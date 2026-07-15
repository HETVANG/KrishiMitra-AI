import { Schema, model } from 'mongoose';

const SoilAnalysisSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pH: { type: Number, required: true },
    N: { type: Number, required: true },
    P: { type: Number, required: true },
    K: { type: Number, required: true },
    organicCarbon: { type: Number, required: true },
    recommendations: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const SoilAnalysis = model('SoilAnalysis', SoilAnalysisSchema);
