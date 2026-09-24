import { Schema, model, Document } from 'mongoose';

export type OutcomeSourceType =
  | 'COPILOT'
  | 'DECISION_ENGINE'
  | 'AGENT'
  | 'DISEASE_AI'
  | 'IRRIGATION'
  | 'PREDICTIVE_INTELLIGENCE'
  | 'WEATHER_ALERT'
  | 'MARKET_INTELLIGENCE'
  | 'FARM_TASK'
  | 'MANUAL_ACTIVITY';

export type OutcomeStatus =
  | 'PENDING'
  | 'OBSERVING'
  | 'REPORTED'
  | 'VALIDATED'
  | 'UNCERTAIN'
  | 'REJECTED';

export type OutcomeType =
  | 'ACTION_COMPLETED'
  | 'ACTION_NOT_COMPLETED'
  | 'CONDITION_IMPROVED'
  | 'CONDITION_UNCHANGED'
  | 'CONDITION_WORSENED'
  | 'RISK_AVOIDED_REPORTED'
  | 'PROBLEM_RESOLVED_REPORTED'
  | 'PROBLEM_PERSISTED'
  | 'HARVEST_COMPLETED'
  | 'YIELD_REPORTED'
  | 'UNKNOWN';

export type EvidenceQuality = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type YieldVerificationType = 'FARMER_REPORTED' | 'VERIFIED' | 'ESTIMATED';

export interface IAgriculturalOutcome extends Document {
  outcomeId: string;
  userId: Schema.Types.ObjectId | string;
  farmId: Schema.Types.ObjectId | string;
  fieldId?: Schema.Types.ObjectId | string;
  cropCycleId?: Schema.Types.ObjectId | string;
  sourceType: OutcomeSourceType;
  sourceId?: string;
  decisionId?: Schema.Types.ObjectId | string;
  actionType?: string;
  observationType?: string;
  outcomeType: OutcomeType;
  status: OutcomeStatus;
  evidence: {
    quality: EvidenceQuality;
    photos?: string[];
    notes?: string;
    measurements?: Record<string, any>;
    farmerFeedback?: string;
    yieldData?: {
      quantity: number;
      unit: string;
      verificationType: YieldVerificationType;
      marketPriceAchieved?: number;
    };
    diseaseProgression?: {
      initialSeverity: string;
      followUpSeverity: string;
      daysToResolution?: number;
    };
  };
  confidence: number;
  causalityDisclaimer: string;
  region?: string;
  observedAt: Date;
  validatedAt?: Date;
  validatedBy?: Schema.Types.ObjectId | string;
  validationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgriculturalOutcomeSchema = new Schema(
  {
    outcomeId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    fieldId: { type: Schema.Types.ObjectId, ref: 'Field', index: true },
    cropCycleId: { type: Schema.Types.ObjectId, ref: 'CropCycle', index: true },
    sourceType: {
      type: String,
      enum: [
        'COPILOT',
        'DECISION_ENGINE',
        'AGENT',
        'DISEASE_AI',
        'IRRIGATION',
        'PREDICTIVE_INTELLIGENCE',
        'WEATHER_ALERT',
        'MARKET_INTELLIGENCE',
        'FARM_TASK',
        'MANUAL_ACTIVITY'
      ],
      required: true,
      index: true
    },
    sourceId: { type: String, index: true },
    decisionId: { type: Schema.Types.ObjectId, ref: 'DecisionRecord', index: true },
    actionType: { type: String, trim: true },
    observationType: { type: String, trim: true },
    outcomeType: {
      type: String,
      enum: [
        'ACTION_COMPLETED',
        'ACTION_NOT_COMPLETED',
        'CONDITION_IMPROVED',
        'CONDITION_UNCHANGED',
        'CONDITION_WORSENED',
        'RISK_AVOIDED_REPORTED',
        'PROBLEM_RESOLVED_REPORTED',
        'PROBLEM_PERSISTED',
        'HARVEST_COMPLETED',
        'YIELD_REPORTED',
        'UNKNOWN'
      ],
      default: 'UNKNOWN',
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'OBSERVING', 'REPORTED', 'VALIDATED', 'UNCERTAIN', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    evidence: {
      quality: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'], default: 'MEDIUM' },
      photos: [{ type: String }],
      notes: { type: String },
      measurements: { type: Schema.Types.Mixed },
      farmerFeedback: { type: String },
      yieldData: {
        quantity: { type: Number },
        unit: { type: String },
        verificationType: {
          type: String,
          enum: ['FARMER_REPORTED', 'VERIFIED', 'ESTIMATED'],
          default: 'FARMER_REPORTED'
        },
        marketPriceAchieved: { type: Number }
      },
      diseaseProgression: {
        initialSeverity: { type: String },
        followUpSeverity: { type: String },
        daysToResolution: { type: Number }
      }
    },
    confidence: { type: Number, default: 0.5, min: 0, max: 1 },
    causalityDisclaimer: {
      type: String,
      default:
        'Correlation observed. Outcome reported without establishing direct mathematical causation.'
    },
    region: { type: String, index: true },
    observedAt: { type: Date, default: Date.now, index: true },
    validatedAt: { type: Date },
    validatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    validationNotes: { type: String }
  },
  { timestamps: true }
);

AgriculturalOutcomeSchema.index({ farmId: 1, observedAt: -1 });
AgriculturalOutcomeSchema.index({ sourceId: 1, sourceType: 1 });
AgriculturalOutcomeSchema.index({ status: 1, observedAt: -1 });

export const AgriculturalOutcome = model<IAgriculturalOutcome>(
  'AgriculturalOutcome',
  AgriculturalOutcomeSchema
);
