import mongoose from 'mongoose';
import {
  AgriculturalOutcome,
  IAgriculturalOutcome,
  OutcomeSourceType,
  OutcomeStatus,
  OutcomeType,
  EvidenceQuality,
  YieldVerificationType
} from '../../models/AgriculturalOutcome';

export interface CreateOutcomeDTO {
  userId: string;
  farmId: string;
  fieldId?: string;
  cropCycleId?: string;
  sourceType: OutcomeSourceType;
  sourceId?: string;
  decisionId?: string;
  actionType?: string;
  observationType?: string;
  outcomeType?: OutcomeType;
  status?: OutcomeStatus;
  evidence?: {
    quality?: EvidenceQuality;
    photos?: string[];
    notes?: string;
    measurements?: Record<string, any>;
    farmerFeedback?: string;
    yieldData?: {
      quantity: number;
      unit: string;
      verificationType?: YieldVerificationType;
      marketPriceAchieved?: number;
    };
    diseaseProgression?: {
      initialSeverity: string;
      followUpSeverity: string;
      daysToResolution?: number;
    };
  };
  confidence?: number;
  region?: string;
  observedAt?: Date;
}

export interface FollowUpObservationDTO {
  outcomeId: string;
  userId: string;
  followUpSeverity?: string;
  daysToResolution?: number;
  notes?: string;
  photos?: string[];
  measurements?: Record<string, any>;
  evidenceQuality?: EvidenceQuality;
  status?: OutcomeStatus;
  outcomeType?: OutcomeType;
}

export interface HarvestOutcomeDTO {
  userId: string;
  farmId: string;
  fieldId?: string;
  cropCycleId: string;
  quantity: number;
  unit: string;
  verificationType?: YieldVerificationType;
  marketPriceAchieved?: number;
  notes?: string;
  region?: string;
}

