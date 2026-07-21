import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();

router.post('/create-order', authenticate, PaymentController.createOrder);
router.post('/verify', authenticate, PaymentController.verify);
router.get('/history', authenticate, PaymentController.getHistory);

export default router;
