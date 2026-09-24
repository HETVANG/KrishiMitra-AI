import mongoose, { Schema, Document } from 'mongoose';

export type SafetyCategory =
  | 'DANGEROUS_ADVICE'
  | 'INCORRECT_PESTICIDE'
  | 'UNSAFE_DOSAGE'
  | 'HARMFUL_RECOMMENDATION'
  | 'DANGEROUS_AGENT_ACTION'
  | 'SERIOUS_DATA_EXPOSURE';

export type SafetyStatus = 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED' | 'DISMISSED';

export interface IProductSafetyReport extends Document {
  reportId: string;
  userId: mongoose.Types.ObjectId;
  farmId?: mongoose.Types.ObjectId;
  category: SafetyCategory;
  feature: string;
  referenceId?: string;
  description: string;
  status: SafetyStatus;
  severity: 'CRITICAL' | 'HIGH';
  internalActionTaken?: string;
  investigatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSafetyReportSchema = new Schema<IProductSafetyReport>(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    category: {
      type: String,
      enum: [
        'DANGEROUS_ADVICE', 'INCORRECT_PESTICIDE', 'UNSAFE_DOSAGE',
        'HARMFUL_RECOMMENDATION', 'DANGEROUS_AGENT_ACTION', 'SERIOUS_DATA_EXPOSURE'
      ],
      required: true,
      index: true
    },
    feature: { type: String, required: true, index: true },
    referenceId: { type: String, default: null },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH'],
      default: 'CRITICAL',
      index: true
    },
    internalActionTaken: { type: String, default: null },
    investigatedBy: { type: String, default: null }
  },
  { timestamps: true }
);

ProductSafetyReportSchema.index({ status: 1, severity: 1, createdAt: -1 });

export const ProductSafetyReport = mongoose.model<IProductSafetyReport>('ProductSafetyReport', ProductSafetyReportSchema);
