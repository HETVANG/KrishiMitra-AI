import { Schema, model } from 'mongoose';

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    field: { type: Schema.Types.ObjectId, ref: 'Field', index: true },
    cropCycle: { type: Schema.Types.ObjectId, ref: 'CropCycle', index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['weather', 'disease', 'market', 'scheme', 'general', 'irrigation', 'crop_lifecycle', 'task', 'agent', 'expert', 'proactive'],
      required: true,
      index: true
    },
    eventType: { type: String, index: true },
    priority: {
      type: String,
      enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true
    },
    status: {
      type: String,
      enum: ['UNREAD', 'READ', 'ACKNOWLEDGED', 'DISMISSED', 'EXPIRED'],
      default: 'UNREAD',
      index: true
    },
    isRead: { type: Boolean, default: false, index: true },
    source: { type: String, default: 'SYSTEM' },
    evidence: [
      {
        source: { type: String },
        sourceType: { type: String },
        value: { type: Schema.Types.Mixed },
        observedAt: { type: String },
        freshness: { type: String },
        confidence: { type: Number, default: 0.8 },
        relevance: { type: String }
      }
    ],
    decisionId: { type: Schema.Types.ObjectId, ref: 'DecisionRecord' },
    actionPlan: [
      {
        stepNumber: { type: Number },
        action: { type: String },
        reason: { type: String },
        priority: { type: String },
        deadline: { type: String },
        approvalRequired: { type: Boolean, default: false },
        status: { type: String, default: 'PENDING' }
      }
    ],
    actionUrl: { type: String },
    fingerprint: { type: String, index: true },
    expiresAt: { type: Date },
    acknowledgedAt: { type: Date },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    dismissedAt: { type: Date },
    dismissedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Keep isRead synced with status
NotificationSchema.pre('save', function (next) {
  if (this.status === 'READ' || this.status === 'ACKNOWLEDGED' || this.status === 'DISMISSED') {
    this.isRead = true;
  }
  next();
});

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, farm: 1, status: 1 });

export const Notification = model('Notification', NotificationSchema);
