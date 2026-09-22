import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AgentController } from '../controllers/AgentController';

const router = Router();

router.use(authenticate);

router.get('/status', AgentController.getStatus);
router.get('/activity', AgentController.getActivity);
router.get('/tasks', AgentController.getTasks);
router.post('/tasks/:id/approve', AgentController.approveTask);
router.post('/tasks/:id/reject', AgentController.rejectTask);
router.get('/policies', AgentController.getPolicies);
router.put('/policies', AgentController.updatePolicies);
router.post('/run', AgentController.triggerRun);

export default router;
