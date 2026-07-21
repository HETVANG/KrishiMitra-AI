import { Schema, model } from 'mongoose';
import { ISubscriptionHistory } from '../types/payment';

const SubscriptionHistorySchema = new Schema<ISubscriptionHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', index: true },
  planName: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free', required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly', required: true },
  status: { type: String, enum: ['active', 'inactive', 'expired', 'trialing'], default: 'active' },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date },
  provider: { type: String, enum: ['razorpay', 'mock', 'upi'], default: 'mock' },
  notes: { type: String }
}, { timestamps: true });

export const SubscriptionHistory = model<ISubscriptionHistory>('SubscriptionHistory', SubscriptionHistorySchema);
