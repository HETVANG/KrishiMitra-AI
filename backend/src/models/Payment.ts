import { Schema, model } from 'mongoose';
import { IPayment } from '../types/payment';

const PaymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  planName: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'basic', required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly', required: true },
  amount: { type: Number, default: 0, required: true },
  currency: { type: String, default: 'INR', required: true },
  status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
  provider: { type: String, enum: ['razorpay', 'mock', 'upi'], default: 'mock' },
  mode: { type: String, enum: ['mock', 'live'], default: 'mock' },
  orderId: { type: String, required: true, unique: true, index: true },
  paymentId: { type: String, index: true },
  receipt: { type: String },
  gatewayResponse: { type: Schema.Types.Mixed, default: {} },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export const Payment = model<IPayment>('Payment', PaymentSchema);
