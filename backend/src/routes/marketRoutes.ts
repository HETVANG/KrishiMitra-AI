import { Router } from 'express';
import { MarketPriceController } from '../controllers/MarketPriceController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validator';

const router = Router();

router.get('/prices', MarketPriceController.getPrices);
router.get('/search', MarketPriceController.searchPrices);
router.get('/history', MarketPriceController.getPriceHistory);
router.get('/trending', MarketPriceController.getTrending);
router.get('/nearby', MarketPriceController.getNearby);
router.get('/last-update', MarketPriceController.getLastUpdate);
router.get('/commodities', MarketPriceController.getCommodities);
router.get('/sync-stats', MarketPriceController.getSyncStats);

router.post(
  '/sync',
  authenticate,
  authorize('admin'),
  MarketPriceController.syncPrices
);

router.post(
  '/update',
  authenticate,
  authorize('admin'),
  validateBody(['state', 'district', 'crop', 'minPrice', 'maxPrice', 'avgPrice']),
  MarketPriceController.updateMandiPrice
);

export default router;
