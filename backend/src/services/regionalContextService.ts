import { User } from '../models/User';
import { Farm } from '../models/Farm';
import { RegionRegistry } from '../config/regions/regionRegistry';
import { TemperatureUnit, LandAreaUnit, MeasurementSystem, CountryStatus, RegionalFeatureAvailability } from '../config/regions/regionTypes';
import { ProviderResolver } from './providers/providerResolver';

export interface NormalizedRegionalContext {
  countryCode: string;
  countryName: string;
  status: CountryStatus;
  readinessScore: number;
  state: string;
  district: string;
  city: string;
  village: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  currency: string;
  currencySymbol: string;
  temperatureUnit: TemperatureUnit;
  landAreaUnit: LandAreaUnit;
  measurementSystem: MeasurementSystem;
  timezone: string;
  supported: boolean;
  features: RegionalFeatureAvailability;
  providers: {
    market: string;
    weather: string;
    agriculture: string;
    payment: string;
    soil: string;
  };
}

export class RegionalContextService {
  /**
   * Build complete RegionalContext for a user and optional farmId
   */
  static async getRegionalContext(userId: string, farmId?: string): Promise<NormalizedRegionalContext> {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    let selectedFarm: any = null;
    if (farmId) {
      selectedFarm = await Farm.findOne({ _id: farmId, user: userId }).lean();
    }
    if (!selectedFarm) {
      selectedFarm = await Farm.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
    }

    // Determine country code and config - Farm context is authoritative for agricultural operations
    const userRegPref = (user as any).settings?.regionalPreferences || {};
    const countryCode = selectedFarm?.countryCode || userRegPref.countryCode || (user as any).countryCode || 'IN';
    const regionConfig = RegionRegistry.getRegionConfig(countryCode);
    const readiness = RegionRegistry.evaluateCountryReadiness(countryCode);

    const state = selectedFarm?.state || user.farmLocation?.state || userRegPref.stateName || 'Gujarat';
    const district = selectedFarm?.district || user.farmLocation?.district || 'Ahmedabad';
    const city = selectedFarm?.taluka || user.farmLocation?.city || '';
    const village = selectedFarm?.village || user.farmLocation?.village || '';
    const postalCode = selectedFarm?.postalCode || user.farmLocation?.postcode || '';
    const lat = selectedFarm?.latitude ?? user.farmLocation?.latitude ?? null;
    const lng = selectedFarm?.longitude ?? user.farmLocation?.longitude ?? null;

    const currency = userRegPref.currency || selectedFarm?.currency || regionConfig.currency;
    const currencySymbol = userRegPref.currencySymbol || regionConfig.currencySymbol;
    const temperatureUnit: TemperatureUnit = userRegPref.temperatureUnit || selectedFarm?.temperatureUnit || regionConfig.temperatureUnit;
    const landAreaUnit: LandAreaUnit = userRegPref.landAreaUnit || selectedFarm?.landAreaUnit || regionConfig.landAreaUnit;
    const measurementSystem: MeasurementSystem = userRegPref.measurementSystem || regionConfig.measurementSystem;
    const timezone = userRegPref.timezone || selectedFarm?.timezone || regionConfig.timezone;

    const marketProv = ProviderResolver.getMarketProvider(countryCode);
    const weatherProv = ProviderResolver.getWeatherProvider(countryCode);
    const agriProv = ProviderResolver.getAgricultureProvider(countryCode);
    const paymentProv = ProviderResolver.getPaymentProvider(countryCode);
    const soilProv = ProviderResolver.getSoilProvider(countryCode);

    return {
      countryCode: regionConfig.countryCode,
      countryName: regionConfig.countryName,
      status: regionConfig.status || 'PLANNED',
      readinessScore: readiness.readinessScore,
      state,
      district,
      city,
      village,
      postalCode,
      latitude: lat,
      longitude: lng,
      currency,
      currencySymbol,
      temperatureUnit,
      landAreaUnit,
      measurementSystem,
      timezone,
      supported: regionConfig.supported,
      features: regionConfig.supportedFeatures,
      providers: {
        market: marketProv.name,
        weather: weatherProv.name,
        agriculture: agriProv.name,
        payment: paymentProv.name,
        soil: soilProv.name
      }
    };
  }
}

