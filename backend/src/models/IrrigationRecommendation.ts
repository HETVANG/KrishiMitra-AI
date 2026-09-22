import { Schema, model } from 'mongoose';

const EvidenceSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const IrrigationRecommendationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    status: {
      type: String,
      enum: ['NEEDS_ATTENTION', 'LIKELY_NEEDED', 'MONITOR', 'LIKELY_NOT_NEEDED', 'EXCESS_MOISTURE_RISK', 'INSUFFICIENT_DATA'],
      required: true
    },
    level: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
    summary: { type: String, required: true, trim: true },
    reasons: [{ type: String }],
    evidence: [EvidenceSchema],
    recommendedActions: [
      {
        title: { type: String, required: true },
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        reason: { type: String, required: true }
      }
    ],
    timeframe: { type: String, default: 'today' },
    confidence: { type: Number, default: 0.85 },
    dataFreshness: {
      weatherUpdated: { type: Date },
      lastIrrigationDate: { type: Date },
      hasSoilMoisture: { type: Boolean, default: false }
    },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export const IrrigationRecommendation = model('IrrigationRecommendation', IrrigationRecommendationSchema);
