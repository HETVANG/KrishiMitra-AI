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
    village: { type: String, default: '' },
    taluka: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    latitude: { type: Number },
    longitude: { type: Number },
    perimeter: { type: Number, default: 0 }, // in meters
    areaHectares: { type: Number, default: 0 },
    currentCrops: [{ type: String }],
  },
  { timestamps: true }
);

export const Farm = model('Farm', FarmSchema);
