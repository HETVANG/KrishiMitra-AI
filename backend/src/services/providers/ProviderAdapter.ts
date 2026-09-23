import { ProviderHealthService } from './ProviderHealthService';
import { IndiaWeatherProvider } from './WeatherProvider';
import { IndiaMarketProvider } from './MarketProvider';
import { IndiaAgricultureProvider } from './AgricultureProvider';

export interface ProviderSourceMetadata {
  providerId: string;
  providerName: string;
  sourceType: string;
  retrievedAt: Date;
  freshness: string;
  region: string;
}

export interface StandardProviderResponse<T = any> {
  available: boolean;
  reason?: string;
  data?: T;
  source: ProviderSourceMetadata;
}

export interface IProviderAdapter {
  providerId: string;
  providerName: string;
  getCapabilities(): Record<string, boolean>;
  getSupportedRegions(): string[];
  healthCheck(): Promise<boolean>;
}

export class WeatherProviderAdapter implements IProviderAdapter {
  providerId = 'agroweather_india';
  providerName = 'India Meteorological & Open-Meteo Regional Feed';

  getCapabilities(): Record<string, boolean> {
    return { weatherCurrent: true, weatherForecast: true, rainProbability: true };
  }

  getSupportedRegions(): string[] {
    return ['IN'];
  }

  async healthCheck(): Promise<boolean> {
    return !ProviderHealthService.isCircuitBreakerOpen(this.providerId);
  }

  async getCurrentAndForecastWeather(lat: number, lon: number, lang: string = 'en', region: string = 'IN'): Promise<StandardProviderResponse> {
    const startTime = Date.now();
    try {
      const provider = new IndiaWeatherProvider();
      const res = await provider.getWeatherData(lat, lon, lang);
      const elapsed = Date.now() - startTime;

      if (res.available) {
        ProviderHealthService.recordSuccess(this.providerId, this.providerName, 'WEATHER', elapsed);
        return {
          available: true,
          data: res.weather,
          source: {
            providerId: this.providerId,
            providerName: this.providerName,
            sourceType: 'GOVERNMENT_STATION_NETWORK',
            retrievedAt: new Date(),
            freshness: 'REAL_TIME',
            region
          }
        };
      } else {
        ProviderHealthService.recordFailure(this.providerId, this.providerName, 'WEATHER', res.reason);
        return {
          available: false,
          reason: res.reason || 'Weather provider data unavailable',
          source: {
            providerId: this.providerId,
            providerName: this.providerName,
            sourceType: 'GOVERNMENT_STATION_NETWORK',
            retrievedAt: new Date(),
            freshness: 'UNAVAILABLE',
            region
          }
        };
      }
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      ProviderHealthService.recordFailure(this.providerId, this.providerName, 'WEATHER', err.message);
      return {
        available: false,
        reason: err.message || 'Weather adapter execution error',
        source: {
          providerId: this.providerId,
          providerName: this.providerName,
          sourceType: 'GOVERNMENT_STATION_NETWORK',
          retrievedAt: new Date(),
          freshness: 'ERROR',
          region
        }
      };
    }
  }
}

export class MarketProviderAdapter implements IProviderAdapter {
  providerId = 'agmarknet_official';
  providerName = 'Agmarknet Directorate of Marketing & Inspection (India)';

  getCapabilities(): Record<string, boolean> {
    return { marketPrices: true, mandiArrivals: true };
  }

  getSupportedRegions(): string[] {
    return ['IN'];
  }

  async healthCheck(): Promise<boolean> {
    return !ProviderHealthService.isCircuitBreakerOpen(this.providerId);
  }

  async getMarketPrices(commodity: string, state?: string, district?: string): Promise<StandardProviderResponse> {
    const startTime = Date.now();
    try {
      const provider = new IndiaMarketProvider();
      const res = await provider.getMarketPrices(commodity, state, district);
      const elapsed = Date.now() - startTime;

      if (res.available) {
        ProviderHealthService.recordSuccess(this.providerId, this.providerName, 'MARKET', elapsed);
        return {
          available: true,
          data: res.prices,
          source: {
            providerId: this.providerId,
            providerName: this.providerName,
            sourceType: 'GOVERNMENT_MINISTRY',
            retrievedAt: new Date(),
            freshness: 'DAILY',
            region: `${district || ''}, ${state || 'India'}`.trim()
          }
        };
      } else {
        ProviderHealthService.recordFailure(this.providerId, this.providerName, 'MARKET', res.reason);
        return {
          available: false,
          reason: res.reason || 'Market provider prices unavailable',
          source: {
            providerId: this.providerId,
            providerName: this.providerName,
            sourceType: 'GOVERNMENT_MINISTRY',
            retrievedAt: new Date(),
            freshness: 'UNAVAILABLE',
            region: `${district || ''}, ${state || 'India'}`.trim()
          }
        };
      }
    } catch (err: any) {
      ProviderHealthService.recordFailure(this.providerId, this.providerName, 'MARKET', err.message);
      return {
        available: false,
        reason: err.message || 'Market adapter execution error',
        source: {
          providerId: this.providerId,
          providerName: this.providerName,
          sourceType: 'GOVERNMENT_MINISTRY',
          retrievedAt: new Date(),
          freshness: 'ERROR',
          region: `${district || ''}, ${state || 'India'}`.trim()
        }
      };
    }
  }
}

export class AgricultureKnowledgeAdapter implements IProviderAdapter {
  providerId = 'icar_national';
  providerName = 'ICAR National Agricultural Research System';

  getCapabilities(): Record<string, boolean> {
    return { cropCalendar: true, agronomicGuidance: true };
  }

  getSupportedRegions(): string[] {
    return ['IN'];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async getCropCalendar(cropName: string, countryCode: string = 'IN'): Promise<StandardProviderResponse> {
    const startTime = Date.now();
    try {
      const provider = new IndiaAgricultureProvider();
      const res = await provider.getAgriculturalCalendar(countryCode, cropName);
      const elapsed = Date.now() - startTime;

      if (res.available) {
        ProviderHealthService.recordSuccess(this.providerId, this.providerName, 'AGRICULTURAL_KNOWLEDGE', elapsed);
        return {
          available: true,
          data: res.data,
          source: {
            providerId: this.providerId,
            providerName: this.providerName,
            sourceType: 'RESEARCH_INSTITUTION',
            retrievedAt: new Date(),
            freshness: 'SEASONAL',
            region: countryCode
          }
        };
      } else {
        return {
          available: false,
          reason: res.reason || 'Agricultural calendar data unavailable',
          source: {
            providerId: this.providerId,
            providerName: this.providerName,
            sourceType: 'RESEARCH_INSTITUTION',
            retrievedAt: new Date(),
            freshness: 'UNAVAILABLE',
            region: countryCode
          }
        };
      }
    } catch (err: any) {
      ProviderHealthService.recordFailure(this.providerId, this.providerName, 'AGRICULTURAL_KNOWLEDGE', err.message);
      return {
        available: false,
        reason: err.message || 'Agriculture knowledge error',
        source: {
          providerId: this.providerId,
          providerName: this.providerName,
          sourceType: 'RESEARCH_INSTITUTION',
          retrievedAt: new Date(),
          freshness: 'ERROR',
          region: countryCode
        }
      };
    }
  }
}
