import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/download', authenticate, ReportController.downloadReport);

export default router;
