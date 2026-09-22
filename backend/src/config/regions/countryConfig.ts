import { RegionalConfig } from './regionTypes';
import { INDIA_REGIONAL_CONFIG } from './indiaConfig';

export const COUNTRY_CONFIG_MAP: Record<string, RegionalConfig> = {
  IN: INDIA_REGIONAL_CONFIG,
  US: {
    countryCode: 'US',
    countryName: 'United States',
    supported: false,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es'],
    currency: 'USD',
    currencySymbol: '$',
    measurementSystem: 'imperial',
    temperatureUnit: 'F',
    landAreaUnit: 'acre',
    timezone: 'America/New_York',
    agriculturalCalendar: { seasons: [] },
    marketProviders: [{ id: 'usda_ams', name: 'USDA Agricultural Marketing Service', type: 'official_gov', status: 'coming_soon' }],
    weatherProviders: [{ id: 'noaa_nws', name: 'NOAA National Weather Service', status: 'coming_soon' }],
    agricultureProviders: [],
    supportedCrops: ['Corn', 'Soybeans', 'Wheat', 'Cotton'],
    supportedFeatures: { weather: false, marketPrices: false, diseaseIntelligence: true, irrigationIntelligence: true, predictiveIntelligence: true, cropLifecycle: true, farmAgents: true }
  },
  BR: {
    countryCode: 'BR',
    countryName: 'Brazil',
    supported: false,
    defaultLanguage: 'pt',
    supportedLanguages: ['pt', 'en'],
    currency: 'BRL',
    currencySymbol: 'R$',
    measurementSystem: 'metric',
    temperatureUnit: 'C',
    landAreaUnit: 'hectare',
    timezone: 'America/Sao_Paulo',
    agriculturalCalendar: { seasons: [] },
    marketProviders: [],
    weatherProviders: [],
    agricultureProviders: [],
    supportedCrops: ['Soybeans', 'Corn', 'Coffee', 'Sugarcane'],
    supportedFeatures: { weather: false, marketPrices: false, diseaseIntelligence: true, irrigationIntelligence: true, predictiveIntelligence: true, cropLifecycle: true, farmAgents: true }
  },
  EU: {
    countryCode: 'EU',
    countryName: 'European Union (General)',
    supported: false,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'fr', 'de', 'es', 'it'],
    currency: 'EUR',
    currencySymbol: '€',
    measurementSystem: 'metric',
    temperatureUnit: 'C',
    landAreaUnit: 'hectare',
    timezone: 'Europe/Paris',
    agriculturalCalendar: { seasons: [] },
    marketProviders: [],
    weatherProviders: [],
    agricultureProviders: [],
    supportedCrops: ['Wheat', 'Barley', 'Sugarbeet', 'Maize'],
    supportedFeatures: { weather: false, marketPrices: false, diseaseIntelligence: true, irrigationIntelligence: true, predictiveIntelligence: true, cropLifecycle: true, farmAgents: true }
  }
};
