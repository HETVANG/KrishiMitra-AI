import { KnowledgeRegistry } from './knowledgeRegistry';
import { CropKnowledgeService } from './cropKnowledgeService';
import { DiseaseKnowledgeService } from './diseaseKnowledgeService';
import { PestKnowledgeService } from './pestKnowledgeService';
import { SoilKnowledgeService } from './soilKnowledgeService';
import { NutrientKnowledgeService } from './nutrientKnowledgeService';
import { AgriculturalPracticeService } from './agriculturalPracticeService';
import { KnowledgeQueryFilter } from './knowledgeTypes';

export interface ComprehensiveKnowledgeResponse {
  success: boolean;
  queryFilter: KnowledgeQueryFilter;
  crop?: any;
  disease?: any;
  pest?: any;
  soil?: any;
  nutrient?: any;
  practices?: any[];
  searchResults?: any[];
  sources: any[];
}

export class KnowledgeRetrievalService {
  /**
   * Universal search across all agricultural knowledge domains
   */
  static searchKnowledge(queryFilter: KnowledgeQueryFilter): ComprehensiveKnowledgeResponse {
    KnowledgeRegistry.init();
    const query = queryFilter.search || '';

    const matchingCrops = queryFilter.crop ? [CropKnowledgeService.getCrop(queryFilter.crop)].filter(Boolean) : CropKnowledgeService.searchCrops(query);
    const matchingDiseases = queryFilter.disease ? [DiseaseKnowledgeService.getDisease(queryFilter.disease)].filter(Boolean) : DiseaseKnowledgeService.searchDiseases(query);
    const matchingPests = queryFilter.pest ? [PestKnowledgeService.getPest(queryFilter.pest)].filter(Boolean) : PestKnowledgeService.searchPests(query);
    const matchingSoils = queryFilter.soil ? [SoilKnowledgeService.getSoil(queryFilter.soil)].filter(Boolean) : SoilKnowledgeService.searchSoils(query);
    const matchingNutrients = queryFilter.nutrient ? [NutrientKnowledgeService.getNutrient(queryFilter.nutrient)].filter(Boolean) : NutrientKnowledgeService.searchNutrients(query);
    const matchingPractices = queryFilter.practiceCategory ? AgriculturalPracticeService.getPracticesByCategory(queryFilter.practiceCategory) : AgriculturalPracticeService.searchPractices(query);

    const allSources = new Map<string, any>();
    const collectSources = (item: any) => {
      if (item?.sources) {
        item.sources.forEach((s: any) => allSources.set(s.source, s));
      }
      if (item?.referenceSources) {
        item.referenceSources.forEach((s: any) => allSources.set(s.source, s));
      }
    };

    matchingCrops.forEach(collectSources);
    matchingDiseases.forEach(collectSources);
    matchingPests.forEach(collectSources);
    matchingSoils.forEach(collectSources);
    matchingNutrients.forEach(collectSources);
    matchingPractices.forEach(collectSources);

    return {
      success: true,
      queryFilter,
      crop: matchingCrops[0] || null,
      disease: matchingDiseases[0] || null,
      pest: matchingPests[0] || null,
      soil: matchingSoils[0] || null,
      nutrient: matchingNutrients[0] || null,
      practices: matchingPractices,
      searchResults: [
        ...matchingCrops.map(c => ({ type: 'crop', item: c })),
        ...matchingDiseases.map(d => ({ type: 'disease', item: d })),
        ...matchingPests.map(p => ({ type: 'pest', item: p })),
        ...matchingSoils.map(s => ({ type: 'soil', item: s })),
        ...matchingNutrients.map(n => ({ type: 'nutrient', item: n })),
        ...matchingPractices.map(pr => ({ type: 'practice', item: pr }))
      ],
      sources: Array.from(allSources.values())
    };
  }

  static getCropKnowledge(cropName: string) {
    KnowledgeRegistry.init();
    const crop = CropKnowledgeService.getCrop(cropName);
    return {
      success: !!crop,
      crop: crop || null,
      sources: crop?.sources || []
    };
  }

  static getDiseaseKnowledge(diseaseName: string) {
    KnowledgeRegistry.init();
    const disease = DiseaseKnowledgeService.getDisease(diseaseName);
    return {
      success: !!disease,
      disease: disease || null,
      sources: disease?.referenceSources || []
    };
  }

  static getPestKnowledge(pestName: string) {
    KnowledgeRegistry.init();
    const pest = PestKnowledgeService.getPest(pestName);
    return {
      success: !!pest,
      pest: pest || null,
      sources: pest?.sources || []
    };
  }

  static getSoilKnowledge(soilType: string) {
    KnowledgeRegistry.init();
    const soil = SoilKnowledgeService.getSoil(soilType);
    return {
      success: !!soil,
      soil: soil || null,
      sources: soil?.sources || []
    };
  }

  static getNutrientKnowledge(nutrientName: string) {
    KnowledgeRegistry.init();
    const nutrient = NutrientKnowledgeService.getNutrient(nutrientName);
    return {
      success: !!nutrient,
      nutrient: nutrient || null,
      sources: nutrient?.sources || []
    };
  }

  static getPracticeKnowledge(idOrCategory: string) {
    KnowledgeRegistry.init();
    const practice = AgriculturalPracticeService.getPractice(idOrCategory);
    const categoryPractices = practice ? [practice] : AgriculturalPracticeService.getPracticesByCategory(idOrCategory);
    return {
      success: categoryPractices.length > 0,
      practices: categoryPractices,
      sources: categoryPractices[0]?.sources || []
    };
  }
}
