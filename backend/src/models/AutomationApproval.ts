import { Schema, model, Document } from 'mongoose';

export interface IAutomationApproval extends Document {
  approvalId: string;
  runId: string;
  userId: Schema.Types.ObjectId | string;
  farmId: Schema.Types.ObjectId | string;
  fieldId?: Schema.Types.ObjectId | string;
  agentType: string;
  actionType: string;
  toolName: string;
  parameters: any;
  summary: string;
  reason: string;
  evidence: any;
  expectedResult: string;
  risks: any;
  reversibility: 'REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'IRREVERSIBLE';
  expiresAt: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  decidedBy?: Schema.Types.ObjectId | string;
  decidedAt?: Date;
  decisionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationApprovalSchema = new Schema(
  {
    approvalId: { type: String, required: true, unique: true, index: true },
    runId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    fieldId: { type: Schema.Types.ObjectId, ref: 'Field', index: true },
    agentType: { type: String, required: true },
    actionType: { type: String, required: true },
    toolName: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed },
    summary: { type: String, required: true },
    reason: { type: String, required: true },
    evidence: { type: Schema.Types.Mixed },
    expectedResult: { type: String, required: true },
    risks: { type: Schema.Types.Mixed },
    reversibility: {
      type: String,
      enum: ['REVERSIBLE', 'PARTIALLY_REVERSIBLE', 'IRREVERSIBLE'],
      default: 'REVERSIBLE'
    },
    expiresAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING',
      index: true
    },
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    decidedAt: { type: Date },
    decisionReason: { type: String }
  },
  { timestamps: true }
);

AutomationApprovalSchema.index({ userId: 1, status: 1 });
AutomationApprovalSchema.index({ farmId: 1, status: 1 });

export const AutomationApproval = model<IAutomationApproval>(
  'AutomationApproval',
  AutomationApprovalSchema
);
