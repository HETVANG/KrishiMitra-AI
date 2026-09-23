import { PestKnowledgeItem } from './knowledgeTypes';
import { KnowledgeSourceService } from './knowledgeSourceService';

export class PestKnowledgeService {
  private static pests: Map<string, PestKnowledgeItem> = new Map();

  static init() {
    if (this.pests.size > 0) return;

    const icarSource = KnowledgeSourceService.getSource('icar_official');
    const kvkSource = KnowledgeSourceService.getSource('kvk_extension');

    // 1. Pink Bollworm (Pectinophora gossypiella)
    this.pests.set('pink_bollworm', {
      id: 'pest_pink_bollworm',
      pestName: 'Pink Bollworm',
      scientificName: 'Pectinophora gossypiella',
      affectedCrops: ['Cotton'],
      symptoms: [
        '"Rosetted" flowers (petals tied together)',
        'Small entry holes in green bolls',
        'Stained lint and damaged seeds inside bolls'
      ],
      riskConditions: [
        'Monoculture of cotton over extended seasons',
        'Warm dry weather during boll formation',
        'Delay in crop termination'
      ],
      lifeCycleInfo: 'Eggs laid on bolls/squares -> Larvae bore into boll -> Pupation in soil/litter (25-30 day cycle)',
      prevention: [
        'Install Pheromone traps (5-8 traps/hectare) for monitoring adult moth activity',
        'Maintain crop window; terminate crop by December to break pest cycle',
        'Deep autumn plowing to expose overwintering pupae'
      ],
      management: [
        'Release Trichogramma egg parasitoids',
        'Spray Neem seed kernel extract (NSKE 5%) upon reaching Economic Threshold Level (ETL: 8 adult moths/trap/night for 3 consecutive days)'
      ],
      regionalRelevance: ['IN'],
      sources: [icarSource, kvkSource]
    });

    // 2. Yellow Stem Borer (Scirpophaga incertulas)
    this.pests.set('stem_borer', {
      id: 'pest_stem_borer',
      pestName: 'Rice Stem Borer',
      scientificName: 'Scirpophaga incertulas',
      affectedCrops: ['Rice', 'Paddy'],
      symptoms: [
        '"Dead hearts" (drying of central tiller shoot in vegetative stage)',
        '"White ears" (empty white panicles at flowering stage)',
        'Holes in lower stem with frass output'
      ],
      riskConditions: [
        'High Nitrogen fertilizer application',
        'Continuous standing water without intermittent drainage',
        'Late planting'
      ],
      lifeCycleInfo: 'Moth lays egg masses covered with hair on leaf tips -> Larvae bore into stem (35-45 day cycle)',
      prevention: [
        'Clip leaf tips of seedlings before transplanting to remove egg masses',
        'Set up light traps (1 trap/hectare) to catch adult moths',
        'Balance Nitrogen with adequate Potassium'
      ],
      management: [
        'Release Trichogramma japonicum parasitoids',
        'Adopt alternate wetting and drying of field'
      ],
      regionalRelevance: ['IN'],
      sources: [icarSource]
    });
  }

  static getPest(pestKey: string): PestKnowledgeItem | undefined {
    this.init();
    const key = pestKey.trim().toLowerCase().replace(/\s+/g, '_');
    return this.pests.get(key) || Array.from(this.pests.values()).find(p => 
      p.pestName.toLowerCase().includes(pestKey.toLowerCase())
    );
  }

  static getAllPests(): PestKnowledgeItem[] {
    this.init();
    return Array.from(this.pests.values());
  }

  static searchPests(query: string): PestKnowledgeItem[] {
    this.init();
    const q = query.trim().toLowerCase();
    return Array.from(this.pests.values()).filter(p => 
      p.pestName.toLowerCase().includes(q) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(q)) ||
      p.affectedCrops.some(c => c.toLowerCase().includes(q))
    );
  }
}
