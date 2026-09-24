import { Request, Response } from 'express';
import { ClosedLoopEngine } from '../services/agents/closedLoopEngine';
import { AutomationRun } from '../models/AutomationRun';
import { AutomationApproval } from '../models/AutomationApproval';

export class AutomationController {
  /**
   * GET /api/automation/status
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const settings = await ClosedLoopEngine.getAutomationSettings(userId);
      const pendingApprovalsCount = await AutomationApproval.countDocuments({
        userId,
        status: 'PENDING'
      });
      const totalRunsCount = await AutomationRun.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          status: 'ACTIVE',
          autonomyLevel: settings.globalAutonomyLevel ?? 2,
          pendingApprovalsCount,
          totalRunsCount,
          settings
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/automation/runs
   */
  static async getRuns(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const limit = Number(req.query.limit) || 20;

      const runs = await AutomationRun.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.json({
        success: true,
        count: runs.length,
        data: runs
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/automation/runs/:id
   */
  static async getRunById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { id } = req.params;

      const run = await AutomationRun.findOne({ runId: id, userId }).lean();
      if (!run) {
        res.status(404).json({ success: false, error: 'Automation run not found' });
        return;
      }

      res.json({
        success: true,
        data: run
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/automation/settings
   */
  static async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const settings = await ClosedLoopEngine.getAutomationSettings(userId);

      res.json({
        success: true,
        data: settings
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * PATCH /api/automation/settings
   */
  static async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const updates = req.body;

      const updated = await ClosedLoopEngine.updateAutomationSettings(userId, updates);

      res.json({
        success: true,
        message: 'Automation settings updated successfully',
        data: updated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/automation/approvals
   */
  static async getApprovals(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const status = req.query.status as string;

      const filter: any = { userId };
      if (status) {
        filter.status = status;
      }

      const approvals = await AutomationApproval.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        count: approvals.length,
        data: approvals
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/automation/approvals/:id/approve
   */
  static async approveAction(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { id } = req.params;
      const { reason } = req.body || {};

      const result = await ClosedLoopEngine.approveAction(id, userId, reason);

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/automation/approvals/:id/reject
   */
  static async rejectAction(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { id } = req.params;
      const { reason } = req.body || {};

      const result = await ClosedLoopEngine.rejectAction(id, userId, reason);

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/automation/history
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const limit = Number(req.query.limit) || 50;

      const history = await AutomationRun.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.json({
        success: true,
        count: history.length,
        data: history
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/automation/weekly-summary
   */
  static async getWeeklySummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const farmId = req.query.farmId as string;

      const summary = await ClosedLoopEngine.runWeeklyFarmReview(userId, farmId);

      res.json({
        success: true,
        data: summary
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/automation/trigger-event
   */
  static async triggerEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { eventType, farmId, fieldId, cropCycleId, metadata, confidence, severity } = req.body;

      if (!eventType) {
        res.status(400).json({ success: false, error: 'eventType is required' });
        return;
      }

      const run = await ClosedLoopEngine.processEvent({
        eventType,
        userId,
        farmId,
        fieldId,
        cropCycleId,
        metadata,
        confidence,
        severity
      });

      res.status(201).json({
        success: true,
        data: run
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
