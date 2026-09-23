import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { RegionController } from '../controllers/RegionController';

const router = Router();

// Public region info
router.get('/countries', RegionController.getCountries);
router.get('/countries/:countryCode', RegionController.getCountryByCode);

// Protected user regional context
router.get('/context', authenticate, RegionController.getContext);
router.put('/context', authenticate, RegionController.updateContext);

export default router;
