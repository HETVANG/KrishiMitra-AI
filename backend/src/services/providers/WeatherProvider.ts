import { WeatherService } from '../WeatherService';

export interface WeatherProviderResult {
  available: boolean;
  reason?: string;
  providerName?: string;
  weather?: any;
}

export interface WeatherProvider {
  id: string;
  name: string;
  getWeatherData: (lat: number, lon: number, lang?: string) => Promise<WeatherProviderResult>;
}

export class IndiaWeatherProvider implements WeatherProvider {
  id = 'agroweather_india';
  name = 'India Meteorological & Open-Meteo Regional Feed';

  async getWeatherData(lat: number, lon: number, lang: string = 'en'): Promise<WeatherProviderResult> {
    try {
      const data = await WeatherService.getWeatherData(lat, lon, lang);
      if (!data) {
        return {
          available: false,
          reason: 'Weather service data unavailable for coordinates.',
          providerName: this.name
        };
      }
      return {
        available: true,
        providerName: this.name,
        weather: data
      };
    } catch (err: any) {
      return {
        available: false,
        reason: err.message || 'Weather provider error',
        providerName: this.name
      };
    }
  }
}
