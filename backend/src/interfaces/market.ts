export interface MarketApiRecord {
  crop?: string;
  state?: string;
  district?: string;
  market?: string;
  mandiName?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  modalPrice?: number | string;
  avgPrice?: number | string;
  arrivalQuantity?: number | string;
  unit?: string;
  date?: string | Date;
  source?: string;
}

export interface MarketQueryOptions {
  crop?: string;
  state?: string;
  district?: string;
  market?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface MarketSyncResult {
  success: boolean;
  message: string;
  recordsInserted: number;
  recordsUpdated: number;
  lastUpdated?: Date | null;
  warnings: string[];
}
