import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Farm } from '../models/Farm';
import { Crop } from '../models/Crop';
import { SoilAnalysis } from '../models/SoilAnalysis';
import { GeminiService } from '../services/GeminiService';

export class CropController {
  /**
   * Recommends crops based on farm conditions using Gemini AI
   */
  static async recommendCrops(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { state, district, soilType, season, waterAvailability, budget, farmSize } = req.body;
      const lang = req.query.lang || req.user?.settings?.language || 'en';

      const recommendations = await GeminiService.recommendCrops({
        state,
        district,
        soilType,
        season,
        waterAvailability,
        budget: Number(budget),
        farmSize: Number(farmSize),
        language: lang as string
      });

      return res.json({
        success: true,
        recommendations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analyzes soil NPK, pH, carbon levels, and structures a fertilization plan
   */
  static async analyzeSoil(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { pH, N, P, K, organicCarbon } = req.body;
      const lang = req.query.lang || req.user?.settings?.language || 'en';

      const analysis = await GeminiService.analyzeSoil({
        pH: Number(pH),
        N: Number(N),
        P: Number(P),
        K: Number(K),
        organicCarbon: Number(organicCarbon),
        language: lang as string
      });

      // Log soil test analysis into SoilAnalysis collection in MongoDB
      try {
        await SoilAnalysis.create({
          user: req.user._id,
          pH: Number(pH),
          N: Number(N),
          P: Number(P),
          K: Number(K),
          organicCarbon: Number(organicCarbon),
          recommendations: analysis
        });
      } catch (logErr) {
        console.warn('[Soil Log Warning] Failed to log soil test:', logErr);
      }

      return res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch a user's farm profile
   */
  static async getFarmProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      const farm = await Farm.findOne({ user: req.user._id });
      return res.json({
        success: true,
        farm: farm || null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create or update farm details (coordinates, size, etc.)
   */
  static async upsertFarmProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { name, size, soilType, waterSource, boundary, currentCrops } = req.body;

      const farm = await Farm.findOneAndUpdate(
        { user: req.user._id },
        {
          user: req.user._id,
          name,
          size: Number(size),
          soilType,
          waterSource,
          boundary,
          currentCrops: currentCrops || [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.json({
        success: true,
        farm,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches reference crops database list
   */
  static async listCrops(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await Crop.countDocuments();
      if (count === 0) {
        const seedCrops = [
          {
            name: 'Wheat',
            soilRequirements: { pH: { min: 6.0, max: 7.5 }, N: 120, P: 60, K: 40 },
            season: ['Rabi'],
            waterRequirement: 'Medium',
            durationDays: 120,
            expectedYield: 2000,
            profitMargin: 25,
            riskLevel: 'Low',
            description: 'Wheat is a cereal grain which is a worldwide staple food.',
            diseases: ['Wheat Rust', 'Powdery Mildew']
          },
          {
            name: 'Paddy',
            soilRequirements: { pH: { min: 5.5, max: 6.5 }, N: 100, P: 50, K: 50 },
            season: ['Kharif'],
            waterRequirement: 'High',
            durationDays: 135,
            expectedYield: 2400,
            profitMargin: 30,
            riskLevel: 'Medium',
            description: 'Paddy is harvested rice with hulls still attached, grown in flooded fields.',
            diseases: ['Blast Disease', 'Bacterial Leaf Blight']
          },
          {
            name: 'Cotton',
            soilRequirements: { pH: { min: 6.0, max: 8.0 }, N: 80, P: 40, K: 40 },
            season: ['Kharif'],
            waterRequirement: 'Medium',
            durationDays: 160,
            expectedYield: 800,
            profitMargin: 35,
            riskLevel: 'High',
            description: 'Cotton is a soft, fluffy staple fiber that grows in a boll around the seeds.',
            diseases: ['Leaf Curl Virus', 'Boll Rot']
          }
        ];
        await Crop.insertMany(seedCrops);
      }

      const crops = await Crop.find({});
      return res.json({
        success: true,
        crops,
      });
    } catch (error) {
      next(error);
    }
  }
}
