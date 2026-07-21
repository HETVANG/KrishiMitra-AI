import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService';
import { AuthRequest } from '../middleware/auth';

export class PaymentController {
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.createOrder({
        userId: req.user?._id?.toString() || req.body.userId,
        planName: req.body.planName,
        billingCycle: req.body.billingCycle,
        amount: req.body.amount,
        currency: req.body.currency,
        provider: req.body.provider,
        metadata: req.body.metadata
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.verifyPayment({
        userId: req.user?._id?.toString() || req.body.userId,
        orderId: req.body.orderId,
        paymentId: req.body.paymentId,
        signature: req.body.signature,
        status: req.body.status,
        provider: req.body.provider
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.getHistory(req.user?._id?.toString() || '');
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
