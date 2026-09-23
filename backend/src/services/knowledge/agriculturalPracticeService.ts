import { AgriculturalPracticeItem } from './knowledgeTypes';
import { KnowledgeSourceService } from './knowledgeSourceService';

export class AgriculturalPracticeService {
  private static practices: Map<string, AgriculturalPracticeItem> = new Map();

  static init() {
    if (this.practices.size > 0) return;

    const icarSource = KnowledgeSourceService.getSource('icar_official');

    // 1. Seed Treatment
    this.practices.set('seed_treatment', {
      id: 'practice_seed_treatment',
      title: 'Integrated Seed Treatment & Bio-priming',
      category: 'seed_preparation',
      description: 'Treating seeds prior to sowing to prevent seed-borne pathogens, soil-borne fungi, and promote uniform germination.',
      steps: [
        'Clean seeds to remove chaff and underdeveloped seeds',
        'Soak or treat with Trichoderma viride (4-5g/kg seed) or Pseudomonas fluorescens for biological protection',
        'Inoculate legume seeds with Rhizobium culture and cereal seeds with Azotobacter/Azospirillum prior to sowing',
        'Shade dry treated seeds for 30 minutes before sowing'
      ],
      applicableCrops: ['Wheat', 'Rice', 'Chickpea', 'Cotton', 'Soybean'],
      regionalNotes: { IN: 'Follow ICAR-KVK recommended bio-agent dosages based on seed lot weight.' },
      sources: [icarSource]
    });

    // 2. Drip Irrigation Scheduling
    this.practices.set('drip_irrigation', {
      id: 'practice_drip_irrigation',
      title: 'Precision Drip & Fertigation Management',
      category: 'irrigation',
      description: 'Delivering water and soluble nutrients directly to plant root zone to maximize water use efficiency (WUE).',
      steps: [
        'Check drip emitters weekly for clogging or bio-film buildup',
        'Schedule irrigation frequency based on soil moisture and crop evapotranspiration (ETc)',
        'Apply water-soluble fertilizers through fertigation venturi injector during middle 50% of irrigation cycle',
        'Flush lateral lines fortnightly with clean water'
      ],
      applicableCrops: ['Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Maize'],
      regionalNotes: { IN: 'Utilize PMKSY (Pradhan Mantri Krishi Sinchayee Yojana) micro-irrigation guidelines.' },
      sources: [icarSource]
    });

    // 3. Post-Harvest Grain Storage
    this.practices.set('post_harvest_storage', {
      id: 'practice_post_harvest_storage',
      title: 'Safe Grain Moisture Management & Hermetic Storage',
      category: 'post_harvest',
      description: 'Drying harvested grain to safe moisture thresholds before bagging or bin storage to prevent mold and storage pests.',
      steps: [
        'Sun-dry harvested grain until moisture content drops below 12% for Wheat/Rice',
        'Clean storage structures and seal cracks to eliminate pest harborages',
        'Store in hermetic bags (Purdue Improved Crop Storage - PICS) or metal bins',
        'Keep bags on wooden pallets 20 cm above floor away from walls'
      ],
      applicableCrops: ['Wheat', 'Rice', 'Maize', 'Pulses'],
      regionalNotes: { IN: 'Follow FCI (Food Corporation of India) grain storage standards.' },
      sources: [icarSource]
    });
  }

  static getPractice(id: string): AgriculturalPracticeItem | undefined {
    this.init();
    return this.practices.get(id);
  }

  static getPracticesByCategory(category: string): AgriculturalPracticeItem[] {
    this.init();
    return Array.from(this.practices.values()).filter(p => p.category === category);
  }

  static getAllPractices(): AgriculturalPracticeItem[] {
    this.init();
    return Array.from(this.practices.values());
  }

  static searchPractices(query: string): AgriculturalPracticeItem[] {
    this.init();
    const q = query.trim().toLowerCase();
    return Array.from(this.practices.values()).filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.applicableCrops.some(c => c.toLowerCase().includes(q))
    );
  }
}
