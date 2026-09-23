import { DecisionEvidenceEngine } from '../services/decisionEngine/decisionEvidenceEngine';
import { DecisionRuleEngine } from '../services/decisionEngine/decisionRuleEngine';
import { DecisionRiskEngine } from '../services/decisionEngine/decisionRiskEngine';
import { DecisionConfidenceEngine } from '../services/decisionEngine/decisionConfidenceEngine';
import { DecisionOptionsEngine } from '../services/decisionEngine/decisionOptionsEngine';
import { ToolRegistry } from '../services/agents/toolRegistry';
import { NormalizedFarmGraphContext } from '../services/knowledgeGraph/graphTypes';

async function runStep26Tests() {
  console.log('--- RUNNING STEP 26 ADVANCED AI DECISION ENGINE TESTS ---');

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

  // Build sample mock NormalizedFarmGraphContext
  const mockGraph: NormalizedFarmGraphContext = {
    user: { id: 'user123', name: 'Ramesh Patel', role: 'FARMER', country: 'IN' },
    farm: {
      id: 'farm123',
      name: 'Green Field Farm',
      sizeAcres: 5,
      soilType: 'Black Soil',
      waterSource: 'Canal',
      location: {
        address: 'Anand, Gujarat',
        village: 'Anand',
        district: 'Anand',
        state: 'Gujarat',
        latitude: 22.56,
        longitude: 72.93
      }
    },
    fields: [
      { id: 'field1', name: 'North Field', sizeAcres: 3, soilType: 'Black Soil', waterSource: 'Canal', irrigationType: 'Drip', status: 'ACTIVE' }
    ],
    activeCropCycles: [
      {
        id: 'cycle1',
        cropName: 'Cotton',
        variety: 'Bt Cotton',
        currentStage: 'Vegetative',
        fieldId: 'field1',
        fieldName: 'North Field',
        plantingDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        ageInDays: 40
      }
    ],
    soilContext: {
      available: true,
      ph: 7.2,
      nitrogen: 45,
      phosphorus: 25,
      potassium: 180,
      organicMatter: 0.6,
      freshness: {
        observedAt: new Date().toISOString(),
        freshness: 'FRESH',
        confidence: 0.95,
        source: 'SOIL_ANALYSIS'
      }
    },
    weatherContext: {
      available: true,
      tempCelsius: 38, // Heat stress condition
      humidity: 75,
      rainProbability: 65, // Heavy rain forecast >= 60%
      condition: 'Rainy',
      windSpeed: 12,
      freshness: {
        observedAt: new Date().toISOString(),
        freshness: 'FRESH',
        confidence: 0.95,
        source: 'WEATHER_PROVIDER'
      }
    },
    irrigationContext: {
      waterAttentionNeeded: true,
      reason: 'Scheduled irrigation window arriving.',
      recommendedAction: 'Apply drip irrigation.'
    },
    diseaseContext: {
      available: true,
      scansCount: 1,
      latestDiagnosis: {
        disease: 'Pink Bollworm',
        crop: 'Cotton',
        severity: 'severe',
        confidenceScore: 0.88,
        createdAt: new Date().toISOString()
      },
      freshness: {
        observedAt: new Date().toISOString(),
        freshness: 'FRESH',
        confidence: 0.9,
        source: 'DISEASE_SCAN'
      }
    },
    marketContext: {
      available: true,
      commodity: 'Cotton',
      price: 7200,
      marketName: 'Anand APMC',
      trend: 'UPWARD',
      freshness: {
        observedAt: new Date().toISOString(),
        freshness: 'FRESH',
        confidence: 0.9,
        source: 'MARKET_PROVIDER'
      }
    },
    taskContext: {
      pendingTasksCount: 1,
      urgentTasks: []
    },
    regionalContext: {
      countryCode: 'IN',
      countryName: 'India',
      state: 'Gujarat',
      currency: { code: 'INR', symbol: '₹' },
      units: { temperature: 'CELSIUS', landArea: 'ACRE' }
    } as any,
    freshnessMap: {}
  };

  // 1. Evidence Engine Test
  const evidence = DecisionEvidenceEngine.extractEvidence(mockGraph);
  assert(evidence.length > 0, 'Evidence Engine extracts non-empty evidence array');
  const weatherEvidence = evidence.find(e => e.sourceType === 'WEATHER_PROVIDER');
  assert(weatherEvidence !== undefined, 'Evidence Engine tags WEATHER_PROVIDER evidence correctly');

  // 2. Deterministic Rule Engine Test
  const rules = DecisionRuleEngine.evaluateRules(mockGraph);
  assert(rules.length >= 2, 'Rule Engine evaluates rules and returns multiple matches (Rainfall Hold & Pathology Escalation)');
  const rainRule = rules.find(r => r.ruleId === 'rule_rain_irrigation_hold');
  assert(rainRule !== undefined, 'rule_rain_irrigation_hold rule fires when rain probability >= 60%');

  const severePathologyRule = rules.find(r => r.ruleId === 'rule_severe_disease_expert');
  assert(severePathologyRule !== undefined, 'rule_severe_disease_expert rule fires on severe pink bollworm scan');

  // 3. Multi-factor Risk Engine Test
  const risks = DecisionRiskEngine.evaluateRisks(mockGraph, evidence);
  assert(risks.length > 0, 'Risk Engine evaluates multi-factor risk categories');
  const diseaseRisk = risks.find(r => r.category === 'DISEASE');
  assert(diseaseRisk?.riskLevel === 'CRITICAL' || diseaseRisk?.riskLevel === 'HIGH', 'Severe pathology registers HIGH or CRITICAL risk');

  // 4. Confidence & Missing Data Engine Test
  const confidenceEval = DecisionConfidenceEngine.evaluateConfidence(mockGraph, evidence);
  assert(confidenceEval.isInsufficient === false, 'Complete mock graph evaluates to sufficient data (isInsufficient = false)');
  assert(confidenceEval.confidence === 'HIGH', 'Fresh telemetry data computes HIGH decision confidence');

  // Insufficient Data Test (missing farm location coordinates)
  const incompleteGraph: NormalizedFarmGraphContext = {
    user: mockGraph.user,
    farm: {
      ...mockGraph.farm,
      location: { ...mockGraph.farm.location, latitude: null, longitude: null }
    },
    fields: [],
    activeCropCycles: [],
    soilContext: { available: false, ph: null, nitrogen: null, phosphorus: null, potassium: null, organicMatter: null, freshness: { observedAt: '', freshness: 'UNKNOWN', confidence: 0, source: 'SOIL_ANALYSIS' } },
    weatherContext: { available: false, tempCelsius: null, condition: null, humidity: null, rainProbability: null, windSpeed: null, freshness: { observedAt: '', freshness: 'UNKNOWN', confidence: 0, source: 'WEATHER_PROVIDER' } },
    irrigationContext: { waterAttentionNeeded: false, reason: '', recommendedAction: '' },
    diseaseContext: { available: false, scansCount: 0, latestDiagnosis: null, freshness: { observedAt: '', freshness: 'UNKNOWN', confidence: 0, source: 'DISEASE_SCAN' } },
    marketContext: { available: false, commodity: '', price: null, marketName: null, trend: null, freshness: { observedAt: '', freshness: 'UNKNOWN', confidence: 0, source: 'MARKET_PROVIDER' } },
    taskContext: { pendingTasksCount: 0, urgentTasks: [] },
    freshnessMap: {}
  };
  const incompleteEval = DecisionConfidenceEngine.evaluateConfidence(incompleteGraph, []);
  assert(incompleteEval.isInsufficient === true, 'Incomplete farm graph correctly triggers isInsufficient = true');
  assert(incompleteEval.missingData.length >= 1, 'Missing critical parameters are identified in missingData array');

  // 5. Options Engine Test
  const options = DecisionOptionsEngine.generateOptions(mockGraph, rules);
  assert(options.length >= 2, 'Options Engine generates structured A/B/C options');
  assert(options[0].id === 'opt_a_monitor', 'Primary option is generated correctly');

  // 6. Agent Tool Registry Integration Test
  const evalTool = ToolRegistry.getTool('evaluateDecision');
  assert(evalTool !== undefined, 'evaluateDecision agent tool is registered in ToolRegistry');
  assert(evalTool?.permission === 'READ_ONLY', 'evaluateDecision tool permission is classified READ_ONLY');

  const historyTool = ToolRegistry.getTool('getDecisionHistory');
  assert(historyTool !== undefined, 'getDecisionHistory agent tool is registered in ToolRegistry');

  console.log(`\nSTEP 26 TEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep26Tests();
