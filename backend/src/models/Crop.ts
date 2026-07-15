import { Schema, model } from 'mongoose';

const CropSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    soilRequirements: {
      pH: {
        min: { type: Number, default: 6.0 },
        max: { type: Number, default: 7.5 },
      },
      N: { type: Number, required: true }, // kg/ha recommendation
      P: { type: Number, required: true }, // kg/ha recommendation
      K: { type: Number, required: true }, // kg/ha recommendation
    },
    season: [{ type: String }], // Kharif, Rabi, Zaid
    waterRequirement: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
    durationDays: { type: Number, required: true },
    expectedYield: { type: Number, required: true }, // kg per acre
    profitMargin: { type: Number, default: 0 }, // percentage
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    description: { type: String, trim: true },
    diseases: [{ type: String }],
  },
  { timestamps: true }
);

export const Crop = model('Crop', CropSchema);
