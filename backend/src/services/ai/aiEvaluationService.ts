import mongoose from 'mongoose';
import {
  AIEvaluation,
  IAIEvaluation,
  AISourceType,
  AIEvaluationStatus,
  AIFailureCategory
} from '../../models/AIEvaluation';
import { AIIncident, IAIIncident } from '../../models/AIIncident';
import { AISafetyValidator } from './aiSafetyValidator';

export interface CreateEvaluationDTO {
  userId: string;
  organizationId?: string;
  farmId?: string;
  fieldId?: string;
  cropCycleId?: string;
  sourceType: AISourceType;
  feature: string;
  modelProvider?: string;
  modelName?: string;
  modelVersion?: string;
  promptVersion?: string;
  knowledgeVersion?: string;
  inputContextReference?: any;
  outputReference?: any;
  evidenceReferences?: Array<{ type: string; source: string; detail: string; confidence?: number }>;
  confidenceLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  uncertainty?: { isUncertain: boolean; missingData?: string[]; identifiedUncertainties?: string[] };
  correlationId?: string;
  region?: string;
  language?: string;
}

export interface UserFeedbackDTO {
  evaluationId: string;
  userId: string;
  rating: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT' | 'PARTIALLY_CORRECT' | 'NOT_RELEVANT' | 'UNSAFE' | 'OUTDATED' | 'MISSING_CONTEXT';
  comment?: string;
}

export interface ExpertReviewDTO {
  evaluationId: string;
  expertUserId: string;
  decision: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT' | 'UNCERTAIN';
  corrections?: string;
  notes?: string;
}

export interface ReportIncidentDTO {
  userId: string;
  farmId?: string;
  evaluationId?: string;
  feature: string;
  category: 'UNSAFE_RECOMMENDATION' | 'PATHOLOGY_MISDIAGNOSIS' | 'UNAUTHORIZED_TOOL_EXECUTION' | 'CROSS_FARM_EXPOSURE' | 'REGULATORY_MISALIGNMENT' | 'HALLUCINATION' | 'PROMPT_INJECTION_ATTEMPT';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  evidence?: any;
}

export class AIEvaluationService {
  private static killSwitches: Map<string, boolean> = new Map();

  private static isDbConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private static generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Emergency Kill Switch Management
   */
  static setKillSwitch(key: string, disabled: boolean): void {
    this.killSwitches.set(key, disabled);
  }

  static isKillSwitchActive(key: string): boolean {
    return this.killSwitches.get(key) === true;
  }

  static getActiveKillSwitches(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    this.killSwitches.forEach((val, key) => {
      result[key] = val;
    });
    return result;
  }

  /**
   * Register a new AI Evaluation Record
   */
  static async recordEvaluation(dto: CreateEvaluationDTO): Promise<IAIEvaluation> {
    const evaluationId = this.generateId('aiev');

    const evalData = {
      evaluationId,
      userId: dto.userId,
      organizationId: dto.organizationId,
      farmId: dto.farmId,
      fieldId: dto.fieldId,
      cropCycleId: dto.cropCycleId,
      sourceType: dto.sourceType,
      feature: dto.feature,
      modelProvider: dto.modelProvider || 'Google Gemini',
      modelName: dto.modelName || 'gemini-3.1-flash-lite',
      modelVersion: dto.modelVersion || '1.0.0',
      promptVersion: dto.promptVersion || '1.0.0',
      knowledgeVersion: dto.knowledgeVersion || '1.0.0',
      inputContextReference: dto.inputContextReference,
      outputReference: dto.outputReference,
      evidenceReferences: dto.evidenceReferences || [],
      confidenceLevel: dto.confidenceLevel || 'MEDIUM',
      uncertainty: dto.uncertainty || { isUncertain: false, missingData: [], identifiedUncertainties: [] },
      evaluationStatus: 'PENDING',
      failureCategory: 'NONE',
      correlationId: dto.correlationId,
      region: dto.region || 'IN',
      language: dto.language || 'en'
    };

    if (!this.isDbConnected()) {
      return evalData as unknown as IAIEvaluation;
    }

    const doc = new AIEvaluation(evalData);
    return await doc.save();
  }

