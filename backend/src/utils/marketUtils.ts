import type { MarketApiRecord, MarketQueryOptions } from '../interfaces/market';

const normalizeText = (value?: string): string => (typeof value === 'string' ? value.trim() : '');

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const escapeRegex = (str: string): string => {
  return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const normalizeMarketRecord = (record: any, fallbackDate: Date = new Date()) => {
  const crop = normalizeText(record.crop || record.commodity || record.cropName) || 'Unknown Crop';
  const state = normalizeText(record.state) || 'Unknown State';
  const district = normalizeText(record.district) || 'Unknown District';
  const market = normalizeText(record.market || record.mandiName || record.mandi_name) || `${district} Mandi`;

  const rawMin = record.minPrice !== undefined ? record.minPrice : record.min_price;
  const rawMax = record.maxPrice !== undefined ? record.maxPrice : record.max_price;
  const rawAvg = record.avgPrice !== undefined ? record.avgPrice : record.avg_price;
  const rawModal = record.modalPrice !== undefined ? record.modalPrice : record.modal_price;
  const rawArrival = record.arrivalQuantity !== undefined ? record.arrivalQuantity : (record.arrival_quantity || record.arrivals);

  const minPrice = Math.max(toNumber(rawMin), 0);
  const maxPrice = Math.max(toNumber(rawMax), minPrice);
  const modalPrice = Math.max(toNumber(rawModal), toNumber(rawAvg), Math.round((minPrice + maxPrice) / 2));
  const avgPrice = Math.max(toNumber(rawAvg), modalPrice, Math.round((minPrice + maxPrice) / 2));
  const arrivalQuantity = Math.max(toNumber(rawArrival), 0);
  const unit = normalizeText(record.unit) || 'Qtl';
  
  const rawDate = record.date || record.arrival_date || record.date_arrival;
  const parsedDate = rawDate ? new Date(rawDate) : fallbackDate;

  return {
    crop,
    state,
    district,
    market,
    mandiName: market,
    minPrice,
    maxPrice,
    avgPrice,
    modalPrice,
    arrivalQuantity,
    unit,
    date: Number.isNaN(parsedDate.getTime()) ? fallbackDate : parsedDate,
    source: normalizeText(record.source) || 'live-api',
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
    filter.crop = new RegExp(escapeRegex(query.crop), 'i');
  }
  if (query.state) {
    filter.state = new RegExp(escapeRegex(query.state), 'i');
  }
  if (query.district) {
    filter.district = new RegExp(escapeRegex(query.district), 'i');
  }
  if (query.market) {
    const escapedMarket = escapeRegex(query.market);
    filter.$or = [
      { market: new RegExp(escapedMarket, 'i') },
      { mandiName: new RegExp(escapedMarket, 'i') }
    ];
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
