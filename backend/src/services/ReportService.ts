import { Types } from 'mongoose';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Report, IReport } from '../models/Report';
import { User } from '../models/User';
import { Farm } from '../models/Farm';
import { Expense } from '../models/Expense';
import { DiseaseHistory } from '../models/DiseaseHistory';
import { PdfService, PdfReportOptions } from './PdfService';
import { CloudinaryService } from './CloudinaryService';
import { WeatherService } from './WeatherService';
import { GeminiService, getLocalizedMockData } from './GeminiService';

export interface GenerateReportInput {
  userId: string;
  type: 'crop' | 'weather' | 'disease' | 'expense';
  scanId?: string;
  diseaseName?: string;
  lang?: string;
  userAgent?: string;
}

export class ReportService {
  /**
   * Generates a unique, human-readable report ID (e.g., REP-20261101-9F2B8)
   */
  public static generateReportId(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `REP-${dateStr}-${randomHex}`;
  }

  /**
   * Generates a dynamic PDF, stores it in Cloudinary/local storage, and persists metadata to MongoDB
   */
  public static async generateAndStoreReport(input: GenerateReportInput): Promise<IReport> {
    const { userId, type, scanId, diseaseName, lang, userAgent } = input;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const activeLang = (lang || user.settings?.language || 'en').toLowerCase().slice(0, 2);
    const reportId = this.generateReportId();
    let reportData: any = {};
    let cropName = 'All Crops';
    let detectedDisease = '';
    let condition = '';
    let confidenceScore: number | undefined;
    let severity = '';
    let summaryText = '';

    try {
      // 1. GATHER DATA ACCORDING TO REPORT TYPE
      if (type === 'crop') {
        const farm = await Farm.findOne({ user: user._id });
        const farmLoc = user.farmLocation?.address || '';
        const state = farmLoc.split(',')[1]?.trim() || 'Location not selected';
        const district = farmLoc.split(',')[0]?.trim() || 'Location not selected';

        if (farm) {
          const recs = await GeminiService.recommendCrops({
            state,
            district,
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
          cropName = farm.currentCrops?.[0] || 'Field Crops';
          summaryText = `AI Crop & Soil Advisory for ${farm.name} (${farm.size} Acres).`;
        } else {
          reportData = {
            farmName: 'Farm Profile Pending',
            farmSize: 0,
            soilType: 'Loamy',
            waterSource: 'Borewell',
            recommendations: []
          };
          summaryText = 'AI Crop Recommendations for regional soil.';
        }
      } else if (type === 'weather') {
        const lat = user.farmLocation?.latitude || 22.3039;
        const lon = user.farmLocation?.longitude || 70.8022;
        const weather = await WeatherService.getWeatherData(lat, lon);
        reportData = weather;
        summaryText = `Meteorological Advisory: ${weather.current?.description || 'Clear Sky'}, Temp ${weather.current?.temp || 26}°C.`;
      } else if (type === 'expense') {
        const expensesList = await Expense.find({ user: user._id }).sort({ date: -1 });
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
        summaryText = `Farm Ledger: Revenue Rs. ${totalIncome}, Costs Rs. ${totalExpense}, Net Rs. ${totalIncome - totalExpense}.`;
      } else if (type === 'disease') {
        let scanRecord = null;
        if (scanId && Types.ObjectId.isValid(scanId)) {
          scanRecord = await DiseaseHistory.findOne({ _id: scanId, user: user._id });
        } else if (diseaseName) {
          scanRecord = await DiseaseHistory.findOne({
            user: user._id,
            diseaseName: new RegExp(diseaseName, 'i')
          }).sort({ createdAt: -1 });
        }

        if (!scanRecord) {
          scanRecord = await DiseaseHistory.findOne({ user: user._id }).sort({ createdAt: -1 });
        }

        if (scanRecord) {
          cropName = scanRecord.crop || 'Field Crop';
          detectedDisease = scanRecord.diseaseName;
          condition = scanRecord.condition || 'POSSIBLE_DISEASE';
          confidenceScore = scanRecord.confidenceScore || 0.85;
          severity = scanRecord.severity || 'moderate';
          summaryText = `Detected: ${detectedDisease} on ${cropName} (${(confidenceScore * 100).toFixed(0)}% confidence).`;

          reportData = {
            name: scanRecord.diseaseName,
            diseaseName: scanRecord.diseaseName,
            localName: scanRecord.localName || scanRecord.diseaseName,
            scientificName: scanRecord.scientificName || 'N/A',
            condition,
            confidence: scanRecord.confidence || 'moderate',
            confidenceScore,
            severity,
            crop: cropName,
            symptoms: scanRecord.symptoms || [],
            possibleCauses: scanRecord.possibleCauses || scanRecord.causes || [],
            organicTreatment: scanRecord.organicTreatment || [],
            chemicalTreatment: scanRecord.chemicalTreatment || [],
            preventiveTips: scanRecord.preventiveTips || [],
            recommendedActions: scanRecord.recommendedActions || [],
            pesticideDetails: scanRecord.pesticideDetails,
            environmentalContext: scanRecord.environmentalContext,
            limitations: scanRecord.limitations,
            chemicalSafetyNotice: scanRecord.chemicalSafetyNotice,
            imageUri: scanRecord.imageUri,
            scanDate: scanRecord.createdAt
          };
        } else {
          const mockData = getLocalizedMockData(activeLang);
          const d = mockData.disease || {};
          cropName = 'Tomato';
          detectedDisease = d.name || 'Tomato Early Blight';
          condition = 'POSSIBLE_DISEASE';
          confidenceScore = d.confidenceScore || 0.88;
          severity = 'moderate';
          summaryText = `Observed symptoms on ${cropName}: ${detectedDisease}.`;

          reportData = {
            name: detectedDisease,
            diseaseName: detectedDisease,
            localName: d.localName || 'Early Blight',
            scientificName: d.scientificName || 'Alternaria solani',
            condition,
            confidence: 'high',
            confidenceScore,
            severity,
            crop: cropName,
            symptoms: d.symptoms || ['Brown concentric leaf lesions'],
            possibleCauses: d.causes || ['High microclimate humidity'],
            organicTreatment: d.organicTreatment || ['Neem oil spray (5ml/L)'],
            chemicalTreatment: d.chemicalTreatment || ['Mancozeb 75 WP (2g/L)'],
            preventiveTips: d.preventiveTips || ['Crop rotation with non-solanaceous crops'],
            imageUri: ''
          };
        }

        // Fetch leaf image buffer safely if present
        if (reportData.imageUri && reportData.imageUri.startsWith('http')) {
          try {
            const imgRes = await axios.get(reportData.imageUri, { responseType: 'arraybuffer', timeout: 3500 });
            reportData.imageBuffer = Buffer.from(imgRes.data);
          } catch (imgErr: any) {
            console.warn('[ReportService Image Fetch] Leaf image skipped:', imgErr?.message || imgErr);
            reportData.imageBuffer = null;
          }
        }
      }

      // 2. BUILD PDF BUFFER VIA PDF SERVICE
      const pdfOptions: PdfReportOptions = {
        reportId,
        farmerName: user.name,
        farmerEmail: user.email,
        farmerLocation: user.farmLocation?.address || ''
      };

      const pdfBuffer = await PdfService.generateReportBuffer(type, reportData, activeLang, pdfOptions);

      // 3. STORE GENERATED PDF VIA CLOUDINARY OR LOCAL SAFE STORAGE
      const filename = `TheKhedut_${reportId}_${type}.pdf`;
      const uploadResult = await CloudinaryService.uploadReportPdf(pdfBuffer, filename);

      // 4. PERSIST REPORT RECORD IN MONGODB
      const reportDoc = await Report.create({
        reportId,
        user: user._id,
        farmerName: user.name,
        farmerEmail: user.email,
        type,
        cropName,
        diseaseName: detectedDisease,
        condition,
        confidenceScore,
        severity,
        language: activeLang,
        status: 'completed',
        fileUrl: uploadResult.url,
        storageKey: uploadResult.publicId,
        fileSize: pdfBuffer.length,
        scanId: (scanId && Types.ObjectId.isValid(scanId)) ? new Types.ObjectId(scanId) : undefined,
        downloadCount: 1,
        downloadedAt: new Date(),
        lastDownloadedAt: new Date(),
        summary: summaryText,
        metadata: {
          userAgent,
          storageType: uploadResult.storageType
        }
      });

      return reportDoc;
    } catch (err: any) {
      console.error('[ReportService generateAndStoreReport Error]', err);

      // Record failed generation in MongoDB for auditing and analytics
      try {
        await Report.create({
          reportId,
          user: user._id,
          farmerName: user.name,
          farmerEmail: user.email,
          type,
          cropName,
          language: activeLang,
          status: 'failed',
          errorMessage: err.message || 'PDF generation or storage failed',
          metadata: { userAgent }
        });
      } catch (logErr) {
        console.warn('[ReportService Failed to log failure]', logErr);
      }

      throw err;
    }
  }

  /**
   * Returns paginated reports belonging strictly to the requesting farmer
   */
  public static async getFarmerReports(
    userId: string,
    query: { page?: number; limit?: number; type?: string; lang?: string; search?: string }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { user: new Types.ObjectId(userId) };

    if (query.type && ['crop', 'weather', 'disease', 'expense'].includes(query.type)) {
      filter.type = query.type;
    }

    if (query.lang) {
      filter.language = query.lang.toLowerCase().slice(0, 2);
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { reportId: new RegExp(q, 'i') },
        { cropName: new RegExp(q, 'i') },
        { diseaseName: new RegExp(q, 'i') },
        { summary: new RegExp(q, 'i') }
      ];
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter)
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Retrieves single report metadata verifying owner or admin authorization
   */
  public static async getReportById(reportIdOrMongoId: string, userId: string, isAdmin: boolean) {
    let query: any = {};
    if (Types.ObjectId.isValid(reportIdOrMongoId)) {
      query.$or = [{ _id: reportIdOrMongoId }, { reportId: reportIdOrMongoId }];
    } else {
      query.reportId = reportIdOrMongoId;
    }

    const report = await Report.findOne(query);
    if (!report) {
      throw new Error('Report not found');
    }

    if (!isAdmin && report.user.toString() !== userId) {
      throw new Error('Unauthorized access: This report belongs to another farmer.');
    }

    return report;
  }

  /**
   * Fetches or generates the PDF buffer for streaming, with permission validation
   */
  public static async getReportPdfBuffer(reportIdOrMongoId: string, userId: string, isAdmin: boolean): Promise<{ buffer: Buffer; fileName: string; report: IReport }> {
    const report = await this.getReportById(reportIdOrMongoId, userId, isAdmin);

    // Increment download count and update timestamp
    report.downloadCount = (report.downloadCount || 0) + 1;
    report.lastDownloadedAt = new Date();
    await report.save();

    const fileName = `TheKhedut_${report.reportId || 'Report'}_${report.type}.pdf`;

    // 1. If stored locally in uploads/reports/
    if (report.storageKey && report.storageKey.startsWith('local_')) {
      const localFile = report.storageKey.replace(/^local_/, '');
      const filePath = path.resolve(process.cwd(), 'uploads/reports', localFile);
      if (fs.existsSync(filePath)) {
        return { buffer: fs.readFileSync(filePath), fileName, report };
      }
    }

    // 2. If stored in Cloudinary
    if (report.fileUrl && report.fileUrl.startsWith('http')) {
      try {
        const res = await axios.get(report.fileUrl, { responseType: 'arraybuffer', timeout: 8000 });
        return { buffer: Buffer.from(res.data), fileName, report };
      } catch (cloudErr) {
        console.warn('[ReportService Cloudinary Fetch Failed, regenerating dynamically]', cloudErr);
      }
    }

    // 3. Dynamic Regeneration Fallback if remote storage is unreachable
    const user = await User.findById(report.user);
    const pdfOptions: PdfReportOptions = {
      reportId: report.reportId,
      farmerName: report.farmerName || user?.name,
      farmerEmail: report.farmerEmail || user?.email,
      farmerLocation: user?.farmLocation?.address || ''
    };

    let reportData: any = {};
    if (report.type === 'disease' && report.scanId) {
      const scan = await DiseaseHistory.findById(report.scanId);
      if (scan) {
        reportData = {
          name: scan.diseaseName,
          diseaseName: scan.diseaseName,
          localName: scan.localName,
          scientificName: scan.scientificName,
          condition: scan.condition,
          confidenceScore: scan.confidenceScore,
          severity: scan.severity,
          crop: scan.crop,
          symptoms: scan.symptoms,
          possibleCauses: scan.possibleCauses || scan.causes,
          organicTreatment: scan.organicTreatment,
          chemicalTreatment: scan.chemicalTreatment,
          preventiveTips: scan.preventiveTips,
          recommendedActions: scan.recommendedActions,
          scanDate: scan.createdAt
        };
      }
    }

    const regeneratedBuffer = await PdfService.generateReportBuffer(report.type, reportData, report.language || 'en', pdfOptions);
    return { buffer: regeneratedBuffer, fileName, report };
  }

  /**
   * Deletes a report with proper ownership or admin verification
   */
  public static async deleteReport(reportIdOrMongoId: string, userId: string, isAdmin: boolean) {
    const report = await this.getReportById(reportIdOrMongoId, userId, isAdmin);

    // Delete local cached file if present
    if (report.storageKey && report.storageKey.startsWith('local_')) {
      const localFile = report.storageKey.replace(/^local_/, '');
      const filePath = path.resolve(process.cwd(), 'uploads/reports', localFile);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('[Report Delete Warning] Could not remove local file:', e);
        }
      }
    }

    await Report.deleteOne({ _id: report._id });
    return { success: true, message: `Report ${report.reportId || report._id} deleted successfully.` };
  }

