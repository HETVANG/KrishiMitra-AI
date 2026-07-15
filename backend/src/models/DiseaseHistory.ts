import { Schema, model } from 'mongoose';

const DiseaseHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    diseaseName: { type: String, required: true, trim: true },
    scientificName: { type: String, trim: true },
    confidenceScore: { type: Number },
    imageUri: { type: String, trim: true },
    symptoms: [{ type: String }],
    causes: [{ type: String }],
    organicTreatment: [{ type: String }],
    chemicalTreatment: [{ type: String }],
    preventiveTips: [{ type: String }],
    pesticideDetails: {
      localName: { type: String },
      englishName: { type: String },
      brands: [{ type: String }],
      dosage: { type: String },
      mixingMethod: { type: String },
      precautions: { type: String },
      waitingPeriod: { type: String }
    }
  },
  { timestamps: true }
);

export const DiseaseHistory = model('DiseaseHistory', DiseaseHistorySchema);
