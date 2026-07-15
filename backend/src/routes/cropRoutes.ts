import { Router } from 'express';
import { CropController } from '../controllers/CropController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { requirePremium } from '../middleware/subscription';

const router = Router();

// Advanced crop recommendations and soil chemical evaluation require Premium plans
router.post(
  '/recommend',
  authenticate,
  requirePremium,
  validateBody(['state', 'district', 'soilType', 'season', 'waterAvailability', 'budget', 'farmSize']),
  CropController.recommendCrops
);

router.post(
  '/soil-analysis',
  authenticate,
  requirePremium,
  validateBody(['pH', 'N', 'P', 'K', 'organicCarbon']),
  CropController.analyzeSoil
);

// Farm profile mapping (Free)
router.get('/farm', authenticate, CropController.getFarmProfile);
router.post('/farm', authenticate, validateBody(['name', 'size', 'soilType', 'waterSource']), CropController.upsertFarmProfile);

// Public lookup lists
router.get('/list', CropController.listCrops);

export default router;