  /**
   * Admin Analytics: Aggregates real MongoDB statistics
   */
  public static async getAdminAnalytics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

    const [
      totalReports,
      reportsToday,
      reportsThisMonth,
      categoryCounts,
      languageCounts,
      statusCounts,
      dailyTrend
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ createdAt: { $gte: startOfToday } }),
      Report.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Report.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            success: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const byCategory: Record<string, number> = { crop: 0, weather: 0, disease: 0, expense: 0 };
    categoryCounts.forEach(c => {
      if (c._id) byCategory[c._id] = c.count;
    });

    const byLanguage: Record<string, number> = {};
    languageCounts.forEach(l => {
      if (l._id) byLanguage[l._id] = l.count;
    });

    let successCount = 0;
    let failedCount = 0;
    statusCounts.forEach(s => {
      if (s._id === 'completed') successCount = s.count;
      else if (s._id === 'failed') failedCount = s.count;
    });

    // If total reports exist but older records had no status field, default them to completed
    if (successCount === 0 && failedCount === 0 && totalReports > 0) {
      successCount = totalReports;
    }

    const successRate = totalReports > 0 ? Number(((successCount / totalReports) * 100).toFixed(1)) : 100;

    return {
      totalReports,
      reportsToday,
      reportsThisMonth,
      successCount,
      failedCount,
      successRate,
      byCategory,
      byLanguage,
      dailyTrend: dailyTrend.map(d => ({
        date: d._id,
        count: d.count,
        success: d.success,
        failed: d.failed
      }))
    };
  }

  /**
   * Admin Report Management Table: Paginated, searchable, filterable list across all farmers
   */
  public static async getAdminReportsList(query: {
    page?: number;
    limit?: number;
    type?: string;
    lang?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.type && ['crop', 'weather', 'disease', 'expense'].includes(query.type)) {
      filter.type = query.type;
    }

    if (query.lang) {
      filter.language = query.lang.toLowerCase().slice(0, 2);
    }

    if (query.status && ['completed', 'processing', 'failed'].includes(query.status)) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { reportId: new RegExp(q, 'i') },
        { farmerName: new RegExp(q, 'i') },
        { farmerEmail: new RegExp(q, 'i') },
        { cropName: new RegExp(q, 'i') },
        { diseaseName: new RegExp(q, 'i') }
      ];
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('user', 'name email phone farmLocation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter)
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
