import { Schema, model } from 'mongoose';

const MarketPriceSchema = new Schema(
  {
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    market: { type: String, required: true, trim: true },
    mandiName: { type: String, trim: true },
    crop: { type: String, required: true, trim: true },
    variety: { type: String, trim: true, default: 'FAQ' },
    grade: { type: String, trim: true, default: 'FAQ' },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    avgPrice: { type: Number, required: true },
    modalPrice: { type: Number, required: true, default: 0 },
    arrivalQuantity: { type: Number, default: 0 },
    unit: { type: String, default: 'Qtl' },
    date: { type: Date, default: Date.now },
    source: { type: String, default: 'live-api' },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

MarketPriceSchema.index({ state: 1, district: 1, crop: 1, date: -1 });
MarketPriceSchema.index({ crop: 1, state: 1, district: 1, market: 1, date: -1 });
MarketPriceSchema.index({ lastUpdated: -1 });

export const MarketPrice = model('MarketPrice', MarketPriceSchema);
