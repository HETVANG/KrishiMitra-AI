export type GrowthStage =
  | 'PRE_PLANTING'
  | 'GERMINATION'
  | 'SEEDLING'
  | 'VEGETATIVE'
  | 'FLOWERING'
  | 'FRUIT_DEVELOPMENT'
  | 'MATURITY'
  | 'HARVEST'
  | 'POST_HARVEST';

export interface CropGrowthProfile {
  cropName: string;
  totalDaysToHarvest: number;
  stages: Array<{
    stage: GrowthStage;
    label: string;
    startDay: number;
    endDay: number;
  }>;
}

export class GrowthStageEngine {
  private static cropProfiles: Record<string, CropGrowthProfile> = {
    wheat: {
      cropName: 'Wheat',
      totalDaysToHarvest: 120,
      stages: [
        { stage: 'GERMINATION', label: 'Germination & Crown Root', startDay: 0, endDay: 15 },
        { stage: 'SEEDLING', label: 'Tillering & Seedling Stage', startDay: 16, endDay: 35 },
        { stage: 'VEGETATIVE', label: 'Jointing & Stem Elongation', startDay: 36, endDay: 60 },
        { stage: 'FLOWERING', label: 'Heading & Flowering', startDay: 61, endDay: 80 },
        { stage: 'FRUIT_DEVELOPMENT', label: 'Milk & Dough Grain Filling', startDay: 81, endDay: 105 },
        { stage: 'MATURITY', label: 'Full Maturity', startDay: 106, endDay: 120 }
      ]
    },
    rice: {
      cropName: 'Rice',
      totalDaysToHarvest: 130,
      stages: [
        { stage: 'GERMINATION', label: 'Nursery & Germination', startDay: 0, endDay: 20 },
        { stage: 'SEEDLING', label: 'Transplanting & Seedling', startDay: 21, endDay: 40 },
        { stage: 'VEGETATIVE', label: 'Tillering', startDay: 41, endDay: 70 },
        { stage: 'FLOWERING', label: 'Panicle & Flowering', startDay: 71, endDay: 95 },
        { stage: 'FRUIT_DEVELOPMENT', label: 'Grain Ripening', startDay: 96, endDay: 115 },
        { stage: 'MATURITY', label: 'Harvest Ready', startDay: 116, endDay: 130 }
      ]
    },
    tomato: {
      cropName: 'Tomato',
      totalDaysToHarvest: 90,
      stages: [
        { stage: 'GERMINATION', label: 'Sprouting', startDay: 0, endDay: 10 },
        { stage: 'SEEDLING', label: 'Transplanting Seedling', startDay: 11, endDay: 25 },
        { stage: 'VEGETATIVE', label: 'Vegetative Canopy Growth', startDay: 26, endDay: 45 },
        { stage: 'FLOWERING', label: 'Flowering & Early Bloom', startDay: 46, endDay: 60 },
        { stage: 'FRUIT_DEVELOPMENT', label: 'Fruit Setting & Swelling', startDay: 61, endDay: 80 },
        { stage: 'MATURITY', label: 'Fruit Ripening & Harvesting', startDay: 81, endDay: 90 }
      ]
    },
    cotton: {
      cropName: 'Cotton',
      totalDaysToHarvest: 160,
      stages: [
        { stage: 'GERMINATION', label: 'Emergence', startDay: 0, endDay: 12 },
        { stage: 'SEEDLING', label: 'Square Formation', startDay: 13, endDay: 45 },
        { stage: 'VEGETATIVE', label: 'Vegetative Extension', startDay: 46, endDay: 75 },
        { stage: 'FLOWERING', label: 'Flowering & Boll Setting', startDay: 76, endDay: 110 },
        { stage: 'FRUIT_DEVELOPMENT', label: 'Boll Development & Opening', startDay: 111, endDay: 145 },
        { stage: 'MATURITY', label: 'Cotton Picking Maturity', startDay: 146, endDay: 160 }
      ]
    }
  };

  /**
   * Get Crop Growth Profile definition
   */
  static getCropProfile(cropName: string): CropGrowthProfile {
    const key = cropName.toLowerCase();
    return this.cropProfiles[key] || {
      cropName,
      totalDaysToHarvest: 100,
      stages: [
        { stage: 'GERMINATION', label: 'Germination', startDay: 0, endDay: 14 },
        { stage: 'SEEDLING', label: 'Seedling Stage', startDay: 15, endDay: 30 },
        { stage: 'VEGETATIVE', label: 'Vegetative Growth', startDay: 31, endDay: 60 },
        { stage: 'FLOWERING', label: 'Flowering', startDay: 61, endDay: 80 },
        { stage: 'MATURITY', label: 'Maturity', startDay: 81, endDay: 100 }
      ]
    };
  }

  /**
   * Estimate current growth stage from planting date and crop type
   */
  static estimateGrowthStage(cropName: string, plantingDate: Date): { stage: GrowthStage; label: string; daysSincePlanting: number; progressPct: number } {
    const now = new Date();
    const pDate = new Date(plantingDate);
    const diffTime = Math.max(0, now.getTime() - pDate.getTime());
    const daysSincePlanting = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const key = cropName.toLowerCase();
    const profile = this.cropProfiles[key] || {
      cropName,
      totalDaysToHarvest: 100,
      stages: [
        { stage: 'GERMINATION', label: 'Germination', startDay: 0, endDay: 14 },
        { stage: 'SEEDLING', label: 'Seedling Stage', startDay: 15, endDay: 30 },
        { stage: 'VEGETATIVE', label: 'Vegetative Growth', startDay: 31, endDay: 55 },
        { stage: 'FLOWERING', label: 'Flowering', startDay: 56, endDay: 75 },
        { stage: 'FRUIT_DEVELOPMENT', label: 'Fruit/Grain Development', startDay: 76, endDay: 90 },
        { stage: 'MATURITY', label: 'Maturity', startDay: 91, endDay: 100 }
      ]
    };

    const matched = profile.stages.find(s => daysSincePlanting >= s.startDay && daysSincePlanting <= s.endDay);
    const stage = matched ? matched.stage : (daysSincePlanting > profile.totalDaysToHarvest ? 'HARVEST' : 'VEGETATIVE');
    const label = matched ? matched.label : (daysSincePlanting > profile.totalDaysToHarvest ? 'Harvest Window' : 'Growth Phase');

    const progressPct = Math.min(100, Math.round((daysSincePlanting / profile.totalDaysToHarvest) * 100));

    return {
      stage,
      label,
      daysSincePlanting,
      progressPct
    };
  }

  /**
   * Estimate expected harvest date if not manually provided
   */
  static estimateExpectedHarvestDate(cropName: string, plantingDate: Date): Date {
    const key = cropName.toLowerCase();
    const profile = this.cropProfiles[key];
    const daysToHarvest = profile ? profile.totalDaysToHarvest : 100;

    const pDate = new Date(plantingDate);
    return new Date(pDate.getTime() + daysToHarvest * 24 * 60 * 60 * 1000);
  }
}
