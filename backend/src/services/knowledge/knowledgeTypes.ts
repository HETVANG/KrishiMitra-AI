export interface KnowledgeSource {
  source: string;
  sourceType: 'official_gov' | 'extension_service' | 'university_research' | 'verified_agronomic_db';
  sourceUrl?: string;
  publisher: string;
  publishedAt?: string;
  verifiedAt: string;
  version: string;
  region: string;
  confidence: 'high' | 'verified' | 'moderate';
}

export interface CropGrowthStage {
  stageName: string;
  description: string;
  startDay: number;
  endDay: number;
  waterNeed: 'low' | 'moderate' | 'high' | 'critical';
  keyPractices: string[];
}

export interface CropKnowledgeItem {
  id: string;
  cropName: string;
  scientificName: string;
  commonNames: string[];
  localNames: Record<string, string>; // e.g. { hi: 'गेहूं', gu: 'ઘઉં' }
  translations: Record<string, string>;
  category: 'cereal' | 'pulse' | 'oilseed' | 'cash_crop' | 'fiber' | 'vegetable' | 'fruit' | 'spice';
  growthStages: CropGrowthStage[];
  climateRequirements: {
    minTempC: number;
    maxTempC: number;
    optimalTempC: number;
    rainfallMinMm: number;
    rainfallMaxMm: number;
    sunlightHours: number;
  };
  soilRequirements: {
    preferredTypes: string[];
    minPh: number;
    maxPh: number;
    optimalPh: number;
    drainageNeed: string;
  };
  waterRequirements: {
    totalMm: number;
    criticalStages: string[];
    irrigationMethod: string;
  };
  nutrientRequirements: {
    nKgPerHectare: number;
    pKgPerHectare: number;
    kKgPerHectare: number;
    micronutrientNotes: string;
  };
  plantingInformation: {
    sowingSeason: string[];
    seedRateKgPerHectare: number;
    rowSpacingCm: number;
    plantSpacingCm: number;
  };
  harvestingInformation: {
    maturityDays: number;
    maturityIndicators: string[];
    moisturePercent: number;
  };
  regionalAvailability: string[];
  sources: KnowledgeSource[];
}

export interface DiseaseKnowledgeItem {
  id: string;
  diseaseName: string;
  scientificName?: string;
  affectedCrops: string[];
  symptoms: string[];
  riskFactors: string[];
  environmentalConditions: {
    tempMinC?: number;
    tempMaxC?: number;
    humidityMinPercent?: number;
    conduciveWeather: string;
  };
  growthStageRelationship: string[];
  severity: 'low' | 'moderate' | 'high' | 'severe';
  prevention: string[];
  management: string[];
  referenceSources: KnowledgeSource[];
}

export interface PestKnowledgeItem {
  id: string;
  pestName: string;
  scientificName?: string;
  affectedCrops: string[];
  symptoms: string[];
  riskConditions: string[];
  lifeCycleInfo: string;
  prevention: string[];
  management: string[];
  regionalRelevance: string[];
  sources: KnowledgeSource[];
}

export interface SoilKnowledgeItem {
  id: string;
  soilType: string;
  phRange: { min: number; max: number; optimal: number };
  npkCharacteristics: {
    nitrogenStatus: string;
    phosphorusStatus: string;
    potassiumStatus: string;
  };
  organicMatter: string;
  salinityRisk: string;
  drainage: string;
  waterRetention: 'low' | 'moderate' | 'high' | 'very_high';
  cropSuitability: string[];
  deficiencyRelationships: string[];
  sources: KnowledgeSource[];
}

export interface NutrientKnowledgeItem {
  id: string;
  nutrientName: string;
  category: 'macro' | 'micro';
  role: string;
  deficiencySymptoms: string[];
  excessSymptoms: string[];
  cropRelationships: string[];
  soilRelationships: string[];
  managementGuidance: string[];
  sources: KnowledgeSource[];
}

export interface AgriculturalPracticeItem {
  id: string;
  title: string;
  category: 'planting' | 'seed_preparation' | 'irrigation' | 'fertilization' | 'weed_management' | 'crop_protection' | 'harvesting' | 'post_harvest';
  description: string;
  steps: string[];
  applicableCrops: string[];
  regionalNotes: Record<string, string>;
  sources: KnowledgeSource[];
}

export interface KnowledgeQueryFilter {
  crop?: string;
  disease?: string;
  pest?: string;
  soil?: string;
  nutrient?: string;
  practiceCategory?: string;
  region?: string;
  country?: string;
  growthStage?: string;
  language?: string;
  knowledgeType?: string;
  search?: string;
}
