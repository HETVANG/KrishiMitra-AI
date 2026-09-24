import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { OutcomeController } from '../controllers/OutcomeController';

const router = Router();

router.post('/', authenticate, OutcomeController.createOutcome);
router.post('/follow-up', authenticate, OutcomeController.recordFollowUp);
router.post('/harvest', authenticate, OutcomeController.recordHarvest);
router.put('/:outcomeId/validate', authenticate, OutcomeController.validateOutcome);
router.get('/farm/:farmId', authenticate, OutcomeController.getFarmHistory);
router.get('/crop-cycle/:cropCycleId', authenticate, OutcomeController.getCropHistory);
router.get('/ai-context/:farmId', authenticate, OutcomeController.getAIContext);
router.get('/admin/review-queue', authenticate, OutcomeController.getReviewQueue);

export default router;
