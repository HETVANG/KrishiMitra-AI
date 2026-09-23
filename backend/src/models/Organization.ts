import { Schema, model } from 'mongoose';

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['COOPERATIVE', 'AGRI_ENTERPRISE', 'FARM_GROUP', 'COMMERCIAL_FARM', 'OTHER'],
      default: 'AGRI_ENTERPRISE'
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    description: { type: String, default: '', trim: true },
    countryCode: { type: String, default: 'IN' },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true
    }
  },
  { timestamps: true }
);

export const Organization = model('Organization', OrganizationSchema);
