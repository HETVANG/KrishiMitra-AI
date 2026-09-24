import { Schema, model, Document } from 'mongoose';

export interface IAutomationRun extends Document {
  runId: string;
  userId: Schema.Types.ObjectId | string;
  farmId: Schema.Types.ObjectId | string;
  fieldId?: Schema.Types.ObjectId | string;
  cropCycleId?: Schema.Types.ObjectId | string;
  eventId: string;
  eventType: string;
  source: string;
  autonomyLevel: number; // 0..5
  evidence: {
    quality: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
    items: Array<{
      type: 'FACT' | 'OBSERVATION' | 'INFERENCE' | 'USER_REPORTED' | 'PROVIDER_DATA' | 'AI_INTERPRETATION';
      source: string;
      detail: string;
      confidence: number;
    }>;
  };
  evidenceSufficient: boolean;
  riskAssessment: {
    highestRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    categories: Array<{
      category: 'WEATHER' | 'WATER' | 'DISEASE' | 'CROP_HEALTH' | 'MARKET' | 'TASK' | 'OPERATIONAL' | 'DATA_QUALITY' | 'SYSTEM';
      level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
    }>;
  };
  decision?: {
    category?: string;
    recommendation?: string;
    confidence?: number;
  };
  plan?: {
    objective: string;
    steps: Array<{
      stepId: string;
      toolName: string;
      parameters: any;
      description: string;
      requiresApproval: boolean;
    }>;
  };
  policyEvaluation?: {
    result: 'ALLOW' | 'DENY' | 'REQUIRES_APPROVAL' | 'INSUFFICIENT_DATA';
    reason: string;
    autonomyLevelAllowed: number;
  };
  approvalId?: string;
  executionStatus:
    | 'PENDING'
    | 'WAITING_APPROVAL'
    | 'EXECUTED'
    | 'VERIFIED'
    | 'FAILED'
    | 'REJECTED'
    | 'INSUFFICIENT_DATA'
    | 'SKIPPED_DEDUPLICATED';
  verificationStatus?: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'FAILED' | 'UNKNOWN';
  outcomeId?: string;
  errorDetails?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationRunSchema = new Schema(
  {
    runId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    fieldId: { type: Schema.Types.ObjectId, ref: 'Field', index: true },
    cropCycleId: { type: Schema.Types.ObjectId, ref: 'CropCycle', index: true },
    eventId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    source: { type: String, default: 'SYSTEM' },
    autonomyLevel: { type: Number, default: 2, min: 0, max: 5 },
    evidence: {
      quality: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT'], default: 'MEDIUM' },
      items: [
        {
          type: {
            type: String,
            enum: ['FACT', 'OBSERVATION', 'INFERENCE', 'USER_REPORTED', 'PROVIDER_DATA', 'AI_INTERPRETATION'],
            required: true
          },
          source: { type: String, required: true },
          detail: { type: String, required: true },
          confidence: { type: Number, default: 0.8 }
        }
      ]
    },
    evidenceSufficient: { type: Boolean, default: true },
    riskAssessment: {
      highestRiskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW'
      },
      categories: [
        {
          category: {
            type: String,
            enum: ['WEATHER', 'WATER', 'DISEASE', 'CROP_HEALTH', 'MARKET', 'TASK', 'OPERATIONAL', 'DATA_QUALITY', 'SYSTEM']
          },
          level: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
          description: { type: String }
        }
      ]
    },
    decision: {
      category: { type: String },
      recommendation: { type: String },
      confidence: { type: Number }
    },
    plan: {
      objective: { type: String },
      steps: [
        {
          stepId: { type: String },
          toolName: { type: String },
          parameters: { type: Schema.Types.Mixed },
          description: { type: String },
          requiresApproval: { type: Boolean, default: false }
        }
      ]
    },
    policyEvaluation: {
      result: {
        type: String,
        enum: ['ALLOW', 'DENY', 'REQUIRES_APPROVAL', 'INSUFFICIENT_DATA'],
        default: 'ALLOW'
      },
      reason: { type: String },
      autonomyLevelAllowed: { type: Number }
    },
    approvalId: { type: String, index: true },
    executionStatus: {
      type: String,
      enum: [
        'PENDING',
        'WAITING_APPROVAL',
        'EXECUTED',
        'VERIFIED',
        'FAILED',
        'REJECTED',
        'INSUFFICIENT_DATA',
        'SKIPPED_DEDUPLICATED'
      ],
      default: 'PENDING',
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'PARTIALLY_VERIFIED', 'FAILED', 'UNKNOWN'],
      default: 'UNKNOWN'
    },
    outcomeId: { type: String, index: true },
    errorDetails: { type: String },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

AutomationRunSchema.index({ farmId: 1, createdAt: -1 });
AutomationRunSchema.index({ userId: 1, executionStatus: 1 });

export const AutomationRun = model<IAutomationRun>('AutomationRun', AutomationRunSchema);
