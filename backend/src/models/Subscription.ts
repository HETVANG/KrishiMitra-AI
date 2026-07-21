import { Schema, model } from 'mongoose';

const SubscriptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'expired', 'trialing'], default: 'trialing' },
    expiryDate: { type: Date },
    paymentHistory: [{
      provider: { type: String },
      transactionId: { type: String },
      amount: { type: Number },
      date: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export const Subscription = model('Subscription', SubscriptionSchema);
