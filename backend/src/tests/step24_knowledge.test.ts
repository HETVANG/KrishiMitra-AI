import { KnowledgeRetrievalService } from '../services/knowledge/knowledgeRetrievalService';
import { CropKnowledgeService } from '../services/knowledge/cropKnowledgeService';
import { DiseaseKnowledgeService } from '../services/knowledge/diseaseKnowledgeService';
import { PestKnowledgeService } from '../services/knowledge/pestKnowledgeService';
import { SoilKnowledgeService } from '../services/knowledge/soilKnowledgeService';
import { NutrientKnowledgeService } from '../services/knowledge/nutrientKnowledgeService';
import { AgriculturalPracticeService } from '../services/knowledge/agriculturalPracticeService';
import { KnowledgeRegistry } from '../services/knowledge/knowledgeRegistry';
import { ToolRegistry } from '../services/agents/toolRegistry';

async function runStep24Tests() {
  console.log('--- RUNNING STEP 24 GLOBAL AGRICULTURE KNOWLEDGE TESTS ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Registry & Overview Summary
  const summary = KnowledgeRegistry.getSummary();
  assert(summary.cropsCount > 0, 'KnowledgeRegistry initialized crops');
  assert(summary.sourcesCount > 0, 'KnowledgeRegistry initialized verified sources');

  // 2. Crop Knowledge Retrieval
  const wheat = CropKnowledgeService.getCrop('wheat');
  assert(wheat !== undefined, 'Retrieved wheat crop profile');
  assert(wheat?.scientificName === 'Triticum aestivum', 'Wheat scientific name is Triticum aestivum');
  assert(wheat?.sources.length! > 0, 'Wheat contains verified sources');

  // 3. Disease Knowledge Retrieval
  const yellowRust = DiseaseKnowledgeService.getDisease('yellow_rust');
  assert(yellowRust !== undefined, 'Retrieved Yellow Rust disease profile');
  assert(yellowRust?.affectedCrops.includes('Wheat') === true, 'Yellow Rust affects Wheat');
  assert(yellowRust?.severity === 'severe', 'Yellow Rust severity is severe');

  // 4. Pest Knowledge Retrieval
  const pinkBollworm = PestKnowledgeService.getPest('pink_bollworm');
  assert(pinkBollworm !== undefined, 'Retrieved Pink Bollworm pest profile');
  assert(pinkBollworm?.affectedCrops.includes('Cotton') === true, 'Pink Bollworm affects Cotton');

  // 5. Soil Knowledge Retrieval
  const alluvial = SoilKnowledgeService.getSoil('alluvial');
  assert(alluvial !== undefined, 'Retrieved Alluvial soil profile');
  assert(alluvial?.cropSuitability.includes('Wheat') === true, 'Alluvial soil suitable for Wheat');

  // 6. Nutrient Knowledge Retrieval
  const nitrogen = NutrientKnowledgeService.getNutrient('nitrogen');
  assert(nitrogen !== undefined, 'Retrieved Nitrogen nutrient profile');
  assert(nitrogen?.deficiencySymptoms.length! > 0, 'Nitrogen has deficiency symptoms listed');

  // 7. Practice Retrieval
  const seedPrep = AgriculturalPracticeService.getPracticesByCategory('seed_preparation');
  assert(seedPrep.length > 0, 'Retrieved seed preparation agricultural practices');

  // 8. Knowledge Retrieval Service Universal Search
  const searchRes = KnowledgeRetrievalService.searchKnowledge({ search: 'rust' });
  assert(searchRes.success === true, 'Universal search query executed');
  assert(searchRes.disease !== null, 'Search query "rust" matched Yellow Rust disease');
  assert(searchRes.sources.length > 0, 'Search response exposes verified sources');

  // 9. Agent Tool Registry Execution
  const cropTool = ToolRegistry.getTool('getCropKnowledge');
  assert(cropTool !== undefined, 'getCropKnowledge agent tool registered in ToolRegistry');
  if (cropTool) {
    const toolExec = await cropTool.handler('user123', { crop: 'wheat' });
    assert(toolExec.success === true, 'getCropKnowledge agent tool executed successfully');
    assert(toolExec.result?.cropName === 'Wheat', 'Agent tool returned Wheat knowledge item');
  }

  console.log(`\nSTEP 24 TEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep24Tests();
