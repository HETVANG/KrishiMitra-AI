import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validator';

const router = Router();

router.post('/register', validateBody(['name', 'email', 'password']), AuthController.register);
router.post('/login', validateBody(['email', 'password']), AuthController.login);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);
router.put('/settings', authenticate, AuthController.updateSettings);

// Admin-only metrics and analytics (fully protected)
router.get('/admin/stats', authenticate, authorize('admin'), AdminController.getStats);

export default router;
