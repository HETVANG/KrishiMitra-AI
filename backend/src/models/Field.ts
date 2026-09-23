import { Schema, model } from 'mongoose';

const FieldSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    name: { type: String, required: true, trim: true, default: 'Main Field' },
    sizeAcres: { type: Number, required: true, default: 1 },
    soilType: { type: String, trim: true, default: 'Loam' },
    boundary: {
      type: [[Number]],
      default: []
    },
    waterSource: { type: String, trim: true, default: 'Borewell' },
    irrigationType: { type: String, trim: true, default: 'Drip' },
    status: { type: String, enum: ['ACTIVE', 'FALLOW', 'PREPARATION'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

FieldSchema.index({ user: 1, farm: 1 });

export const Field = model('Field', FieldSchema);
