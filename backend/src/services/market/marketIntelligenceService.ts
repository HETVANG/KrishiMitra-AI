import { marketPriceService } from '../MarketPriceService';
import { MarketDataNormalizer, NormalizedMarketRecord } from './marketDataNormalizer';
import { MarketTrendService, TrendAnalysisResult } from './marketTrendService';
import { MarketComparisonService, RegionalMarketComparison } from './marketComparisonService';
import { MarketAnalysisService } from './marketAnalysisService';
import { MarketWatchlist } from '../../models/MarketWatchlist';
import { CopilotContextService } from '../CopilotContextService';

export interface MarketIntelligencePayload {
  commodity: string;
  currentPrice: {
    modalPrice: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    unit: string;
    currency: string;
    arrivalDate: string;
    source: string;
    sourceTimestamp: Date;
    isTrulyZero: boolean;
  };
  trend7d: TrendAnalysisResult;
  trend30d: TrendAnalysisResult;
  regionalComparison: RegionalMarketComparison;
  advisory: {
    summary: string;
    keyInsights: string[];
    sellingConsiderations: string[];
    disclaimer: string;
  };
  isWatchlisted?: boolean;
}

export class MarketIntelligenceService {
  /**
   * Unified Market Intelligence Engine Pipeline
   */
  static async getCommodityIntelligence(
    commodity: string,
    options: {
      userId?: string;
      state?: string;
      district?: string;
      market?: string;
      language?: string;
    } = {}
  ): Promise<MarketIntelligencePayload> {
    const lang = options.language || 'en';

    // 1. Fetch live market prices
    const pricesResult = await marketPriceService.getPrices({
      crop: commodity,
      state: options.state,
      district: options.district,
      market: options.market,
      limit: 10
    });

    const primaryRecord = pricesResult.prices?.[0]
      ? MarketDataNormalizer.normalizeRecord(pricesResult.prices[0])
      : {
          commodity,
          market: options.market || 'Regional Mandi',
          district: options.district || 'District',
          state: options.state || 'State',
          country: 'India',
          minPrice: null,
          maxPrice: null,
          modalPrice: null,
          avgPrice: null,
          unit: 'Qtl',
          currency: 'INR',
          arrivalDate: new Date().toISOString().split('T')[0],
          source: 'agmarknet-official',
          sourceTimestamp: new Date(),
          isTrulyZero: false
        };

    // 2. Trend & Volatility Analysis over 7D and 30D
    const [trend7d, trend30d] = await Promise.all([
      MarketTrendService.analyzeTrend(commodity, {
        state: options.state,
        district: options.district,
        market: options.market,
        periodDays: 7
      }),
      MarketTrendService.analyzeTrend(commodity, {
        state: options.state,
        district: options.district,
        market: options.market,
        periodDays: 30
      })
    ]);

    // 3. Regional Nearby Market Comparisons
    const regionalComparison = await MarketComparisonService.compareMarkets(commodity, {
      state: options.state,
      district: options.district,
      limit: 6
    });

    // 4. Factual AI / Agronomic Explanation
    const advisory = await MarketAnalysisService.generateMarketAdvisory(
      commodity,
      trend7d,
      regionalComparison,
      lang
    );

    // 5. Watchlist status check
    let isWatchlisted = false;
    if (options.userId) {
      try {
        const item = await MarketWatchlist.findOne({
          user: options.userId,
          crop: new RegExp(`^${commodity}$`, 'i')
        }).lean();
        if (item) isWatchlisted = true;
      } catch (wErr) {
        console.warn('[MarketIntelligenceService] Watchlist check error:', wErr);
      }
    }

    return {
      commodity,
      currentPrice: {
        modalPrice: primaryRecord.modalPrice,
        minPrice: primaryRecord.minPrice,
        maxPrice: primaryRecord.maxPrice,
        unit: primaryRecord.unit,
        currency: primaryRecord.currency,
        arrivalDate: primaryRecord.arrivalDate,
        source: primaryRecord.source,
        sourceTimestamp: primaryRecord.sourceTimestamp,
        isTrulyZero: primaryRecord.isTrulyZero
      },
      trend7d,
      trend30d,
      regionalComparison,
      advisory,
      isWatchlisted
    };
  }

  /**
   * Watchlist Operations: Add to watchlist
   */
  static async addToWatchlist(
    userId: string,
    payload: { crop: string; commodity?: string; state?: string; district?: string; market?: string }
  ) {
    const doc = await MarketWatchlist.findOneAndUpdate(
      {
        user: userId,
        crop: payload.crop
      },
      {
        user: userId,
        crop: payload.crop,
        commodity: payload.commodity || payload.crop,
        state: payload.state,
        district: payload.district,
        market: payload.market
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return doc;
  }

  /**
   * Watchlist Operations: Remove from watchlist
   */
  static async removeFromWatchlist(userId: string, crop: string) {
    return MarketWatchlist.findOneAndDelete({
      user: userId,
      crop: new RegExp(`^${crop}$`, 'i')
    });
  }

  /**
   * Fetch User Watchlist with current live price intelligence
   */
  static async getUserWatchlist(userId: string) {
    const list = await MarketWatchlist.find({ user: userId }).sort({ createdAt: -1 }).lean();
    
    const enrichedList = await Promise.all(
      list.map(async (item: any) => {
        const intel = await this.getCommodityIntelligence(item.crop, {
          userId,
          state: item.state,
          district: item.district,
          market: item.market
        });
        return {
          id: item._id,
          crop: item.crop,
          state: item.state,
          market: item.market,
          currentPrice: intel.currentPrice.modalPrice,
          unit: intel.currentPrice.unit,
          currency: intel.currentPrice.currency,
          trend: intel.trend7d.trend,
          percentageChange: intel.trend7d.percentageChange,
          sourceTimestamp: intel.currentPrice.sourceTimestamp
        };
      })
    );

    return enrichedList;
  }
}
