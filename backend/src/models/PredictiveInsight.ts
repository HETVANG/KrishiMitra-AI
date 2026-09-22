import { Schema, model } from 'mongoose';

const EvidenceSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const RecommendedActionSchema = new Schema(
  {
    title: { type: String, required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    reason: { type: String, required: true }
  },
  { _id: false }
);

const PredictiveInsightSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    category: {
      type: String,
      enum: ['weather', 'disease', 'water', 'nutrient', 'health'],
      required: true,
      index: true
    },
    level: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    reasons: [{ type: String }],
    evidence: [EvidenceSchema],
    recommendedActions: [RecommendedActionSchema],
    affectedCrop: { type: String, required: true },
    timeframe: {
      type: String,
      enum: ['today', '24_hours', '3_days', '7_days'],
      default: '24_hours'
    },
    confidence: { type: Number, default: 0.85 },
    dataTimestamp: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export const PredictiveInsight = model('PredictiveInsight', PredictiveInsightSchema);
