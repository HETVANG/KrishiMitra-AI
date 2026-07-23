import axios from 'axios';
import { MarketPrice } from '../models/MarketPrice';
import { MarketPriceHistory } from '../models/MarketPriceHistory';
import type { MarketApiRecord, MarketSyncResult } from '../interfaces/market';
import { getStartOfDay, normalizeMarketRecord } from '../utils/marketUtils';
import cron from 'node-cron';
import { SUPPORTED_COMMODITIES } from '../config/commodities';

class MarketSyncService {
  private cache: { records: any[]; expiresAt: number } | null = null;
  private readonly cacheTtlMs = 5 * 60 * 1000;
  private readonly timeoutMs = 10_000;
  private readonly maxRetries = 3;

  public getCachedPrices() {
    if (!this.cache || this.cache.expiresAt <= Date.now()) {
      return [];
    }
    return this.cache.records;
  }

  public async scheduleDailySync() {
    cron.schedule('0 6 * * *', async () => {
      await this.syncLatestPrices();
    }, {
      timezone: 'Asia/Kolkata'
    });

    console.info('[Market Sync] Daily scheduler initialized for 6:00 AM IST');
  }

  public async syncLatestPrices(): Promise<MarketSyncResult> {
    const warnings: string[] = [];
    const apiKey = process.env.MANDI_API_KEY;
    let apiUrl = process.env.MANDI_API_URL;

    console.info('[Market Sync] Sync started');

    if (!apiKey || !apiUrl) {
      warnings.push('MANDI API credentials are not configured.');
      await this.seedFallbackIfEmpty(warnings);
      return {
        success: false,
        message: 'MANDI API credentials are not configured. Loaded fallback seed data.',
        recordsInserted: 0,
        recordsUpdated: 0,
        warnings
      };
    }

    // Normalize human-facing page URL to data.gov.in API resource endpoint
    if (apiUrl.includes('www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity')) {
      apiUrl = 'https://api.data.gov.in/resource/9ef842f8-8580-4c7b-bc95-a912e774d9d3';
      console.info(`[Market Sync] Normalizing human web page URL to official API endpoint: ${apiUrl}`);
    }

    try {
      const startTime = Date.now();
      let successfulImports = 0;
      let failedImports = 0;
      const recordsPerCommodity: Record<string, number> = {};
      let totalImported = 0;
      let records: any[] = [];

      for (const crop of SUPPORTED_COMMODITIES) {
        const cropUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}filters[Commodity]=${encodeURIComponent(crop)}`;
        try {
          console.info(`[Market Sync] Querying live daily rates for commodity: "${crop}"`);
          let response = await this.fetchWithRetry(cropUrl, apiKey);
          let payload = response.data;
          let cropRecords = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.records)
              ? payload.records
              : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.prices)
                  ? payload.prices
                  : [];

          // Fallback: If official resource is empty, query the active Agmarknet endpoint
          if (!cropRecords.length && apiUrl.includes('9ef842f8-8580-4c7b-bc95-a912e774d9d3')) {
            const altUrl = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?filters[Commodity]=${encodeURIComponent(crop)}`;
            console.warn(`[Market Sync] Official dataset returned 0 records for "${crop}". Retrying with active Agmarknet dataset: ${altUrl}`);
            warnings.push(`Official daily dataset was empty for "${crop}"; fell back to alternative Agmarknet resource.`);
            
            response = await this.fetchWithRetry(altUrl, apiKey);
            payload = response.data;
            cropRecords = Array.isArray(payload?.records) ? payload.records : [];
          }

          if (cropRecords.length > 0) {
            records.push(...cropRecords);
            successfulImports++;
            recordsPerCommodity[crop] = cropRecords.length;
            totalImported += cropRecords.length;
          } else {
            recordsPerCommodity[crop] = 0;
          }
        } catch (err: any) {
          failedImports++;
          recordsPerCommodity[crop] = 0;
          console.warn(`[Market Sync] Failed to fetch rates for crop "${crop}": ${err.message}`);
          warnings.push(`Failed to fetch crop "${crop}": ${err.message}`);
        }
        // Stagger queries to prevent OGD Gateway rate-limit blocking (HTTP 429)
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const executionTimeMs = Date.now() - startTime;
      console.info(`
--- 📊 MANDI PRICE SYNC SUMMARY ---
Total Commodities Processed: ${SUPPORTED_COMMODITIES.length}
Successful Crop Imports:      ${successfulImports}
Failed Crop Imports:          ${failedImports}
Total Records Imported:       ${totalImported}
Execution Time:               ${(executionTimeMs / 1000).toFixed(2)} seconds
Imports Per Commodity:
${Object.entries(recordsPerCommodity).map(([k, v]) => `  - ${k}: ${v} records`).join('\n')}
----------------------------------
      `);

      if (!records.length) {
        warnings.push('Mandi API returned an empty payload for all target commodities.');
        await this.seedFallbackIfEmpty(warnings);
        return {
          success: false,
          message: 'Mandi API returned an empty payload for all target commodities. Loaded fallback seed data.',
          recordsInserted: 0,
          recordsUpdated: 0,
          warnings
        };
      }

      const priceBulkOps: any[] = [];
      const historyBulkOps: any[] = [];
      const normalizedRecords: any[] = [];

