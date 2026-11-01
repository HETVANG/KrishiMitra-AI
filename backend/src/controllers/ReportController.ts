import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Report } from '../models/Report';
import { ReportService } from '../services/ReportService';
import { PdfService, PdfReportOptions } from '../services/PdfService';
import { Farm } from '../models/Farm';
import { Expense } from '../models/Expense';
import { DiseaseHistory } from '../models/DiseaseHistory';
import { WeatherService } from '../services/WeatherService';
import { GeminiService, getLocalizedMockData } from '../services/GeminiService';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

export class ReportController {
  /**
   * Generates and downloads PDF reports based on query selection in the active language.
   * Kept backwards-compatible with existing frontend calls.
   */
  static async downloadReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { type, lang, scanId, diseaseName } = req.query;

      if (!type || !['crop', 'weather', 'disease', 'expense'].includes(type as string)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing report type parameter.' });
      }

      const reportType = type as 'crop' | 'weather' | 'disease' | 'expense';
      const activeLang = (lang || req.user?.settings?.language || 'en') as string;

      // Persist generation record through ReportService
      try {
        const reportDoc = await ReportService.generateAndStoreReport({
          userId: req.user._id.toString(),
          type: reportType,
          scanId: scanId as string,
          diseaseName: diseaseName as string,
          lang: activeLang,
          userAgent: req.headers['user-agent']
        });

        // Fetch buffer for immediate streaming
        const { buffer, fileName } = await ReportService.getReportPdfBuffer(reportDoc.reportId, req.user._id.toString(), false);
        const disposition = (req.query.disposition as string) === 'attachment' ? 'attachment' : 'inline';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
      } catch (err: any) {
        console.warn('[ReportController Streaming Fallback to Direct Stream]', err.message);
        // Direct stream fallback if storage step had an error
        const reportData: any = {};
        const disposition = (req.query.disposition as string) === 'attachment' ? 'attachment' : 'inline';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${disposition}; filename="TheKhedut_${reportType}_Report.pdf"`);
        PdfService.generateReport(res, reportType, reportData, activeLang, {
          farmerName: req.user.name,
          farmerEmail: req.user.email
        });
      }
    } catch (error) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', '');
        next(error);
      } else {
        console.error('[PDF Report Stream Error]', error);
      }
    }
  }

  /**
   * Generates a new report and returns metadata + download/preview URLs
   */
  static async generateReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const { type, scanId, diseaseName, lang } = req.body;
      if (!type || !['crop', 'weather', 'disease', 'expense'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid report type' });
      }

      const report = await ReportService.generateAndStoreReport({
        userId: req.user._id.toString(),
        type,
        scanId,
        diseaseName,
        lang: lang || req.user.settings?.language || 'en',
        userAgent: req.headers['user-agent']
      });

      return res.status(201).json({
        success: true,
        message: 'Report generated and stored successfully',
        report: {
          id: report._id,
          reportId: report.reportId,
          type: report.type,
          cropName: report.cropName,
          diseaseName: report.diseaseName,
          confidenceScore: report.confidenceScore,
          severity: report.severity,
          language: report.language,
          status: report.status,
          summary: report.summary,
          fileSize: report.fileSize,
          createdAt: report.createdAt,
          previewUrl: `/api/reports/${report.reportId}/preview`,
          downloadUrl: `/api/reports/${report.reportId}/download`
        }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Farmer Report History: returns paginated reports belonging to logged-in farmer
   */
  static async getMyReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const { page, limit, type, lang, search } = req.query;
      const data = await ReportService.getFarmerReports(req.user._id.toString(), {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        type: type as string,
        lang: lang as string,
        search: search as string
      });

      return res.json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves single report metadata (verifies farmer ownership or admin)
   */
  static async getReportById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const isAdmin = req.user.role === 'admin';
      const report = await ReportService.getReportById(req.params.id, req.user._id.toString(), isAdmin);

      return res.json({
        success: true,
        report
      });
    } catch (error: any) {
      return res.status(error.message.includes('Unauthorized') ? 403 : 404).json({
        success: false,
        message: error.message || 'Report not found'
      });
    }
  }

  /**
   * Streams PDF as an attachment for direct download
   */
  static async downloadReportById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const isAdmin = req.user.role === 'admin';
      const { buffer, fileName } = await ReportService.getReportPdfBuffer(req.params.id, req.user._id.toString(), isAdmin);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    } catch (error: any) {
      if (!res.headersSent) {
        return res.status(404).json({ success: false, message: error.message || 'Report file unavailable' });
      }
    }
  }

  /**
   * Streams PDF inline for in-browser preview modal
   */
  static async previewReportById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const isAdmin = req.user.role === 'admin';
      const { buffer, fileName } = await ReportService.getReportPdfBuffer(req.params.id, req.user._id.toString(), isAdmin);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    } catch (error: any) {
      if (!res.headersSent) {
        return res.status(404).json({ success: false, message: error.message || 'Report file unavailable' });
      }
    }
  }

  /**
   * Deletes a report (owner farmer or admin)
   */
  static async deleteReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const isAdmin = req.user.role === 'admin';
      const result = await ReportService.deleteReport(req.params.id, req.user._id.toString(), isAdmin);

      return res.json(result);
    } catch (error: any) {
      return res.status(error.message.includes('Unauthorized') ? 403 : 404).json({
        success: false,
        message: error.message || 'Report not found'
      });
    }
  }

  /**
   * Public Report Verification Endpoint (Scanned from PDF QR code)
   * Validates authenticity without revealing private personal farmer credentials
   */
  static async verifyReportPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const reportId = req.params.reportId;
      if (!reportId) {
        return res.status(400).json({ success: false, verified: false, message: 'Report identifier is required' });
      }

      let query: any = {};
      if (Types.ObjectId.isValid(reportId)) {
        query.$or = [{ _id: reportId }, { reportId }];
      } else {
        query.reportId = reportId;
      }

      const report = await Report.findOne(query).lean();
      if (!report || report.status === 'failed') {
        return res.status(404).json({
          success: false,
          verified: false,
          message: 'This document could not be verified or has not been recognized by The Khedut validation registry.'
        });
      }

      const categoryTitles: Record<string, string> = {
        disease: 'Crop Disease Detection & Pathology Report',
        crop: 'Farm Crop Suitability & Soil Advisory Statement',
        weather: 'Agricultural Weather Advisory Statement',
        expense: 'Farm Financial Ledger & Cost Statement'
      };

      return res.json({
        success: true,
        verified: true,
        report: {
          reportId: report.reportId || report._id,
          type: report.type,
          categoryTitle: categoryTitles[report.type] || 'Agricultural Advisory Statement',
          cropName: report.cropName || 'Field Crop',
          diseaseName: report.diseaseName,
          severity: report.severity,
          confidenceScore: report.confidenceScore,
          generatedAt: report.createdAt,
          status: report.status || 'completed',
          language: report.language || 'en',
          summary: report.summary,
          platform: 'The Khedut Autonomous Agricultural Intelligence Platform',
          issuer: 'THE KHEDUT Agricultural Technologies',
          verificationStamp: 'AUTHENTIC_DIGITAL_RECORD'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Serves local cached reports from uploads/reports directory
   */
  static async serveLocalStorageFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filename = path.basename(req.params.filename);
      const filePath = path.resolve(process.cwd(), 'uploads/reports', filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Analytics: Real MongoDB statistics
   */
  static async getAdminAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await ReportService.getAdminAnalytics();
      return res.json({
        success: true,
        analytics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Reports Listing: Paginated, searchable, filterable
   */
  static async getAdminReportsList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, type, lang, status, search, startDate, endDate } = req.query;
      const data = await ReportService.getAdminReportsList({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 15,
        type: type as string,
        lang: lang as string,
        status: status as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string
      });

      return res.json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }
}
