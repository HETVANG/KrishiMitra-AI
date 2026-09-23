import { Schema, model } from 'mongoose';

const MarketplaceCategorySchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    group: {
      type: String,
      enum: ['INPUTS', 'EQUIPMENT', 'SERVICES', 'EXPERTISE', 'MARKET_SUPPORT'],
      required: true,
      index: true
    },
    description: { type: String, default: '', trim: true },
    icon: { type: String, default: 'Sprout' },
    supportedCountries: [{ type: String, default: 'IN' }],
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const MarketplaceCategory = model('MarketplaceCategory', MarketplaceCategorySchema);
