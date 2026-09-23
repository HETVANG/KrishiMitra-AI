import { Schema, model } from 'mongoose';

const ProactiveEventLogSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    field: { type: Schema.Types.ObjectId, ref: 'Field', index: true },
    cropCycle: { type: Schema.Types.ObjectId, ref: 'CropCycle', index: true },
    eventType: { type: String, required: true, index: true },
    source: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'MODERATE'
    },
    priority: {
      type: String,
      enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true
    },
    evidence: [Schema.Types.Mixed],
    context: Schema.Types.Mixed,
    detectedAt: { type: Date, default: Date.now },
    observedAt: { type: Date },
    freshness: {
      type: String,
      enum: ['FRESH', 'RECENT', 'STALE', 'UNKNOWN'],
      default: 'FRESH'
    },
    confidence: { type: Number, default: 0.8 },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ['DETECTED', 'EVALUATING', 'ACTION_REQUIRED', 'NOTIFIED', 'ACKNOWLEDGED', 'RESOLVED', 'EXPIRED', 'DISMISSED'],
      default: 'DETECTED',
      index: true
    },
    fingerprint: { type: String, required: true, index: true },
    decisionId: { type: Schema.Types.ObjectId, ref: 'DecisionRecord' },
    notificationId: { type: Schema.Types.ObjectId, ref: 'Notification' }
  },
  { timestamps: true }
);

export const ProactiveEventLog = model('ProactiveEventLog', ProactiveEventLogSchema);
