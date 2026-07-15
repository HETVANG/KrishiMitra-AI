import { Schema, model } from 'mongoose';

const DiseaseSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    affectedCrops: [{ type: String }],
    symptoms: [{ type: String }],
    causes: [{ type: String }],
    chemicalTreatment: [{ type: String }],
    organicTreatment: [{ type: String }],
    preventiveTips: [{ type: String }],
  },
  { timestamps: true }
);

export const Disease = model('Disease', DiseaseSchema);
