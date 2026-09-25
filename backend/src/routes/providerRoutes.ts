import { Router } from 'express';
import { ProviderController } from '../controllers/ProviderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Enforce authentication & admin authorization for all provider management routes
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', ProviderController.getProviders);
router.post('/', ProviderController.createProvider);
router.get('/:id', ProviderController.getProviderById);
router.post('/:id/test', ProviderController.testConnection);
router.post('/:id/sync', ProviderController.syncProvider);
router.patch('/:id', ProviderController.updateProvider);
router.patch('/:id/status', ProviderController.toggleStatus);
router.get('/:id/logs', ProviderController.getLogs);
router.get('/:id/health-history', ProviderController.getHealthHistory);

export default router;
