import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { MultiFarmController } from '../controllers/MultiFarmController';

const router = Router();

// Protected Multi-Farm Endpoints
router.get('/farms', authenticate, MultiFarmController.getUserFarms);
router.get('/farms/compare', authenticate, MultiFarmController.compareFarms);
router.get('/farms/:id', authenticate, MultiFarmController.getFarmById);
router.post('/farms', authenticate, MultiFarmController.createFarm);
router.put('/farms/:id', authenticate, MultiFarmController.updateFarm);
router.post('/farms/:id/archive', authenticate, MultiFarmController.archiveFarm);

// Farm Membership & Team Endpoints
router.get('/farms/:id/members', authenticate, MultiFarmController.getFarmMembers);
router.post('/farms/:id/members/invite', authenticate, MultiFarmController.inviteMember);
router.delete('/farms/:id/members/:memberId', authenticate, MultiFarmController.removeMember);

export default router;
