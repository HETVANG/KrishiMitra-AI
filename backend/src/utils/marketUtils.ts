import type { MarketApiRecord, MarketQueryOptions } from '../interfaces/market';
import { resolveApiNameToCommodity } from '../config/commodities';

const normalizeText = (value?: string): string => (typeof value === 'string' ? value.trim() : '');

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const escapeRegex = (str: string): string => {
  return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const normalizeMarketRecord = (record: any, fallbackDate: Date = new Date()) => {
  const rawCrop = normalizeText(record.crop || record.commodity || record.Commodity || record.cropName) || 'Unknown Crop';
  
  // Resolve raw crop name to our catalog commodity apiCommodity
  const matchedCommodity = resolveApiNameToCommodity(rawCrop);
  const crop = matchedCommodity ? matchedCommodity.apiCommodity : rawCrop;
  
  const variety = normalizeText(record.variety || record.Variety) || 'FAQ';
  const grade = normalizeText(record.grade || record.Grade || record.GradeName) || 'FAQ';
  const state = normalizeText(record.state || record.State) || 'Unknown State';
  const district = normalizeText(record.district || record.District) || 'Unknown District';
  const market = normalizeText(record.market || record.Market || record.mandiName || record.mandi_name) || `${district} Mandi`;

  const rawMin = record.minPrice !== undefined ? record.minPrice : (record.min_price !== undefined ? record.min_price : record.Min_Price);
  const rawMax = record.maxPrice !== undefined ? record.maxPrice : (record.max_price !== undefined ? record.max_price : record.Max_Price);
  const rawAvg = record.avgPrice !== undefined ? record.avgPrice : (record.avg_price !== undefined ? record.avg_price : (record.avg_price || record.Modal_Price));
  const rawModal = record.modalPrice !== undefined ? record.modalPrice : (record.modal_price !== undefined ? record.modal_price : record.Modal_Price);
  const rawArrival = record.arrivalQuantity !== undefined ? record.arrivalQuantity : (record.arrival_quantity !== undefined ? record.arrival_quantity : (record.arrivals !== undefined ? record.arrivals : record.Arrivals));

  const parsedMin = toNumberOrNull(rawMin);
  const parsedMax = toNumberOrNull(rawMax);
  const parsedModal = toNumberOrNull(rawModal);
  const parsedAvg = toNumberOrNull(rawAvg);
  const parsedArrival = toNumberOrNull(rawArrival);

  const isTrulyZero = record.isTrulyZero === true || record.isTrulyZero === 'true';
  const hasValidNumericPrice = parsedMin !== null || parsedMax !== null || parsedModal !== null || parsedAvg !== null || isTrulyZero;

  const minPrice = parsedMin !== null ? Math.max(parsedMin, 0) : 0;
  const maxPrice = parsedMax !== null ? Math.max(parsedMax, minPrice) : minPrice;
  const modalPrice = parsedModal !== null ? parsedModal : (parsedAvg !== null ? parsedAvg : Math.round((minPrice + maxPrice) / 2));
  const avgPrice = parsedAvg !== null ? parsedAvg : modalPrice;
  const arrivalQuantity = parsedArrival !== null ? Math.max(parsedArrival, 0) : 0;
  const unit = normalizeText(record.unit || record.Unit) || 'Qtl';
  
  const rawDate = record.date || record.arrival_date || record.date_arrival || record.Arrival_Date;
  const parsedDate = rawDate ? new Date(rawDate) : fallbackDate;

  return {
    crop,
    variety,
    grade,
    state,
    district,
    market,
    mandiName: market,
    priceAvailable: hasValidNumericPrice,
    priceDisplay: hasValidNumericPrice ? `₹${modalPrice}/${unit}` : 'Price Not Available',
    minPrice,
    maxPrice,
    avgPrice,
    modalPrice,
    arrivalQuantity,
    unit,
    isTrulyZero,
    date: Number.isNaN(parsedDate.getTime()) ? fallbackDate : parsedDate,
    source: normalizeText(record.source) || 'Agmarknet APMC Mandi Feed',
    fetchedAt: fallbackDate,
    lastUpdated: fallbackDate
  };
};

export const getStartOfDay = (value: Date = new Date()): Date => {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const buildMarketFilter = (query: MarketQueryOptions) => {
  const filter: Record<string, unknown> = {};

  if (query.crop) {
    const { resolveCropToApiName } = require('../config/commodities');
    const apiCrop = resolveCropToApiName(query.crop);
    filter.crop = new RegExp(escapeRegex(apiCrop), 'i');
  }
  if (query.state) {
    filter.state = new RegExp(escapeRegex(query.state), 'i');
  }
  
  if (query.district || query.market) {
    const locationTerm = query.district || query.market;
    if (locationTerm) {
      const escaped = escapeRegex(locationTerm);
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { district: regex },
        { market: regex },
        { mandiName: regex }
      ];
    }
  }
  
  if (query.date) {
    const dateValue = new Date(query.date);
    if (!Number.isNaN(dateValue.getTime())) {
      const start = getStartOfDay(dateValue);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      filter.date = { $gte: start, $lt: end };
    }
  }

  return filter;
};

export const getPaginationMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit))
});
