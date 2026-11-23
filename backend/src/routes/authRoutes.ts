import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/register', authLimiter, validateBody(['name', 'email', 'password']), AuthController.register);
router.post('/login', authLimiter, validateBody(['email', 'password']), AuthController.login);

// Legal & Privacy Compliance routes (User Rights, DPDP Act 2023, Play Store Deletion)
router.post('/request-data-deletion', authLimiter, optionalAuthenticate, AuthController.requestDataDeletion);
router.post('/unsubscribe', authLimiter, AuthController.unsubscribe);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);
router.put('/settings', authenticate, AuthController.updateSettings);

// Admin-only metrics and analytics (fully protected)
router.get('/admin/stats', authenticate, authorize('admin'), AdminController.getStats);

export default router;
