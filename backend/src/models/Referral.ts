import mongoose, { Schema, Document } from 'mongoose';

export type ReferralStatus =
  | 'INVITED'
  | 'SIGNED_UP'
  | 'ONBOARDED'
  | 'ACTIVATED'
  | 'CONVERTED'
  | 'EXPIRED'
  | 'INVALID';

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId?: mongoose.Types.ObjectId;
  referralCode: string;
  status: ReferralStatus;
  campaignId?: string;
  source: string;
  medium: string;
  metadata?: Record<string, any>;
  signedUpAt?: Date;
  activatedAt?: Date;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    referralCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    status: {
      type: String,
      enum: ['INVITED', 'SIGNED_UP', 'ONBOARDED', 'ACTIVATED', 'CONVERTED', 'EXPIRED', 'INVALID'],
      default: 'SIGNED_UP',
      index: true
    },
    campaignId: { type: String, index: true },
    source: { type: String, default: 'referral_link' },
    medium: { type: String, default: 'direct' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    signedUpAt: { type: Date, default: Date.now },
    activatedAt: { type: Date },
    convertedAt: { type: Date }
  },
  { timestamps: true }
);

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
