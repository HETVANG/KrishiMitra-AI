import { GrowthStageEngine } from '../lifecycle/growthStageEngine';
import { RegionRegistry } from '../../config/regions/regionRegistry';

export interface AgricultureProviderResult {
  available: boolean;
  code?: string;
  reason?: string;
  providerName?: string;
  data?: any;
}

export interface AgricultureProvider {
  id: string;
  name: string;
  getAgriculturalCalendar: (countryCode: string, cropName: string) => Promise<AgricultureProviderResult>;
}

export class IndiaAgricultureProvider implements AgricultureProvider {
  id = 'icar_national';
  name = 'ICAR National Agricultural Research System';

  async getAgriculturalCalendar(countryCode: string, cropName: string): Promise<AgricultureProviderResult> {
    const config = RegionRegistry.getRegionConfig(countryCode);
    const cropProfile = GrowthStageEngine.getCropProfile(cropName);

    return {
      available: true,
      providerName: this.name,
      data: {
        cropName,
        seasons: config.agriculturalCalendar.seasons,
        totalGrowthDays: cropProfile.totalDaysToHarvest,
        stages: cropProfile.stages
      }
    };
  }
}

export class UnsupportedAgricultureProvider implements AgricultureProvider {
  id: string;
  name: string;

  constructor(countryCode: string) {
    this.id = `unsupported_agri_${countryCode.toLowerCase()}`;
    const config = RegionRegistry.getRegionConfig(countryCode);
    this.name = `Agricultural Calendar (${config.countryName})`;
  }

  async getAgriculturalCalendar(): Promise<AgricultureProviderResult> {
    return {
      available: false,
      code: 'FEATURE_NOT_SUPPORTED_IN_REGION',
      reason: 'Regional calendar data unavailable',
      providerName: this.name
    };
  }
}

