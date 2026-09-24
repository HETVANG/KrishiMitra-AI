import { RegionalConfig, CountryReadiness, CountryStatus } from './regionTypes';
import { INDIA_REGIONAL_CONFIG } from './indiaConfig';

export const COUNTRY_CONFIG_MAP: Record<string, RegionalConfig> = {
  IN: INDIA_REGIONAL_CONFIG,
  US: {
    countryCode: 'US',
    countryName: 'United States',
    status: 'BETA',
    supported: true,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es'],
    currency: 'USD',
    currencySymbol: '$',
    measurementSystem: 'imperial',
    temperatureUnit: 'F',
    landAreaUnit: 'acre',
    timezone: 'America/New_York',
    agriculturalCalendar: {
      seasons: [
        { id: 'spring_summer', name: 'Spring/Summer Crop Season', months: [4, 5, 6, 7, 8, 9] },
        { id: 'fall_winter', name: 'Fall/Winter Season', months: [10, 11, 12, 1, 2, 3] }
      ]
    },
    marketProviders: [{ id: 'usda_ams', name: 'USDA Agricultural Marketing Service', type: 'official_gov', status: 'coming_soon' }],
    weatherProviders: [{ id: 'noaa_nws', name: 'NOAA National Weather Service', status: 'active' }],
    agricultureProviders: [{ id: 'usda_nifa', name: 'USDA NIFA Agronomic Network', status: 'active' }],
    supportedCrops: ['Corn', 'Soybeans', 'Wheat', 'Cotton', 'Sorghum', 'Rice'],
    supportedFeatures: {
      weather: true,
      marketPrices: false,
      diseaseIntelligence: true,
      irrigationIntelligence: true,
      predictiveIntelligence: true,
      cropLifecycle: true,
      farmAgents: true,
      marketplace: false,
      payments: false,
      expertNetwork: false,
      advisory: true,
      diseaseDetection: true,
      yieldPrediction: true
    }
  },
  BR: {
    countryCode: 'BR',
    countryName: 'Brazil',
    status: 'LIMITED',
    supported: false,
    defaultLanguage: 'pt',
    supportedLanguages: ['pt', 'en'],
    currency: 'BRL',
    currencySymbol: 'R$',
    measurementSystem: 'metric',
    temperatureUnit: 'C',
    landAreaUnit: 'hectare',
    timezone: 'America/Sao_Paulo',
    agriculturalCalendar: {
      seasons: [
        { id: 'safra', name: 'Safra Main Season', months: [9, 10, 11, 12, 1, 2] },
        { id: 'safrinha', name: 'Safrinha Second Season', months: [1, 2, 3, 4, 5, 6] }
      ]
    },
    marketProviders: [{ id: 'cepea_esalq', name: 'CEPEA / ESALQ Market Feed', type: 'exchange', status: 'coming_soon' }],
    weatherProviders: [{ id: 'inmet_br', name: 'INMET Brasil Regional Feed', status: 'active' }],
    agricultureProviders: [{ id: 'embrapa_br', name: 'Embrapa Agricultural Research', status: 'active' }],
    supportedCrops: ['Soybeans', 'Corn', 'Coffee', 'Sugarcane', 'Cotton'],
    supportedFeatures: {
      weather: true,
      marketPrices: false,
      diseaseIntelligence: true,
      irrigationIntelligence: true,
      predictiveIntelligence: true,
      cropLifecycle: true,
      farmAgents: true,
      marketplace: false,
      payments: false,
      expertNetwork: false,
      advisory: true,
      diseaseDetection: true,
      yieldPrediction: true
    }
  },
  EU: {
    countryCode: 'EU',
    countryName: 'European Union',
    status: 'LIMITED',
    supported: false,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'fr', 'de', 'es', 'it'],
    currency: 'EUR',
    currencySymbol: '€',
    measurementSystem: 'metric',
    temperatureUnit: 'C',
    landAreaUnit: 'hectare',
    timezone: 'Europe/Paris',
    agriculturalCalendar: {
      seasons: [
        { id: 'eu_main', name: 'European Main Growing Season', months: [3, 4, 5, 6, 7, 8, 9] }
      ]
    },
    marketProviders: [],
    weatherProviders: [{ id: 'ecmwf_open', name: 'ECMWF Regional European Feed', status: 'active' }],
    agricultureProviders: [],
    supportedCrops: ['Wheat', 'Barley', 'Sugarbeet', 'Maize', 'Rapeseed'],
    supportedFeatures: {
      weather: true,
      marketPrices: false,
      diseaseIntelligence: true,
      irrigationIntelligence: true,
      predictiveIntelligence: true,
      cropLifecycle: true,
      farmAgents: true,
      marketplace: false,
      payments: false,
      expertNetwork: false,
      advisory: true,
      diseaseDetection: true,
      yieldPrediction: false
    }
  },
  KE: {
    countryCode: 'KE',
    countryName: 'Kenya',
    status: 'COMING_SOON',
    supported: false,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'sw'],
    currency: 'KES',
    currencySymbol: 'KSh',
    measurementSystem: 'metric',
    temperatureUnit: 'C',
    landAreaUnit: 'acre',
    timezone: 'Africa/Nairobi',
    agriculturalCalendar: {
      seasons: [
        { id: 'long_rains', name: 'Long Rains Season', months: [3, 4, 5, 6, 7] },
        { id: 'short_rains', name: 'Short Rains Season', months: [10, 11, 12] }
      ]
    },
    marketProviders: [],
    weatherProviders: [{ id: 'kmd_kenya', name: 'Kenya Meteorological Department', status: 'coming_soon' }],
    agricultureProviders: [{ id: 'kalro_kenya', name: 'KALRO Research Institute', status: 'coming_soon' }],
    supportedCrops: ['Maize', 'Tea', 'Coffee', 'Beans', 'Potatoes'],
    supportedFeatures: {
      weather: true,
      marketPrices: false,
      diseaseIntelligence: true,
      irrigationIntelligence: true,
      predictiveIntelligence: false,
      cropLifecycle: true,
      farmAgents: false,
      marketplace: false,
      payments: false,
      expertNetwork: false,
      advisory: true,
      diseaseDetection: true,
      yieldPrediction: false
    }
  },
  VN: {
    countryCode: 'VN',
    countryName: 'Vietnam',
    status: 'PLANNED',
    supported: false,
    defaultLanguage: 'vi',
    supportedLanguages: ['vi', 'en'],
    currency: 'VND',
    currencySymbol: '₫',
    measurementSystem: 'metric',
    temperatureUnit: 'C',
    landAreaUnit: 'hectare',
    timezone: 'Asia/Ho_Chi_Minh',
    agriculturalCalendar: { seasons: [] },
    marketProviders: [],
    weatherProviders: [],
    agricultureProviders: [],
    supportedCrops: ['Rice', 'Coffee', 'Rubber', 'Cassava'],
    supportedFeatures: {
      weather: false,
      marketPrices: false,
      diseaseIntelligence: false,
      irrigationIntelligence: false,
      predictiveIntelligence: false,
      cropLifecycle: false,
      farmAgents: false,
      marketplace: false,
      payments: false,
      expertNetwork: false,
      advisory: false,
      diseaseDetection: false,
      yieldPrediction: false
    }
  }
};

