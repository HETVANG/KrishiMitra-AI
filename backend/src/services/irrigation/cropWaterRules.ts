export interface CropWaterProfile {
  cropName: string;
  waterSensitivity: 'low' | 'medium' | 'high';
  criticalGrowthStages: string[];
  preferredMoistureRange: string;
  maxDryPeriodDays: number;
  notes: string;
}

const CROP_WATER_DATABASE: Record<string, CropWaterProfile> = {
  wheat: {
    cropName: 'Wheat',
    waterSensitivity: 'medium',
    criticalGrowthStages: ['Crown Root Initiation (CRI)', 'Flowering / Booting', 'Milking Stage'],
    preferredMoistureRange: '50% - 70% Field Capacity',
    maxDryPeriodDays: 12,
    notes: 'CRI stage (20-25 days after sowing) is most sensitive to moisture deficit.'
  },
  rice: {
    cropName: 'Rice / Paddy',
    waterSensitivity: 'high',
    criticalGrowthStages: ['Tillering', 'Panicle Initiation', 'Flowering'],
    preferredMoistureRange: '70% - 100% Saturation',
    maxDryPeriodDays: 3,
    notes: 'Requires continuous standing water or alternate wetting and drying during tillering.'
  },
  paddy: {
    cropName: 'Rice / Paddy',
    waterSensitivity: 'high',
    criticalGrowthStages: ['Tillering', 'Panicle Initiation', 'Flowering'],
    preferredMoistureRange: '70% - 100% Saturation',
    maxDryPeriodDays: 3,
    notes: 'Requires continuous standing water or alternate wetting and drying during tillering.'
  },
  tomato: {
    cropName: 'Tomato',
    waterSensitivity: 'high',
    criticalGrowthStages: ['Flowering', 'Fruit Setting', 'Fruit Enlargement'],
    preferredMoistureRange: '60% - 80% Field Capacity',
    maxDryPeriodDays: 5,
    notes: 'Irregular watering leads to blossom end rot and fruit cracking.'
  },
  cotton: {
    cropName: 'Cotton',
    waterSensitivity: 'medium',
    criticalGrowthStages: ['Square Formation', 'Boll Formation', 'Boll Development'],
    preferredMoistureRange: '50% - 65% Field Capacity',
    maxDryPeriodDays: 10,
    notes: 'Excess moisture during boll ripening retards boll opening.'
  },
  soybean: {
    cropName: 'Soybean',
    waterSensitivity: 'medium',
    criticalGrowthStages: ['Pod Initiation', 'Pod Filling'],
    preferredMoistureRange: '55% - 75% Field Capacity',
    maxDryPeriodDays: 7,
    notes: 'Pod filling stage requires reliable moisture for maximum oil & protein yield.'
  },
  maize: {
    cropName: 'Maize / Corn',
    waterSensitivity: 'high',
    criticalGrowthStages: ['Tasseling', 'Silking', 'Grain Filling'],
    preferredMoistureRange: '60% - 75% Field Capacity',
    maxDryPeriodDays: 6,
    notes: 'Water stress at silking can reduce grain yield by up to 40%.'
  },
  sugarcane: {
    cropName: 'Sugarcane',
    waterSensitivity: 'high',
    criticalGrowthStages: ['Formative Stage', 'Grand Growth Phase'],
    preferredMoistureRange: '65% - 85% Field Capacity',
    maxDryPeriodDays: 8,
    notes: 'High water requirement during vegetative tillering and stalk elongation.'
  },
  rose: {
    cropName: 'Rose',
    waterSensitivity: 'medium',
    criticalGrowthStages: ['Bud Development', 'Post-Pruning Growth'],
    preferredMoistureRange: '50% - 70% Field Capacity',
    maxDryPeriodDays: 4,
    notes: 'Deep loamy soil with morning drip irrigation prevents black spot fungus.'
  }
};

export class CropWaterRulesEngine {
  static getProfile(crop: string): CropWaterProfile {
    const key = (crop || 'general').toLowerCase().trim();
    return CROP_WATER_DATABASE[key] || {
      cropName: crop || 'General Crop',
      waterSensitivity: 'medium',
      criticalGrowthStages: ['Vegetative', 'Flowering', 'Fruit/Grain Setting'],
      preferredMoistureRange: '55% - 75% Field Capacity',
      maxDryPeriodDays: 7,
      notes: 'Maintain balanced root zone hydration and avoid soil over-saturation.'
    };
  }
}
