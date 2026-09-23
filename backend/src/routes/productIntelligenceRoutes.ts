import { Router } from 'express';
import { ProductIntelligenceController } from '../controllers/ProductIntelligenceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public/Optional Telemetry endpoint
router.post('/events', ProductIntelligenceController.logEvent);

// Authenticated Farmer Feedback & Reporting
router.post('/feedback', authenticate, ProductIntelligenceController.submitFeedback);
router.get('/feedback/my', authenticate, ProductIntelligenceController.getUserFeedback);
router.post('/issues', authenticate, ProductIntelligenceController.reportIssue);
router.post('/feature-requests', authenticate, ProductIntelligenceController.submitFeatureRequest);

// Admin Product Analytics & Feedback Queue
router.get('/admin/analytics', authenticate, authorize('admin'), ProductIntelligenceController.getAdminAnalytics);

export default router;
