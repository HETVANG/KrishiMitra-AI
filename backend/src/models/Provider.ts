import mongoose, { Schema, Document } from 'mongoose';

export type ProviderType =
  | 'WEATHER'
  | 'MARKET'
  | 'AGRICULTURAL_KNOWLEDGE'
  | 'SOIL'
  | 'CROP_DATA'
  | 'DISEASE'
  | 'EXPERT_NETWORK'
  | 'LOGISTICS'
  | 'STORAGE'
  | 'EQUIPMENT'
  | 'AGRICULTURAL_SERVICES'
  | 'GOVERNMENT_DATA'
  | 'RESEARCH'
  | 'MAPS'
  | 'NOTIFICATION'
  | 'OTHER';

export type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DEPRECATED';

export type ProviderVerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'PARTNER_VERIFIED';

export type ProviderIntegrationType = 'API' | 'WEBHOOK' | 'FILE_FEED' | 'MANUAL';

export interface IProvider extends Document {
  name: string;
  slug: string;
  providerType: ProviderType;
  description?: string;
  organizationType?: string;
  country: string;
  regions?: string[];
  capabilities: Record<string, boolean>;
  status: ProviderStatus;
  verificationStatus: ProviderVerificationStatus;
  integrationType: ProviderIntegrationType;
  baseUrl?: string;
  documentationUrl?: string;
  sourceMetadata?: Record<string, any>;
  supportedCountries: string[];
  supportedRegions?: string[];
  supportedLanguages: string[];
  supportedCurrencies: string[];
  dataFreshness?: {
    maxAgeMinutes?: number;
    freshnessType?: string;
  };
  rateLimits?: {
    maxRequestsPerMinute?: number;
    quotaLimit?: number;
  };
  enabled?: boolean;
  priority?: number;
  timeoutMs?: number;
  cacheTTL?: number;
  lastCheckedAt?: Date;
  lastSuccessfulAt?: Date;
  lastSyncAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    providerType: {
      type: String,
      required: true,
      enum: [
        'WEATHER',
        'MARKET',
        'AGRICULTURAL_KNOWLEDGE',
        'SOIL',
        'CROP_DATA',
        'DISEASE',
        'EXPERT_NETWORK',
        'LOGISTICS',
        'STORAGE',
        'EQUIPMENT',
        'AGRICULTURAL_SERVICES',
        'GOVERNMENT_DATA',
        'RESEARCH',
        'MAPS',
        'NOTIFICATION',
        'OTHER'
      ],
      index: true
    },
    description: { type: String, default: '' },
    organizationType: { type: String, default: 'GOVERNMENT' },
    country: { type: String, required: true, uppercase: true, default: 'IN', index: true },
    regions: [{ type: String }],
    capabilities: { type: Map, of: Boolean, default: {} },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DEPRECATED'],
      default: 'ACTIVE',
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED', 'PARTNER_VERIFIED'],
      default: 'VERIFIED',
      index: true
    },
    integrationType: {
      type: String,
      enum: ['API', 'WEBHOOK', 'FILE_FEED', 'MANUAL'],
      default: 'API'
    },
    baseUrl: { type: String, default: '' },
    documentationUrl: { type: String, default: '' },
    sourceMetadata: { type: Schema.Types.Mixed, default: {} },
    supportedCountries: [{ type: String, uppercase: true, default: ['IN'] }],
    supportedRegions: [{ type: String }],
    supportedLanguages: [{ type: String, default: ['en', 'hi', 'gu'] }],
    supportedCurrencies: [{ type: String, default: ['INR'] }],
    dataFreshness: {
      maxAgeMinutes: { type: Number, default: 60 },
      freshnessType: { type: String, default: 'REAL_TIME' }
    },
    rateLimits: {
      maxRequestsPerMinute: { type: Number, default: 120 },
      quotaLimit: { type: Number, default: 10000 }
    },
    enabled: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 1 },
    timeoutMs: { type: Number, default: 5000 },
    cacheTTL: { type: Number, default: 3600 },
    lastCheckedAt: { type: Date },
    lastSuccessfulAt: { type: Date },
    lastSyncAt: { type: Date },
    lastError: { type: String, default: '' }
  },
  { timestamps: true }
);

ProviderSchema.index({ country: 1, providerType: 1, status: 1 });

export const Provider = mongoose.model<IProvider>('Provider', ProviderSchema);
