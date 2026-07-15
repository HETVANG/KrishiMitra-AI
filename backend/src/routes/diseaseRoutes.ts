import { Router } from 'express';
import { DiseaseController } from '../controllers/DiseaseController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Handle leaf upload
router.post('/diagnose', authenticate, upload.single('image'), DiseaseController.diagnose);
router.get('/list', authenticate, DiseaseController.listDiseases);

export default router;
