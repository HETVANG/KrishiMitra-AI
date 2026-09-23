import { Schema, model } from 'mongoose';

const FarmMembershipSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MANAGER', 'FARM_WORKER', 'ADVISOR', 'VIEWER'],
      default: 'VIEWER',
      required: true
    },
    status: {
      type: String,
      enum: ['INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED'],
      default: 'ACTIVE',
      index: true
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    invitedEmail: { type: String, trim: true, lowercase: true }
  },
  { timestamps: true }
);

FarmMembershipSchema.index({ user: 1, farm: 1 }, { unique: true });

export const FarmMembership = model('FarmMembership', FarmMembershipSchema);
