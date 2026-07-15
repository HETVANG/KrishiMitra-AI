import { Schema, model } from 'mongoose';

const FarmSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    size: { type: Number, required: true }, // in acres
    soilType: { type: String, required: true, trim: true },
    waterSource: { type: String, required: true, trim: true },
    boundary: {
      type: [[Number]], // Array of [lat, lng] coordinates defining a polygon
      default: [],
    },
    currentCrops: [{ type: String }],
  },
  { timestamps: true }
);

export const Farm = model('Farm', FarmSchema);