      for (const item of records) {
        if (!item || typeof item !== 'object') {
          continue;
        }

        const normalized = normalizeMarketRecord(item, new Date());
        if (!normalized.crop || !normalized.state || !normalized.district || !normalized.market) {
          continue;
        }

        const filter = {
          state: normalized.state,
          district: normalized.district,
          market: normalized.market,
          crop: normalized.crop,
          unit: normalized.unit
        };

        priceBulkOps.push({
          updateOne: {
            filter,
            update: { $set: { ...normalized, lastUpdated: new Date() } },
            upsert: true
          }
        });

        const dayStart = getStartOfDay(normalized.date);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        historyBulkOps.push({
          updateOne: {
            filter: {
              crop: normalized.crop,
              state: normalized.state,
              district: normalized.district,
              market: normalized.market,
              date: { $gte: dayStart, $lt: dayEnd }
            },
            update: { $setOnInsert: { ...normalized, date: normalized.date, lastUpdated: new Date() } },
            upsert: true
          }
        });

        normalizedRecords.push(normalized);
      }

      let recordsInserted = 0;
      let recordsUpdated = 0;

      if (priceBulkOps.length > 0) {
        const priceResult = await MarketPrice.bulkWrite(priceBulkOps);
        recordsInserted = priceResult.upsertedCount || 0;
        recordsUpdated = priceResult.modifiedCount || 0;
      }

      if (historyBulkOps.length > 0) {
        await MarketPriceHistory.bulkWrite(historyBulkOps);
      }

      const lastUpdated = new Date();
      this.cache = { records: normalizedRecords, expiresAt: Date.now() + this.cacheTtlMs };

      // Dynamically clear the read query cache to reflect synchronized prices immediately
      try {
        const { marketPriceService } = require('./MarketPriceService');
        marketPriceService.clearCache();
      } catch (cacheErr) {
        console.warn('[Market Sync] Failed to clear query cache:', cacheErr);
      }

      console.info(`[Market Sync] Sync completed. Inserted: ${recordsInserted}, Updated: ${recordsUpdated}`);
      return {
        success: true,
        message: 'Mandi prices synced successfully.',
        recordsInserted,
        recordsUpdated,
        lastUpdated,
        warnings
      };
    } catch (error) {
      const message = this.describeError(error);
      console.error(`[Market Sync] Sync failed: ${message}`);
      warnings.push(message);
      await this.seedFallbackIfEmpty(warnings);
      return {
        success: false,
        message: `Mandi API sync failed: ${message}. Active database fallback seeded.`,
        recordsInserted: 0,
        recordsUpdated: 0,
        warnings
      };
    }
  }

  private async seedFallbackIfEmpty(warnings: string[]): Promise<void> {
    try {
      const count = await MarketPrice.countDocuments({});
      if (count === 0) {
        console.info('[Market Sync] Database is empty and API failed. Seeding fallback seed data...');
        const { mockDatabase } = require('../utils/dbFallback');
        
        const seedOps = mockDatabase.marketPrices.map((m: any) => {
          const normalized = normalizeMarketRecord(m, new Date());
          return {
            updateOne: {
              filter: {
                state: normalized.state,
                district: normalized.district,
                market: normalized.market,
                crop: normalized.crop,
                unit: normalized.unit
              },
              update: { $set: normalized },
              upsert: true
            }
          };
        });

        const historyOps = mockDatabase.marketPrices.map((m: any) => {
          const normalized = normalizeMarketRecord(m, new Date());
          const dayStart = getStartOfDay(normalized.date);
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          return {
            updateOne: {
              filter: {
                crop: normalized.crop,
                state: normalized.state,
                district: normalized.district,
                market: normalized.market,
                date: { $gte: dayStart, $lt: dayEnd }
              },
              update: { $setOnInsert: { ...normalized, date: normalized.date, lastUpdated: new Date() } },
              upsert: true
            }
          };
        });

        await Promise.all([
          MarketPrice.bulkWrite(seedOps),
          MarketPriceHistory.bulkWrite(historyOps)
        ]);

        console.info('[Market Sync] Fallback seed data populated successfully.');
        warnings.push('Seeded database with fallback Mandi prices.');
      }
    } catch (err: any) {
      console.error('[Market Sync] Failed to seed fallback data:', err.message);
      warnings.push(`Seeding fallback failed: ${err.message}`);
    }
  }

  private async fetchWithRetry(apiUrl: string, apiKey: string) {
    let lastError: unknown;

    let targetUrl = apiUrl;
    if (apiUrl.includes('api.data.gov.in')) {
      const separator = apiUrl.includes('?') ? '&' : '?';
      targetUrl = `${apiUrl}${separator}api-key=${apiKey}&format=json&limit=150`;
    }

    console.info(`[Market Sync] Requesting URL: ${targetUrl.replace(apiKey, 'REDACTED')}`);

    for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
      try {
        const res = await axios.get(targetUrl, {
          headers: {
            'x-api-key': apiKey,
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json'
          },
          timeout: this.timeoutMs,
          validateStatus: (status) => status >= 200 && status < 300
        });

        // Log the raw response keys and counts safely (without keys)
        const payload = res.data;
        const records = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.records)
            ? payload.records
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.prices)
                ? payload.prices
                : [];
        
        console.log('[Market Sync Raw API Response Logs] SUCCESS.');
        console.log('[Market Sync Raw API Response Keys]', Object.keys(payload || {}));
        console.log('[Market Sync Raw API Records Count]', records.length);
        if (records.length > 0) {
          console.log('[Market Sync Raw API Record Sample]', JSON.stringify(records[0]));
        }

        return res;
      } catch (error) {
        lastError = error;
        if (this.isRetryable(error) && attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  private isRetryable(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      return status === 429 || status === 500 || status === 502 || status === 503 || status === 504 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    }
    return true;
  }

  private describeError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) return 'Invalid mandi API key.';
      if (status === 429) return 'Mandi API rate limit exceeded.';
      if (status === 404) return 'Mandi API endpoint not found.';
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return 'Mandi API request timed out.';
      if (error.response?.data) return `Mandi API request failed: ${JSON.stringify(error.response.data)}`;
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown mandi API error.';
  }
}

export const marketSyncService = new MarketSyncService();
