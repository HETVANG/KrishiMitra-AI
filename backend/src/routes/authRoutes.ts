import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiters';

const router = Router();

// Validate login body: supports mobile number or email identifier + password
const validateLoginBody = (req: Request, res: Response, next: NextFunction) => {
  const { phone, mobile, phoneNumber, email, password } = req.body;
  const identifier = phone || mobile || phoneNumber || email;
  if (!identifier || (typeof identifier === 'string' && !identifier.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number or email is required',
    });
  }
  if (!password || (typeof password === 'string' && !password.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    });
  }
  next();
};

router.post('/register', authLimiter, validateBody(['name', 'email', 'password']), AuthController.register);
router.post('/login', authLimiter, validateLoginBody, AuthController.login);

// Legal & Privacy Compliance routes (User Rights, DPDP Act 2023, Play Store Deletion)
router.post('/request-data-deletion', authLimiter, optionalAuthenticate, AuthController.requestDataDeletion);
router.post('/unsubscribe', authLimiter, AuthController.unsubscribe);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);
router.put('/settings', authenticate, AuthController.updateSettings);

// Admin-only metrics and analytics (fully protected)
router.get('/admin/stats', authenticate, authorize('admin'), AdminController.getStats);

export default router;
