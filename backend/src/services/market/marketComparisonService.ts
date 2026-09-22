import { MarketPrice } from '../../models/MarketPrice';
import { MarketDataNormalizer, NormalizedMarketRecord } from './marketDataNormalizer';

export interface MarketComparisonItem {
  market: string;
  district: string;
  state: string;
  modalPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  priceDifference: number | null; // difference from regional average
  unit: string;
  currency: string;
  arrivalDate: string;
  lastUpdated: Date;
}

export interface RegionalMarketComparison {
  commodity: string;
  regionalAverage: number | null;
  highestMarket: string | null;
  highestPrice: number | null;
  lowestMarket: string | null;
  lowestPrice: number | null;
  marketsCount: number;
  comparisons: MarketComparisonItem[];
}

export class MarketComparisonService {
  /**
   * Compare commodity prices across regional mandis/markets
   */
  static async compareMarkets(
    crop: string,
    options: {
      state?: string;
      district?: string;
      limit?: number;
    } = {}
  ): Promise<RegionalMarketComparison> {
    const limit = options.limit || 6;
    const filter: any = {
      crop: new RegExp(`^${crop}$`, 'i')
    };

    if (options.state) filter.state = new RegExp(`^${options.state}$`, 'i');

    try {
      const records = await MarketPrice.find(filter)
        .sort({ lastUpdated: -1, date: -1 })
        .limit(30)
        .lean();

      // Deduplicate by market name to get latest entry per mandi
      const uniqueMarketsMap = new Map<string, any>();
      for (const rec of records) {
        const key = `${rec.state}_${rec.district}_${rec.market}`.toLowerCase();
        if (!uniqueMarketsMap.has(key)) {
          uniqueMarketsMap.set(key, rec);
        }
      }

      const deduplicatedRecords = Array.from(uniqueMarketsMap.values()).slice(0, limit);

      if (deduplicatedRecords.length === 0) {
        return {
          commodity: crop,
          regionalAverage: null,
          highestMarket: null,
          highestPrice: null,
          lowestMarket: null,
          lowestPrice: null,
          marketsCount: 0,
          comparisons: []
        };
      }

      const validModalPrices = deduplicatedRecords
        .map((r: any) => r.modalPrice || r.avgPrice)
        .filter((p: any) => typeof p === 'number' && p > 0);

      const regionalAvg = validModalPrices.length > 0
        ? Number((validModalPrices.reduce((a, b) => a + b, 0) / validModalPrices.length).toFixed(2))
        : null;

      let highestMarket: string | null = null;
      let highestPrice: number | null = null;
      let lowestMarket: string | null = null;
      let lowestPrice: number | null = null;

      const comparisons: MarketComparisonItem[] = deduplicatedRecords.map((r: any) => {
        const normalized: NormalizedMarketRecord = MarketDataNormalizer.normalizeRecord(r);
        const price = normalized.modalPrice;

        if (price !== null) {
          if (highestPrice === null || price > highestPrice) {
            highestPrice = price;
            highestMarket = normalized.market;
          }
          if (lowestPrice === null || price < lowestPrice) {
            lowestPrice = price;
            lowestMarket = normalized.market;
          }
        }

        const priceDiff = (price !== null && regionalAvg !== null)
          ? Number((price - regionalAvg).toFixed(2))
          : null;

        return {
          market: normalized.market,
          district: normalized.district,
          state: normalized.state,
          modalPrice: price,
          minPrice: normalized.minPrice,
          maxPrice: normalized.maxPrice,
          priceDifference: priceDiff,
          unit: normalized.unit,
          currency: normalized.currency,
          arrivalDate: normalized.arrivalDate,
          lastUpdated: normalized.sourceTimestamp
        };
      });

      return {
        commodity: crop,
        regionalAverage: regionalAvg,
        highestMarket,
        highestPrice,
        lowestMarket,
        lowestPrice,
        marketsCount: comparisons.length,
        comparisons
      };
    } catch (err) {
      console.warn('[MarketComparisonService] Comparison error:', err);
      return {
        commodity: crop,
        regionalAverage: null,
        highestMarket: null,
        highestPrice: null,
        lowestMarket: null,
        lowestPrice: null,
        marketsCount: 0,
        comparisons: []
      };
    }
  }
}
