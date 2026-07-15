import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AdminController } from '../controllers/AdminController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';

const router = Router();

router.post('/register', validateBody(['name', 'email', 'password']), AuthController.register);
router.post('/login', validateBody(['email', 'password']), AuthController.login);
router.post('/google-login', AuthController.googleLogin);
router.post('/otp-login', validateBody(['phone', 'otp']), AuthController.otpLogin);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);
router.put('/settings', authenticate, AuthController.updateSettings);

// Admin-only metrics and analytics
router.get('/admin/stats', authenticate, AdminController.getStats);

export default router;
