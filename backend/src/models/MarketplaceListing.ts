import { Schema, model } from 'mongoose';

const MarketplaceListingSchema = new Schema(
  {
    provider: { type: Schema.Types.ObjectId, ref: 'MarketplaceProvider', required: true, index: true },
    category: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    listingType: {
      type: String,
      enum: ['PRODUCT', 'SERVICE', 'EQUIPMENT_RENTAL', 'CONSULTATION', 'BUYER_LEAD'],
      required: true,
      index: true
    },
    brand: { type: String, default: '' },
    model: { type: String, default: '' },
    images: [{ type: String }],
    location: {
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      countryCode: { type: String, default: 'IN' },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    },
    pricing: {
      amount: { type: Number, default: null },
      currency: { type: String, default: 'INR' },
      unit: { type: String, default: '' },
      pricingType: {
        type: String,
        enum: ['FIXED', 'STARTING_AT', 'QUOTE_ON_REQUEST'],
        default: 'QUOTE_ON_REQUEST'
      }
    },
    availability: {
      isAvailable: { type: Boolean, default: true },
      leadTimeDays: { type: Number, default: 0 }
    },
    cropsSupported: [{ type: String }],
    farmingStagesSupported: [{ type: String }],
    serviceAreas: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'UNVERIFIED',
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true
    },
    source: { type: String, default: 'PLATFORM_PROVIDER' }
  },
  { timestamps: true }
);

MarketplaceListingSchema.index({ 'location.state': 1, 'location.district': 1 });
MarketplaceListingSchema.index({ cropsSupported: 1 });
MarketplaceListingSchema.index({ category: 1, status: 1 });

export const MarketplaceListing = model('MarketplaceListing', MarketplaceListingSchema);
