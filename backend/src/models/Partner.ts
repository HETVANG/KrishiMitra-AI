import mongoose, { Schema, Document } from 'mongoose';

export type PartnerType =
  | 'DATA_PROVIDER'
  | 'AGRICULTURAL_ORGANIZATION'
  | 'RESEARCH_INSTITUTION'
  | 'EXPERT_NETWORK'
  | 'SERVICE_NETWORK'
  | 'LOGISTICS_PARTNER'
  | 'EQUIPMENT_PARTNER'
  | 'GOVERNMENT_DATA_SOURCE'
  | 'ENTERPRISE'
  | 'OTHER';

export type PartnerStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';

export type PartnerVerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'PARTNER_VERIFIED';

export interface IPartner extends Document {
  organizationName: string;
  partnerType: PartnerType;
  description?: string;
  status: PartnerStatus;
  countries: string[];
  regions: string[];
  capabilities: string[];
  contactInformation?: {
    email?: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
  };
  website?: string;
  agreementMetadata?: {
    agreementId?: string;
    signedDate?: Date;
    expiryDate?: Date;
    tier?: string;
  };
  verificationStatus: PartnerVerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema: Schema = new Schema(
  {
    organizationName: { type: String, required: true, trim: true },
    partnerType: {
      type: String,
      required: true,
      enum: [
        'DATA_PROVIDER',
        'AGRICULTURAL_ORGANIZATION',
        'RESEARCH_INSTITUTION',
        'EXPERT_NETWORK',
        'SERVICE_NETWORK',
        'LOGISTICS_PARTNER',
        'EQUIPMENT_PARTNER',
        'GOVERNMENT_DATA_SOURCE',
        'ENTERPRISE',
        'OTHER'
      ],
      index: true
    },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'],
      default: 'PENDING_VERIFICATION',
      index: true
    },
    countries: [{ type: String, uppercase: true, default: ['IN'] }],
    regions: [{ type: String }],
    capabilities: [{ type: String }],
    contactInformation: {
      email: { type: String, lowercase: true, trim: true },
      phone: { type: String, trim: true },
      address: { type: String },
      contactPerson: { type: String }
    },
    website: { type: String, trim: true },
    agreementMetadata: {
      agreementId: { type: String },
      signedDate: { type: Date },
      expiryDate: { type: Date },
      tier: { type: String, default: 'STANDARD' }
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED', 'PARTNER_VERIFIED'],
      default: 'UNVERIFIED',
      index: true
    }
  },
  { timestamps: true }
);

export const Partner = mongoose.model<IPartner>('Partner', PartnerSchema);
