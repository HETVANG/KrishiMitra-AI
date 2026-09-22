import { Router } from 'express';
import { DiseaseController } from '../controllers/DiseaseController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Multimodal Leaf Image Analysis (Guest & Authenticated Users)
router.post('/analyze', optionalAuthenticate, upload.single('image'), DiseaseController.analyze);

// Legacy diagnose endpoint (backwards compatibility)
router.post('/diagnose', optionalAuthenticate, upload.single('image'), DiseaseController.diagnose);

// Authenticated History & Active Concern endpoints
router.get('/history', authenticate, DiseaseController.getHistory);
router.get('/history/:id', authenticate, DiseaseController.getHistoryById);
router.post('/:id/follow-up', authenticate, DiseaseController.scheduleFollowUp);
router.get('/active/:farmId', authenticate, DiseaseController.getActiveConcerns);

// Disease dictionary list
router.get('/list', authenticate, DiseaseController.listDiseases);

export default router;
