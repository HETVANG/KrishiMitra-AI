import { MarketPrice } from '../../models/MarketPrice';
import { MarketDataNormalizer, NormalizedMarketRecord } from './marketDataNormalizer';
import { escapeRegex } from '../../utils/marketUtils';
import {
  normalizeState,
  getNeighboringStates,
  buildDistrictRegex,
  calculateFreshness,
  getCanonicalStateForDistrict
} from '../../utils/geoNormalization';

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
  scope: 'district' | 'state' | 'neighboring' | 'national';
  freshness: {
    daysOld: number;
    status: 'live' | 'recent' | 'moderate' | 'stale';
    label: string;
    formattedDate: string;
  };
}

export interface RegionalMarketComparison {
  commodity: string;
  regionalAverage: number | null;
  highestMarket: string | null;
  highestPrice: number | null;
  lowestMarket: string | null;
  lowestPrice: number | null;
  marketsCount: number;
  scope: 'district' | 'state' | 'neighboring' | 'national';
  resolvedLocation: {
    state?: string;
    district?: string;
  };
  isNationalFallback: boolean;
  comparisons: MarketComparisonItem[];
}

export interface CompareMarketsOptions {
  state?: string;
  district?: string;
  limit?: number;
  lat?: number;
  lon?: number;
  allowNationalFallback?: boolean;
  allowNeighboringFallback?: boolean;
}