/**
 * Evaluate regional production readiness for a target country
 */
export function evaluateCountryReadiness(countryCode: string = 'IN'): CountryReadiness {
  const code = countryCode.trim().toUpperCase();
  const config = COUNTRY_CONFIG_MAP[code];

  if (!config) {
    return {
      countryCode: code,
      countryName: `Market (${code})`,
      status: 'PLANNED',
      readinessScore: 10,
      dataSourcesReady: false,
      languageReady: false,
      regulatoryReady: false,
      paymentsReady: false,
      agronomicCalendarReady: false,
      missingRequirements: ['Unregistered market configuration', 'Local data source feeds', 'Payment gateway integration'],
      recommendation: 'Market under initial evaluation. Regional data sources required before launch.'
    };
  }

  if (code === 'IN') {
    return {
      countryCode: 'IN',
      countryName: 'India',
      status: 'SUPPORTED',
      readinessScore: 100,
      dataSourcesReady: true,
      languageReady: true,
      regulatoryReady: true,
      paymentsReady: true,
      agronomicCalendarReady: true,
      missingRequirements: [],
      recommendation: 'Full production market active. All platform systems operational.'
    };
  }

  if (code === 'US') {
    return {
      countryCode: 'US',
      countryName: 'United States',
      status: 'BETA',
      readinessScore: 85,
      dataSourcesReady: true,
      languageReady: true,
      regulatoryReady: true,
      paymentsReady: false,
      agronomicCalendarReady: true,
      missingRequirements: ['Local mandi/exchange price telemetry', 'Stripe payment gateway integration'],
      recommendation: 'Beta operational for advisory & weather intelligence. Market telemetry pending.'
    };
  }

  if (code === 'BR') {
    return {
      countryCode: 'BR',
      countryName: 'Brazil',
      status: 'LIMITED',
      readinessScore: 65,
      dataSourcesReady: true,
      languageReady: true,
      regulatoryReady: false,
      paymentsReady: false,
      agronomicCalendarReady: true,
      missingRequirements: ['Local market price provider integration', 'PIX payment gateway', 'Regulatory compliance review'],
      recommendation: 'Limited advisory availability. Weather & disease intelligence active.'
    };
  }

  if (code === 'EU') {
    return {
      countryCode: 'EU',
      countryName: 'European Union',
      status: 'LIMITED',
      readinessScore: 60,
      dataSourcesReady: true,
      languageReady: true,
      regulatoryReady: false,
      paymentsReady: false,
      agronomicCalendarReady: true,
      missingRequirements: ['GDPR data residency review', 'European commodity exchange price feeds'],
      recommendation: 'Limited advisory availability. Core weather telemetry operational.'
    };
  }

  if (code === 'KE') {
    return {
      countryCode: 'KE',
      countryName: 'Kenya',
      status: 'COMING_SOON',
      readinessScore: 40,
      dataSourcesReady: false,
      languageReady: true,
      regulatoryReady: false,
      paymentsReady: false,
      agronomicCalendarReady: true,
      missingRequirements: ['M-Pesa payment integration', 'KALRO agronomic calendar integration', 'Local weather feed integration'],
      recommendation: 'Coming soon. Regional partner onboarding in progress.'
    };
  }

  return {
    countryCode: code,
    countryName: config.countryName,
    status: config.status || 'PLANNED',
    readinessScore: 20,
    dataSourcesReady: false,
    languageReady: config.supportedLanguages?.length > 0,
    regulatoryReady: false,
    paymentsReady: false,
    agronomicCalendarReady: config.agriculturalCalendar?.seasons?.length > 0,
    missingRequirements: ['Localized market data providers', 'Regional payment gateways', 'Agronomic calendar validation'],
    recommendation: `Market (${config.countryName}) is currently in planned status.`
  };
}

