import { RegionalConfig } from './regionTypes';

export const INDIA_REGIONAL_CONFIG: RegionalConfig = {
  countryCode: 'IN',
  countryName: 'India',
  status: 'SUPPORTED',
  supported: true,
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'hi', 'gu', 'mr', 'pa', 'bn', 'ta', 'te', 'kn', 'ml', 'or', 'as'],
  currency: 'INR',
  currencySymbol: '₹',
  measurementSystem: 'metric',
  temperatureUnit: 'C',
  landAreaUnit: 'acre',
  timezone: 'Asia/Kolkata',
  agriculturalCalendar: {
    seasons: [
      { id: 'kharif', name: 'Kharif (Monsoon)', months: [6, 7, 8, 9, 10] },
      { id: 'rabi', name: 'Rabi (Winter)', months: [10, 11, 12, 1, 2, 3] },
      { id: 'zaid', name: 'Zaid (Summer)', months: [3, 4, 5, 6] }
    ]
  },
  marketProviders: [
    {
      id: 'agmarknet_official',
      name: 'Agmarknet Directorate of Marketing & Inspection (India)',
      type: 'official_gov',
      status: 'active'
    }
  ],
  weatherProviders: [
    {
      id: 'agroweather_india',
      name: 'India Meteorological & Open-Meteo Regional Feed',
      status: 'active'
    }
  ],
  agricultureProviders: [
    {
      id: 'icar_national',
      name: 'ICAR National Agricultural Research System',
      status: 'active'
    }
  ],
  supportedCrops: ['Wheat', 'Rice', 'Paddy', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Mustard', 'Gram', 'Soyabean'],
  supportedFeatures: {
    weather: true,
    marketPrices: true,
    diseaseIntelligence: true,
    irrigationIntelligence: true,
    predictiveIntelligence: true,
    cropLifecycle: true,
    farmAgents: true,
    marketplace: true,
    payments: true,
    expertNetwork: true,
    advisory: true,
    diseaseDetection: true,
    yieldPrediction: true
  }
};

