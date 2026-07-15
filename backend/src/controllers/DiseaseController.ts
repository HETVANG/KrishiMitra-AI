import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Disease } from '../models/Disease';
import { DiseaseHistory } from '../models/DiseaseHistory';
import { User } from '../models/User';
import { GeminiService } from '../services/GeminiService';

export class DiseaseController {
  /**
   * Diagnoses crop disease from leaf upload using Gemini Vision
   */
  static async diagnose(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a leaf image file.' });
      }

      const lang = req.query.lang || req.user?.settings?.language || 'en';

      // Analyze image via Gemini Service
      const diagnosis = await GeminiService.diagnoseCropDisease(
        req.file.buffer,
        req.file.mimetype,
        lang as string
      );

      // Save to database cache history & user scan counts
      try {
        // Increment scan usage count
        await User.findByIdAndUpdate(req.user._id, { $inc: { scansUsedToday: 1 } });
        req.user.scansUsedToday = (req.user.scansUsedToday || 0) + 1;

        // Save scan history log to MongoDB
        await DiseaseHistory.create({
          user: req.user._id,
          diseaseName: diagnosis.name,
          scientificName: diagnosis.scientificName,
          confidenceScore: diagnosis.confidenceScore,
          imageUri: '', // Buffer upload
          symptoms: diagnosis.symptoms,
          causes: diagnosis.causes,
          organicTreatment: diagnosis.organicTreatment,
          chemicalTreatment: diagnosis.chemicalTreatment,
          preventiveTips: diagnosis.preventiveTips,
          pesticideDetails: diagnosis.pesticideDetails
        });

        // Upsert general disease entry for search list
        await Disease.findOneAndUpdate(
          { name: diagnosis.name },
          {
            name: diagnosis.name,
            symptoms: diagnosis.symptoms,
            causes: diagnosis.causes,
            chemicalTreatment: diagnosis.chemicalTreatment,
            organicTreatment: diagnosis.organicTreatment,
            preventiveTips: diagnosis.preventiveTips
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (dbErr) {
        console.warn(`[Disease Save Cache Warning] Failed: ${dbErr}`);
      }

      return res.json({
        success: true,
        diagnosis,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch known disease descriptions lists
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
