import { Schema, model } from 'mongoose';

const FarmActivitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    cropCycle: { type: Schema.Types.ObjectId, ref: 'CropCycle', required: true, index: true },
    type: {
      type: String,
      enum: [
        'planting',
        'irrigation',
        'fertilizer',
        'pesticide',
        'disease_scan',
        'soil_test',
        'weather_event',
        'crop_inspection',
        'harvesting',
        'note',
        'other'
      ],
      required: true
    },
    date: { type: Date, required: true, default: Date.now },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

FarmActivitySchema.index({ cropCycle: 1, date: -1 });
FarmActivitySchema.index({ user: 1, date: -1 });

export const FarmActivity = model('FarmActivity', FarmActivitySchema);
