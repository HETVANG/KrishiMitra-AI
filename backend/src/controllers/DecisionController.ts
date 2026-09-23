import { Request, Response } from 'express';
import { DecisionEngine } from '../services/decisionEngine/decisionEngine';

export class DecisionController {
  /**
   * POST /api/decisions/evaluate
   * Evaluate farm context and return structured decision
   */
  static async evaluateDecision(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { farmId, decisionType } = req.body || {};
      const targetFarmId = farmId || (req.query.farmId as string);

      const decision = await DecisionEngine.evaluateDecision(
        userId,
        targetFarmId,
        decisionType
      );

      res.json({
        success: true,
        data: decision
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/decisions/history
   * Retrieve historical decision records for user/farm
   */
  static async getDecisionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.query.farmId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const history = await DecisionEngine.getDecisionHistory(userId, farmId, limit);

      res.json({
        success: true,
        data: history
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/decisions/:id/approve
   * Approve a pending decision requiring policy authorization
   */
  static async approveDecision(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const decisionId = req.params.id;

      const updated = await DecisionEngine.approveDecision(userId, decisionId);

      res.json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/decisions/:id/reject
   * Reject a pending decision
   */
  static async rejectDecision(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const decisionId = req.params.id;

      const updated = await DecisionEngine.rejectDecision(userId, decisionId);

      res.json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
