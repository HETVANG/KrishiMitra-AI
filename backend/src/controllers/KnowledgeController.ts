import { Request, Response } from 'express';
import { KnowledgeRetrievalService } from '../services/knowledge/knowledgeRetrievalService';
import { CropKnowledgeService } from '../services/knowledge/cropKnowledgeService';
import { DiseaseKnowledgeService } from '../services/knowledge/diseaseKnowledgeService';
import { SoilKnowledgeService } from '../services/knowledge/soilKnowledgeService';
import { PestKnowledgeService } from '../services/knowledge/pestKnowledgeService';
import { NutrientKnowledgeService } from '../services/knowledge/nutrientKnowledgeService';
import { AgriculturalPracticeService } from '../services/knowledge/agriculturalPracticeService';

export class KnowledgeController {
  /**
   * GET /api/knowledge/crops/:crop
   */
  static getCropKnowledge(req: Request, res: Response): void {
    try {
      const cropName = req.params.crop;
      const result = KnowledgeRetrievalService.getCropKnowledge(cropName);
      res.json({ success: result.success, data: result.crop, sources: result.sources });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/knowledge/diseases/:disease
   */
  static getDiseaseKnowledge(req: Request, res: Response): void {
    try {
      const diseaseName = req.params.disease;
      const result = KnowledgeRetrievalService.getDiseaseKnowledge(diseaseName);
      res.json({ success: result.success, data: result.disease, sources: result.sources });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/knowledge/soil/:type
   */
  static getSoilKnowledge(req: Request, res: Response): void {
    try {
      const soilType = req.params.type;
      const result = KnowledgeRetrievalService.getSoilKnowledge(soilType);
      res.json({ success: result.success, data: result.soil, sources: result.sources });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/knowledge/pests/:pest
   */
  static getPestKnowledge(req: Request, res: Response): void {
    try {
      const pestName = req.params.pest;
      const result = KnowledgeRetrievalService.getPestKnowledge(pestName);
      res.json({ success: result.success, data: result.pest, sources: result.sources });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/knowledge/nutrients/:nutrient
   */
  static getNutrientKnowledge(req: Request, res: Response): void {
    try {
      const nutrientName = req.params.nutrient;
      const result = KnowledgeRetrievalService.getNutrientKnowledge(nutrientName);
      res.json({ success: result.success, data: result.nutrient, sources: result.sources });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/knowledge/practices
   */
  static getPractices(req: Request, res: Response): void {
    try {
      const category = req.query.category as string | undefined;
      const practices = category 
        ? AgriculturalPracticeService.getPracticesByCategory(category)
        : AgriculturalPracticeService.getAllPractices();
      res.json({ success: true, count: practices.length, data: practices });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/knowledge/search
   */
  static searchKnowledge(req: Request, res: Response): void {
    try {
      const search = req.query.query as string | undefined;
      const crop = req.query.crop as string | undefined;
      const disease = req.query.disease as string | undefined;
      const soil = req.query.soil as string | undefined;
      const pest = req.query.pest as string | undefined;

      const result = KnowledgeRetrievalService.searchKnowledge({
        search,
        crop,
        disease,
        soil,
        pest
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
