import { Router } from 'express';
import { SuccessController } from '../controllers/SuccessController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Authenticated Farmer Success & Daily Brief Endpoints
router.get('/context', authenticate, SuccessController.getContext);
router.get('/daily-brief', authenticate, SuccessController.getDailyBrief);
router.get('/weekly-brief', authenticate, SuccessController.getWeeklyBrief);
router.get('/timeline', authenticate, SuccessController.getTimeline);

// Task Outcome & Feedback Endpoints
router.post('/tasks/:taskId/complete', authenticate, SuccessController.completeTask);
router.post('/feedback', authenticate, SuccessController.submitFeedback);

// Admin Retention & Success Analytics Endpoint
router.get('/admin/analytics', authenticate, authorize('admin'), SuccessController.getAdminRetentionAnalytics);

export default router;
