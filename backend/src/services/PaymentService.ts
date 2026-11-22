import { Types } from 'mongoose';
import { Payment } from '../models/Payment';
import { Transaction } from '../models/Transaction';
import { SubscriptionHistory } from '../models/SubscriptionHistory';
import { User } from '../models/User';
import { getRazorpayConfig } from './RazorpayService';
import { getMockPaymentMode, getPlanAmount, getPlanDefinition, getSubscriptionExpiry } from '../utils/paymentUtils';
import { CreateOrderInput, VerifyPaymentInput } from '../types/payment';
import { DiscountEngine } from './BillingService';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export class PaymentService {
  static async createOrder(input: CreateOrderInput) {
    const { userId, planName = 'basic', billingCycle = 'monthly', amount, currency = 'INR', metadata = {} } = input;
    const normalizedPlan = planName as any;
    const normalizedBillingCycle = billingCycle as any;
    
    // Secure server-side price calculation: Client-supplied amount is NEVER trusted to override canonical plan price
    const baseAmount = getPlanAmount(normalizedPlan, normalizedBillingCycle);
    const finalAmount = DiscountEngine.calculateFinalPrice(baseAmount, {
      userId,
      planType: normalizedBillingCycle,
      paymentProvider: 'razorpay',
      couponCode: metadata.coupon,
      referralCode: metadata.referral,
      discountType: metadata.discountType || (metadata.isStudent ? 'student' : metadata.sponsorType !== 'none' ? metadata.sponsorType : 'none')
    });

    const razorpayConfig = getRazorpayConfig();
    
    if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
      const err = new Error('Razorpay credentials are not configured');
      (err as any).statusCode = 500;
      throw err;
    }

    const amountInPaise = Math.round(finalAmount * 100);
    if (amountInPaise < 100) {
      const err = new Error('Amount must be at least 100 paise (₹1)');
      (err as any).statusCode = 400;
      throw err;
    }

    let orderId = '';
    let gatewayOrderResponse: any = null;

    try {
      const instance = new Razorpay({
        key_id: razorpayConfig.keyId,
        key_secret: razorpayConfig.keySecret
      });

      const receipt = `receipt_order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const razorpayOrder = await instance.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          userId,
          planName: normalizedPlan,
          billingCycle: normalizedBillingCycle
        }
      });

      orderId = razorpayOrder.id;
      gatewayOrderResponse = razorpayOrder;
    } catch (razorError: any) {
      console.error('Razorpay API Order Error:', razorError);
      const err = new Error(razorError.description || razorError.message || 'Failed to create Razorpay order');
      (err as any).statusCode = 500;
      throw err;
    }

    const payment = await Payment.create({
      userId: new Types.ObjectId(userId),
      planName: normalizedPlan,
      billingCycle: normalizedBillingCycle,
      amount: finalAmount,
      currency,
      status: 'pending',
      provider: 'razorpay',
      mode: 'live',
      orderId,
      receipt: gatewayOrderResponse?.receipt || `receipt_${orderId}`,
      gatewayResponse: gatewayOrderResponse || {},
      metadata
    });

    await Transaction.create({
      userId: new Types.ObjectId(userId),
      paymentId: payment._id,
      type: 'order_created',
      status: 'initiated',
      provider: 'razorpay',
      amount: finalAmount,
      currency,
      metadata: { orderId }
    });

    return {
      success: true,
      order: {
        id: orderId,
        amount: finalAmount,
        currency,
        receipt: payment.receipt,
        plan: normalizedPlan,
        billingCycle: normalizedBillingCycle,
        provider: 'razorpay',
        mode: 'live',
        keyId: razorpayConfig.keyId || null,
        mockMode: false,
        planDetails: getPlanDefinition(normalizedPlan)
      },
      paymentId: payment._id
    };
  }

  static async verifyPayment(input: VerifyPaymentInput) {
    const { userId, orderId, paymentId, signature, status = 'captured' } = input;

    // Strict ownership enforcement: payment order must match both orderId and authenticated userId
    const payment = await Payment.findOne({
      orderId,
      userId: new Types.ObjectId(userId)
    });
    if (!payment) {
      const err = new Error('Payment order not found or does not belong to the authenticated user');
      (err as any).statusCode = 404;
      throw err;
    }

    // Idempotency: If this payment has already succeeded, return clean status without double-crediting
    if (payment.status === 'succeeded') {
      return {
        success: true,
        payment: {
          id: payment._id,
          status: 'succeeded',
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          provider: 'razorpay',
          mode: 'live',
          mockMode: false,
          subscriptionActivated: true,
          alreadyVerified: true
        }
      };
    }

    const razorpayConfig = getRazorpayConfig();

    if (!signature || !paymentId) {
      const err = new Error('Signature and payment ID are required for verification');
      (err as any).statusCode = 400;
      throw err;
    }

    if (!razorpayConfig.keySecret) {
      const err = new Error('Razorpay secret key is not configured');
      (err as any).statusCode = 500;
      throw err;
    }

    const generatedSignature = crypto
      .createHmac('sha256', razorpayConfig.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Constant-time signature comparison to prevent timing attacks
    const generatedBuf = Buffer.from(generatedSignature, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');
    const isSignatureValid = 
      generatedBuf.length === signatureBuf.length && 
      crypto.timingSafeEqual(generatedBuf, signatureBuf);

    if (!isSignatureValid) {
      payment.status = 'failed';
      payment.paymentId = paymentId;
      payment.gatewayResponse = {
        verified: false,
        signature,
        error: 'Signature mismatch'
      };
      await payment.save();

      await Transaction.create({
        userId: new Types.ObjectId(userId),
        paymentId: payment._id,
        type: 'payment_failed',
        status: 'failed',
        provider: 'razorpay',
        amount: payment.amount,
        currency: payment.currency,
        gatewayResponse: payment.gatewayResponse
      });

      const err = new Error('Payment signature verification failed');
      (err as any).statusCode = 400;
      throw err;
    }

    const finalStatus = 'succeeded';

    payment.status = finalStatus;
    payment.paymentId = paymentId;
    payment.gatewayResponse = {
      verified: true,
      signature,
      provider: 'razorpay',
      status,
      mockMode: false
    };
    await payment.save();

    await Transaction.create({
      userId: new Types.ObjectId(userId),
      paymentId: payment._id,
      type: 'payment_verified',
      status: 'succeeded',
      provider: 'razorpay',
      amount: payment.amount,
      currency: payment.currency,
      gatewayResponse: payment.gatewayResponse
    });

    const user = await User.findById(userId);
    if (user) {
      const expiryDate = getSubscriptionExpiry(payment.billingCycle);
      user.plan = payment.planName === 'free' ? 'free' : 'premium';
      user.subscriptionStatus = 'active';
      user.subscriptionType = payment.billingCycle;
      user.paymentProvider = 'razorpay';
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
        provider: 'razorpay',
        notes: `Subscription activated via verified Razorpay checkout`
      });
    }

    return {
      success: true,
      payment: {
        id: payment._id,
        status: finalStatus,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        provider: 'razorpay',
        mode: 'live',
        mockMode: false,
        subscriptionActivated: true
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
