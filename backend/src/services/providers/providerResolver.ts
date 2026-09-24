import { MarketProvider, IndiaMarketProvider, UnsupportedMarketProvider } from './MarketProvider';
import { WeatherProvider, IndiaWeatherProvider } from './WeatherProvider';
import { AgricultureProvider, IndiaAgricultureProvider, UnsupportedAgricultureProvider } from './AgricultureProvider';
import { RegionRegistry } from '../../config/regions/regionRegistry';
import { ProviderRegistry, ProviderDefinition } from './ProviderRegistry';
import { ProviderCapabilityService } from './ProviderCapabilityService';
import { WeatherProviderAdapter, MarketProviderAdapter, AgricultureKnowledgeAdapter, StandardProviderResponse } from './ProviderAdapter';
import { ProviderType } from '../../models/Provider';

export interface PaymentProviderResult {
  id: string;
  name: string;
  available: boolean;
  code?: string;
  reason?: string;
}

export interface SoilProviderResult {
  id: string;
  name: string;
  available: boolean;
  code?: string;
  reason?: string;
}

export class ProviderResolver {
  /**
   * Get MarketProvider for a country code
   */
  static getMarketProvider(countryCode: string = 'IN'): MarketProvider {
    const isSupported = RegionRegistry.isSupportedCountry(countryCode);
    if (isSupported && countryCode.toUpperCase() === 'IN') {
      return new IndiaMarketProvider();
    }
    return new UnsupportedMarketProvider(countryCode);
  }

  /**
   * Get WeatherProvider for a country code
   */
  static getWeatherProvider(countryCode: string = 'IN'): WeatherProvider {
    return new IndiaWeatherProvider(); // Uses Open-Meteo & IMD regional coordinates
  }

  /**
   * Get AgricultureProvider for a country code
   */
  static getAgricultureProvider(countryCode: string = 'IN'): AgricultureProvider {
    const isSupported = RegionRegistry.isSupportedCountry(countryCode);
    if (isSupported && countryCode.toUpperCase() === 'IN') {
      return new IndiaAgricultureProvider();
    }
    return new UnsupportedAgricultureProvider(countryCode);
  }

  /**
   * Get PaymentProvider for a country code
   */
  static getPaymentProvider(countryCode: string = 'IN'): PaymentProviderResult {
    const code = countryCode.trim().toUpperCase();
    if (code === 'IN') {
      return {
        id: 'razorpay_india',
        name: 'Razorpay Payment Gateway (India)',
        available: true
      };
    }
    const config = RegionRegistry.getRegionConfig(code);
    return {
      id: `unsupported_payment_${code.toLowerCase()}`,
      name: `Payment Gateway (${config.countryName})`,
      available: false,
      code: 'FEATURE_NOT_SUPPORTED_IN_REGION',
      reason: `Razorpay billing is currently optimized for India (IN). Payment gateway for ${config.countryName} is under integration.`
    };
  }

  /**
   * Get SoilProvider for a country code
   */
  static getSoilProvider(countryCode: string = 'IN'): SoilProviderResult {
    const code = countryCode.trim().toUpperCase();
    if (code === 'IN') {
      return {
        id: 'national_soil_survey_in',
        name: 'National Soil Survey & SoilGrids Data Feed',
        available: true
      };
    }
    const config = RegionRegistry.getRegionConfig(code);
    if (config.supportedFeatures?.predictiveIntelligence) {
      return {
        id: `soilgrids_global_${code.toLowerCase()}`,
        name: `ISRIC SoilGrids Global Telemetry (${config.countryName})`,
        available: true
      };
    }
    return {
      id: `unsupported_soil_${code.toLowerCase()}`,
      name: `Soil Telemetry (${config.countryName})`,
      available: false,
      code: 'FEATURE_NOT_SUPPORTED_IN_REGION',
      reason: `Soil telemetry data is not currently available for ${config.countryName}.`
    };
  }

  /**
   * Resolve best provider matching required capability and region
   */
  static async resolveProviderForCapability(
    capability: string,
    providerType?: ProviderType,
    countryCode: string = 'IN'
  ): Promise<{ primary?: ProviderDefinition; fallback?: ProviderDefinition; available: boolean }> {
    const matches = await ProviderCapabilityService.findProvidersWithCapability(capability, providerType, countryCode);

    if (!matches || matches.length === 0) {
      return { available: false };
    }

    return {
      primary: matches[0],
      fallback: matches.length > 1 ? matches[1] : undefined,
      available: true
    };
  }

  /**
   * Execute resolved weather telemetry with capability matching and adapter fallback
   */
  static async getResolvedWeather(lat: number, lon: number, countryCode: string = 'IN', lang: string = 'en'): Promise<StandardProviderResponse> {
    const weatherAdapter = new WeatherProviderAdapter();
    return await weatherAdapter.getCurrentAndForecastWeather(lat, lon, lang, countryCode);
  }

  /**
   * Execute resolved market prices with capability matching and adapter fallback
   */
  static async getResolvedMarketPrices(commodity: string, state?: string, district?: string): Promise<StandardProviderResponse> {
    const marketAdapter = new MarketProviderAdapter();
    return await marketAdapter.getMarketPrices(commodity, state, district);
  }
}

