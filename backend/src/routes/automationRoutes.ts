import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AutomationController } from '../controllers/AutomationController';

const router = Router();

router.use(authenticate);

router.get('/status', AutomationController.getStatus);
router.get('/runs', AutomationController.getRuns);
router.get('/runs/:id', AutomationController.getRunById);
router.get('/settings', AutomationController.getSettings);
router.patch('/settings', AutomationController.updateSettings);
router.get('/approvals', AutomationController.getApprovals);
router.post('/approvals/:id/approve', AutomationController.approveAction);
router.post('/approvals/:id/reject', AutomationController.rejectAction);
router.get('/history', AutomationController.getHistory);
router.get('/weekly-summary', AutomationController.getWeeklySummary);
router.post('/trigger-event', AutomationController.triggerEvent);

export default router;
