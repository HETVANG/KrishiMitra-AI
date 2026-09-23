import { Schema, model } from 'mongoose';

const OrganizationMembershipSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'],
      default: 'MEMBER'
    },
    status: {
      type: String,
      enum: ['INVITED', 'ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true
    }
  },
  { timestamps: true }
);

OrganizationMembershipSchema.index({ user: 1, organization: 1 }, { unique: true });

export const OrganizationMembership = model('OrganizationMembership', OrganizationMembershipSchema);
