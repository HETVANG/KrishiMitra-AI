import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { OrganizationController } from '../controllers/OrganizationController';

const router = Router();

// Protected Organization Endpoints
router.get('/', authenticate, OrganizationController.getUserOrganizations);
router.post('/', authenticate, OrganizationController.createOrganization);
router.get('/:id/farms', authenticate, OrganizationController.getOrganizationFarms);
router.post('/:id/farms', authenticate, OrganizationController.addFarmToOrganization);

export default router;
