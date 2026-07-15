import { Schema, model } from 'mongoose';

const MarketPriceSchema = new Schema(
  {
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    mandiName: { type: String, required: true, trim: true },
    crop: { type: String, required: true, trim: true },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    avgPrice: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create compound index for fast queries on localized mandi listings
MarketPriceSchema.index({ state: 1, district: 1, crop: 1, date: -1 });

export const MarketPrice = model('MarketPrice', MarketPriceSchema);
