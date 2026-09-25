import mongoose from 'mongoose';
import { Provider, ProviderType } from '../../models/Provider';

export interface ProviderDefinition {
  id: string;
  name: string;
  slug: string;
  providerType: ProviderType;
  description: string;
  organizationType: string;
  country: string;
  supportedCountries: string[];
  capabilities: Record<string, boolean>;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DEPRECATED';
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'PARTNER_VERIFIED';
  documentationUrl?: string;
  dataFreshness?: {
    maxAgeMinutes: number;
    freshnessType: string;
  };
}

export const DEFAULT_PLATFORM_PROVIDERS: ProviderDefinition[] = [
  {
    id: 'agroweather_india',
    name: 'India Meteorological & Open-Meteo Regional Feed',
    slug: 'agroweather-india',
    providerType: 'WEATHER',
    description: 'High-resolution regional weather forecast and current weather telemetry for Indian agricultural zones.',
    organizationType: 'GOVERNMENT_STATION_NETWORK',
    country: 'IN',
    supportedCountries: ['IN'],
    capabilities: {
      weatherCurrent: true,
      weatherForecast: true,
      rainProbability: true,
      historicalWeather: false
    },
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    documentationUrl: 'https://mausam.imd.gov.in/',
    dataFreshness: { maxAgeMinutes: 30, freshnessType: 'REAL_TIME' }
  },
  {
    id: 'agmarknet_official',
    name: 'Agmarknet Directorate of Marketing & Inspection (India)',
    slug: 'agmarknet-official',
    providerType: 'MARKET',
    description: 'Official APMC mandi price telemetry across Indian states and agricultural commodities.',
    organizationType: 'GOVERNMENT_MINISTRY',
    country: 'IN',
    supportedCountries: ['IN'],
    capabilities: {
      marketPrices: true,
      mandiArrivals: true,
      historicalMarketPrices: true,
      exportPrices: false
    },
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    documentationUrl: 'https://agmarknet.gov.in/',
    dataFreshness: { maxAgeMinutes: 1440, freshnessType: 'DAILY' }
  },
  {
    id: 'icar_national',
    name: 'ICAR National Agricultural Research System',
    slug: 'icar-national',
    providerType: 'AGRICULTURAL_KNOWLEDGE',
    description: 'Indian Council of Agricultural Research official crop calendars, growth stages, and agronomic guidelines.',
    organizationType: 'RESEARCH_INSTITUTION',
    country: 'IN',
    supportedCountries: ['IN'],
    capabilities: {
      cropCalendar: true,
      agronomicGuidance: true,
      pestManagementRules: true,
      soilHealthGuidelines: true
    },
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    documentationUrl: 'https://icar.org.in/',
    dataFreshness: { maxAgeMinutes: 10080, freshnessType: 'SEASONAL' }
  },
  {
    id: 'digital_soil_grid_in',
    name: 'National Soil Survey & SoilGrids Data Feed',
    slug: 'national-soil-survey-in',
    providerType: 'SOIL',
    description: 'Soil chemistry properties, pH, NPK profiles, and soil texture telemetry for Indian agricultural land.',
    organizationType: 'RESEARCH_DATA_CENTER',
    country: 'IN',
    supportedCountries: ['IN'],
    capabilities: {
      soilProperties: true,
      soilNutrients: true,
      soilPH: true,
      moistureProfile: false
    },
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    dataFreshness: { maxAgeMinutes: 43200, freshnessType: 'STATIC_SURVEY' }
  },
  {
    id: 'expert_consultation_network',
    name: 'KrishiMitra Certified Agronomist Network',
    slug: 'agronomist-consulting-network',
    providerType: 'EXPERT_NETWORK',
    description: 'Verified direct agricultural expert advice and plant disease diagnostic consultations.',
    organizationType: 'VERIFIED_EXPERT_NETWORK',
    country: 'IN',
    supportedCountries: ['IN'],
    capabilities: {
      agronomistConsulting: true,
      pathologyDiagnosis: true,
      prescriptionReview: true
    },
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    dataFreshness: { maxAgeMinutes: 60, freshnessType: 'ON_DEMAND' }
  }
];

export class ProviderRegistry {
  /**
   * Ensure standard platform providers are registered in DB if online
   */
  static async ensureDefaultProviders() {
    if (mongoose.connection.readyState !== 1) return;
    try {
      for (const def of DEFAULT_PLATFORM_PROVIDERS) {
        const existing = await Provider.findOne({ slug: def.slug });
        if (!existing) {
          await Provider.create({
            name: def.name,
            slug: def.slug,
            providerType: def.providerType,
            description: def.description,
            organizationType: def.organizationType,
            country: def.country,
            supportedCountries: def.supportedCountries,
            capabilities: def.capabilities,
            status: def.status,
            verificationStatus: def.verificationStatus,
            documentationUrl: def.documentationUrl,
            dataFreshness: def.dataFreshness
          });
        }
      }
    } catch (err: any) {
      console.warn('[ProviderRegistry] Provider seeding notice:', err.message);
    }
  }

  /**
   * List all providers filtered by type and country
   */
  static async getProviders(type?: ProviderType, countryCode: string = 'IN', includeInactive: boolean = false): Promise<ProviderDefinition[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        await this.ensureDefaultProviders();
        const query: any = {};
        if (!includeInactive) {
          query.status = 'ACTIVE';
        }
        if (type) query.providerType = type;
        query.$or = [{ country: countryCode.toUpperCase() }, { supportedCountries: countryCode.toUpperCase() }];

        const dbProviders = await Provider.find(query).lean();
        if (dbProviders && dbProviders.length > 0) {
          return dbProviders.map((p: any) => ({
            id: p._id.toString(),
            name: p.name,
            slug: p.slug,
            providerType: p.providerType as ProviderType,
            description: p.description || '',
            organizationType: p.organizationType || '',
            country: p.country,
            supportedCountries: p.supportedCountries || [p.country],
            capabilities: p.capabilities || {},
            status: p.status,
            verificationStatus: p.verificationStatus,
            documentationUrl: p.documentationUrl,
            dataFreshness: p.dataFreshness
          }));
        }
      } catch (err: any) {
        console.warn('[ProviderRegistry] DB provider query notice:', err.message);
      }
    }

    // Static fallback if DB is offline or empty
    let list = includeInactive ? DEFAULT_PLATFORM_PROVIDERS : DEFAULT_PLATFORM_PROVIDERS.filter(p => p.status === 'ACTIVE');
    if (type) list = list.filter(p => p.providerType === type);
    list = list.filter(p => p.country === countryCode.toUpperCase() || p.supportedCountries.includes(countryCode.toUpperCase()));
    return list;
  }
}
