import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { AIAdminController } from '../controllers/AIAdminController';

const router = Router();

router.use(authenticate);

// Public / Farmer AI Evaluation & Feedback Endpoints
router.post('/evaluations', AIAdminController.createEvaluation);
router.get('/evaluations/:id', AIAdminController.getEvaluation);
router.post('/feedback', AIAdminController.submitFeedback);
router.post('/expert-review', authorize('expert', 'admin'), AIAdminController.submitExpertReview);
router.post('/incidents', AIAdminController.reportIncident);

// Admin Governance Endpoints (Strictly Admin Authorized)
router.get('/admin/governance', authorize('admin'), AIAdminController.getGovernanceDashboard);
router.get('/admin/incidents', authorize('admin'), AIAdminController.getIncidents);
router.post('/admin/incidents/:id/review', authorize('admin'), AIAdminController.resolveIncident);
router.post('/admin/kill-switch', authorize('admin'), AIAdminController.toggleKillSwitch);

export default router;
