import { MarketPrice } from '../../models/MarketPrice';
import { RegionRegistry } from '../../config/regions/regionRegistry';

export interface MarketProviderResult {
  available: boolean;
  code?: string;
  reason?: string;
  providerName?: string;
  prices?: any[];
}

export interface MarketProvider {
  id: string;
  name: string;
  getMarketPrices: (commodity: string, state?: string, district?: string) => Promise<MarketProviderResult>;
}

export class IndiaMarketProvider implements MarketProvider {
  id = 'agmarknet_official';
  name = 'Agmarknet Directorate of Marketing & Inspection (India)';

  async getMarketPrices(commodity: string, state?: string, district?: string): Promise<MarketProviderResult> {
    try {
      const filter: any = { crop: new RegExp(commodity, 'i') };
      if (state) filter.state = new RegExp(state, 'i');
      if (district) filter.district = new RegExp(district, 'i');

      const prices = await MarketPrice.find(filter).sort({ lastUpdated: -1 }).limit(10).lean();

      if (!prices || prices.length === 0) {
        return {
          available: false,
          code: 'INSUFFICIENT_DATA',
          reason: `No live mandi prices found for ${commodity} in the selected area.`,
          providerName: this.name
        };
      }

      return {
        available: true,
        providerName: this.name,
        prices
      };
    } catch (err: any) {
      return {
        available: false,
        code: 'DATA_PROVIDER_UNAVAILABLE',
        reason: err.message || 'Market provider connection error',
        providerName: this.name
      };
    }
  }
}

export class UnsupportedMarketProvider implements MarketProvider {
  id: string;
  name: string;

  constructor(countryCode: string) {
    this.id = `unsupported_${countryCode.toLowerCase()}`;
    const config = RegionRegistry.getRegionConfig(countryCode);
    this.name = `Market Provider (${config.countryName})`;
  }

  async getMarketPrices(): Promise<MarketProviderResult> {
    return {
      available: false,
      code: 'FEATURE_NOT_SUPPORTED_IN_REGION',
      reason: 'Market data is not currently available for this region.',
      providerName: this.name
    };
  }
}

