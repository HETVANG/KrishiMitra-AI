import { RegionalConfig, CountryReadiness, CountryStatus, RegionalFeatureAvailability } from './regionTypes';
import { COUNTRY_CONFIG_MAP, evaluateCountryReadiness } from './countryConfig';
import { INDIA_REGIONAL_CONFIG } from './indiaConfig';

export class RegionRegistry {
  /**
   * Get RegionalConfig for a given country code (defaults to IN)
   */
  static getRegionConfig(countryCode?: string): RegionalConfig {
    if (!countryCode) return INDIA_REGIONAL_CONFIG;
    const code = countryCode.trim().toUpperCase();
    return COUNTRY_CONFIG_MAP[code] || INDIA_REGIONAL_CONFIG;
  }

  /**
   * Check if country exists in registry
   */
  static hasCountry(countryCode?: string): boolean {
    if (!countryCode) return false;
    return !!COUNTRY_CONFIG_MAP[countryCode.trim().toUpperCase()];
  }

  /**
   * Check if a country code is currently an active supported production market
   */
  static isSupportedCountry(countryCode?: string): boolean {
    if (!countryCode) return true;
    const config = this.getRegionConfig(countryCode);
    return config.supported === true || config.status === 'SUPPORTED' || config.status === 'BETA';
  }

  /**
   * Check whether a specific agricultural platform feature is supported in a given country
   */
  static isFeatureAvailable(countryCode: string | undefined, featureKey: keyof RegionalFeatureAvailability): boolean {
    const config = this.getRegionConfig(countryCode);
    return config.supportedFeatures ? !!config.supportedFeatures[featureKey] : false;
  }

  /**
   * Evaluate regional production readiness for a target country
   */
  static evaluateCountryReadiness(countryCode?: string): CountryReadiness {
    return evaluateCountryReadiness(countryCode || 'IN');
  }

  /**
   * Get agricultural season for a given date and country code
   */
  static getSeasonForDate(date: Date, countryCode?: string): { seasonName: string; available: boolean } {
    const config = this.getRegionConfig(countryCode);
    if (!config.supported || !config.agriculturalCalendar?.seasons || config.agriculturalCalendar.seasons.length === 0) {
      return { seasonName: 'Regional calendar data unavailable', available: false };
    }

    const month = date.getMonth() + 1; // 1-12
    const matchingSeason = config.agriculturalCalendar.seasons.find(s => s.months.includes(month));
    return {
      seasonName: matchingSeason ? matchingSeason.name : 'Off-Season',
      available: true
    };
  }

  /**
   * Verify if a crop is supported in a regional configuration
   */
  static isCropSupported(cropName: string, countryCode?: string): boolean {
    const config = this.getRegionConfig(countryCode);
    if (!config.supportedCrops || config.supportedCrops.length === 0) return true;
    return config.supportedCrops.some(c => c.toLowerCase() === cropName.trim().toLowerCase());
  }

  /**
   * Get list of all registered country configs
   */
  static getAllCountries(): RegionalConfig[] {
    return Object.values(COUNTRY_CONFIG_MAP);
  }

  /**
   * Get list of active supported countries
   */
  static getSupportedCountries(): RegionalConfig[] {
    return Object.values(COUNTRY_CONFIG_MAP).filter(c => c.supported || c.status === 'SUPPORTED' || c.status === 'BETA');
  }

  /**
   * Filter registered countries by activation status
   */
  static getCountriesByStatus(status: CountryStatus): RegionalConfig[] {
    return Object.values(COUNTRY_CONFIG_MAP).filter(c => c.status === status);
  }
}

