import { Router } from 'express';
import { PartnerController } from '../controllers/PartnerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', PartnerController.getPartners);
router.post('/', PartnerController.createPartner);

export default router;
