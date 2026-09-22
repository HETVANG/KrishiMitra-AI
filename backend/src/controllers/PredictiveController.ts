import { Request, Response, NextFunction } from 'express';
import { PredictiveCropService } from '../services/prediction/predictiveCropService';

export class PredictiveController {
  /**
   * GET /api/predictions
   * GET /api/predictions/:farmId
   * Retrieve active predictive risk signals and outlook
   */
  static async getPredictions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId !== 'undefined' ? req.params.farmId : undefined;
      const language = (req.query.language as string) || 'en';

      const data = await PredictiveCropService.evaluateAndGetPredictions(userId, farmId, language);
      return res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/predictions/:farmId/timeline
   */
  static async getTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId !== 'undefined' ? req.params.farmId : undefined;

      const data = await PredictiveCropService.evaluateAndGetPredictions(userId, farmId);
      return res.json({ success: true, timeline: data.timeline });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/predictions/:farmId/refresh
   * Force re-evaluate predictive signals
   */
  static async refreshPredictions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId !== 'undefined' ? req.params.farmId : undefined;
      const language = (req.query.language as string) || 'en';

      const data = await PredictiveCropService.evaluateAndGetPredictions(userId, farmId, language);
      return res.json({ success: true, ...data, refreshed: true });
    } catch (error) {
      next(error);
    }
  }
}
