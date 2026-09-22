import { Request, Response, NextFunction } from 'express';
import { marketPriceService } from '../services/MarketPriceService';

export class MarketPriceController {
  static async searchPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketPriceService.getPrices({
        crop: req.query.crop as string | undefined,
        state: req.query.state as string | undefined,
        district: req.query.district as string | undefined,
        market: req.query.market as string | undefined,
        date: req.query.date as string | undefined,
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20)
      });

      return res.json({
        success: true,
        prices: result.prices,
        analytics: result.analytics,
        pagination: result.pagination,
        lastUpdated: result.lastUpdated
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketPriceService.getPrices({
        crop: req.query.crop as string | undefined,
        state: req.query.state as string | undefined,
        district: req.query.district as string | undefined,
        market: req.query.market as string | undefined,
        date: req.query.date as string | undefined,
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20)
      });

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async updateMandiPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { state, district, mandiName, market, crop, minPrice, maxPrice, avgPrice, modalPrice, arrivalQuantity, unit } = req.body;
      const priceLog = await marketPriceService.insertManualRecord({
        state,
        district,
        market: market || mandiName,
        crop,
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
        avgPrice: Number(avgPrice),
        modalPrice: Number(modalPrice || avgPrice),
        arrivalQuantity: Number(arrivalQuantity || 0),
        unit: unit || 'Qtl',
        source: 'manual'
      });

      return res.status(201).json({ success: true, priceLog });
    } catch (error) {
      next(error);
    }
  }

  static async getPriceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketPriceService.getHistory({
        crop: req.query.crop as string | undefined,
        state: req.query.state as string | undefined,
        district: req.query.district as string | undefined,
        market: req.query.market as string | undefined,
        date: req.query.date as string | undefined,
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 30)
      });

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const trending = await marketPriceService.getTrending({
        crop: req.query.crop as string | undefined,
        state: req.query.state as string | undefined,
        district: req.query.district as string | undefined,
        market: req.query.market as string | undefined
      });
      return res.json({ success: true, trending });
    } catch (error) {
      next(error);
    }
  }

  static async getNearby(req: Request, res: Response, next: NextFunction) {
    try {
      const nearby = await marketPriceService.getNearby({
        crop: req.query.crop as string | undefined,
        state: req.query.state as string | undefined,
        district: req.query.district as string | undefined,
        market: req.query.market as string | undefined
      });
      return res.json({ success: true, nearby });
    } catch (error) {
      next(error);
    }
  }

  static async getLastUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketPriceService.getLastUpdate();
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async syncPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketPriceService.syncFromApi();
      const { success, ...payload } = result;
      return res.json({ success, ...payload });
    } catch (error) {
      next(error);
    }
  }

  static async getCommodities(req: Request, res: Response, next: NextFunction) {
    try {
      const { CATEGORIZED_COMMODITIES } = require('../config/commodities');
      return res.json({ success: true, commodities: CATEGORIZED_COMMODITIES });
    } catch (error) {
      next(error);
    }
  }

  static async getSyncStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await marketPriceService.getSyncStats();
      return res.json({ success: true, stats: result });
    } catch (error) {
      next(error);
    }
  }

  static async getIntelligence(req: any, res: Response, next: NextFunction) {
    try {
      const { MarketIntelligenceService } = require('../services/market/marketIntelligenceService');
      const commodity = req.params.commodity || (req.query.crop as string) || 'Wheat';
      const intel = await MarketIntelligenceService.getCommodityIntelligence(commodity, {
        userId: req.user?._id?.toString(),
        state: req.query.state as string,
        district: req.query.district as string,
        market: req.query.market as string,
        language: (req.query.lang as string) || req.user?.settings?.language || 'en'
      });
      return res.json({ success: true, intelligence: intel });
    } catch (error) {
      next(error);
    }
  }

  static async compareMarkets(req: Request, res: Response, next: NextFunction) {
    try {
      const { MarketComparisonService } = require('../services/market/marketComparisonService');
      const commodity = (req.query.crop as string) || (req.query.commodity as string) || 'Wheat';
      const result = await MarketComparisonService.compareMarkets(commodity, {
        state: req.query.state as string,
        district: req.query.district as string,
        limit: Number(req.query.limit || 6)
      });
      return res.json({ success: true, comparison: result });
    } catch (error) {
      next(error);
    }
  }

  static async getWatchlist(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const { MarketIntelligenceService } = require('../services/market/marketIntelligenceService');
      const watchlist = await MarketIntelligenceService.getUserWatchlist(req.user._id.toString());
      return res.json({ success: true, watchlist });
    } catch (error) {
      next(error);
    }
  }

  static async addToWatchlist(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const { crop, state, district, market } = req.body;
      if (!crop) {
        return res.status(400).json({ success: false, message: 'Crop parameter required' });
      }
      const { MarketIntelligenceService } = require('../services/market/marketIntelligenceService');
      const item = await MarketIntelligenceService.addToWatchlist(req.user._id.toString(), {
        crop,
        state,
        district,
        market
      });
      return res.status(201).json({ success: true, item });
    } catch (error) {
      next(error);
    }
  }

  static async removeFromWatchlist(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const crop = req.params.crop;
      const { MarketIntelligenceService } = require('../services/market/marketIntelligenceService');
      await MarketIntelligenceService.removeFromWatchlist(req.user._id.toString(), crop);
      return res.json({ success: true, message: `Removed ${crop} from watchlist` });
    } catch (error) {
      next(error);
    }
  }
}
