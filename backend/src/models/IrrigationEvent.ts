import { Schema, model } from 'mongoose';

const IrrigationEventSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    cropName: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now, required: true },
    method: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'manual', 'other'],
      default: 'drip'
    },
    durationMinutes: { type: Number, default: 30 },
    waterAmount: { type: Number }, // Optional measured water volume in Liters or M3
    waterUnit: { type: String, default: 'Liters' },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

export const IrrigationEvent = model('IrrigationEvent', IrrigationEventSchema);
