import { Schema, model } from 'mongoose';

const DiseaseHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    crop: { type: String, trim: true },
    variety: { type: String, trim: true },
    growthStage: { type: String, trim: true },
    diseaseName: { type: String, required: true, trim: true },
    localName: { type: String, trim: true },
    scientificName: { type: String, trim: true },
    condition: { 
      type: String, 
      enum: ['HEALTHY', 'POSSIBLE_DISEASE', 'POSSIBLE_PEST_DAMAGE', 'NUTRIENT_RELATED_SYMPTOMS', 'ENVIRONMENTAL_STRESS', 'UNCERTAIN', 'INSUFFICIENT_IMAGE_QUALITY'],
      default: 'POSSIBLE_DISEASE' 
    },
    confidence: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
    confidenceScore: { type: Number, default: 0.8 },
    severity: { type: String, enum: ['low', 'moderate', 'high', 'uncertain'], default: 'moderate' },
    imageUri: { type: String, trim: true },
    symptoms: [{ type: String }],
    evidence: [{ label: { type: String }, value: { type: String } }],
    possibleCauses: [{ type: String }],
    causes: [{ type: String }],
    organicTreatment: [{ type: String }],
    chemicalTreatment: [{ type: String }],
    preventiveTips: [{ type: String }],
    recommendedActions: [{
      actionType: { type: String, enum: ['IMMEDIATE_CHECK', 'MONITOR', 'PREVENTION', 'EXPERT_CONSULTATION', 'FOLLOW_UP'] },
      title: { type: String },
      details: { type: String }
    }],
    pesticideDetails: {
      localName: { type: String },
      englishName: { type: String },
      brands: [{ type: String }],
      dosage: { type: String },
      mixingMethod: { type: String },
      precautions: { type: String },
      waitingPeriod: { type: String }
    },
    environmentalContext: {
      temperature: { type: Number },
      humidity: { type: Number },
      rainProb: { type: Number },
      soilMoisture: { type: Number },
      favorabilityNote: { type: String }
    },
    limitations: { type: String },
    chemicalSafetyNotice: { type: String },
    followUpDate: { type: Date },
    followUpStatus: { type: String, enum: ['none', 'scheduled', 'completed', 'overdue'], default: 'none' },
    followUpNotes: { type: String },
    previousScan: { type: Schema.Types.ObjectId, ref: 'DiseaseHistory' },
    progressionNote: { type: String },
    farmerNotes: { type: String },
    language: { type: String, default: 'en' }
  },
  { timestamps: true }
);

DiseaseHistorySchema.index({ user: 1, createdAt: -1 });
DiseaseHistorySchema.index({ farm: 1, createdAt: -1 });
DiseaseHistorySchema.index({ followUpDate: 1 });

export const DiseaseHistory = model('DiseaseHistory', DiseaseHistorySchema);

