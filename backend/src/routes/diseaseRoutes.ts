import { Router } from 'express';
import { DiseaseController } from '../controllers/DiseaseController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Handle leaf upload (accessible to guests and registered users)
router.post('/diagnose', optionalAuthenticate, upload.single('image'), DiseaseController.diagnose);
router.get('/list', authenticate, DiseaseController.listDiseases);

export default router;
