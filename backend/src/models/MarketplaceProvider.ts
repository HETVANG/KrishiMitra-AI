import { Schema, model } from 'mongoose';

const MarketplaceProviderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['SUPPLIER', 'FARM_SERVICE_PROVIDER', 'EQUIPMENT_PROVIDER', 'EXPERT', 'LOGISTICS_PROVIDER', 'STORAGE_PROVIDER', 'AGRICULTURAL_ORGANIZATION', 'OTHER'],
      required: true,
      index: true
    },
    description: { type: String, default: '', trim: true },
    contactInformation: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      whatsapp: { type: String, trim: true }
    },
    location: {
      address: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      countryCode: { type: String, default: 'IN' },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    },
    serviceAreas: [{ type: String }],
    categories: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'UNVERIFIED',
      index: true
    },
    verificationDetails: {
      verifiedAt: { type: Date },
      verifiedBy: { type: String },
      notes: { type: String }
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    source: {
      type: String,
      enum: ['PLATFORM_PROVIDER', 'VERIFIED_PARTNER', 'USER_SUBMITTED', 'ADMIN_VERIFIED'],
      default: 'PLATFORM_PROVIDER'
    },
    website: { type: String, default: '' },
    profileImage: { type: String, default: '' }
  },
  { timestamps: true }
);

export const MarketplaceProvider = model('MarketplaceProvider', MarketplaceProviderSchema);
