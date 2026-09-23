import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();

// Protected Notification Endpoints
router.get('/', authenticate, NotificationController.getNotifications);
router.get('/unread', authenticate, NotificationController.getUnreadCount);
router.post('/:id/read', authenticate, NotificationController.markAsRead);
router.post('/:id/acknowledge', authenticate, NotificationController.acknowledgeNotification);
router.post('/:id/dismiss', authenticate, NotificationController.dismissNotification);
router.get('/preferences', authenticate, NotificationController.getPreferences);
router.put('/preferences', authenticate, NotificationController.updatePreferences);

export default router;
