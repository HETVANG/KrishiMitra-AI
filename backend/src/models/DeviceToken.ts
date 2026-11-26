import { Schema, model, Document } from 'mongoose';

export interface IDeviceToken extends Document {
  user: Schema.Types.ObjectId;
  token: string;
  platform: 'android' | 'ios' | 'web';
  deviceModel?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceTokenSchema = new Schema<IDeviceToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true, trim: true },
    platform: {
      type: String,
      enum: ['android', 'ios', 'web'],
      default: 'android'
    },
    deviceModel: { type: String, trim: true },
    appVersion: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    lastUsedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

DeviceTokenSchema.index({ user: 1, isActive: 1 });

export const DeviceToken = model<IDeviceToken>('DeviceToken', DeviceTokenSchema);
