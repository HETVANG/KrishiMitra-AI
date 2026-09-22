import { Router } from 'express';
import { CropCycleController } from '../controllers/CropCycleController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', CropCycleController.create);
router.get('/', CropCycleController.list);
router.get('/:id', CropCycleController.getIntelligence);
router.put('/:id', CropCycleController.update);
router.post('/:id/activity', CropCycleController.logActivity);
router.post('/:id/harvest', CropCycleController.recordHarvest);
router.post('/:id/complete', CropCycleController.complete);

export default router;
