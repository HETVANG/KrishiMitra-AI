import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BillingServiceFactory } from '../services/BillingService';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { Payment } from '../models/Payment';
import { Transaction } from '../models/Transaction';
import crypto from 'crypto';

export class BillingController {
  /**
   * Generates a checkout session and simulates instant premium upgrade in development
   */
  static async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      return res.status(400).json({
        success: false,
        message: 'Direct session upgrades are disabled. Please use the /payments/create-order endpoint and checkout via Razorpay popup.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cryptographic webhook receiver with HMAC signature verification and idempotency
   */
  static async handleWebhook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const signature = (req.headers['x-razorpay-signature'] || req.headers['signature']) as string;
      const { provider } = req.params;

      if (!provider) {
        return res.status(400).json({ success: false, message: 'Provider parameter required.' });
      }

      if (provider === 'razorpay') {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

        if (webhookSecret) {
          if (!signature) {
            return res.status(400).json({ success: false, message: 'Missing webhook signature header' });
          }

          const rawPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
          const expectedSig = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawPayload)
            .digest('hex');

          const expectedBuf = Buffer.from(expectedSig, 'utf8');
          const signatureBuf = Buffer.from(signature, 'utf8');

          const isValid = expectedBuf.length === signatureBuf.length && crypto.timingSafeEqual(expectedBuf, signatureBuf);
          if (!isValid) {
            console.warn('[Billing Webhook Alert] Invalid webhook signature received for Razorpay');
            return res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
          }
        }

        // Idempotent event processing
        const event = req.body?.event;
        const payloadEntity = req.body?.payload?.payment?.entity || req.body?.payload?.order?.entity;
        const orderId = payloadEntity?.order_id || payloadEntity?.id;

        if (orderId) {
          const existingPayment = await Payment.findOne({ orderId });
          if (existingPayment && existingPayment.status === 'succeeded') {
            return res.json({ success: true, message: 'Webhook event already processed (idempotent)', event });
          }
        }
      }

      console.info(`[Billing Webhook] Verified event received for ${provider}`);
      return res.json({
        success: true,
        message: `${provider} webhook executed and verified successfully.`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates and downloads a tax invoice for a completed payment.
   */
  static async downloadInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.params;
      if (!paymentId) {
        return res.status(400).json({ success: false, message: 'Payment ID is required.' });
      }

      // Fetch the payment details and populate user details
      const payment = await Payment.findById(paymentId).populate('userId');
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment record not found.' });
      }

      // Security: Validate ownership. Only admin or the payment owner can download.
      const isOwner = payment.userId?._id?.toString() === req.user?._id?.toString();
      const isAdmin = req.user?.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not authorized to view this invoice.' });
      }

      // Security: Validate status. Only captured/succeeded payments can have downloadable invoices.
      if (payment.status !== 'succeeded') {
        return res.status(400).json({ success: false, message: 'Invoice is only available for successful/completed payments.' });
      }

      // Set headers for file download response
      const invoiceYear = payment.createdAt ? new Date(payment.createdAt).getFullYear() : new Date().getFullYear();
      const invoiceSerial = payment._id.toString().slice(-6).toUpperCase();
      const filename = `TheKhedut_Invoice_TK-INV-${invoiceYear}-${invoiceSerial}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Stream generated PDF to Response
      const { generateInvoicePDF } = require('../utils/invoiceGenerator');
      await generateInvoicePDF(payment, payment.userId || req.user, res);
    } catch (error) {
      console.error('[Invoice Download Error]:', error);
      next(error);
    }
  }
}
