import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { DecisionController } from '../controllers/DecisionController';

const router = Router();

// All Decision Engine endpoints require authentication
router.post('/evaluate', authenticate, DecisionController.evaluateDecision);
router.get('/history', authenticate, DecisionController.getDecisionHistory);
router.post('/:id/approve', authenticate, DecisionController.approveDecision);
router.post('/:id/reject', authenticate, DecisionController.rejectDecision);

export default router;
