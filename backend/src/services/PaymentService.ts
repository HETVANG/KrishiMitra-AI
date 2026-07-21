import { Types } from 'mongoose';
import { Payment } from '../models/Payment';
import { Transaction } from '../models/Transaction';
import { SubscriptionHistory } from '../models/SubscriptionHistory';
import { User } from '../models/User';
import { getRazorpayConfig } from './RazorpayService';
import { getMockPaymentMode, getPlanAmount, getPlanDefinition, getSubscriptionExpiry } from '../utils/paymentUtils';
import { CreateOrderInput, VerifyPaymentInput } from '../types/payment';

export class PaymentService {
  static async createOrder(input: CreateOrderInput) {
    const { userId, planName = 'basic', billingCycle = 'monthly', amount, currency = 'INR', provider = 'mock', metadata = {} } = input;
    const normalizedPlan = planName as any;
    const normalizedBillingCycle = billingCycle as any;
    const calculatedAmount = amount ?? getPlanAmount(normalizedPlan, normalizedBillingCycle);
    const razorpayConfig = getRazorpayConfig();
    const mockMode = getMockPaymentMode() || !razorpayConfig.enabled;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const payment = await Payment.create({
      userId: new Types.ObjectId(userId),
      planName: normalizedPlan,
      billingCycle: normalizedBillingCycle,
      amount: calculatedAmount,
      currency,
      status: 'pending',
      provider: mockMode ? 'mock' : provider,
      mode: mockMode ? 'mock' : 'live',
      orderId,
      receipt: `receipt_${orderId}`,
      metadata
    });

    await Transaction.create({
      userId: new Types.ObjectId(userId),
      paymentId: payment._id,
      type: 'order_created',
      status: 'initiated',
      provider: payment.provider,
      amount: calculatedAmount,
      currency,
      metadata: { orderId }
    });

    return {
      success: true,
      order: {
        id: orderId,
        amount: calculatedAmount,
        currency,
        receipt: payment.receipt,
        plan: normalizedPlan,
        billingCycle: normalizedBillingCycle,
        provider: payment.provider,
        mode: payment.mode,
        keyId: razorpayConfig.keyId || null,
        mockMode,
        planDetails: getPlanDefinition(normalizedPlan)
      },
      paymentId: payment._id
    };
  }

  static async verifyPayment(input: VerifyPaymentInput) {
    const { userId, orderId, paymentId, signature, status = 'captured', provider = 'mock' } = input;
    const mockMode = getMockPaymentMode();

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      throw new Error('Payment order not found');
    }

    const success = mockMode || status === 'captured' || !!paymentId;
    const finalStatus = success ? 'succeeded' : 'failed';

    payment.status = finalStatus;
    payment.paymentId = paymentId || `mock_${Date.now()}`;
    payment.provider = mockMode ? 'mock' : provider;
    payment.mode = mockMode ? 'mock' : 'live';
    payment.gatewayResponse = {
      verified: success,
      signature,
      provider,
      status,
      mockMode
    };
    await payment.save();

    await Transaction.create({
      userId: new Types.ObjectId(userId),
      paymentId: payment._id,
      type: success ? 'payment_verified' : 'payment_failed',
      status: success ? 'succeeded' : 'failed',
      provider: payment.provider,
      amount: payment.amount,
      currency: payment.currency,
      gatewayResponse: payment.gatewayResponse
    });

    if (success) {
      const user = await User.findById(userId);
      if (user) {
        const expiryDate = getSubscriptionExpiry(payment.billingCycle);
        user.plan = payment.planName === 'free' ? 'free' : 'premium';
        user.subscriptionStatus = 'active';
        user.subscriptionType = payment.billingCycle;
        user.paymentProvider = payment.provider === 'mock' ? 'razorpay' : payment.provider;
        user.subscriptionExpiry = expiryDate;
        user.lastPaymentDate = new Date();
        user.nextBillingDate = expiryDate;
        await user.save();

        await SubscriptionHistory.create({
          userId: new Types.ObjectId(userId),
          paymentId: payment._id,
          planName: payment.planName,
          billingCycle: payment.billingCycle,
          status: 'active',
          startDate: new Date(),
          endDate: expiryDate,
          provider: payment.provider,
          notes: `Subscription activated in ${mockMode ? 'mock' : 'live'} mode`
        });
      }
    }

    return {
      success: true,
      payment: {
        id: payment._id,
        status: finalStatus,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        mode: payment.mode,
        mockMode,
        subscriptionActivated: success
      }
    };
  }

  static async getHistory(userId: string) {
    const payments = await Payment.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
    const subscriptionHistory = await SubscriptionHistory.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();

    return {
      success: true,
      payments,
      subscriptionHistory
    };
  }
}
