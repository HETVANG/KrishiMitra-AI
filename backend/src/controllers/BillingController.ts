import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BillingServiceFactory } from '../services/BillingService';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';

export class BillingController {
  /**
   * Generates a checkout session and simulates instant premium upgrade in development
   */
  static async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { planType, paymentProvider, couponCode, referralCode, discountType } = req.body;

      if (!planType || !['monthly', 'yearly'].includes(planType)) {
        return res.status(400).json({ success: false, message: 'Valid planType (monthly or yearly) is required.' });
      }

      if (!paymentProvider || !['stripe', 'razorpay', 'upi'].includes(paymentProvider)) {
        return res.status(400).json({ success: false, message: 'Valid paymentProvider (stripe, razorpay, upi) is required.' });
      }

      const billingService = BillingServiceFactory.getService(paymentProvider);
      
      const sessionResult = await billingService.createCheckoutSession({
        userId: req.user._id,
        planType,
        paymentProvider,
        couponCode,
        referralCode,
        discountType
      });

      if (sessionResult.success) {
        // Calculate subscription expiry (1 month vs 1 year)
        const expiryDate = new Date();
        if (planType === 'monthly') {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }

        // Live Mongoose mode
        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          {
            plan: 'premium',
            subscriptionStatus: 'active',
            subscriptionType: planType,
            subscriptionExpiry: expiryDate,
            paymentProvider,
            lastPaymentDate: new Date(),
            nextBillingDate: expiryDate
          },
          { new: true }
        );

        // Update or create active Subscription log in MongoDB
        try {
          await Subscription.findOneAndUpdate(
            { user: req.user._id },
            {
              user: req.user._id,
              plan: 'premium',
              status: 'active',
              expiryDate: expiryDate,
              $push: {
                paymentHistory: {
                  provider: paymentProvider,
                  transactionId: `txn_mock_${Math.random().toString(36).substring(7).toUpperCase()}`,
                  amount: sessionResult.amount,
                  date: new Date()
                }
              }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } catch (subErr) {
          console.warn('[Subscription Log Warning] Failed to log active subscription:', subErr);
        }

        return res.json({
          success: true,
          checkoutUrl: sessionResult.paymentUrl,
          amount: sessionResult.amount,
          user: updatedUser || req.user,
          message: 'Premium upgraded successfully! Enjoy unlimited agricultural tools.'
        });
      }

      return res.status(400).json({ success: false, message: sessionResult.message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mock Billing Webhook receiver for Stripe, Razorpay, or UPI callbacks
   */
  static async handleWebhook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['signature'] as string;
      const { provider } = req.params;

      if (!provider) {
        return res.status(400).json({ success: false, message: 'Provider parameter required.' });
      }

      console.log(`[Billing Webhook] Callback received for ${provider}. Signature: ${signature}`);

      // We succeed verified webhooks always in mock mode
      return res.json({
        success: true,
        message: `${provider} webhook executed successfully.`
      });
    } catch (error) {
      next(error);
    }
  }
}
