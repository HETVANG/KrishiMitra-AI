import { DiseaseKnowledgeItem } from './knowledgeTypes';
import { KnowledgeSourceService } from './knowledgeSourceService';

export class DiseaseKnowledgeService {
  private static diseases: Map<string, DiseaseKnowledgeItem> = new Map();

  static init() {
    if (this.diseases.size > 0) return;

    const icarSource = KnowledgeSourceService.getSource('icar_official');
    const tnauSource = KnowledgeSourceService.getSource('tnau_agritech');

    // 1. Yellow Rust / Stripe Rust (Puccinia striiformis)
    this.diseases.set('yellow_rust', {
      id: 'disease_yellow_rust',
      diseaseName: 'Yellow Rust / Stripe Rust',
      scientificName: 'Puccinia striiformis',
      affectedCrops: ['Wheat', 'Barley'],
      symptoms: [
        'Bright yellow pustules arranged in linear stripes along leaf veins',
        'Dusty yellow spore powder on fingers when touching leaf',
        'Premature drying of leaf lamina'
      ],
      riskFactors: [
        'Cool humid weather during jointing to tillering stage',
        'Continuous overcast skies with intermittent dew',
        'Susceptible crop varieties'
      ],
      environmentalConditions: {
        tempMinC: 8,
        tempMaxC: 18,
        humidityMinPercent: 85,
        conduciveWeather: 'Cool temperatures (10-15°C) with high relative humidity and dew'
      },
      growthStageRelationship: ['Tillering', 'Jointing', 'Booting'],
      severity: 'severe',
      prevention: [
        'Sow rust-resistant varieties recommended for the region',
        'Avoid excessive Nitrogen fertilizer application',
        'Maintain recommended row spacing for air circulation'
      ],
      management: [
        'Inspect fields weekly during cool winter months',
        'Spray recommended bio-agent or systemic fungicide upon first sign of stripe pustules as per regional agricultural extension guidelines'
      ],
      referenceSources: [icarSource]
    });

    // 2. Leaf Blast (Magnaporthe oryzae)
    this.diseases.set('rice_leaf_blast', {
      id: 'disease_rice_leaf_blast',
      diseaseName: 'Rice Leaf Blast',
      scientificName: 'Magnaporthe oryzae',
      affectedCrops: ['Rice', 'Paddy'],
      symptoms: [
        'Spindle-shaped or eye-shaped lesions with brown margins and greyish center',
        'Lesions coalesce causing complete drying of leaves ("burnt" appearance)',
        'Nodal and neck rot in later stages'
      ],
      riskFactors: [
        'High nitrogen application',
        'Night temperatures between 19-24°C with high relative humidity (>90%)',
        'Dense canopy and prolonged leaf wetness'
      ],
      environmentalConditions: {
        tempMinC: 19,
        tempMaxC: 28,
        humidityMinPercent: 90,
        conduciveWeather: 'Cloudy weather, frequent rain showers, and cool night temperature'
      },
      growthStageRelationship: ['Nursery', 'Active Tillering', 'Panicle Initiation'],
      severity: 'high',
      prevention: [
        'Treat seeds with Trichoderma harzianum or Pseudomonas fluorescens',
        'Apply Nitrogen in split doses instead of a single heavy dose',
        'Destroy infected crop residue after harvest'
      ],
      management: [
        'Maintain proper field water level',
        'Apply recommended copper/bio-fungicide upon early lesion detection under extension guidance'
      ],
      referenceSources: [icarSource, tnauSource]
    });

    // 3. Early Blight (Alternaria solani)
    this.diseases.set('early_blight', {
      id: 'disease_early_blight',
      diseaseName: 'Early Blight',
      scientificName: 'Alternaria solani',
      affectedCrops: ['Potato', 'Tomato'],
      symptoms: [
        'Concentric dark brown to black rings forming "target board" spots on older leaves',
        'Yellow halo surrounding leaf lesions',
        'Leaf drop and stem collar rot'
      ],
      riskFactors: [
        'Warm dry weather alternating with wet cloudy periods',
        'Plant nutrient stress or low soil fertility',
        'Over-crowded plant spacing'
      ],
      environmentalConditions: {
        tempMinC: 20,
        tempMaxC: 30,
        humidityMinPercent: 80,
        conduciveWeather: 'Warm days with high humidity or heavy dew'
      },
      growthStageRelationship: ['Tuber / Fruit Initiation', 'Vegetative Growth'],
      severity: 'moderate',
      prevention: [
        'Adopt 2-3 year crop rotation with non-solanaceous crops',
        'Remove lower infected leaves near soil level',
        'Use drip irrigation to keep foliage dry'
      ],
      management: [
        'Apply neem-based organic formulation or protective bio-fungicide at early spot stage'
      ],
      referenceSources: [icarSource, tnauSource]
    });
  }

  static getDisease(diseaseKey: string): DiseaseKnowledgeItem | undefined {
    this.init();
    const key = diseaseKey.trim().toLowerCase().replace(/\s+/g, '_');
    return this.diseases.get(key) || Array.from(this.diseases.values()).find(d => 
      d.diseaseName.toLowerCase().includes(diseaseKey.toLowerCase())
    );
  }

  static getAllDiseases(): DiseaseKnowledgeItem[] {
    this.init();
    return Array.from(this.diseases.values());
  }

  static searchDiseases(query: string): DiseaseKnowledgeItem[] {
    this.init();
    const q = query.trim().toLowerCase();
    return Array.from(this.diseases.values()).filter(d => 
      d.diseaseName.toLowerCase().includes(q) ||
      (d.scientificName && d.scientificName.toLowerCase().includes(q)) ||
      d.affectedCrops.some(c => c.toLowerCase().includes(q))
    );
  }
}
