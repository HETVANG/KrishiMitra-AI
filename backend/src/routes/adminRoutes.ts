import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints
router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', AdminController.getAdminDashboard);
router.get('/analytics', AdminController.getAdminAnalytics);
router.get('/users', AdminController.getAdminUsers);
router.get('/login-history', AdminController.getAdminLoginHistory);
router.get('/audit-logs', AdminController.getAdminAuditLogs);
router.post('/users/:userId/toggle-block', AdminController.toggleBlockUser);
router.post('/notifications/broadcast', AdminController.broadcastNotification);

export default router;
