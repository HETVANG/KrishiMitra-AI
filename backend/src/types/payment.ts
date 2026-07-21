import { Document, Types } from 'mongoose';

export type SubscriptionPlanName = 'free' | 'basic' | 'premium' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentProvider = 'razorpay' | 'mock' | 'upi';
export type PaymentMode = 'mock' | 'live';

export interface ISubscriptionSnapshot {
  plan: SubscriptionPlanName;
  status: 'active' | 'inactive' | 'expired' | 'trialing';
  subscriptionType: BillingCycle | 'trial' | 'none';
  subscriptionExpiry?: Date | null;
  paymentProvider?: PaymentProvider | 'none';
  lastPaymentDate?: Date | null;
  nextBillingDate?: Date | null;
}

export interface IPayment extends Document {
  userId: Types.ObjectId;
  planName: SubscriptionPlanName;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  mode: PaymentMode;
  orderId: string;
  paymentId?: string;
  receipt?: string;
  gatewayResponse?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  type: 'order_created' | 'payment_verified' | 'payment_failed' | 'subscription_updated';
  status: 'initiated' | 'succeeded' | 'failed';
  provider: PaymentProvider;
  amount: number;
  currency: string;
  gatewayResponse?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ISubscriptionHistory extends Document {
  userId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  planName: SubscriptionPlanName;
  billingCycle: BillingCycle;
  status: 'active' | 'inactive' | 'expired' | 'trialing';
  startDate: Date;
  endDate?: Date;
  provider: PaymentProvider;
  notes?: string;
  createdAt: Date;
}

export interface CreateOrderInput {
  userId: string;
  planName?: SubscriptionPlanName;
  billingCycle?: BillingCycle;
  amount?: number;
  currency?: string;
  provider?: PaymentProvider;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentInput {
  userId: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  status?: string;
  provider?: PaymentProvider;
}
