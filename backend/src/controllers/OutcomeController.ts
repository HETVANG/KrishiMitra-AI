import { Request, Response } from 'express';
import { outcomeLearningService } from '../services/outcomes/outcomeLearningService';

export class OutcomeController {
  /**
   * POST /api/outcomes
   * Log a new agricultural outcome record
   */
  static async createOutcome(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const {
        farmId,
        fieldId,
        cropCycleId,
        sourceType,
        sourceId,
        decisionId,
        actionType,
        observationType,
        outcomeType,
        status,
        evidence,
        confidence,
        region,
        observedAt
      } = req.body;

      if (!farmId || !sourceType) {
        res.status(400).json({
          success: false,
          error: 'farmId and sourceType are required'
        });
        return;
      }

      const outcome = await outcomeLearningService.createOutcome({
        userId,
        farmId,
        fieldId,
        cropCycleId,
        sourceType,
        sourceId,
        decisionId,
        actionType,
        observationType,
        outcomeType,
        status,
        evidence,
        confidence,
        region,
        observedAt
      });

      res.status(201).json({
        success: true,
        data: outcome
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/outcomes/follow-up
   * Record follow-up observation (e.g., disease progression, soil moisture post-irrigation)
   */
  static async recordFollowUp(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const {
        outcomeId,
        followUpSeverity,
        daysToResolution,
        notes,
        photos,
        measurements,
        evidenceQuality,
        status,
        outcomeType
      } = req.body;

      if (!outcomeId) {
        res.status(400).json({
          success: false,
          error: 'outcomeId is required'
        });
        return;
      }

      const outcome = await outcomeLearningService.recordFollowUpObservation({
        outcomeId,
        userId,
        followUpSeverity,
        daysToResolution,
        notes,
        photos,
        measurements,
        evidenceQuality,
        status,
        outcomeType
      });

      res.json({
        success: true,
        data: outcome
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/outcomes/harvest
   * Log harvest yield outcome record
   */
  static async recordHarvest(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const {
        farmId,
        fieldId,
        cropCycleId,
        quantity,
        unit,
        verificationType,
        marketPriceAchieved,
        notes,
        region
      } = req.body;

      if (!farmId || !cropCycleId || quantity === undefined || !unit) {
        res.status(400).json({
          success: false,
          error: 'farmId, cropCycleId, quantity, and unit are required'
        });
        return;
      }

      const outcome = await outcomeLearningService.recordHarvestOutcome({
        userId,
        farmId,
        fieldId,
        cropCycleId,
        quantity,
        unit,
        verificationType,
        marketPriceAchieved,
        notes,
        region
      });

      res.status(201).json({
        success: true,
        data: outcome
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * PUT /api/outcomes/:outcomeId/validate
   * Admin or expert outcome validation
   */
  static async validateOutcome(req: Request, res: Response): Promise<void> {
    try {
      const validatorUserId = (req as any).user?.id || (req as any).user?._id;
      const { outcomeId } = req.params;
      const { status, validationNotes, quality } = req.body;

      if (!['VALIDATED', 'UNCERTAIN', 'REJECTED'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'status must be VALIDATED, UNCERTAIN, or REJECTED'
        });
        return;
      }

      const outcome = await outcomeLearningService.validateOutcome(
        outcomeId,
        validatorUserId,
        status,
        validationNotes,
        quality
      );

      res.json({
        success: true,
        data: outcome
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/outcomes/farm/:farmId
   * Get farm outcome history
   */
  static async getFarmHistory(req: Request, res: Response): Promise<void> {
    try {
      const { farmId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const history = await outcomeLearningService.getFarmOutcomeHistory(farmId, limit);

      res.json({
        success: true,
        data: history
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/outcomes/crop-cycle/:cropCycleId
   * Get crop cycle outcome history
   */
  static async getCropHistory(req: Request, res: Response): Promise<void> {
    try {
      const { cropCycleId } = req.params;

      const history = await outcomeLearningService.getCropOutcomeHistory(cropCycleId);

      res.json({
        success: true,
        data: history
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/outcomes/ai-context/:farmId
   * Get AI context summary for outcomes
   */
  static async getAIContext(req: Request, res: Response): Promise<void> {
    try {
      const { farmId } = req.params;

      const context = await outcomeLearningService.getOutcomeContextForAI(farmId);

      res.json({
        success: true,
        data: context
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/outcomes/admin/review-queue
   * Get outcomes queue for expert / admin validation
   */
  static async getReviewQueue(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as any;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const queue = await outcomeLearningService.getAdminReviewQueue(status, limit);

      res.json({
        success: true,
        data: queue
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
