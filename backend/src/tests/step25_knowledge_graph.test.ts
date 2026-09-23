import { RelationshipResolver } from '../services/knowledgeGraph/relationshipResolver';
import { ToolRegistry } from '../services/agents/toolRegistry';

async function runStep25Tests() {
  console.log('--- RUNNING STEP 25 FARM DATA & KNOWLEDGE GRAPH TESTS ---');

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

  // 1. Freshness Calculation Tests
  const freshMeta = RelationshipResolver.calculateFreshness(new Date(), 'WEATHER_PROVIDER', 12, 48);
  assert(freshMeta.freshness === 'FRESH', 'Recent timestamp resolves to FRESH data freshness');
  assert(freshMeta.confidence >= 0.9, 'FRESH data has high confidence >= 0.9');

  const staleDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const staleMeta = RelationshipResolver.calculateFreshness(staleDate, 'SOIL_ANALYSIS', 24, 168);
  assert(staleMeta.freshness === 'STALE', '30-day old timestamp resolves to STALE data freshness');

  const nullMeta = RelationshipResolver.calculateFreshness(null, 'DISEASE_SCAN');
  assert(nullMeta.freshness === 'UNKNOWN', 'Null timestamp resolves to UNKNOWN data freshness');

  // 2. Crop Age Calculation
  const plantingDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
  const cropAge = RelationshipResolver.calculateCropAgeInDays(plantingDate);
  assert(cropAge === 45, 'Planting date 45 days ago calculates age as 45 days');

  // 3. Agent Tool Registry Verification
  const graphTool = ToolRegistry.getTool('getFarmGraph');
  assert(graphTool !== undefined, 'getFarmGraph agent tool registered in ToolRegistry');

  const cropContextTool = ToolRegistry.getTool('getCropContext');
  assert(cropContextTool !== undefined, 'getCropContext agent tool registered in ToolRegistry');

  const risksTool = ToolRegistry.getTool('getFarmRisks');
  assert(risksTool !== undefined, 'getFarmRisks agent tool registered in ToolRegistry');

  console.log(`\nSTEP 25 TEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep25Tests();
