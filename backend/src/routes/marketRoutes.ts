import { Router } from 'express';
import { MarketPriceController } from '../controllers/MarketPriceController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validator';

const router = Router();

router.get('/search', MarketPriceController.searchPrices);
router.get('/history', MarketPriceController.getPriceHistory);

// Admin only: add market records
router.post(
  '/update',
  authenticate,
  authorize('admin'),
  validateBody(['state', 'district', 'mandiName', 'crop', 'minPrice', 'maxPrice', 'avgPrice']),
  MarketPriceController.updateMandiPrice
);

export default router;
