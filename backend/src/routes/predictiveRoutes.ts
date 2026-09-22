import { Router } from 'express';
import { PredictiveController } from '../controllers/PredictiveController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', PredictiveController.getPredictions);
router.get('/:farmId', PredictiveController.getPredictions);
router.get('/:farmId/timeline', PredictiveController.getTimeline);
router.post('/:farmId/refresh', PredictiveController.refreshPredictions);

export default router;
