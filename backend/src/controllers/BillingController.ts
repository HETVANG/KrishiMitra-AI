import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BillingServiceFactory } from '../services/BillingService';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { Payment } from '../models/Payment';

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
      const filename = `KrishiMitra_Invoice_KM-INV-${invoiceYear}-${invoiceSerial}.pdf`;

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
