import { User } from '../models/User';
import { isDbConnected, mockDatabase } from '../utils/dbFallback';

export interface CheckoutSessionInput {
  userId: string;
  planType: 'monthly' | 'yearly';
  paymentProvider: 'stripe' | 'razorpay' | 'upi';
  couponCode?: string;
  referralCode?: string;
  discountType?: 'student' | 'ngo' | 'gov' | 'none';
}

export interface CheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  paymentUrl?: string;
  amount: number;
  message: string;
}

export interface WebhookResult {
  success: boolean;
  userId?: string;
  planType?: 'monthly' | 'yearly';
  message: string;
}

/**
 * Common interface for all payment providers
 */
export interface IBillingService {
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
  verifyWebhook(signature: string, rawBody: any): Promise<WebhookResult>;
}

/**
 * Business logic processor for promotional discounts, coupons, and sponsored agricultural plans
 */
export class DiscountEngine {
  static calculateFinalPrice(basePrice: number, input: CheckoutSessionInput): number {
    let finalPrice = basePrice;

    // 1. NGO or Government Sponsored Plans (often 100% discount or heavily subsidized)
    if (input.discountType === 'gov') {
      finalPrice = finalPrice * 0.1; // 90% subsidy for small holder farmers
    } else if (input.discountType === 'ngo') {
      finalPrice = finalPrice * 0.2; // 80% discount for NGO cluster cooperatives
    }

    // 2. Student / Young Farmer academic discount
    else if (input.discountType === 'student') {
      finalPrice = finalPrice * 0.5; // 50% academic young farmer discount
    }

    // 3. Coupon Codes (e.g. KRISHI50, MITRA20)
    if (input.couponCode) {
      const code = input.couponCode.toUpperCase().trim();
      if (code === 'KRISHI50') {
        finalPrice = finalPrice * 0.5; // 50% off
      } else if (code === 'MITRA20') {
        finalPrice = finalPrice * 0.8; // 20% off
      }
    }

    // 4. Referral bonuses (e.g. REF100 gives flat ₹100 reduction)
    if (input.referralCode) {
      finalPrice = Math.max(0, finalPrice - 100);
    }

    return Math.round(finalPrice);
  }
}

// ------------------------------------------------------------------------
// Stripe Gateway Implementation
// ------------------------------------------------------------------------
export class StripeBillingService implements IBillingService {
  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const basePrice = input.planType === 'monthly' ? 99 : 999;
    const finalAmount = DiscountEngine.calculateFinalPrice(basePrice, input);

    // Stripe checkout creation logic goes here
    return {
      success: true,
      sessionId: `stripe_sess_${Math.random().toString(36).substring(7)}`,
      paymentUrl: `https://checkout.stripe.com/pay/mock_krishimitra_${input.planType}_${finalAmount}`,
      amount: finalAmount,
      message: 'Stripe mock session created successfully.'
    };
  }

  async verifyWebhook(signature: string, rawBody: any): Promise<WebhookResult> {
    // Stripe webhook validation logic goes here
    return { success: true, message: 'Stripe webhook verified.' };
  }
}

// ------------------------------------------------------------------------
// Razorpay Gateway Implementation
// ------------------------------------------------------------------------
export class RazorpayBillingService implements IBillingService {
  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const basePrice = input.planType === 'monthly' ? 99 : 999;
    const finalAmount = DiscountEngine.calculateFinalPrice(basePrice, input);

    // Razorpay order creation logic goes here
    return {
      success: true,
      sessionId: `razorpay_order_${Math.random().toString(36).substring(7)}`,
      paymentUrl: `https://api.razorpay.com/checkout/mock_order_${finalAmount}`,
      amount: finalAmount,
      message: 'Razorpay mock order created successfully.'
    };
  }

  async verifyWebhook(signature: string, rawBody: any): Promise<WebhookResult> {
    // Razorpay webhook validation logic goes here
    return { success: true, message: 'Razorpay webhook verified.' };
  }
}

// ------------------------------------------------------------------------
// UPI QR Code Gateway Implementation
// ------------------------------------------------------------------------
export class UpiBillingService implements IBillingService {
  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const basePrice = input.planType === 'monthly' ? 99 : 999;
    const finalAmount = DiscountEngine.calculateFinalPrice(basePrice, input);

    // Generate standard BHIM UPI Deep Link QR code string
    // e.g. upi://pay?pa=krishimitra@upi&pn=KrishiMitraAI&am=Amount
    const upiLink = `upi://pay?pa=krishimitra@upi&pn=KrishiMitra%20AI&am=${finalAmount}&cu=INR&tn=KrishiMitra%20${input.planType}%2520Upgrade`;

    return {
      success: true,
      sessionId: `upi_link_${Math.random().toString(36).substring(7)}`,
      paymentUrl: upiLink, // Mobile apps open UPI wallets, web renders QR code
      amount: finalAmount,
      message: 'UPI deep link generated successfully.'
    };
  }

  async verifyWebhook(signature: string, rawBody: any): Promise<WebhookResult> {
    return { success: true, message: 'UPI transaction webhook verified.' };
  }
}

// ------------------------------------------------------------------------
// Billing Service Factory
// ------------------------------------------------------------------------
export class BillingServiceFactory {
  static getService(provider: 'stripe' | 'razorpay' | 'upi'): IBillingService {
    switch (provider) {
      case 'stripe':
        return new StripeBillingService();
      case 'razorpay':
        return new RazorpayBillingService();
      case 'upi':
        return new UpiBillingService();
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }
}
