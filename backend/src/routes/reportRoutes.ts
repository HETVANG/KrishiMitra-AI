import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Existing download route kept for full backward compatibility
router.get('/download', authenticate, ReportController.downloadReport);

// Dynamic Report Generation & Storage
router.post('/generate', authenticate, ReportController.generateReport);

// Farmer's own report history
router.get('/my-reports', authenticate, ReportController.getMyReports);

// Admin Analytics & Report Management
router.get('/admin/analytics', authenticate, authorize('admin'), ReportController.getAdminAnalytics);
router.get('/admin/all', authenticate, authorize('admin'), ReportController.getAdminReportsList);

// Local Storage serving fallback
router.get('/storage/:filename', authenticate, ReportController.serveLocalStorageFile);

// Individual Report actions
router.get('/:id', authenticate, ReportController.getReportById);
router.get('/:id/download', authenticate, ReportController.downloadReportById);
router.get('/:id/preview', authenticate, ReportController.previewReportById);
router.delete('/:id', authenticate, ReportController.deleteReport);

export default router;
