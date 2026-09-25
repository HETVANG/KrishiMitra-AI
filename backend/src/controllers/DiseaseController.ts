import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Disease } from '../models/Disease';
import { DiseaseHistory } from '../models/DiseaseHistory';
import { DiseaseIntelligenceService } from '../services/disease/diseaseIntelligenceService';

export class DiseaseController {
  /**
   * Advanced Disease Intelligence analysis (Multimodal image + Farm/Crop context + Env Risk)
   */
  static async analyze(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a clear leaf image file.' });
      }

      const headerLang = (req.headers['accept-language'] as string)?.split(',')[0]?.trim();
      const lang = (req.query.lang as string) || (req.body.language as string) || headerLang || (req.user?.settings?.language) || 'en';
      const farmId = req.body.farmId || req.query.farmId || undefined;
      const crop = req.body.crop || req.query.crop || undefined;
      const variety = req.body.variety || undefined;
      const growthStage = req.body.growthStage || undefined;
      const farmerNotes = req.body.farmerNotes || req.body.notes || undefined;

      const assessment = await DiseaseIntelligenceService.processLeafScan(
        req.file.buffer,
        req.file.mimetype,
        {
          userId: req.user ? req.user._id.toString() : undefined,
          farmId,
          crop,
          variety,
          growthStage,
          farmerNotes,
          language: lang
        }
      );

      // Backwards compatibility format for diagnosis property
      const diagnosis = {
        name: assessment.diseaseName,
        localName: assessment.localName,
        scientificName: assessment.scientificName,
        confidenceScore: assessment.confidenceScore,
        condition: assessment.condition,
        severity: assessment.severity,
        symptoms: assessment.symptoms,
        evidence: assessment.evidence,
        causes: assessment.possibleCauses,
        organicTreatment: assessment.organicTreatment,
        chemicalTreatment: assessment.chemicalTreatment,
        pesticideDetails: assessment.pesticideDetails,
        preventiveTips: assessment.preventiveTips
      };

      // Upsert into Disease collection
      try {
        await Disease.findOneAndUpdate(
          { name: assessment.diseaseName },
          {
            name: assessment.diseaseName,
            symptoms: assessment.symptoms,
            causes: assessment.possibleCauses,
            chemicalTreatment: assessment.chemicalTreatment,
            organicTreatment: assessment.organicTreatment,
            preventiveTips: assessment.preventiveTips
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (dbErr) {
        console.warn('[DiseaseController] Cache update warning:', dbErr);
      }

      return res.json({
        success: true,
        assessment,
        diagnosis, // Backwards compatibility
        imageUri: assessment.imageUri
      });
    } catch (error: any) {
      console.error('[DiseaseController Analyze Error]', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete disease analysis.'
      });
    }
  }

  /**
   * Backwards compatible legacy diagnose endpoint
   */
  static async diagnose(req: AuthRequest, res: Response, next: NextFunction) {
    return DiseaseController.analyze(req, res, next);
  }

  /**
   * Fetch disease history logs for authenticated user
   */
  static async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { farmId, crop, limit = 20, page = 1 } = req.query;
      const query: any = { user: req.user._id };

      if (farmId) query.farm = farmId;
      if (crop) query.crop = new RegExp(crop as string, 'i');

      const skip = (Number(page) - 1) * Number(limit);

      const [history, total] = await Promise.all([
        DiseaseHistory.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        DiseaseHistory.countDocuments(query)
      ]);

      return res.json({
        success: true,
        history,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch single scan detail by ID
   */
  static async getHistoryById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const scan = await DiseaseHistory.findOne({
        _id: req.params.id,
        user: req.user._id
      });

      if (!scan) {
        return res.status(404).json({ success: false, message: 'Scan history record not found' });
      }

      return res.json({
        success: true,
        scan
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Schedule or update follow-up date for a scan
   */
  static async scheduleFollowUp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { days = 5, notes } = req.body;
      const updated = await DiseaseIntelligenceService.scheduleFollowUp(
        req.user._id.toString(),
        req.params.id,
        Number(days),
        notes
      );

      return res.json({
        success: true,
        message: `Follow-up scheduled for ${days} days`,
        scan: updated
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Fetch active disease concerns for a farm (scans in past 30 days with active issues)
   */
  static async getActiveConcerns(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const farmId = req.params.farmId;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const query: any = {
        user: req.user._id,
        createdAt: { $gte: thirtyDaysAgo },
        condition: { $ne: 'HEALTHY' }
      };

      if (farmId && farmId !== 'all') {
        query.farm = farmId;
      }

      const concerns = await DiseaseHistory.find(query)
        .sort({ createdAt: -1 })
        .limit(10);

      return res.json({
        success: true,
        concerns,
        hasActiveConcerns: concerns.length > 0
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch list of known diseases
   */
  static async listDiseases(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const diseases = await Disease.find({});
      return res.json({
        success: true,
        diseases,
      });
    } catch (error) {
      next(error);
    }
  }
}
