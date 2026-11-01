import { Schema, model, Document, Types } from 'mongoose';

export interface IReport extends Document {
  reportId: string;
  user: Types.ObjectId;
  farmerName?: string;
  farmerEmail?: string;
  type: 'crop' | 'weather' | 'disease' | 'expense';
  cropName?: string;
  diseaseName?: string;
  condition?: string;
  confidenceScore?: number;
  severity?: string;
  language: string;
  status: 'completed' | 'processing' | 'failed';
  fileUrl?: string;
  storageKey?: string;
  fileSize?: number;
  scanId?: Types.ObjectId;
  downloadCount: number;
  lastDownloadedAt?: Date;
  summary?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema(
  {
    reportId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    farmerName: {
      type: String,
      trim: true
    },
    farmerEmail: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['crop', 'weather', 'disease', 'expense'],
      required: true,
      index: true
    },
    cropName: {
      type: String,
      trim: true
    },
    diseaseName: {
      type: String,
      trim: true
    },
    condition: {
      type: String,
      trim: true
    },
    confidenceScore: {
      type: Number
    },
    severity: {
      type: String,
      trim: true
    },
    language: {
      type: String,
      default: 'en',
      index: true
    },
    status: {
      type: String,
      enum: ['completed', 'processing', 'failed'],
      default: 'completed',
      index: true
    },
    fileUrl: {
      type: String,
      trim: true
    },
    storageKey: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number,
      default: 0
    },
    scanId: {
      type: Schema.Types.ObjectId,
      ref: 'DiseaseHistory',
      index: true
    },
    downloadCount: {
      type: Number,
      default: 1
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    lastDownloadedAt: {
      type: Date,
      default: Date.now
    },
    summary: {
      type: String
    },
    metadata: {
      type: Schema.Types.Mixed
    },
    errorMessage: {
      type: String
    }
  },
  { timestamps: true }
);

// Compound indexes for performant querying
ReportSchema.index({ user: 1, createdAt: -1 });
ReportSchema.index({ type: 1, createdAt: -1 });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ createdAt: -1 });

export const Report = model<IReport>('Report', ReportSchema);
