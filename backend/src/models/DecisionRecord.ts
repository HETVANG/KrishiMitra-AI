import { Schema, model } from 'mongoose';

const DecisionRecordSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    field: { type: Schema.Types.ObjectId, ref: 'Field', index: true },
    cropCycle: { type: Schema.Types.ObjectId, ref: 'CropCycle', index: true },
    decisionType: {
      type: String,
      enum: [
        'IRRIGATION_DECISION',
        'CROP_HEALTH_DECISION',
        'DISEASE_RESPONSE_DECISION',
        'NUTRIENT_DECISION',
        'WEATHER_RESPONSE_DECISION',
        'CROP_STAGE_DECISION',
        'FARM_TASK_DECISION',
        'HARVEST_DECISION',
        'MARKET_INFORMATION_DECISION',
        'RISK_ALERT_DECISION',
        'EXPERT_CONSULTATION_DECISION'
      ],
      required: true,
      index: true
    },
    objective: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['EVALUATED', 'INSUFFICIENT_DATA', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED'],
      default: 'EVALUATED',
      index: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    timeframe: {
      type: String,
      enum: ['NOW', 'TODAY', 'NEXT_24_HOURS', 'NEXT_3_DAYS', 'NEXT_7_DAYS', 'SEASON'],
      default: 'TODAY'
    },
    evidence: [
      {
        source: { type: String, required: true },
        sourceType: { type: String, required: true },
        value: { type: Schema.Types.Mixed },
        observedAt: { type: String },
        freshness: { type: String },
        confidence: { type: Number, default: 0.8 },
        relevance: { type: String, enum: ['high', 'medium', 'low'], default: 'high' }
      }
    ],
    observations: [{ type: String }],
    risks: [
      {
        category: { type: String },
        riskScore: { type: Number },
        riskLevel: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'UNKNOWN'] },
        reasons: [{ type: String }],
        timeHorizon: { type: String },
        confidence: { type: Number }
      }
    ],
    options: [
      {
        id: { type: String },
        title: { type: String },
        action: { type: String },
        benefits: [{ type: String }],
        risks: [{ type: String }],
        requirements: [{ type: String }],
        urgency: { type: String },
        approvalRequired: { type: Boolean, default: false }
      }
    ],
    recommendation: {
      action: { type: String },
      summary: { type: String },
      rationale: { type: String },
      expectedOutcome: { type: String }
    },
    confidence: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT_DATA'],
      default: 'MEDIUM'
    },
    confidenceScore: { type: Number, default: 0.8 },
    uncertainty: {
      identifiedUncertainties: [{ type: String }],
      missingData: [{ type: String }]
    },
    assumptions: [{ type: String }],
    requiredApproval: { type: Boolean, default: false },
    policyReason: { type: String },
    requiredTools: [{ type: String }],
    actionPlan: [
      {
        stepNumber: { type: Number },
        action: { type: String },
        reason: { type: String },
        priority: { type: String },
        deadline: { type: String },
        approvalRequired: { type: Boolean, default: false },
        status: { type: String, enum: ['PENDING', 'EXECUTED', 'FAILED'], default: 'PENDING' }
      }
    ],
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    executedAt: { type: Date },
    verifiedAt: { type: Date },
    outcomeNotes: { type: String },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

DecisionRecordSchema.index({ user: 1, farm: 1, status: 1 });
DecisionRecordSchema.index({ createdAt: -1 });

export const DecisionRecord = model('DecisionRecord', DecisionRecordSchema);
