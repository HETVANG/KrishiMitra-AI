import mongoose, { Schema, Document } from 'mongoose';

export type IssueCategory = 'TECHNICAL' | 'WRONG_DATA' | 'AI_ISSUE' | 'TRANSLATION' | 'MAP_ISSUE' | 'OTHER';

export type IssueStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface IIssueReport extends Document {
  userId: string;
  category: IssueCategory;
  description: string;
  feature?: string;
  status: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
}

const IssueReportSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['TECHNICAL', 'WRONG_DATA', 'AI_ISSUE', 'TRANSLATION', 'MAP_ISSUE', 'OTHER'],
      required: true,
      index: true
    },
    description: { type: String, required: true, trim: true },
    feature: { type: String, default: 'SYSTEM' },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true
    }
  },
  { timestamps: true }
);

export const IssueReport = mongoose.model<IIssueReport>('IssueReport', IssueReportSchema);
