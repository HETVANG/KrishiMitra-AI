import { Schema, model } from 'mongoose';

const AgentMemorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', default: null, index: true },
    category: {
      type: String,
      enum: ['preference', 'crop_fact', 'soil_fact', 'irrigation_pattern', 'historical_observation'],
      required: true
    },
    factKey: { type: String, required: true },
    factValue: { type: Schema.Types.Mixed, required: true },
    sourceAgent: { type: String, default: 'system' },
    lastVerifiedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

AgentMemorySchema.index({ user: 1, category: 1, factKey: 1 }, { unique: true });

export const AgentMemory = model('AgentMemory', AgentMemorySchema);
