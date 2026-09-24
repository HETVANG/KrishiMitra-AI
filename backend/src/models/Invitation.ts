import mongoose, { Schema, Document } from 'mongoose';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface IInvitation extends Document {
  inviterId: mongoose.Types.ObjectId;
  inviteeEmail?: string;
  inviteePhone?: string;
  role: string;
  organizationId?: mongoose.Types.ObjectId;
  farmId?: mongoose.Types.ObjectId;
  inviteToken: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    inviterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    inviteeEmail: { type: String, lowercase: true, trim: true },
    inviteePhone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['farmer', 'farm_manager', 'worker', 'advisor', 'expert', 'member', 'admin'],
      default: 'farmer'
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    inviteToken: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'PENDING',
      index: true
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14-day validity
    },
    acceptedAt: { type: Date }
  },
  { timestamps: true }
);

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);
