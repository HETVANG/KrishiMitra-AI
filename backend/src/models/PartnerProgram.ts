import { Schema, model } from 'mongoose';

const PartnerProgramSchema = new Schema(
  {
    partner: { type: Schema.Types.ObjectId, ref: 'Partner', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    targetRegions: [{ type: String }],
    targetLanguages: [{ type: String }],
    targetAudience: { type: String, default: 'Individual Farmers & FPOs' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

PartnerProgramSchema.index({ partner: 1, status: 1 });

export const PartnerProgram = model('PartnerProgram', PartnerProgramSchema);
