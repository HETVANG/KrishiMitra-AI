import { Schema, model } from 'mongoose';

const MarketPriceHistorySchema = new Schema(
  {
    crop: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    market: { type: String, required: true, trim: true },
    mandiName: { type: String, trim: true },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    avgPrice: { type: Number, required: true },
    modalPrice: { type: Number, required: true },
    arrivalQuantity: { type: Number, default: 0 },
    unit: { type: String, default: 'Qtl' },
    date: { type: Date, required: true, default: Date.now },
    source: { type: String, default: 'live-api' },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

MarketPriceHistorySchema.index({ crop: 1, state: 1, district: 1, market: 1, date: -1 });
MarketPriceHistorySchema.index({ date: -1 });

export const MarketPriceHistory = model('MarketPriceHistory', MarketPriceHistorySchema);
