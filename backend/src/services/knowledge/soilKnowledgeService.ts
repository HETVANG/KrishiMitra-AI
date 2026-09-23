import { SoilKnowledgeItem } from './knowledgeTypes';
import { KnowledgeSourceService } from './knowledgeSourceService';

export class SoilKnowledgeService {
  private static soils: Map<string, SoilKnowledgeItem> = new Map();

  static init() {
    if (this.soils.size > 0) return;

    const icarSource = KnowledgeSourceService.getSource('icar_official');

    // 1. Alluvial Soil
    this.soils.set('alluvial', {
      id: 'soil_alluvial',
      soilType: 'Alluvial Soil',
      phRange: { min: 6.0, max: 7.8, optimal: 6.8 },
      npkCharacteristics: {
        nitrogenStatus: 'Low to Moderate',
        phosphorusStatus: 'Adequate to Moderate',
        potassiumStatus: 'Rich in Potash'
      },
      organicMatter: 'Moderate (0.5% - 0.75%)',
      salinityRisk: 'Low (unless over-irrigated with canal water)',
      drainage: 'Good to moderate permeability',
      waterRetention: 'high',
      cropSuitability: ['Wheat', 'Rice', 'Sugarcane', 'Maize', 'Potato', 'Pulses'],
      deficiencyRelationships: ['Nitrogen deficiency common', 'Zinc deficiency in high pH patches'],
      sources: [icarSource]
    });

    // 2. Black Soil (Regur / Vertisol)
    this.soils.set('black', {
      id: 'soil_black',
      soilType: 'Black Soil (Regur)',
      phRange: { min: 7.2, max: 8.5, optimal: 7.8 },
      npkCharacteristics: {
        nitrogenStatus: 'Low',
        phosphorusStatus: 'Low',
        potassiumStatus: 'High to Very High'
      },
      organicMatter: 'Low to Moderate',
      salinityRisk: 'Moderate under poor drainage',
      drainage: 'Poor when wet (high swell-shrink montmorillonite clay)',
      waterRetention: 'very_high',
      cropSuitability: ['Cotton', 'Soybean', 'Groundnut', 'Wheat', 'Sorghum', 'Chickpea'],
      deficiencyRelationships: ['Nitrogen and Phosphorus deficiencies typical', 'Iron chlorosis in high lime areas'],
      sources: [icarSource]
    });

    // 3. Red & Yellow Soil
    this.soils.set('red', {
      id: 'soil_red',
      soilType: 'Red Soil',
      phRange: { min: 5.5, max: 6.8, optimal: 6.2 },
      npkCharacteristics: {
        nitrogenStatus: 'Low',
        phosphorusStatus: 'Low to Deficient',
        potassiumStatus: 'Moderate'
      },
      organicMatter: 'Low (<0.5%)',
      salinityRisk: 'Very Low',
      drainage: 'Excessive / rapid drainage',
      waterRetention: 'low',
      cropSuitability: ['Groundnut', 'Millets', 'Pulses', 'Maize', 'Potato'],
      deficiencyRelationships: ['Phosphate fixation risk due to Iron/Aluminum oxides', 'Lime application recommended if pH < 5.5'],
      sources: [icarSource]
    });
  }

  static getSoil(soilType: string): SoilKnowledgeItem | undefined {
    this.init();
    const key = soilType.trim().toLowerCase().replace(/\s+/g, '_');
    return this.soils.get(key) || Array.from(this.soils.values()).find(s => 
      s.soilType.toLowerCase().includes(soilType.toLowerCase())
    );
  }

  static getAllSoils(): SoilKnowledgeItem[] {
    this.init();
    return Array.from(this.soils.values());
  }

  static searchSoils(query: string): SoilKnowledgeItem[] {
    this.init();
    const q = query.trim().toLowerCase();
    return Array.from(this.soils.values()).filter(s => 
      s.soilType.toLowerCase().includes(q) ||
      s.cropSuitability.some(c => c.toLowerCase().includes(q))
    );
  }
}
