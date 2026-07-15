import { Router } from 'express';
import { BillingController } from '../controllers/BillingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/checkout', authenticate, BillingController.createSession);
router.post('/webhook/:provider', BillingController.handleWebhook);

export default router;
