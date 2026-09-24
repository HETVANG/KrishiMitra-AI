import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchParticipant extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  region: string;
  cropsGrown: string[];
  consentGiven: boolean;
  consentScope: string;
  consentTimestamp: Date;
  status: 'ACTIVE' | 'WITHDRAWN' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const ResearchParticipantSchema = new Schema<IResearchParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    region: { type: String, default: 'IN', index: true },
    cropsGrown: [{ type: String }],
    consentGiven: { type: Boolean, required: true, default: false },
    consentScope: { type: String, required: true, default: 'Product usability and workflow feedback research' },
    consentTimestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['ACTIVE', 'WITHDRAWN', 'COMPLETED'],
      default: 'ACTIVE',
      index: true
    }
  },
  { timestamps: true }
);

export const ResearchParticipant = mongoose.model<IResearchParticipant>('ResearchParticipant', ResearchParticipantSchema);
