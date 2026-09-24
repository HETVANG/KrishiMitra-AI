import { Router } from 'express';
import { GrowthController } from '../controllers/GrowthController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public Acquisition Endpoints
router.post('/referrals/attribute', GrowthController.attributeSignup);
router.get('/invitations/verify/:token', GrowthController.verifyInviteToken);
router.get('/share/:publicId', GrowthController.getPublicShare);
router.post('/campaigns/track', GrowthController.trackCampaign);

// Authenticated Farmer Referral & Sharing Endpoints
router.get('/referrals/me', authenticate, GrowthController.getMyReferralStats);
router.post('/referrals/code', authenticate, GrowthController.getReferralCode);
router.post('/invitations', authenticate, GrowthController.createInvite);
router.post('/invitations/accept', authenticate, GrowthController.acceptInvite);
router.post('/share', authenticate, GrowthController.createShare);

// Admin Growth Analytics Endpoint
router.get('/admin/analytics', authenticate, authorize('admin'), GrowthController.getAdminGrowthAnalytics);

export default router;
