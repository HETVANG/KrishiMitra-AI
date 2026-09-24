import { Request, Response } from 'express';
import { AIEvaluationService } from '../services/ai/aiEvaluationService';
import { AIEvaluation } from '../models/AIEvaluation';
import { AIIncident } from '../models/AIIncident';

export class AIAdminController {
  /**
   * POST /api/ai/evaluations
   */
  static async createEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const {
        organizationId,
        farmId,
        fieldId,
        cropCycleId,
        sourceType,
        feature,
        modelProvider,
        modelName,
        modelVersion,
        promptVersion,
        knowledgeVersion,
        inputContextReference,
        outputReference,
        evidenceReferences,
        confidenceLevel,
        uncertainty,
        correlationId,
        region,
        language
      } = req.body;

      if (!sourceType || !feature) {
        res.status(400).json({ success: false, error: 'sourceType and feature are required' });
        return;
      }

      const evaluation = await AIEvaluationService.recordEvaluation({
        userId,
        organizationId,
        farmId,
        fieldId,
        cropCycleId,
        sourceType,
        feature,
        modelProvider,
        modelName,
        modelVersion,
        promptVersion,
        knowledgeVersion,
        inputContextReference,
        outputReference,
        evidenceReferences,
        confidenceLevel,
        uncertainty,
        correlationId,
        region,
        language
      });

      res.status(201).json({ success: true, data: evaluation });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/ai/evaluations/:id
   */
  static async getEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const doc = await AIEvaluation.findOne({ evaluationId: id }).lean();
      if (!doc) {
        res.status(404).json({ success: false, error: 'AI evaluation record not found' });
        return;
      }
      res.json({ success: true, data: doc });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/ai/feedback
   */
  static async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { evaluationId, rating, comment } = req.body;

      if (!evaluationId || !rating) {
        res.status(400).json({ success: false, error: 'evaluationId and rating are required' });
        return;
      }

      const updated = await AIEvaluationService.submitUserFeedback({
        evaluationId,
        userId,
        rating,
        comment
      });

      res.json({ success: true, message: 'Farmer feedback submitted', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/ai/expert-review
   */
  static async submitExpertReview(req: Request, res: Response): Promise<void> {
    try {
      const expertUserId = (req as any).user?.id || (req as any).user?._id;
      const { evaluationId, decision, corrections, notes } = req.body;

      if (!evaluationId || !decision) {
        res.status(400).json({ success: false, error: 'evaluationId and decision are required' });
        return;
      }

      const updated = await AIEvaluationService.submitExpertReview({
        evaluationId,
        expertUserId,
        decision,
        corrections,
        notes
      });

      res.json({ success: true, message: 'Expert review submitted', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/ai/incidents
   */
  static async reportIncident(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { evaluationId, farmId, feature, category, severity, description, evidence } = req.body;

      if (!feature || !category || !description) {
        res.status(400).json({ success: false, error: 'feature, category, and description are required' });
        return;
      }

      const incident = await AIEvaluationService.reportIncident({
        userId,
        farmId,
        evaluationId,
        feature,
        category,
        severity,
        description,
        evidence
      });

      res.status(201).json({ success: true, data: incident });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/admin/ai/governance
   */
  static async getGovernanceDashboard(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await AIEvaluationService.getGovernanceMetrics();
      res.json({ success: true, data: metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/admin/ai/incidents
   */
  static async getIncidents(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string;
      const filter: any = {};
      if (status) filter.status = status;

      const incidents = await AIIncident.find(filter).sort({ createdAt: -1 }).lean();
      res.json({ success: true, count: incidents.length, data: incidents });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/admin/ai/incidents/:id/review
   */
  static async resolveIncident(req: Request, res: Response): Promise<void> {
    try {
      const assignedToUserId = (req as any).user?.id || (req as any).user?._id;
      const { id } = req.params;
      const { resolutionNotes } = req.body;

      const updated = await AIEvaluationService.resolveIncident(id, assignedToUserId, resolutionNotes || 'Resolved');
      res.json({ success: true, message: 'Incident resolved', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/admin/ai/kill-switch
   */
  static async toggleKillSwitch(req: Request, res: Response): Promise<void> {
    try {
      const { targetKey, disabled } = req.body;
      if (!targetKey || disabled === undefined) {
        res.status(400).json({ success: false, error: 'targetKey and disabled boolean are required' });
        return;
      }

      AIEvaluationService.setKillSwitch(targetKey, disabled);
      res.json({
        success: true,
        message: `Kill switch for ${targetKey} set to ${disabled}`,
        activeKillSwitches: AIEvaluationService.getActiveKillSwitches()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