export class OutcomeLearningService {
  /**
   * Helper check for DB connectivity
   */
  private isDbConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Generate a unique outcome ID
   */
  private generateId(): string {
    return `out_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Log a new agricultural outcome linking decision / recommendation to observation
   */
  async createOutcome(dto: CreateOutcomeDTO): Promise<IAgriculturalOutcome> {
    const outcomeId = this.generateId();

    const outcomeData = {
      outcomeId,
      userId: dto.userId,
      farmId: dto.farmId,
      fieldId: dto.fieldId,
      cropCycleId: dto.cropCycleId,
      sourceType: dto.sourceType,
      sourceId: dto.sourceId,
      decisionId: dto.decisionId,
      actionType: dto.actionType || 'RECOMMENDED_ACTION',
      observationType: dto.observationType || 'GENERAL_OBSERVATION',
      outcomeType: dto.outcomeType || 'UNKNOWN',
      status: dto.status || 'PENDING',
      evidence: {
        quality: dto.evidence?.quality || 'MEDIUM',
        photos: dto.evidence?.photos || [],
        notes: dto.evidence?.notes || '',
        measurements: dto.evidence?.measurements || {},
        farmerFeedback: dto.evidence?.farmerFeedback || '',
        yieldData: dto.evidence?.yieldData,
        diseaseProgression: dto.evidence?.diseaseProgression
      },
      confidence: dto.confidence ?? 0.5,
      causalityDisclaimer:
        'Correlation observed. Outcome reported without establishing direct mathematical causation.',
      region: dto.region || 'GLOBAL',
      observedAt: dto.observedAt || new Date()
    };

    if (!this.isDbConnected()) {
      return outcomeData as unknown as IAgriculturalOutcome;
    }

    const doc = new AgriculturalOutcome(outcomeData);
    return await doc.save();
  }

  /**
   * Record follow-up observation (e.g. disease progression scan, moisture change after irrigation)
   */
  async recordFollowUpObservation(dto: FollowUpObservationDTO): Promise<IAgriculturalOutcome | null> {
    if (!this.isDbConnected()) {
      return null;
    }

    const outcome = await AgriculturalOutcome.findOne({ outcomeId: dto.outcomeId });
    if (!outcome) {
      throw new Error(`Outcome ${dto.outcomeId} not found`);
    }

    if (dto.followUpSeverity) {
      if (!outcome.evidence.diseaseProgression) {
        outcome.evidence.diseaseProgression = {
          initialSeverity: 'UNKNOWN',
          followUpSeverity: dto.followUpSeverity,
          daysToResolution: dto.daysToResolution
        };
      } else {
        outcome.evidence.diseaseProgression.followUpSeverity = dto.followUpSeverity;
        if (dto.daysToResolution !== undefined) {
          outcome.evidence.diseaseProgression.daysToResolution = dto.daysToResolution;
        }
      }

      // Infer outcome type if disease progression is clear
      const init = (outcome.evidence.diseaseProgression.initialSeverity || 'UNKNOWN').toUpperCase();
      const follow = dto.followUpSeverity.toUpperCase();

      if (follow === 'RESOLVED' || (follow === 'MILD' && (init === 'SEVERE' || init === 'MODERATE'))) {
        outcome.outcomeType = 'CONDITION_IMPROVED';
      } else if (follow === init) {
        outcome.outcomeType = 'CONDITION_UNCHANGED';
      } else if (follow === 'SEVERE' && init !== 'SEVERE') {
        outcome.outcomeType = 'CONDITION_WORSENED';
      }
    }

    if (dto.notes) {
      outcome.evidence.notes = (outcome.evidence.notes ? outcome.evidence.notes + '\n' : '') + dto.notes;
    }

    if (dto.photos && dto.photos.length > 0) {
      outcome.evidence.photos = [...(outcome.evidence.photos || []), ...dto.photos];
    }

    if (dto.measurements) {
      outcome.evidence.measurements = {
        ...(outcome.evidence.measurements || {}),
        ...dto.measurements
      };
    }

    if (dto.evidenceQuality) {
      outcome.evidence.quality = dto.evidenceQuality;
    }

    if (dto.status) {
      outcome.status = dto.status;
    } else {
      outcome.status = 'REPORTED';
    }

    if (dto.outcomeType) {
      outcome.outcomeType = dto.outcomeType;
    }

    return await outcome.save();
  }

  /**
   * Record harvest yield outcome without false causality assertions
   */
  async recordHarvestOutcome(dto: HarvestOutcomeDTO): Promise<IAgriculturalOutcome> {
    return await this.createOutcome({
      userId: dto.userId,
      farmId: dto.farmId,
      fieldId: dto.fieldId,
      cropCycleId: dto.cropCycleId,
      sourceType: 'FARM_TASK',
      actionType: 'HARVEST_LOGGED',
      observationType: 'YIELD_RECORDED',
      outcomeType: 'YIELD_REPORTED',
      status: 'REPORTED',
      evidence: {
        quality: dto.verificationType === 'VERIFIED' ? 'HIGH' : 'MEDIUM',
        notes: dto.notes || 'Harvest yield logged by farmer',
        yieldData: {
          quantity: dto.quantity,
          unit: dto.unit,
          verificationType: dto.verificationType || 'FARMER_REPORTED',
          marketPriceAchieved: dto.marketPriceAchieved
        }
      },
      confidence: dto.verificationType === 'VERIFIED' ? 0.9 : 0.7,
      region: dto.region
    });
  }

  /**
   * Expert / Admin outcome validation
   */
  async validateOutcome(
    outcomeId: string,
    validatorUserId: string,
    status: 'VALIDATED' | 'UNCERTAIN' | 'REJECTED',
    validationNotes?: string,
    quality?: EvidenceQuality
  ): Promise<IAgriculturalOutcome | null> {
    if (!this.isDbConnected()) {
      return null;
    }

    const outcome = await AgriculturalOutcome.findOne({ outcomeId });
    if (!outcome) {
      throw new Error(`Outcome ${outcomeId} not found`);
    }

    outcome.status = status;
    outcome.validatedBy = validatorUserId as any;
    outcome.validatedAt = new Date();
    if (validationNotes) {
      outcome.validationNotes = validationNotes;
    }
    if (quality) {
      outcome.evidence.quality = quality;
    }

    return await outcome.save();
  }

  /**
   * Fetch farm outcome history
   */
  async getFarmOutcomeHistory(farmId: string, limit = 20): Promise<IAgriculturalOutcome[]> {
    if (!this.isDbConnected()) {
      return [];
    }
    return await AgriculturalOutcome.find({ farmId })
      .sort({ observedAt: -1 })
      .limit(limit)
      .lean() as unknown as IAgriculturalOutcome[];
  }

  /**
   * Fetch crop cycle outcome history
   */
  async getCropOutcomeHistory(cropCycleId: string): Promise<IAgriculturalOutcome[]> {
    if (!this.isDbConnected()) {
      return [];
    }
    return await AgriculturalOutcome.find({ cropCycleId })
      .sort({ observedAt: -1 })
      .lean() as unknown as IAgriculturalOutcome[];
  }

  /**
   * Admin review queue for outcomes needing expert verification
   */
  async getAdminReviewQueue(status?: OutcomeStatus, limit = 50): Promise<IAgriculturalOutcome[]> {
    if (!this.isDbConnected()) {
      return [];
    }
    const filter = status ? { status } : { status: { $in: ['PENDING', 'REPORTED', 'OBSERVING'] } };
    return await AgriculturalOutcome.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean() as unknown as IAgriculturalOutcome[];
  }

  /**
   * Format outcome context safely for AI Copilot / Decision Engine context enrichment
   */
  async getOutcomeContextForAI(farmId: string): Promise<{
    hasHistory: boolean;
    totalOutcomes: number;
    improvedCount: number;
    worsenedCount: number;
    summaryText: string;
    causalityNotice: string;
  }> {
    const causalityNotice =
      'NOTE: Historical outcomes reflect observed correlations and farmer reports. No causality guaranteed.';

    if (!this.isDbConnected()) {
      return {
        hasHistory: false,
        totalOutcomes: 0,
        improvedCount: 0,
        worsenedCount: 0,
        summaryText: 'No outcome history available (Offline).',
        causalityNotice
      };
    }

    const outcomes = await AgriculturalOutcome.find({ farmId })
      .sort({ observedAt: -1 })
      .limit(10)
      .lean();

    if (!outcomes || outcomes.length === 0) {
      return {
        hasHistory: false,
        totalOutcomes: 0,
        improvedCount: 0,
        worsenedCount: 0,
        summaryText: 'No prior outcomes logged for this farm.',
        causalityNotice
      };
    }

    let improved = 0;
    let worsened = 0;
    const items: string[] = [];

    for (const o of outcomes) {
      if (o.outcomeType === 'CONDITION_IMPROVED' || o.outcomeType === 'PROBLEM_RESOLVED_REPORTED') {
        improved++;
      } else if (o.outcomeType === 'CONDITION_WORSENED' || o.outcomeType === 'PROBLEM_PERSISTED') {
        worsened++;
      }
      items.push(
        `Source: ${o.sourceType}, Action: ${o.actionType}, Outcome: ${o.outcomeType} (Status: ${o.status})`
      );
    }

    const summaryText = `Farm Outcome History (${outcomes.length} records analyzed): ${improved} reported improvements, ${worsened} reported worsenings.\nLatest Records:\n` + items.join('\n');

    return {
      hasHistory: true,
      totalOutcomes: outcomes.length,
      improvedCount: improved,
      worsenedCount: worsened,
      summaryText,
      causalityNotice
    };
  }
}

export const outcomeLearningService = new OutcomeLearningService();
