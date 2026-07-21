import { Schema, model } from 'mongoose';
import { ITransaction } from '../types/payment';

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', index: true },
  type: { type: String, enum: ['order_created', 'payment_verified', 'payment_failed', 'subscription_updated'], required: true },
  status: { type: String, enum: ['initiated', 'succeeded', 'failed'], default: 'initiated' },
  provider: { type: String, enum: ['razorpay', 'mock', 'upi'], default: 'mock' },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  gatewayResponse: { type: Schema.Types.Mixed, default: {} },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