export class MarketComparisonService {
  /**
   * Compare commodity prices across regional mandis/markets with strict location tiering
   */
  static async compareMarkets(
    crop: string,
    options: CompareMarketsOptions = {}
  ): Promise<RegionalMarketComparison> {
    const limit = options.limit || 8;
    const requestedCrop = (crop || 'Wheat').trim();
    
    // Resolve commodity API name if commodity catalog exists
    let apiCropName = requestedCrop;
    try {
      const { resolveCropToApiName } = require('../../config/commodities');
      apiCropName = resolveCropToApiName(requestedCrop);
    } catch {}

    const safeCrop = escapeRegex(apiCropName);
    const cropFilter = {
      crop: new RegExp(`^${safeCrop}$`, 'i')
    };

    let canonicalState = normalizeState(options.state);
    if (options.district) {
      const inferred = getCanonicalStateForDistrict(options.district);
      if (inferred) {
        if (!canonicalState || (canonicalState !== inferred && !options.state?.toLowerCase().includes(inferred.toLowerCase()))) {
          canonicalState = inferred;
        }
      }
    }
    const districtRegex = buildDistrictRegex(options.district);

    try {
      let candidateRecords: Array<{ record: any; scope: 'district' | 'state' | 'neighboring' | 'national' }> = [];
      let activeScope: 'district' | 'state' | 'neighboring' | 'national' = 'state';
      let isNationalFallback = false;

      if (canonicalState) {
        // TIER 1: Exact District Mandis in same state
        if (districtRegex) {
          const districtFilter = {
            ...cropFilter,
            state: new RegExp(`^${escapeRegex(canonicalState)}$`, 'i'),
            $or: [
              { district: districtRegex },
              { market: districtRegex },
              { mandiName: districtRegex }
            ]
          };

          const districtDocs = await MarketPrice.find(districtFilter)
            .sort({ date: -1, lastUpdated: -1 })
            .limit(30)
            .lean();

          for (const d of districtDocs) {
            candidateRecords.push({ record: d, scope: 'district' });
          }
        }

        // TIER 2: Same State Mandis (Nearby in State)
        const stateFilter = {
          ...cropFilter,
          state: new RegExp(`^${escapeRegex(canonicalState)}$`, 'i')
        };

        const stateDocs = await MarketPrice.find(stateFilter)
          .sort({ date: -1, lastUpdated: -1 })
          .limit(50)
          .lean();

        for (const s of stateDocs) {
          // If already added under district, skip
          candidateRecords.push({ record: s, scope: 'state' });
        }

        activeScope = candidateRecords.length > 0 ? (candidateRecords.some(c => c.scope === 'district') ? 'district' : 'state') : 'state';

        // TIER 3: Neighboring States (Only if Tier 1 + 2 are completely empty AND allowed)
        if (candidateRecords.length === 0 && options.allowNeighboringFallback) {
          const neighbors = getNeighboringStates(canonicalState);
          if (neighbors.length > 0) {
            const neighborFilter = {
              ...cropFilter,
              state: { $in: neighbors.map(n => new RegExp(`^${escapeRegex(n)}$`, 'i')) }
            };

            const neighborDocs = await MarketPrice.find(neighborFilter)
              .sort({ date: -1, lastUpdated: -1 })
              .limit(30)
              .lean();

            for (const n of neighborDocs) {
              candidateRecords.push({ record: n, scope: 'neighboring' });
            }
            if (candidateRecords.length > 0) {
              activeScope = 'neighboring';
            }
          }
        }

        // TIER 4: National Fallback (STRICT: Only if explicitly permitted by user!)
        if (candidateRecords.length === 0 && options.allowNationalFallback) {
          const nationalDocs = await MarketPrice.find(cropFilter)
            .sort({ date: -1, lastUpdated: -1 })
            .limit(30)
            .lean();

          for (const nat of nationalDocs) {
            candidateRecords.push({ record: nat, scope: 'national' });
          }
          if (candidateRecords.length > 0) {
            activeScope = 'national';
            isNationalFallback = true;
          }
        }
      } else {
        // No state provided: Check if farmer explicitly requested national comparison
        if (options.allowNationalFallback) {
          const nationalDocs = await MarketPrice.find(cropFilter)
            .sort({ date: -1, lastUpdated: -1 })
            .limit(40)
            .lean();

          for (const nat of nationalDocs) {
            candidateRecords.push({ record: nat, scope: 'national' });
          }
          activeScope = 'national';
          isNationalFallback = true;
        } else {
          // Empty state without explicit national fallback must NOT silently become a national search
          candidateRecords = [];
          activeScope = 'state';
          isNationalFallback = false;
        }
      }

      // Deduplicate by market name to ensure one latest entry per mandi
      const uniqueMarketsMap = new Map<string, { record: any; scope: 'district' | 'state' | 'neighboring' | 'national' }>();
      for (const item of candidateRecords) {
        const key = `${item.record.state}_${item.record.district}_${item.record.market}`.toLowerCase();
        if (!uniqueMarketsMap.has(key)) {
          uniqueMarketsMap.set(key, item);
        }
      }

      const deduplicated = Array.from(uniqueMarketsMap.values()).slice(0, limit);

      if (deduplicated.length === 0) {
        return {
          commodity: requestedCrop,
          regionalAverage: null,
          highestMarket: null,
          highestPrice: null,
          lowestMarket: null,
          lowestPrice: null,
          marketsCount: 0,
          scope: activeScope,
          resolvedLocation: {
            state: canonicalState || undefined,
            district: options.district || undefined
          },
          isNationalFallback,
          comparisons: []
        };
      }

      const validModalPrices = deduplicated
        .map(({ record }) => record.modalPrice || record.avgPrice)
        .filter((p: any) => typeof p === 'number' && p > 0);

      const regionalAvg = validModalPrices.length > 0
        ? Number((validModalPrices.reduce((a, b) => a + b, 0) / validModalPrices.length).toFixed(2))
        : null;

      let highestMarket: string | null = null;
      let highestPrice: number | null = null;
      let lowestMarket: string | null = null;
      let lowestPrice: number | null = null;

      const comparisons: MarketComparisonItem[] = deduplicated.map(({ record, scope }) => {
        const normalized: NormalizedMarketRecord = MarketDataNormalizer.normalizeRecord(record);
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

        const freshness = calculateFreshness(record.date || record.arrivalDate || record.lastUpdated);

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
          arrivalDate: freshness.formattedDate,
          lastUpdated: normalized.sourceTimestamp,
          scope,
          freshness
        };
      });

      return {
        commodity: requestedCrop,
        regionalAverage: regionalAvg,
        highestMarket,
        highestPrice,
        lowestMarket,
        lowestPrice,
        marketsCount: comparisons.length,
        scope: activeScope,
        resolvedLocation: {
          state: canonicalState || undefined,
          district: options.district || undefined
        },
        isNationalFallback,
        comparisons
      };
    } catch (err) {
      console.warn('[MarketComparisonService] Comparison error:', err);
      return {
        commodity: requestedCrop,
        regionalAverage: null,
        highestMarket: null,
        highestPrice: null,
        lowestMarket: null,
        lowestPrice: null,
        marketsCount: 0,
        scope: 'state',
        resolvedLocation: {
          state: canonicalState || undefined,
          district: options.district || undefined
        },
        isNationalFallback: false,
        comparisons: []
      };
    }
  }
}
