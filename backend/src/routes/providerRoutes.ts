import { Router } from 'express';
import { ProviderController } from '../controllers/ProviderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', ProviderController.getProviders);
router.get('/:id', ProviderController.getProviderById);

export default router;
