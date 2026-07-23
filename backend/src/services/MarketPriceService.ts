import { MarketPrice } from '../models/MarketPrice';
import { MarketPriceHistory } from '../models/MarketPriceHistory';
import type { MarketQueryOptions } from '../interfaces/market';
import { buildMarketFilter, getPaginationMeta, normalizeMarketRecord } from '../utils/marketUtils';
import { marketSyncService } from './MarketSyncService';

class MarketPriceService {
  private queryCache = new Map<string, { data: any; expiresAt: number }>();
  private readonly cacheTtlMs = 5 * 60 * 1000; // 5 minutes TTL

  public clearCache(): void {
    this.queryCache.clear();
    console.info('[Market Price Service] Cache cleared.');
  }

  private getCached<T>(key: string): T | null {
    const cached = this.queryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
    if (cached) {
      this.queryCache.delete(key);
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.queryCache.set(key, {
      data,
      expiresAt: Date.now() + this.cacheTtlMs
    });
  }

  public async getPrices(query: MarketQueryOptions = {}) {
    const cacheKey = `prices:${JSON.stringify(query)}`;
    const cachedResult = this.getCached<any>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    let filter = buildMarketFilter(query);

    let fallbackSource = 'exact-match';
    let total = await MarketPrice.countDocuments(filter);
    
    // Diagnostic Fallback Engine
    if (total === 0) {
      // Level 2: latest-local (Drop date restriction, keep crop & location filters)
      if (filter.date) {
        console.info('[Market Price Service Fallback] Level 1 (exact-match) returned 0 records. Attempting Level 2 (latest-local) by dropping date constraint...');
        delete filter.date;
        total = await MarketPrice.countDocuments(filter);
        if (total > 0) {
          fallbackSource = 'latest-local';
        }
      }

      // Level 3: latest-state (Drop location filters, keep crop & state only)
      if (total === 0) {
        console.info('[Market Price Service Fallback] Level 2 (latest-local) returned 0 records. Attempting Level 3 (latest-state) by keeping crop & state only...');
        delete filter.$or;
        delete filter.district;
        delete filter.market;
        total = await MarketPrice.countDocuments(filter);
        if (total > 0) {
          fallbackSource = 'latest-state';
        }
      }

      // Level 4: latest-country (Drop state filter, keep crop only)
      if (total === 0) {
        console.info('[Market Price Service Fallback] Level 3 (latest-state) returned 0 records. Attempting Level 4 (latest-country) by keeping crop only...');
        delete filter.state;
        total = await MarketPrice.countDocuments(filter);
        fallbackSource = 'latest-country';
      }
    }

    const [prices, latestHistory] = await Promise.all([
      MarketPrice.find(filter).sort({ date: -1, lastUpdated: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      MarketPriceHistory.find(filter).sort({ date: -1 }).limit(1).lean()
    ]);

    console.info(`[Market Price Query Completed] Fallback Level: ${fallbackSource} | Filter: ${JSON.stringify(filter)} | Count: ${total}`);

    const analytics = this.buildAnalytics(prices, latestHistory[0]);
    const lastUpdated = await MarketPrice.findOne(filter).sort({ lastUpdated: -1 }).lean();

    const result = {
      prices,
      analytics,
      pagination: getPaginationMeta(page, limit, total),
      lastUpdated: lastUpdated?.lastUpdated || null,
      fallbackSource
    };

    this.setCache(cacheKey, result);
    return result;
  }

  public async getHistory(query: MarketQueryOptions = {}) {
    const cacheKey = `history:${JSON.stringify(query)}`;
    const cachedResult = this.getCached<any>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(60, Math.max(1, Number(query.limit) || 30));
    
    // Always build the filter without the date filter for historical trends
    const queryCopy = { ...query };
    delete queryCopy.date;
    const filter = buildMarketFilter(queryCopy);

    const [total, history] = await Promise.all([
      MarketPriceHistory.countDocuments(filter),
      MarketPriceHistory.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean()
    ]);

    console.info(`[Market History Query] Filter: ${JSON.stringify(filter)} | Matched count: ${total}`);

    const result = {
      history: history.map((item) => ({
        date: item.date.toISOString().split('T')[0],
        avgPrice: item.avgPrice,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        crop: item.crop,
        market: item.market,
        district: item.district,
        state: item.state
      })),
      pagination: getPaginationMeta(page, limit, total)
    };

    this.setCache(cacheKey, result);
    return result;
  }

  public async getTrending(query: MarketQueryOptions = {}) {
    const cacheKey = `trending:${JSON.stringify(query)}`;
    const cachedResult = this.getCached<any>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const filter = buildMarketFilter(query);
    const prices = await MarketPrice.aggregate([
      { $match: filter },
      { $sort: { date: -1, modalPrice: -1 } },
      {
        $group: {
          _id: '$crop',
          doc: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { modalPrice: -1 } },
      { $limit: 4 }
    ]);
    
    this.setCache(cacheKey, prices);
    return prices;
  }

  public async getNearby(query: MarketQueryOptions = {}) {
    const cacheKey = `nearby:${JSON.stringify(query)}`;
    const cachedResult = this.getCached<any>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const filter = buildMarketFilter(query);
    const prices = await MarketPrice.find(filter).sort({ lastUpdated: -1 }).limit(6).lean();
    
    this.setCache(cacheKey, prices);
    return prices;
  }

  public async getLastUpdate() {
    const latest = await MarketPrice.findOne({}).sort({ lastUpdated: -1 }).lean();
    return {
      lastUpdated: latest?.lastUpdated || null,
      source: latest?.source || null
    };
  }

  public async syncFromApi() {
    return marketSyncService.syncLatestPrices();
  }

  public async insertManualRecord(payload: Record<string, unknown>) {
    const normalized = normalizeMarketRecord(payload as any, new Date());
    const filter = {
      state: normalized.state,
      district: normalized.district,
      market: normalized.market,
      crop: normalized.crop,
      unit: normalized.unit
    };

    const result = await MarketPrice.findOneAndUpdate(
      filter,
      { $set: { ...normalized, lastUpdated: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    await MarketPriceHistory.findOneAndUpdate(
      {
        crop: normalized.crop,
        state: normalized.state,
        district: normalized.district,
        market: normalized.market,
        date: { $gte: dayStart, $lt: dayEnd }
      },
      { $setOnInsert: { ...normalized, date: today, lastUpdated: new Date() } },
      { upsert: true }
    );

    this.clearCache();
    return result;
  }

  private buildAnalytics(prices: any[], latestHistory?: any) {
    if (!prices.length) {
      return {
        todayPrice: 0,
        yesterdayPrice: 0,
        difference: 0,
        percentageChange: 0,
        highestPrice: 0,
        lowestPrice: 0,
        averagePrice: 0,
        arrivalQuantity: 0
      };
    }

    const todayPrice = prices[0]?.avgPrice || prices[0]?.modalPrice || 0;
    const yesterdayPrice = latestHistory?.avgPrice || 0;
    const difference = todayPrice - yesterdayPrice;
    const percentageChange = yesterdayPrice > 0 ? (difference / yesterdayPrice) * 100 : 0;

    const highestPrice = prices.reduce((acc, item) => Math.max(acc, item.maxPrice || 0), 0);
    const lowestPrice = prices.reduce((acc, item) => Math.min(acc, item.minPrice || Number.POSITIVE_INFINITY), Number.POSITIVE_INFINITY);
    const averagePrice = prices.reduce((acc, item) => acc + (item.avgPrice || item.modalPrice || 0), 0) / prices.length;
    const arrivalQuantity = prices.reduce((acc, item) => acc + (item.arrivalQuantity || 0), 0);

    return {
      todayPrice,
      yesterdayPrice,
      difference,
      percentageChange,
      highestPrice,
      lowestPrice,
      averagePrice,
      arrivalQuantity
    };
  }
}

export const marketPriceService = new MarketPriceService();