  /**
   * Submit farmer feedback for an AI recommendation
   */
  static async submitUserFeedback(dto: UserFeedbackDTO): Promise<IAIEvaluation | null> {
    if (!this.isDbConnected()) return null;

    const evalDoc = await AIEvaluation.findOne({ evaluationId: dto.evaluationId });
    if (!evalDoc) {
      throw new Error(`AI Evaluation record ${dto.evaluationId} not found`);
    }

    evalDoc.userFeedback = {
      rating: dto.rating,
      comment: dto.comment,
      submittedAt: new Date()
    };
    evalDoc.evaluationStatus = 'USER_REVIEWED';

    if (dto.rating === 'INCORRECT' || dto.rating === 'UNSAFE' || dto.rating === 'NOT_RELEVANT') {
      evalDoc.failureCategory = dto.rating === 'UNSAFE' ? 'UNSAFE_RECOMMENDATION' : 'INCORRECT_REASONING';

      // Auto report incident for unsafe feedback
      if (dto.rating === 'UNSAFE') {
        await this.reportIncident({
          userId: dto.userId,
          evaluationId: dto.evaluationId,
          feature: evalDoc.feature,
          category: 'UNSAFE_RECOMMENDATION',
          severity: 'HIGH',
          description: dto.comment || 'Farmer flagged recommendation as unsafe.'
        });
      }
    }

    return await evalDoc.save();
  }

  /**
   * Submit specialist / expert review for AI output
   */
  static async submitExpertReview(dto: ExpertReviewDTO): Promise<IAIEvaluation | null> {
    if (!this.isDbConnected()) return null;

    const evalDoc = await AIEvaluation.findOne({ evaluationId: dto.evaluationId });
    if (!evalDoc) {
      throw new Error(`AI Evaluation record ${dto.evaluationId} not found`);
    }

    evalDoc.expertReview = {
      expertUserId: dto.expertUserId,
      decision: dto.decision,
      corrections: dto.corrections,
      notes: dto.notes,
      reviewedAt: new Date()
    };
    evalDoc.evaluationStatus = 'EXPERT_REVIEWED';

    if (dto.decision === 'CORRECT') {
      evalDoc.evaluationStatus = 'VALIDATED';
    } else if (dto.decision === 'INCORRECT') {
      evalDoc.evaluationStatus = 'REJECTED';
    }

    return await evalDoc.save();
  }

  /**
   * Report AI Incident
   */
  static async reportIncident(dto: ReportIncidentDTO): Promise<IAIIncident> {
    const incidentId = this.generateId('inc');

    const incidentData = {
      incidentId,
      evaluationId: dto.evaluationId,
      userId: dto.userId,
      farmId: dto.farmId,
      feature: dto.feature,
      category: dto.category,
      severity: dto.severity || 'MEDIUM',
      description: dto.description,
      evidence: dto.evidence,
      status: 'OPEN'
    };

    if (!this.isDbConnected()) {
      return incidentData as unknown as IAIIncident;
    }

    const doc = new AIIncident(incidentData);
    return await doc.save();
  }

  /**
   * Resolve AI Incident
   */
  static async resolveIncident(incidentId: string, assignedToUserId: string, resolutionNotes: string): Promise<IAIIncident | null> {
    if (!this.isDbConnected()) return null;

    const incident = await AIIncident.findOne({ incidentId });
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    incident.status = 'RESOLVED';
    incident.assignedTo = assignedToUserId as any;
    incident.resolutionNotes = resolutionNotes;
    incident.resolvedAt = new Date();

    return await incident.save();
  }

  /**
   * Compute Descriptive Governance Metrics for Admin Dashboard
   */
  static async getGovernanceMetrics(): Promise<{
    totalEvaluations: number;
    userFeedbackCount: number;
    expertReviewCount: number;
    openIncidentsCount: number;
    failureCategoryDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
    activeKillSwitches: Record<string, boolean>;
  }> {
    if (!this.isDbConnected()) {
      return {
        totalEvaluations: 0,
        userFeedbackCount: 0,
        expertReviewCount: 0,
        openIncidentsCount: 0,
        failureCategoryDistribution: {},
        statusDistribution: {},
        activeKillSwitches: this.getActiveKillSwitches()
      };
    }

    const totalEvaluations = await AIEvaluation.countDocuments();
    const userFeedbackCount = await AIEvaluation.countDocuments({ 'userFeedback.rating': { $exists: true } });
    const expertReviewCount = await AIEvaluation.countDocuments({ 'expertReview.decision': { $exists: true } });
    const openIncidentsCount = await AIIncident.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW'] } });

    // Aggregations
    const failures = await AIEvaluation.aggregate([
      { $group: { _id: '$failureCategory', count: { $sum: 1 } } }
    ]);
    const statuses = await AIEvaluation.aggregate([
      { $group: { _id: '$evaluationStatus', count: { $sum: 1 } } }
    ]);

    const failureCategoryDistribution: Record<string, number> = {};
    failures.forEach((f: any) => { failureCategoryDistribution[f._id] = f.count; });

    const statusDistribution: Record<string, number> = {};
    statuses.forEach((s: any) => { statusDistribution[s._id] = s.count; });

    return {
      totalEvaluations,
      userFeedbackCount,
      expertReviewCount,
      openIncidentsCount,
      failureCategoryDistribution,
      statusDistribution,
      activeKillSwitches: this.getActiveKillSwitches()
    };
  }
}
