import { Router } from 'express';
import { IrrigationController } from '../controllers/IrrigationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/status', IrrigationController.getStatus);
router.get('/status/:farmId', IrrigationController.getStatus);

router.post('/events', IrrigationController.logEvent);

router.get('/history', IrrigationController.getHistory);
router.get('/history/:farmId', IrrigationController.getHistory);

export default router;
