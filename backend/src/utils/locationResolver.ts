import { RegionRegistry } from '../config/regions/regionRegistry';
import { RegionalConfig } from '../config/regions/regionTypes';

export interface ResolvedLocation {
  countryCode: string;
  countryName: string;
  state: string;
  district: string;
  timezone: string;
  config: RegionalConfig;
}

export class LocationResolver {
  /**
   * Resolves country, state, district, and timezone from GPS coordinates or location inputs.
   */
  static resolveLocation(
    latitude?: number | null,
    longitude?: number | null,
    stateInput?: string,
    districtInput?: string,
    countryCodeInput?: string
  ): ResolvedLocation {
    // 1. Explicit country code check
    if (countryCodeInput && RegionRegistry.hasCountry(countryCodeInput)) {
      const config = RegionRegistry.getRegionConfig(countryCodeInput);
      return {
        countryCode: config.countryCode,
        countryName: config.countryName,
        state: stateInput || 'Region',
        district: districtInput || 'District',
        timezone: config.timezone,
        config
      };
    }

    // 2. Coordinate boundary check for India
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      const isIndiaCoords = latitude >= 6.5 && latitude <= 37.1 && longitude >= 68.1 && longitude <= 97.4;
      if (isIndiaCoords) {
        const config = RegionRegistry.getRegionConfig('IN');
        return {
          countryCode: 'IN',
          countryName: 'India',
          state: stateInput || 'Gujarat',
          district: districtInput || 'Ahmedabad',
          timezone: 'Asia/Kolkata',
          config
        };
      }
    }

    // 3. Fallback default (India)
    const defaultConfig = RegionRegistry.getRegionConfig('IN');
    return {
      countryCode: defaultConfig.countryCode,
      countryName: defaultConfig.countryName,
      state: stateInput || 'Gujarat',
      district: districtInput || 'Ahmedabad',
      timezone: defaultConfig.timezone,
      config: defaultConfig
    };
  }
}
