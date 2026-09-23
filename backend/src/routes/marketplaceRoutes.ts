import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { MarketplaceController } from '../controllers/MarketplaceController';

const router = Router();

// Public / Authenticated Marketplace Endpoints
router.get('/categories', MarketplaceController.getCategories);
router.get('/listings', MarketplaceController.searchListings);
router.get('/listings/:id', MarketplaceController.getListingById);

// Protected Farmer Marketplace Actions
router.get('/recommended', authenticate, MarketplaceController.getRecommendations);
router.post('/inquiries', authenticate, MarketplaceController.createInquiry);
router.get('/inquiries', authenticate, MarketplaceController.getUserInquiries);
router.post('/favorites', authenticate, MarketplaceController.toggleFavorite);
router.get('/favorites', authenticate, MarketplaceController.getUserFavorites);
router.post('/reviews', authenticate, MarketplaceController.createReview);

export default router;
