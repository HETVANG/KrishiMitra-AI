import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { paymentLimiter } from '../middleware/rateLimiters';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();

router.post('/create-order', authenticate, paymentLimiter, PaymentController.createOrder);
router.post('/verify', authenticate, paymentLimiter, PaymentController.verify);
router.get('/history', authenticate, PaymentController.getHistory);

export default router;
