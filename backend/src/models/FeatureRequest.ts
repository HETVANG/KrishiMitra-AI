import mongoose, { Schema, Document } from 'mongoose';

export type FeatureRequestStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'PLANNED' | 'COMPLETED' | 'DECLINED';

export interface IFeatureRequest extends Document {
  userId: string;
  category: string;
  title: string;
  description: string;
  region?: string;
  language?: string;
  status: FeatureRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureRequestSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true, default: 'GENERAL' },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    region: { type: String, default: 'IN' },
    language: { type: String, default: 'en' },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'PLANNED', 'COMPLETED', 'DECLINED'],
      default: 'SUBMITTED',
      index: true
    }
  },
  { timestamps: true }
);

export const FeatureRequest = mongoose.model<IFeatureRequest>('FeatureRequest', FeatureRequestSchema);
