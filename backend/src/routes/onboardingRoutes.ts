import { Router } from 'express';
import { OnboardingController } from '../controllers/OnboardingController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Authenticated farmer onboarding status and progression
router.get('/status', authenticate, OnboardingController.getStatus);
router.post('/start', authenticate, OnboardingController.start);
router.patch('/step', authenticate, OnboardingController.updateStep);
router.post('/skip', authenticate, OnboardingController.skip);
router.post('/complete', authenticate, OnboardingController.complete);

// Admin activation metrics
router.get('/admin/activation', authenticate, authorize('admin'), OnboardingController.getActivationMetrics);

export default router;
