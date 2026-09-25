import mongoose, { Schema, Document } from 'mongoose';

export type PartnerType =
  | 'FPO'
  | 'COOPERATIVE'
  | 'AGRIBUSINESS'
  | 'AGRICULTURAL_ADVISORY'
  | 'AGRONOMIST'
  | 'UNIVERSITY'
  | 'RESEARCH'
  | 'NGO'
  | 'SERVICE_PROVIDER'
  | 'EQUIPMENT'
  | 'STORAGE'
  | 'LOGISTICS'
  | 'MARKET_PARTNER'
  | 'TECHNOLOGY'
  | 'FINANCIAL_SERVICE'
  | 'INSTITUTION'
  | 'OTHER'
  // Legacy enum compatibility
  | 'DATA_PROVIDER'
  | 'AGRICULTURAL_ORGANIZATION'
  | 'RESEARCH_INSTITUTION'
  | 'EXPERT_NETWORK'
  | 'SERVICE_NETWORK'
  | 'LOGISTICS_PARTNER'
  | 'EQUIPMENT_PARTNER'
  | 'GOVERNMENT_DATA_SOURCE'
  | 'ENTERPRISE';

export type PartnerStatus =
  | 'PROSPECT'
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'INACTIVE'
  | 'PENDING_VERIFICATION';

export type PartnerVerificationStatus = 'UNVERIFIED' | 'UNDER_REVIEW' | 'VERIFIED' | 'PARTNER_VERIFIED';

export interface IPartner extends Document {
  organizationName: string;
  legalName?: string;
  partnerType: PartnerType;
  description?: string;
  logo?: string;
  website?: string;
  status: PartnerStatus;
  verificationStatus: PartnerVerificationStatus;
  countries: string[];
  regions: string[];
  languages: string[];
  capabilities: string[];
  supportedCrops?: string[];
  contactInformation?: {
    email?: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
  };
  ownerUserId?: mongoose.Types.ObjectId;
  referralCode: string;
  referralLink?: string;
  verificationDetails?: {
    verifiedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    notes?: string;
    documents?: string[];
  };
  agreementMetadata?: {
    agreementId?: string;
    signedDate?: Date;
    expiryDate?: Date;
    tier?: string;
    commercialType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema: Schema = new Schema(
  {
    organizationName: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true, default: '' },
    partnerType: {
      type: String,
      required: true,
      index: true
    },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    website: { type: String, trim: true, default: '' },
    status: {
      type: String,
      default: 'APPLIED',
      index: true
    },
    verificationStatus: {
      type: String,
      default: 'UNVERIFIED',
      index: true
    },
    countries: [{ type: String, uppercase: true, default: ['IN'] }],
    regions: [{ type: String, index: true }],
    languages: [{ type: String, default: ['en', 'hi'] }],
    capabilities: [{ type: String, index: true }],
    supportedCrops: [{ type: String }],
    contactInformation: {
      email: { type: String, lowercase: true, trim: true },
      phone: { type: String, trim: true },
      address: { type: String },
      contactPerson: { type: String }
    },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    referralCode: { type: String, required: true, unique: true },
    referralLink: { type: String, default: '' },
    verificationDetails: {
      verifiedAt: { type: Date },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      notes: { type: String, default: '' },
      documents: [{ type: String }]
    },
    agreementMetadata: {
      agreementId: { type: String },
      signedDate: { type: Date },
      expiryDate: { type: Date },
      tier: { type: String, default: 'STANDARD' },
      commercialType: { type: String, default: 'DISTRIBUTION' }
    }
  },
  { timestamps: true }
);

PartnerSchema.index({ regions: 1, capabilities: 1, status: 1 });

export const Partner = mongoose.model<IPartner>('Partner', PartnerSchema);
