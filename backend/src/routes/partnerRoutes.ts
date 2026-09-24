import { Router } from 'express';
import { PartnerController } from '../controllers/PartnerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public / Authenticated Discovery
router.get('/discover', PartnerController.discoverPartners);

// Authenticated Partner Endpoints
router.post('/apply', authenticate, PartnerController.applyPartner);
router.get('/me', authenticate, PartnerController.getMyPartnerProfile);
router.post('/referrals/track', PartnerController.trackReferral);
router.post('/copilot/query', authenticate, PartnerController.queryCopilot);

// Partner Workspace Endpoints
router.get('/:id', authenticate, PartnerController.getPartnerById);
router.get('/:id/programs', authenticate, PartnerController.getPrograms);
router.post('/:id/programs', authenticate, PartnerController.createProgram);
router.get('/:id/analytics', authenticate, PartnerController.getPartnerAnalytics);

// Admin-only Partner Management Endpoints
router.get('/', authenticate, authorize('admin'), PartnerController.getPartners);
router.post('/:id/verify', authenticate, authorize('admin'), PartnerController.verifyPartner);

export default router;
