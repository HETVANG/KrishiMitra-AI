import { Schema, model } from 'mongoose';

const PartnerReferralSchema = new Schema(
  {
    partner: { type: Schema.Types.ObjectId, ref: 'Partner', required: true, index: true },
    program: { type: Schema.Types.ObjectId, ref: 'PartnerProgram', index: true },
    referralCode: { type: String, required: true, index: true },
    referredUser: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    referredOrganization: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    status: {
      type: String,
      enum: ['CLICKED', 'SIGNUP', 'ONBOARDED', 'ACTIVATED', 'CONVERTED'],
      default: 'CLICKED',
      index: true
    },
    source: { type: String, default: 'partner_link' },
    medium: { type: String, default: 'web' },
    attributionMetadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

PartnerReferralSchema.index({ partner: 1, status: 1 });

export const PartnerReferral = model('PartnerReferral', PartnerReferralSchema);
