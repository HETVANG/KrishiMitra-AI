import { Schema, model, Document } from 'mongoose';

export interface ILoginHistory extends Document {
  userId: Schema.Types.ObjectId;
  loginTime: Date;
  browser: string;
  device: string;
  ipAddress: string;
}

const LoginHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    loginTime: { type: Date, default: Date.now },
    browser: { type: String, default: 'Unknown' },
    device: { type: String, default: 'Unknown' },
    ipAddress: { type: String, default: '127.0.0.1' }
  },
  { timestamps: true }
);

// Optimize query retrieval for specific users
LoginHistorySchema.index({ userId: 1, loginTime: -1 });
LoginHistorySchema.index({ loginTime: -1 });

export const LoginHistory = model<ILoginHistory>('LoginHistory', LoginHistorySchema);
