import mongoose, { Schema, Document } from 'mongoose';

export type IssueStatus = 'OPEN' | 'INVESTIGATING' | 'IN_PROGRESS' | 'BLOCKED' | 'RESOLVED' | 'CLOSED';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IProductIssue extends Document {
  issueId: string;
  title: string;
  description: string;
  category: string;
  severity: IssueSeverity;
  status: IssueStatus;
  owner?: string;
  affectedFeature: string;
  affectedRegion?: string;
  feedbackReferences: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductIssueSchema = new Schema<IProductIssue>(
  {
    issueId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'GENERAL', index: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true
    },
    owner: { type: String, default: null },
    affectedFeature: { type: String, required: true, index: true },
    affectedRegion: { type: String, default: 'IN' },
    feedbackReferences: [{ type: String }]
  },
  { timestamps: true }
);

ProductIssueSchema.index({ status: 1, severity: 1, createdAt: -1 });

export const ProductIssue = mongoose.model<IProductIssue>('ProductIssue', ProductIssueSchema);
