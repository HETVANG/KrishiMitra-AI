import { Schema, model } from 'mongoose';

const CropCycleSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    field: { type: String, trim: true, default: 'Field A' },
    cropName: { type: String, required: true, trim: true },
    variety: { type: String, trim: true, default: 'Standard' },
    plantingDate: { type: Date, required: true },
    expectedHarvestDate: { type: Date },
    actualHarvestDate: { type: Date },
    currentGrowthStage: {
      type: String,
      enum: [
        'PRE_PLANTING',
        'GERMINATION',
        'SEEDLING',
        'VEGETATIVE',
        'FLOWERING',
        'FRUIT_DEVELOPMENT',
        'MATURITY',
        'HARVEST',
        'POST_HARVEST'
      ],
      default: 'VEGETATIVE'
    },
    isStageManuallySet: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['PLANNED', 'ACTIVE', 'HARVESTING', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true
    },
    area: { type: Number, default: 1 },
    areaUnit: { type: String, default: 'acres' },
    seedSource: { type: String, trim: true },
    notes: { type: String, trim: true },
    harvestYield: {
      quantity: { type: Number },
      unit: { type: String, default: 'kg' },
      grade: { type: String },
      sellingMarket: { type: String },
      notes: { type: String }
    }
  },
  { timestamps: true }
);

CropCycleSchema.index({ user: 1, farm: 1, status: 1 });
CropCycleSchema.index({ plantingDate: -1 });

export const CropCycle = model('CropCycle', CropCycleSchema);
