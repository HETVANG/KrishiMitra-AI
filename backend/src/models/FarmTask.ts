import { Schema, model } from 'mongoose';

const FarmTaskSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    title: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    durationMinutes: { type: Number, default: 30 },
    dueDate: { type: String, required: true }, // Format YYYY-MM-DD
    planType: { type: String, enum: ['daily', 'weekly'], default: 'daily', index: true },
    completed: { type: Boolean, default: false },
    category: { type: String, enum: ['irrigation', 'fertilizer', 'disease_check', 'weather_prep', 'market', 'general'], default: 'general' },
    // Agentic automation extensions
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED', 'WAITING_APPROVAL'], default: 'TODO', index: true },
    approvalRequired: { type: Boolean, default: false },
    approvedBy: { type: String, default: null },
    agentType: { type: String, default: null },
    cropCycleId: { type: Schema.Types.ObjectId, ref: 'CropCycle', default: null },
    evidence: { type: Schema.Types.Mixed, default: null },
    explanation: { type: String, default: null }
  },
  { timestamps: true }
);

export const FarmTask = model('FarmTask', FarmTaskSchema);
