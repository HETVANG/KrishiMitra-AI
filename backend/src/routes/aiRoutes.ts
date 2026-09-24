import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AIAdminController } from '../controllers/AIAdminController';

const router = Router();

router.use(authenticate);

// Public / Farmer AI Evaluation & Feedback Endpoints
router.post('/evaluations', AIAdminController.createEvaluation);
router.get('/evaluations/:id', AIAdminController.getEvaluation);
router.post('/feedback', AIAdminController.submitFeedback);
router.post('/expert-review', AIAdminController.submitExpertReview);
router.post('/incidents', AIAdminController.reportIncident);

// Admin Governance Endpoints
router.get('/admin/governance', AIAdminController.getGovernanceDashboard);
router.get('/admin/incidents', AIAdminController.getIncidents);
router.post('/admin/incidents/:id/review', AIAdminController.resolveIncident);
router.post('/admin/kill-switch', AIAdminController.toggleKillSwitch);

export default router;
