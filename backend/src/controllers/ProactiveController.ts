import { Request, Response } from 'express';
import { ProactiveEngine } from '../services/proactive/proactiveEngine';
import { ProactiveEventLog } from '../models/ProactiveEventLog';

export class ProactiveController {
  /**
   * POST /api/proactive/evaluate
   * Trigger proactive intelligence evaluation sweep for a farm
   */
  static async evaluateProactiveEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { farmId } = req.body || {};
      const targetFarmId = farmId || (req.query.farmId as string);

      const summary = await ProactiveEngine.evaluateFarmProactiveEvents(userId, targetFarmId);

      res.json({
        success: true,
        data: summary
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/proactive/events
   * Fetch proactive event logs for audit & debugging
   */
  static async getProactiveEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.query.farmId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const query: any = { user: userId };
      if (farmId) query.farm = farmId;

      const logs = await ProactiveEventLog.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.json({
        success: true,
        data: logs
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/proactive/daily-brief
   * Get structured Daily Farm Intelligence Brief
   */
  static async getDailyFarmBrief(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.query.farmId as string;

      const brief = await ProactiveEngine.getDailyFarmBrief(userId, farmId);

      res.json({
        success: true,
        data: brief
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/proactive/explain/:notificationId
   * Copilot proactive explanation endpoint
   */
  static async explainAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const notifId = req.params.notificationId;

      const explanation = await ProactiveEngine.explainProactiveAlert(userId, notifId);

      res.json({
        success: true,
        data: explanation
      });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }
}
