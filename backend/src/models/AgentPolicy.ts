import { Schema, model } from 'mongoose';

const AgentPolicySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    autoAlertsEnabled: { type: Boolean, default: true },
    autoRemindersEnabled: { type: Boolean, default: true },
    autoTaskCreationEnabled: { type: Boolean, default: false }, // Requires approval by default
    expertConsultationPolicy: { type: String, enum: ['ALWAYS_ASK', 'AUTO_RECOMMEND'], default: 'ALWAYS_ASK' },
    externalActionsEnabled: { type: Boolean, default: false } // Disabled by default
  },
  { timestamps: true }
);

export const AgentPolicy = model('AgentPolicy', AgentPolicySchema);
