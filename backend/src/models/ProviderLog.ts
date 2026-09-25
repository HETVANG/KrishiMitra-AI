import mongoose, { Schema, Document } from 'mongoose';

export type ProviderActionType = 'TEST_CONNECTION' | 'SYNC' | 'CONFIG_UPDATE' | 'STATUS_CHANGE' | 'HEALTH_CHECK' | 'CREATE';

export interface IProviderLog extends Document {
  providerId: string;
  providerName: string;
  action: ProviderActionType;
  status: 'SUCCESS' | 'FAILED' | 'DEGRADED' | 'DISABLED';
  httpStatus?: number;
  latencyMs?: number;
  message?: string;
  adminUser?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const ProviderLogSchema: Schema = new Schema(
  {
    providerId: { type: String, required: true, index: true },
    providerName: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: ['TEST_CONNECTION', 'SYNC', 'CONFIG_UPDATE', 'STATUS_CHANGE', 'HEALTH_CHECK', 'CREATE'],
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'FAILED', 'DEGRADED', 'DISABLED'],
      index: true
    },
    httpStatus: { type: Number },
    latencyMs: { type: Number, default: 0 },
    message: { type: String, default: '' },
    adminUser: { type: String, default: 'System Admin' },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

ProviderLogSchema.index({ providerId: 1, timestamp: -1 });

export const ProviderLog = mongoose.model<IProviderLog>('ProviderLog', ProviderLogSchema);
