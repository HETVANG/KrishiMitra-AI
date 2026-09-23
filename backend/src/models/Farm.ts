import { Schema, model } from 'mongoose';

const FarmSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
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
    countryCode: { type: String, default: 'IN' },
    countryName: { type: String, default: 'India' },
    postalCode: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    temperatureUnit: { type: String, enum: ['C', 'F'], default: 'C' },
    landAreaUnit: { type: String, enum: ['acre', 'hectare', 'bigha', 'sq_meter'], default: 'acre' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    latitude: { type: Number },
    longitude: { type: Number },
    perimeter: { type: Number, default: 0 }, // in meters
    areaHectares: { type: Number, default: 0 },
    currentCrops: [{ type: String }],
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
    isPrimary: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Farm = model('Farm', FarmSchema);
