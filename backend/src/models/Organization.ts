import { Schema, model } from 'mongoose';

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true, default: '' },
    type: {
      type: String,
      enum: [
        'FPO',
        'COOPERATIVE',
        'AGRIBUSINESS',
        'ENTERPRISE_FARM',
        'ADVISORY',
        'RESEARCH',
        'NGO',
        'INSTITUTION',
        'SERVICE_PROVIDER',
        'OTHER',
        'AGRI_ENTERPRISE', // Legacy compatibility
        'FARM_GROUP',
        'COMMERCIAL_FARM'
      ],
      default: 'FPO'
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    description: { type: String, default: '', trim: true },
    logo: { type: String, default: '' },
    country: { type: String, default: 'India' },
    countryCode: { type: String, default: 'IN' },
    region: { type: String, default: '' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    measurementSystem: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true
    },
    settings: {
      notificationEmail: { type: String, default: '' },
      autoAssignTasks: { type: Boolean, default: false },
      customFields: { type: Schema.Types.Mixed, default: {} }
    }
  },
  { timestamps: true }
);

export const Organization = model('Organization', OrganizationSchema);
