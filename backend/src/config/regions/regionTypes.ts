export type TemperatureUnit = 'C' | 'F';
export type LandAreaUnit = 'acre' | 'hectare' | 'bigha' | 'sq_meter';
export type WeightUnit = 'kg' | 'quintal' | 'ton' | 'lb';
export type VolumeUnit = 'liter' | 'gallon';
export type MeasurementSystem = 'metric' | 'imperial';

export interface MarketProviderInfo {
  id: string;
  name: string;
  type: 'official_gov' | 'exchange' | 'aggregated';
  status: 'active' | 'coming_soon' | 'unavailable';
}

export interface WeatherProviderInfo {
  id: string;
  name: string;
  status: 'active' | 'coming_soon' | 'unavailable';
}

export interface AgricultureProviderInfo {
  id: string;
  name: string;
  status: 'active' | 'coming_soon' | 'unavailable';
}

export interface RegionalFeatureAvailability {
  weather: boolean;
  marketPrices: boolean;
  diseaseIntelligence: boolean;
  irrigationIntelligence: boolean;
  predictiveIntelligence: boolean;
  cropLifecycle: boolean;
  farmAgents: boolean;
}

export interface RegionalConfig {
  countryCode: string; // ISO 3166-1 alpha-2 e.g. "IN"
  countryName: string;
  supported: boolean;
  defaultLanguage: string;
  supportedLanguages: string[];
  currency: string;
  currencySymbol: string;
  measurementSystem: MeasurementSystem;
  temperatureUnit: TemperatureUnit;
  landAreaUnit: LandAreaUnit;
  timezone: string;
  agriculturalCalendar: {
    seasons: Array<{
      id: string;
      name: string;
      months: number[]; // 1-12
    }>;
  };
  marketProviders: MarketProviderInfo[];
  weatherProviders: WeatherProviderInfo[];
  agricultureProviders: AgricultureProviderInfo[];
  supportedCrops: string[];
  supportedFeatures: RegionalFeatureAvailability;
}
