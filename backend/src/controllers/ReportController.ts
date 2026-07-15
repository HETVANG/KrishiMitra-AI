import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PdfService } from '../services/PdfService';
import { Farm } from '../models/Farm';
import { Expense } from '../models/Expense';
import { Report } from '../models/Report';
import { WeatherService } from '../services/WeatherService';
import { GeminiService } from '../services/GeminiService';
import { hasPremiumAccess } from '../middleware/subscription';

export class ReportController {
  /**
   * Generates and downloads PDF reports based on query selection in the active language
   */
  static async downloadReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { type, lang } = req.query;

      if (!type || !['crop', 'weather', 'disease', 'expense'].includes(type as string)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing report type parameter.' });
      }

      const reportType = type as 'crop' | 'weather' | 'disease' | 'expense';

      // Protect Premium PDF Reports (Crop & Disease scans)
      if (reportType === 'crop' || reportType === 'disease') {
        if (!hasPremiumAccess(req.user)) {
          res.setHeader('Content-Type', 'application/json');
          return res.status(403).json({
            success: false,
            code: 'PREMIUM_UPGRADE_REQUIRED',
            message: 'Premium feature – Coming Soon'
          });
        }
      }

      const activeLang = (lang || req.user?.settings?.language || 'en') as string;
      let reportData: any = {};

      // Set headers for PDF streaming
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=KrishiMitra_${reportType}_Report.pdf`);

      if (reportType === 'crop') {
        const farm = await Farm.findOne({ user: req.user._id });

        if (farm) {
          const recs = await GeminiService.recommendCrops({
            state: req.user.farmLocation?.address?.split(',')[1]?.trim() || 'Haryana',
            district: req.user.farmLocation?.address?.split(',')[0]?.trim() || 'Karnal',
            soilType: farm.soilType,
            season: 'Rabi',
            waterAvailability: farm.waterSource,
            budget: 50000,
            farmSize: farm.size,
            language: activeLang
          });

          reportData = {
            farmName: farm.name,
            farmSize: farm.size,
            soilType: farm.soilType,
            waterSource: farm.waterSource,
            recommendations: recs
          };
        } else {
          reportData = {
            farmName: 'No Farm Setup Yet',
            farmSize: 0,
            soilType: 'Unknown',
            waterSource: 'N/A',
            recommendations: []
          };
        }
      } 
      
      else if (reportType === 'weather') {
        const lat = req.user.farmLocation?.latitude || 29.6857;
        const lon = req.user.farmLocation?.longitude || 76.9905;
        const weather = await WeatherService.getWeatherData(lat, lon);
        reportData = weather;
      } 
      
      else if (reportType === 'expense') {
        const expensesList = await Expense.find({ user: req.user._id }).sort({ date: -1 });
        
        let totalIncome = 0;
        let totalExpense = 0;
        expensesList.forEach(e => {
          if (e.type === 'income') totalIncome += e.amount;
          else totalExpense += e.amount;
        });

        reportData = {
          expenses: expensesList,
          summary: {
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense
          }
        };
      } 
      
      else if (reportType === 'disease') {
        const diagnosis = await GeminiService.diagnoseCropDisease(
          Buffer.alloc(0),
          'image/jpeg',
          activeLang
        );
        reportData = diagnosis;
      }

      // Log download into the Reports collection in MongoDB
      try {
        await Report.create({
          user: req.user._id,
          type: reportType,
          metadata: {
            language: activeLang,
            userAgent: req.headers['user-agent']
          }
        });
      } catch (logErr) {
        console.warn('[Report Log Warning] Failed to log download history:', logErr);
      }

      // Stream translated PDF out
      PdfService.generateReport(res, reportType, reportData, activeLang);

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
}
