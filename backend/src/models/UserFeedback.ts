import mongoose, { Schema, Document } from 'mongoose';

export type FeedbackType =
  | 'FEATURE_FEEDBACK'
  | 'AI_FEEDBACK'
  | 'BUG_REPORT'
  | 'DATA_ERROR'
  | 'CONTENT_FEEDBACK'
  | 'GENERAL_FEEDBACK';

export type FeedbackStatus = 'NEW' | 'REVIEWING' | 'RESOLVED' | 'CLOSED';

export type AIClassificationCategory =
  | 'BUG'
  | 'DATA_QUALITY'
  | 'UX'
  | 'FEATURE_REQUEST'
  | 'AI_QUALITY'
  | 'TRANSLATION'
  | 'SAFETY'
  | 'OTHER';

export interface IUserFeedback extends Document {
  userId: string;
  farmId?: string;
  feature: string;
  type: FeedbackType;
  rating?: number;
  message: string;
  category?: string;
  status: FeedbackStatus;
  aiClassification?: {
    category: AIClassificationCategory;
    confidence: number;
    reasoning?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserFeedbackSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    feature: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['FEATURE_FEEDBACK', 'AI_FEEDBACK', 'BUG_REPORT', 'DATA_ERROR', 'CONTENT_FEEDBACK', 'GENERAL_FEEDBACK'],
      required: true,
      index: true
    },
    rating: { type: Number, min: 1, max: 5 },
    message: { type: String, required: true, trim: true },
    category: { type: String, default: 'GENERAL' },
    status: {
      type: String,
      enum: ['NEW', 'REVIEWING', 'RESOLVED', 'CLOSED'],
      default: 'NEW',
      index: true
    },
    aiClassification: {
      category: {
        type: String,
        enum: ['BUG', 'DATA_QUALITY', 'UX', 'FEATURE_REQUEST', 'AI_QUALITY', 'TRANSLATION', 'SAFETY', 'OTHER']
      },
      confidence: { type: Number, default: 0.8 },
      reasoning: { type: String }
    }
  },
  { timestamps: true }
);

export const UserFeedback = mongoose.model<IUserFeedback>('UserFeedback', UserFeedbackSchema);
