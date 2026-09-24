import { Schema, model } from 'mongoose';

const OrganizationMembershipSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    role: {
      type: String,
      enum: [
        'OWNER',
        'ORG_ADMIN',
        'FARM_MANAGER',
        'AGRONOMIST',
        'ADVISOR',
        'FIELD_MANAGER',
        'FARM_WORKER',
        'ANALYST',
        'ACCOUNTANT',
        'VIEWER',
        'ADMIN', // Legacy mapping
        'MANAGER',
        'MEMBER'
      ],
      default: 'VIEWER'
    },
    status: {
      type: String,
      enum: ['INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED'],
      default: 'ACTIVE',
      index: true
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    assignedFarms: [{ type: Schema.Types.ObjectId, ref: 'Farm' }],
    assignedFields: [{ type: String }]
  },
  { timestamps: true }
);

OrganizationMembershipSchema.index({ user: 1, organization: 1 }, { unique: true });
OrganizationMembershipSchema.index({ organization: 1, status: 1 });

export const OrganizationMembership = model('OrganizationMembership', OrganizationMembershipSchema);
