import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { ProactiveController } from '../controllers/ProactiveController';

const router = Router();

// Protected Proactive Intelligence Endpoints
router.post('/evaluate', authenticate, ProactiveController.evaluateProactiveEvents);
router.get('/events', authenticate, ProactiveController.getProactiveEvents);
router.get('/daily-brief', authenticate, ProactiveController.getDailyFarmBrief);
router.get('/explain/:notificationId', authenticate, ProactiveController.explainAlert);

export default router;
