import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PdfService } from '../services/PdfService';
import { Farm } from '../models/Farm';
import { Expense } from '../models/Expense';
import { Report } from '../models/Report';
import { WeatherService } from '../services/WeatherService';
import { GeminiService } from '../services/GeminiService';
import { hasPremiumAccess } from '../middleware/subscription';

import axios from 'axios';
import { DiseaseHistory } from '../models/DiseaseHistory';
import { getLocalizedMockData } from '../services/GeminiService';

export class ReportController {
  /**
   * Generates and downloads PDF reports based on query selection in the active language
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
      let reportData: any = {};

      if (reportType === 'weather' && (!req.user.farmLocation?.latitude || !req.user.farmLocation?.longitude)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ success: false, message: 'Weather reports require a configured farm location. Please set your location on the dashboard first.' });
      }

      if (reportType === 'crop' && (!req.user.farmLocation?.address)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ success: false, message: 'Crop reports require a configured farm location. Please set your location on the dashboard first.' });
      }

      if (reportType === 'crop') {
        const farm = await Farm.findOne({ user: req.user._id });

        if (farm) {
          const recs = await GeminiService.recommendCrops({
            state: req.user.farmLocation?.address?.split(',')[1]?.trim() || 'Location not selected',
            district: req.user.farmLocation?.address?.split(',')[0]?.trim() || 'Location not selected',
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
        const lat = req.user.farmLocation!.latitude!;
        const lon = req.user.farmLocation!.longitude!;
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
        let scanRecord = null;
        if (scanId) {
          scanRecord = await DiseaseHistory.findOne({ _id: scanId, user: req.user._id });
        } else if (diseaseName) {
          scanRecord = await DiseaseHistory.findOne({
            user: req.user._id,
            diseaseName: new RegExp(diseaseName as string, 'i')
          }).sort({ createdAt: -1 });
        }

        if (!scanRecord) {
          scanRecord = await DiseaseHistory.findOne({ user: req.user._id }).sort({ createdAt: -1 });
        }

        if (scanRecord) {
          reportData = {
            name: scanRecord.diseaseName,
            diseaseName: scanRecord.diseaseName,
            localName: scanRecord.localName || scanRecord.diseaseName,
            scientificName: scanRecord.scientificName || 'N/A',
            condition: scanRecord.condition || 'POSSIBLE_DISEASE',
            confidence: scanRecord.confidence || 'moderate',
            confidenceScore: scanRecord.confidenceScore || 0.8,
            severity: scanRecord.severity || 'moderate',
            crop: scanRecord.crop || 'Crop Leaf',
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
          // Fallback mock pathology structure for user
          const mockData = getLocalizedMockData(activeLang);
          const d = mockData.disease || {};
          reportData = {
            name: d.name || 'Tomato Early Blight',
            diseaseName: d.name || 'Tomato Early Blight',
            localName: d.localName || 'Early Blight',
            scientificName: d.scientificName || 'Alternaria solani',
            condition: 'POSSIBLE_DISEASE',
            confidence: 'high',
            confidenceScore: d.confidenceScore || 0.9,
            severity: 'moderate',
            crop: 'Tomato',
            symptoms: d.symptoms || ['Spots on leaves'],
            possibleCauses: d.causes || ['High humidity'],
            organicTreatment: d.organicTreatment || ['Neem oil spray'],
            chemicalTreatment: d.chemicalTreatment || ['Mancozeb spray'],
            preventiveTips: d.preventiveTips || ['Crop rotation'],
            pesticideDetails: d.pesticideDetails,
            imageUri: ''
          };
        }

        // Try downloading leaf scan image buffer safely if remote URL is present
        if (reportData.imageUri && reportData.imageUri.startsWith('http')) {
          try {
            const imgRes = await axios.get(reportData.imageUri, { responseType: 'arraybuffer', timeout: 3500 });
            reportData.imageBuffer = Buffer.from(imgRes.data);
          } catch (imgErr: any) {
            console.warn('[PDF Image Fetch Notice] Leaf image skipped:', imgErr?.message || imgErr);
            reportData.imageBuffer = null;
          }
        }
      }

      // Configure filename
      let fileName = `KrishiMitra_${reportType}_Report.pdf`;
      if (reportType === 'disease') {
        const rawName = reportData.diseaseName || 'Disease';
        const cleanName = rawName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
        fileName = `KrishiMitra_Disease_Report_${cleanName || 'Diagnosis'}.pdf`;
      }

      // Set headers for PDF streaming (defaults to inline for browser preview)
      const disposition = (req.query.disposition as string) === 'attachment' ? 'attachment' : 'inline';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);

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
