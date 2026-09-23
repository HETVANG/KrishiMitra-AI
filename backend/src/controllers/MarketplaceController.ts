import { Request, Response } from 'express';
import { MarketplaceCategoryService } from '../services/marketplace/marketplaceCategoryService';
import { MarketplaceSearchService } from '../services/marketplace/marketplaceSearchService';
import { MarketplaceRecommendationService } from '../services/marketplace/marketplaceRecommendationService';
import { MarketplaceService } from '../services/marketplace/marketplaceService';
import { FarmKnowledgeGraphService } from '../services/knowledgeGraph/farmKnowledgeGraphService';

export class MarketplaceController {
  /**
   * GET /api/marketplace/categories
   * Fetch active marketplace categories
   */
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const group = req.query.group as string;
      const countryCode = (req.query.countryCode as string) || 'IN';
      const categories = await MarketplaceCategoryService.getCategories(group, countryCode);

      res.json({
        success: true,
        data: categories
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/marketplace/listings
   * Search and filter marketplace listings
   */
  static async searchListings(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        listingType,
        district,
        state,
        countryCode,
        crop,
        query,
        minPrice,
        maxPrice,
        page,
        limit
      } = req.query;

      const results = await MarketplaceSearchService.searchListings({
        category: category as string,
        listingType: listingType as string,
        district: district as string,
        state: state as string,
        countryCode: countryCode as string,
        crop: crop as string,
        query: query as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });

      res.json({
        success: true,
        data: results.listings,
        pagination: results.pagination,
        hasResults: results.hasResults,
        emptyStateMessage: results.emptyStateMessage
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/marketplace/listings/:id
   * Get single listing details
   */
  static async getListingById(req: Request, res: Response): Promise<void> {
    try {
      const listingId = req.params.id;
      const result = await MarketplaceService.getListingById(listingId);

      res.json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/marketplace/recommended
   * Get context-aware marketplace category and service recommendations for farm
   */
  static async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.query.farmId as string;

      const graph = await FarmKnowledgeGraphService.getFarmGraph(userId, farmId);
      const recommendations = await MarketplaceRecommendationService.getFarmRecommendations(graph);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/marketplace/inquiries
   * Submit farmer inquiry to provider
   */
  static async createInquiry(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { farmId, listingId, message, subject } = req.body;

      if (!listingId || !message) {
        res.status(400).json({ success: false, error: 'listingId and message are required fields.' });
        return;
      }

      const inquiry = await MarketplaceService.createInquiry(userId, farmId, listingId, message, subject);

      res.status(201).json({
        success: true,
        data: inquiry
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/marketplace/inquiries
   * Fetch user's submitted inquiries
   */
  static async getUserInquiries(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const inquiries = await MarketplaceService.getUserInquiries(userId);

      res.json({
        success: true,
        data: inquiries
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/marketplace/favorites
   * Toggle favorite / saved listing
   */
  static async toggleFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { farmId, listingId } = req.body;

      if (!listingId) {
        res.status(400).json({ success: false, error: 'listingId is required.' });
        return;
      }

      const resObj = await MarketplaceService.toggleFavorite(userId, farmId, listingId);

      res.json({
        success: true,
        data: resObj
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/marketplace/favorites
   * Get user's saved favorite listings
   */
  static async getUserFavorites(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const favorites = await MarketplaceService.getUserFavorites(userId);

      res.json({
        success: true,
        data: favorites
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/marketplace/reviews
   * Submit authentic review for provider
   */
  static async createReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { providerId, listingId, rating, comment } = req.body;

      if (!providerId || !rating || !comment) {
        res.status(400).json({ success: false, error: 'providerId, rating, and comment are required.' });
        return;
      }

      const review = await MarketplaceService.createReview(userId, providerId, listingId, rating, comment);

      res.status(201).json({
        success: true,
        data: review
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
