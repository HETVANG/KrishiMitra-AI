import { Schema, model } from 'mongoose';

const NotificationPreferenceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    channels: {
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false }
    },
    categories: {
      weatherAlerts: { type: Boolean, default: true },
      cropHealthAlerts: { type: Boolean, default: true },
      irrigationAlerts: { type: Boolean, default: true },
      marketAlerts: { type: Boolean, default: true },
      cropLifecycleAlerts: { type: Boolean, default: true },
      taskAlerts: { type: Boolean, default: true },
      agentAlerts: { type: Boolean, default: true },
      expertAlerts: { type: Boolean, default: true }
    },
    minPriority: {
      type: String,
      enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'INFO'
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' }, // 10 PM
      end: { type: String, default: '06:00' },   // 6 AM
      timezone: { type: String, default: 'Asia/Kolkata' },
      bypassForCritical: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export const NotificationPreference = model('NotificationPreference', NotificationPreferenceSchema);
