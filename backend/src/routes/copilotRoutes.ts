import { Router } from 'express';
import { CopilotController } from '../controllers/CopilotController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All Copilot endpoints require authentication
router.use(authenticate);

router.post('/chat', CopilotController.chat);

router.get('/context', CopilotController.getContext);
router.get('/context/:farmId', CopilotController.getContext);

router.get('/insights', CopilotController.getInsights);
router.get('/insights/:farmId', CopilotController.getInsights);

router.get('/daily-plan', CopilotController.getDailyPlan);
router.get('/daily-plan/:farmId', CopilotController.getDailyPlan);

router.get('/weekly-plan', CopilotController.getWeeklyPlan);
router.get('/weekly-plan/:farmId', CopilotController.getWeeklyPlan);

router.put('/tasks/:taskId/toggle', CopilotController.toggleTask);

router.get('/conversations', CopilotController.listConversations);
router.get('/conversations/:id', CopilotController.getConversation);
router.delete('/conversations/:id', CopilotController.deleteConversation);

export default router;
