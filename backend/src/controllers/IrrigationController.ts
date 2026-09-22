import { Request, Response, NextFunction } from 'express';
import { IrrigationService } from '../services/irrigation/irrigationService';

export class IrrigationController {
  /**
   * GET /api/irrigation/status
   * GET /api/irrigation/status/:farmId
   */
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId !== 'undefined' ? req.params.farmId : undefined;
      const language = (req.query.language as string) || 'en';

      const data = await IrrigationService.getIrrigationStatus(userId, farmId, language);
      return res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/irrigation/events
   * Log an irrigation activity event
   */
  static async logEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { farmId, cropName, date, method, durationMinutes, waterAmount, waterUnit, notes } = req.body;

      const event = await IrrigationService.logIrrigationEvent(userId, {
        farmId,
        cropName,
        date,
        method,
        durationMinutes: Number(durationMinutes || 30),
        waterAmount: waterAmount ? Number(waterAmount) : undefined,
        waterUnit,
        notes
      });

      return res.status(201).json({ success: true, event });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/irrigation/history
   * GET /api/irrigation/history/:farmId
   */
  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId !== 'undefined' ? req.params.farmId : undefined;

      const data = await IrrigationService.getIrrigationStatus(userId, farmId);
      return res.json({ success: true, recentEvents: data.recentEvents });
    } catch (error) {
      next(error);
    }
  }
}
