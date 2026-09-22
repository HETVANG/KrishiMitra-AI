export interface NormalizedMarketRecord {
  commodity: string;
  commodityId?: string;
  market: string;
  district: string;
  state: string;
  country: string;
  minPrice: number | null;
  maxPrice: number | null;
  modalPrice: number | null;
  avgPrice: number | null;
  unit: string;
  currency: string;
  arrivalDate: string;
  arrivalQuantity?: number;
  source: string;
  sourceTimestamp: Date;
  isTrulyZero: boolean;
}

export class MarketDataNormalizer {
  /**
   * Normalize raw database record or API response into standard market schema
   */
  static normalizeRecord(raw: any, defaultCountry: string = 'India', defaultCurrency: string = 'INR'): NormalizedMarketRecord {
    const rawMin = raw.minPrice;
    const rawMax = raw.maxPrice;
    const rawModal = raw.modalPrice ?? raw.avgPrice;
    const rawAvg = raw.avgPrice ?? raw.modalPrice;

    // Never convert undefined or null to 0 unless isTrulyZero is set explicitly
    const minPrice = typeof rawMin === 'number' && !isNaN(rawMin) ? rawMin : null;
    const maxPrice = typeof rawMax === 'number' && !isNaN(rawMax) ? rawMax : null;
    const modalPrice = typeof rawModal === 'number' && !isNaN(rawModal) ? rawModal : null;
    const avgPrice = typeof rawAvg === 'number' && !isNaN(rawAvg) ? rawAvg : null;

    const arrivalDateStr = raw.date 
      ? new Date(raw.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];

    return {
      commodity: raw.crop || raw.commodity || 'Commodity',
      commodityId: raw.cropId || raw.crop,
      market: raw.market || raw.mandiName || 'Local Mandi',
      district: raw.district || 'District',
      state: raw.state || 'State',
      country: raw.country || defaultCountry,
      minPrice,
      maxPrice,
      modalPrice,
      avgPrice,
      unit: raw.unit || 'Qtl',
      currency: raw.currency || defaultCurrency,
      arrivalDate: arrivalDateStr,
      arrivalQuantity: typeof raw.arrivalQuantity === 'number' ? raw.arrivalQuantity : 0,
      source: raw.source || 'agmarknet-official',
      sourceTimestamp: raw.lastUpdated ? new Date(raw.lastUpdated) : (raw.createdAt ? new Date(raw.createdAt) : new Date()),
      isTrulyZero: Boolean(raw.isTrulyZero)
    };
  }
}
