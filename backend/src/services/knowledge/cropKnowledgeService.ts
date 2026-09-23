import { CropKnowledgeItem } from './knowledgeTypes';
import { KnowledgeSourceService } from './knowledgeSourceService';

export class CropKnowledgeService {
  private static crops: Map<string, CropKnowledgeItem> = new Map();

  static init() {
    if (this.crops.size > 0) return;

    const icarSource = KnowledgeSourceService.getSource('icar_official');
    const faoSource = KnowledgeSourceService.getSource('fao_knowledge');

    // 1. Wheat (Triticum aestivum)
    this.crops.set('wheat', {
      id: 'crop_wheat',
      cropName: 'Wheat',
      scientificName: 'Triticum aestivum',
      commonNames: ['Wheat', 'Bread Wheat'],
      localNames: { hi: 'गेहूं', gu: 'ઘઉં', mr: 'गहू', pa: 'ਕਣਕ', bn: 'গম' },
      translations: { en: 'Wheat', hi: '게हूं', gu: 'ઘઉં' },
      category: 'cereal',
      growthStages: [
        { stageName: 'Germination & Crown Root Initiation', description: 'Crown roots form 20-25 days after sowing', startDay: 1, endDay: 25, waterNeed: 'critical', keyPractices: ['First irrigation at CRI stage', 'Weed check'] },
        { stageName: 'Tillering', description: 'Development of side shoots and tiller count', startDay: 26, endDay: 45, waterNeed: 'high', keyPractices: ['Top dressing Nitrogen fertilizer'] },
        { stageName: 'Jointing & Booting', description: 'Stem elongation and earhead formation', startDay: 46, endDay: 75, waterNeed: 'high', keyPractices: ['Monitor for rust symptoms'] },
        { stageName: 'Flowering & Grain Filling', description: 'Pollination and milk to dough stage', startDay: 76, endDay: 105, waterNeed: 'critical', keyPractices: ['Terminal irrigation', 'Protect from aphids'] },
        { stageName: 'Maturity & Harvest', description: 'Grains harden and moisture drops below 14%', startDay: 106, endDay: 135, waterNeed: 'low', keyPractices: ['Harvest at 12-14% grain moisture'] }
      ],
      climateRequirements: { minTempC: 10, maxTempC: 30, optimalTempC: 22, rainfallMinMm: 450, rainfallMaxMm: 650, sunlightHours: 8 },
      soilRequirements: { preferredTypes: ['Alluvial', 'Clay Loam', 'Loam'], minPh: 6.0, maxPh: 7.5, optimalPh: 6.8, drainageNeed: 'Well-drained soil with good water retention' },
      waterRequirements: { totalMm: 500, criticalStages: ['Crown Root Initiation', 'Flowering', 'Milk stage'], irrigationMethod: 'Check basin or Sprinkler' },
      nutrientRequirements: { nKgPerHectare: 120, pKgPerHectare: 60, kKgPerHectare: 40, micronutrientNotes: 'Zinc deficiency common in calcareous soils; apply Zinc Sulfate baseline' },
      plantingInformation: { sowingSeason: ['Rabi (Nov-Dec)'], seedRateKgPerHectare: 100, rowSpacingCm: 22.5, plantSpacingCm: 5 },
      harvestingInformation: { maturityDays: 130, maturityIndicators: ['Golden yellow straw', 'Hardened grain'], moisturePercent: 12 },
      regionalAvailability: ['IN', 'US', 'EU'],
      sources: [icarSource, faoSource]
    });

    // 2. Rice / Paddy (Oryza sativa)
    this.crops.set('rice', {
      id: 'crop_rice',
      cropName: 'Rice',
      scientificName: 'Oryza sativa',
      commonNames: ['Rice', 'Paddy'],
      localNames: { hi: 'धान / चावल', gu: 'ચોખા', mr: 'भात', pa: 'ਝੋਨਾ', bn: 'ধান' },
      translations: { en: 'Rice', hi: 'धान', gu: 'ચોખા' },
      category: 'cereal',
      growthStages: [
        { stageName: 'Nursery & Germination', description: 'Seedling development in nursery bed', startDay: 1, endDay: 25, waterNeed: 'high', keyPractices: ['Treat seed with Trichoderma', 'Maintain shallow water layer'] },
        { stageName: 'Transplanting & Active Tillering', description: 'Transplanting to main field and tiller multiplication', startDay: 26, endDay: 55, waterNeed: 'critical', keyPractices: ['Maintain 2-5 cm standing water', 'Apply basal NPK'] },
        { stageName: 'Panicle Initiation & Booting', description: 'Panicle formation inside leaf sheath', startDay: 56, endDay: 85, waterNeed: 'critical', keyPractices: ['Keep field continuously moist', 'Monitor for stem borer'] },
        { stageName: 'Heading & Grain Filling', description: 'Emergence of panicles and milky kernel filling', startDay: 86, endDay: 115, waterNeed: 'high', keyPractices: ['Prevent moisture stress during flowering'] },
        { stageName: 'Maturity & Harvest', description: 'Panicles turn golden yellow', startDay: 116, endDay: 140, waterNeed: 'low', keyPractices: ['Drain field 10 days prior to harvest'] }
      ],
      climateRequirements: { minTempC: 20, maxTempC: 38, optimalTempC: 30, rainfallMinMm: 1000, rainfallMaxMm: 1500, sunlightHours: 7 },
      soilRequirements: { preferredTypes: ['Clay', 'Clay Loam', 'Alluvial'], minPh: 5.5, maxPh: 7.0, optimalPh: 6.5, drainageNeed: 'Impermeable subsoil to hold standing water' },
      waterRequirements: { totalMm: 1200, criticalStages: ['Transplanting', 'Panicle Initiation', 'Flowering'], irrigationMethod: 'Flooding / Alternate Wetting and Drying (AWD)' },
      nutrientRequirements: { nKgPerHectare: 120, pKgPerHectare: 60, kKgPerHectare: 60, micronutrientNotes: 'Khaira disease caused by Zinc deficiency; apply Zinc Sulfate in nursery and main field' },
      plantingInformation: { sowingSeason: ['Kharif (June-July)', 'Rabi/Summer (Nov-Dec)'], seedRateKgPerHectare: 40, rowSpacingCm: 20, plantSpacingCm: 15 },
      harvestingInformation: { maturityDays: 135, maturityIndicators: ['80% panicles turn golden', 'Grains hard in lower part of panicle'], moisturePercent: 20 },
      regionalAvailability: ['IN', 'BR'],
      sources: [icarSource, faoSource]
    });

    // 3. Cotton (Gossypium hirsutum)
    this.crops.set('cotton', {
      id: 'crop_cotton',
      cropName: 'Cotton',
      scientificName: 'Gossypium hirsutum',
      commonNames: ['Cotton', 'Bt Cotton'],
      localNames: { hi: 'कपास', gu: 'કપાસ', mr: 'कापूस', pa: 'ਕਪਾਹ' },
      translations: { en: 'Cotton', hi: 'कपास', gu: 'કપાસ' },
      category: 'fiber',
      growthStages: [
        { stageName: 'Germination & Seedling', description: 'Cotyledon emergence and root establishment', startDay: 1, endDay: 30, waterNeed: 'moderate', keyPractices: ['Gap filling', 'Thinning to single plant'] },
        { stageName: 'Square Formation & Branching', description: 'Appearance of floral buds (squares)', startDay: 31, endDay: 65, waterNeed: 'high', keyPractices: ['Inter-cultivation for weed control'] },
        { stageName: 'Flowering & Boll Formation', description: 'White/pink blooms and boll development', startDay: 66, endDay: 110, waterNeed: 'critical', keyPractices: ['Monitor for Pink Bollworm & sucking pests'] },
        { stageName: 'Boll Bursting & Harvesting', description: 'Bolls open exposing white fiber', startDay: 111, endDay: 160, waterNeed: 'low', keyPractices: ['Pick clean dry cotton bolls'] }
      ],
      climateRequirements: { minTempC: 18, maxTempC: 38, optimalTempC: 30, rainfallMinMm: 500, rainfallMaxMm: 800, sunlightHours: 9 },
      soilRequirements: { preferredTypes: ['Black Soil (Regur)', 'Deep Clay', 'Alluvial'], minPh: 6.5, maxPh: 8.0, optimalPh: 7.2, drainageNeed: 'Deep well-drained soil' },
      waterRequirements: { totalMm: 700, criticalStages: ['Square Formation', 'Boll Development'], irrigationMethod: 'Drip or Furrow' },
      nutrientRequirements: { nKgPerHectare: 100, pKgPerHectare: 50, kKgPerHectare: 50, micronutrientNotes: 'Foliar spray of Magnesium Sulfate & Boron during boll development' },
      plantingInformation: { sowingSeason: ['Kharif (May-June)'], seedRateKgPerHectare: 2.5, rowSpacingCm: 90, plantSpacingCm: 60 },
      harvestingInformation: { maturityDays: 160, maturityIndicators: ['Fully opened fluffy bolls'], moisturePercent: 8 },
      regionalAvailability: ['IN', 'US', 'BR'],
      sources: [icarSource]
    });
  }

  static getCrop(cropName: string): CropKnowledgeItem | undefined {
    this.init();
    const key = cropName.trim().toLowerCase();
    return this.crops.get(key);
  }

  static getAllCrops(): CropKnowledgeItem[] {
    this.init();
    return Array.from(this.crops.values());
  }

  static searchCrops(query: string): CropKnowledgeItem[] {
    this.init();
    const q = query.trim().toLowerCase();
    return Array.from(this.crops.values()).filter(c => 
      c.cropName.toLowerCase().includes(q) ||
      c.scientificName.toLowerCase().includes(q) ||
      c.commonNames.some(cn => cn.toLowerCase().includes(q))
    );
  }
}
