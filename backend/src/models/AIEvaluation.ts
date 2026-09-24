import { Schema, model, Document } from 'mongoose';

export type AISourceType =
  | 'COPILOT'
  | 'DECISION_ENGINE'
  | 'AGENT'
  | 'DISEASE_AI'
  | 'IRRIGATION_AI'
  | 'PREDICTIVE_INTELLIGENCE'
  | 'MARKET_INTELLIGENCE'
  | 'WEATHER_INTELLIGENCE'
  | 'KNOWLEDGE_ENGINE'
  | 'FARM_PLANNING';

export type AIEvaluationStatus =
  | 'NOT_EVALUATED'
  | 'PENDING'
  | 'USER_REVIEWED'
  | 'EXPERT_REVIEWED'
  | 'OUTCOME_AVAILABLE'
  | 'VALIDATED'
  | 'UNCERTAIN'
  | 'REJECTED';

export type AIFailureCategory =
  | 'NONE'
  | 'MISSING_CONTEXT'
  | 'OUTDATED_DATA'
  | 'WRONG_CROP'
  | 'WRONG_REGION'
  | 'WRONG_UNIT'
  | 'WRONG_LANGUAGE'
  | 'INCORRECT_REASONING'
  | 'UNSUPPORTED_CLAIM'
  | 'UNSAFE_RECOMMENDATION'
  | 'TOOL_FAILURE'
  | 'PROVIDER_FAILURE'
  | 'HALLUCINATION'
  | 'DUPLICATE_ACTION'
  | 'POLICY_ERROR'
  | 'VERIFICATION_FAILURE';

export interface IAIEvaluation extends Document {
  evaluationId: string;
  userId: Schema.Types.ObjectId | string;
  organizationId?: Schema.Types.ObjectId | string;
  farmId?: Schema.Types.ObjectId | string;
  fieldId?: Schema.Types.ObjectId | string;
  cropCycleId?: Schema.Types.ObjectId | string;
  sourceType: AISourceType;
  feature: string;
  modelProvider: string;
  modelName: string;
  modelVersion: string;
  promptVersion: string;
  knowledgeVersion: string;
  inputContextReference?: any;
  outputReference?: any;
  evidenceReferences?: Array<{
    type: string;
    source: string;
    detail: string;
    confidence?: number;
  }>;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  uncertainty?: {
    isUncertain: boolean;
    missingData?: string[];
    identifiedUncertainties?: string[];
  };
  userFeedback?: {
    rating: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT' | 'PARTIALLY_CORRECT' | 'NOT_RELEVANT' | 'UNSAFE' | 'OUTDATED' | 'MISSING_CONTEXT';
    comment?: string;
    submittedAt?: Date;
  };
  expertReview?: {
    expertUserId: Schema.Types.ObjectId | string;
    decision: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT' | 'UNCERTAIN';
    corrections?: string;
    notes?: string;
    reviewedAt?: Date;
  };
  outcomeReference?: {
    outcomeId?: string;
    status?: string;
    verifiedYield?: number;
    conditionAfterward?: string;
  };
  evaluationStatus: AIEvaluationStatus;
  failureCategory: AIFailureCategory;
  correlationId?: string;
  region?: string;
  language?: string;
  createdAt: Date;
  evaluatedAt?: Date;
}

const AIEvaluationSchema = new Schema(
  {
    evaluationId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    fieldId: { type: Schema.Types.ObjectId, ref: 'Field', index: true },
    cropCycleId: { type: Schema.Types.ObjectId, ref: 'CropCycle', index: true },
    sourceType: {
      type: String,
      enum: [
        'COPILOT',
        'DECISION_ENGINE',
        'AGENT',
        'DISEASE_AI',
        'IRRIGATION_AI',
        'PREDICTIVE_INTELLIGENCE',
        'MARKET_INTELLIGENCE',
        'WEATHER_INTELLIGENCE',
        'KNOWLEDGE_ENGINE',
        'FARM_PLANNING'
      ],
      required: true,
      index: true
    },
    feature: { type: String, required: true, index: true },
    modelProvider: { type: String, default: 'Google Gemini' },
    modelName: { type: String, default: 'gemini-3.1-flash-lite' },
    modelVersion: { type: String, default: '1.0.0' },
    promptVersion: { type: String, default: '1.0.0' },
    knowledgeVersion: { type: String, default: '1.0.0' },
    inputContextReference: { type: Schema.Types.Mixed },
    outputReference: { type: Schema.Types.Mixed },
    evidenceReferences: [
      {
        type: { type: String },
        source: { type: String },
        detail: { type: String },
        confidence: { type: Number }
      }
    ],
    confidenceLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    uncertainty: {
      isUncertain: { type: Boolean, default: false },
      missingData: [{ type: String }],
      identifiedUncertainties: [{ type: String }]
    },
    userFeedback: {
      rating: {
        type: String,
        enum: [
          'HELPFUL',
          'NOT_HELPFUL',
          'INCORRECT',
          'PARTIALLY_CORRECT',
          'NOT_RELEVANT',
          'UNSAFE',
          'OUTDATED',
          'MISSING_CONTEXT'
        ]
      },
      comment: { type: String },
      submittedAt: { type: Date }
    },
    expertReview: {
      expertUserId: { type: Schema.Types.ObjectId, ref: 'User' },
      decision: {
        type: String,
        enum: ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'UNCERTAIN']
      },
      corrections: { type: String },
      notes: { type: String },
      reviewedAt: { type: Date }
    },
    outcomeReference: {
      outcomeId: { type: String },
      status: { type: String },
      verifiedYield: { type: Number },
      conditionAfterward: { type: String }
    },
    evaluationStatus: {
      type: String,
      enum: [
        'NOT_EVALUATED',
        'PENDING',
        'USER_REVIEWED',
        'EXPERT_REVIEWED',
        'OUTCOME_AVAILABLE',
        'VALIDATED',
        'UNCERTAIN',
        'REJECTED'
      ],
      default: 'PENDING',
      index: true
    },
    failureCategory: {
      type: String,
      enum: [
        'NONE',
        'MISSING_CONTEXT',
        'OUTDATED_DATA',
        'WRONG_CROP',
        'WRONG_REGION',
        'WRONG_UNIT',
        'WRONG_LANGUAGE',
        'INCORRECT_REASONING',
        'UNSUPPORTED_CLAIM',
        'UNSAFE_RECOMMENDATION',
        'TOOL_FAILURE',
        'PROVIDER_FAILURE',
        'HALLUCINATION',
        'DUPLICATE_ACTION',
        'POLICY_ERROR',
        'VERIFICATION_FAILURE'
      ],
      default: 'NONE',
      index: true
    },
    correlationId: { type: String, index: true },
    region: { type: String, index: true },
    language: { type: String, default: 'en' },
    evaluatedAt: { type: Date }
  },
  { timestamps: true }
);

AIEvaluationSchema.index({ farmId: 1, createdAt: -1 });
AIEvaluationSchema.index({ feature: 1, evaluationStatus: 1 });

export const AIEvaluation = model<IAIEvaluation>('AIEvaluation', AIEvaluationSchema);
