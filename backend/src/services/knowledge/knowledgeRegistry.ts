import { CropKnowledgeService } from './cropKnowledgeService';
import { DiseaseKnowledgeService } from './diseaseKnowledgeService';
import { PestKnowledgeService } from './pestKnowledgeService';
import { SoilKnowledgeService } from './soilKnowledgeService';
import { NutrientKnowledgeService } from './nutrientKnowledgeService';
import { AgriculturalPracticeService } from './agriculturalPracticeService';
import { KnowledgeSourceService } from './knowledgeSourceService';

export class KnowledgeRegistry {
  private static isInitialized = false;

  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    CropKnowledgeService.init();
    DiseaseKnowledgeService.init();
    PestKnowledgeService.init();
    SoilKnowledgeService.init();
    NutrientKnowledgeService.init();
    AgriculturalPracticeService.init();
  }

  static getSummary() {
    this.init();
    return {
      cropsCount: CropKnowledgeService.getAllCrops().length,
      diseasesCount: DiseaseKnowledgeService.getAllDiseases().length,
      pestsCount: PestKnowledgeService.getAllPests().length,
      soilsCount: SoilKnowledgeService.getAllSoils().length,
      nutrientsCount: NutrientKnowledgeService.getAllNutrients().length,
      practicesCount: AgriculturalPracticeService.getAllPractices().length,
      sourcesCount: KnowledgeSourceService.getAllSources().length
    };
  }
}
