import { Schema, model } from 'mongoose';

const AgentActivitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', default: null, index: true },
    agentType: { 
      type: String, 
      enum: ['farm_monitoring', 'crop_health', 'irrigation', 'market', 'planning', 'system'], 
      required: true,
      index: true
    },
    eventType: { type: String, required: true },
    observation: { type: String, required: true },
    reasoningSummary: { type: String, required: true },
    evidence: { type: Schema.Types.Mixed, default: null },
    action: {
      toolName: { type: String, default: null },
      parameters: { type: Schema.Types.Mixed, default: null },
      summary: { type: String, default: null }
    },
    status: {
      type: String,
      enum: ['OBSERVED', 'ANALYZING', 'PLANNED', 'WAITING_APPROVAL', 'EXECUTED', 'REJECTED', 'FAILED', 'VERIFIED'],
      default: 'OBSERVED',
      index: true
    },
    approvalRequired: { type: Boolean, default: false },
    approvedBy: { type: String, default: null },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const AgentActivity = model('AgentActivity', AgentActivitySchema);
