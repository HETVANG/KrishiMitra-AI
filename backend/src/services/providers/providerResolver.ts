import { MarketProvider, IndiaMarketProvider, UnsupportedMarketProvider } from './MarketProvider';
import { WeatherProvider, IndiaWeatherProvider } from './WeatherProvider';
import { AgricultureProvider, IndiaAgricultureProvider, UnsupportedAgricultureProvider } from './AgricultureProvider';
import { RegionRegistry } from '../../config/regions/regionRegistry';
import { ProviderRegistry, ProviderDefinition } from './ProviderRegistry';
import { ProviderCapabilityService } from './ProviderCapabilityService';
import { WeatherProviderAdapter, MarketProviderAdapter, AgricultureKnowledgeAdapter, StandardProviderResponse } from './ProviderAdapter';
import { ProviderType } from '../../models/Provider';

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
