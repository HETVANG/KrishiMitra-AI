import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone {
  key: string;
  title: string;
  achievedAt: Date;
}

export interface IFeedbackItem {
  feature: string;
  rating: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT' | 'OUTDATED' | 'NOT_RELEVANT';
  comment?: string;
  createdAt: Date;
}

export interface IOutcomeRecord {
  taskId?: mongoose.Types.ObjectId;
  activityType: string;
  result: 'completed_successfully' | 'partially_completed' | 'not_completed' | 'farmer_reported_result';
  notes?: string;
  recordedAt: Date;
}

export interface IFarmerSuccessProfile extends Document {
  user: mongoose.Types.ObjectId;
  lastMeaningfulActivityAt: Date;
  completedTasksCount: number;
  milestones: IMilestone[];
  feedbackHistory: IFeedbackItem[];
  outcomesRecorded: IOutcomeRecord[];
  notificationCooldowns: Record<string, any>;
  healthCompletenessScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSuccessProfileSchema = new Schema<IFarmerSuccessProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    lastMeaningfulActivityAt: { type: Date, default: Date.now, index: true },
    completedTasksCount: { type: Number, default: 0 },
    milestones: [
      {
        key: { type: String, required: true },
        title: { type: String, required: true },
        achievedAt: { type: Date, default: Date.now }
      }
    ],
    feedbackHistory: [
      {
        feature: { type: String, required: true },
        rating: {
          type: String,
          enum: ['HELPFUL', 'NOT_HELPFUL', 'INCORRECT', 'OUTDATED', 'NOT_RELEVANT'],
          required: true
        },
        comment: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    outcomesRecorded: [
      {
        taskId: { type: Schema.Types.ObjectId, ref: 'FarmTask' },
        activityType: { type: String, required: true },
        result: {
          type: String,
          enum: ['completed_successfully', 'partially_completed', 'not_completed', 'farmer_reported_result'],
          default: 'completed_successfully'
        },
        notes: { type: String, trim: true },
        recordedAt: { type: Date, default: Date.now }
      }
    ],
    notificationCooldowns: { type: Schema.Types.Mixed, default: {} },
    healthCompletenessScore: { type: Number, default: 50 }
  },
  { timestamps: true }
);

export const FarmerSuccessProfile = mongoose.model<IFarmerSuccessProfile>(
  'FarmerSuccessProfile',
  FarmerSuccessProfileSchema
);
