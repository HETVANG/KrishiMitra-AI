import mongoose, { Schema, Document } from 'mongoose';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export interface ICampaign extends Document {
  campaignId: string;
  name: string;
  source: string;
  medium: string;
  region: string;
  language: string;
  audience?: string;
  landingPage?: string;
  status: CampaignStatus;
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    campaignId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    medium: { type: String, required: true, trim: true },
    region: { type: String, default: 'IN', uppercase: true },
    language: { type: String, default: 'en', lowercase: true },
    audience: { type: String, trim: true },
    landingPage: { type: String, trim: true },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
