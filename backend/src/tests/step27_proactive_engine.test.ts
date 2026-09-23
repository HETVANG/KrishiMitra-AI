import { EventDetector } from '../services/proactive/eventDetector';
import { EventDeduplicator } from '../services/proactive/eventDeduplicator';
import { EventPrioritizer } from '../services/proactive/eventPrioritizer';
import { NotificationPolicyEngine } from '../services/proactive/notificationPolicy';
import { ToolRegistry } from '../services/agents/toolRegistry';
import { NormalizedFarmGraphContext } from '../services/knowledgeGraph/graphTypes';
import { ProactiveEvent } from '../services/proactive/proactiveEventTypes';

async function runStep27Tests() {
  console.log('--- RUNNING STEP 27 PROACTIVE FARM INTELLIGENCE & NOTIFICATION ENGINE TESTS ---');

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

  // Sample mock NormalizedFarmGraphContext
  const mockGraph: NormalizedFarmGraphContext = {
    user: { id: '507f1f77bcf86cd799439011', name: 'Ramesh Patel', role: 'FARMER', country: 'IN' },
    farm: {
      id: '507f1f77bcf86cd799439012',
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
      tempCelsius: 39, // Heat risk >= 38
      humidity: 75,
      rainProbability: 75, // Heavy rain >= 60
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
    freshnessMap: {}
  };

  // 1. Event Detector Test
  const events = EventDetector.detectEvents(mockGraph);
  assert(events.length >= 3, 'EventDetector identifies multiple proactive events (Rain, Heat, Disease, Water)');
  
  const rainEvent = events.find(e => e.eventType === 'HEAVY_RAIN_DETECTED');
  assert(rainEvent !== undefined, 'HEAVY_RAIN_DETECTED event generated when rain probability >= 60%');
  assert(rainEvent?.category === 'IRRIGATION_DECISION', 'Heavy rain event maps to IRRIGATION_DECISION category');

  const heatEvent = events.find(e => e.eventType === 'HEAT_RISK_DETECTED');
  assert(heatEvent !== undefined, 'HEAT_RISK_DETECTED event generated when temp >= 38°C');

  const diseaseEvent = events.find(e => e.eventType === 'DISEASE_RISK_INCREASED');
  assert(diseaseEvent !== undefined, 'DISEASE_RISK_INCREASED event generated on severe scan');

  // 2. Event Prioritizer Test
  if (rainEvent) {
    const priority = EventPrioritizer.prioritize(rainEvent);
    assert(priority === 'HIGH' || priority === 'CRITICAL' || priority === 'MEDIUM', 'EventPrioritizer calculates non-empty priority');
  }

  // 3. Notification Policy Test
  const dummyEvent: ProactiveEvent = {
    eventId: 'evt_test_1',
    eventType: 'HEAVY_RAIN_DETECTED',
    userId: '507f1f77bcf86cd799439011',
    farmId: '507f1f77bcf86cd799439012',
    source: 'WEATHER_PROVIDER',
    severity: 'HIGH',
    priority: 'HIGH',
    evidence: [],
    context: {},
    detectedAt: new Date().toISOString(),
    observedAt: new Date().toISOString(),
    freshness: 'FRESH',
    confidence: 0.9,
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    status: 'DETECTED',
    fingerprint: 'farm123_test_fp',
    title: 'Heavy Rain Forecast',
    summary: 'Rain expected.',
    category: 'IRRIGATION_DECISION'
  };

  const policyRes = await NotificationPolicyEngine.evaluatePolicy(dummyEvent);
  assert(policyRes.shouldNotify === true, 'NotificationPolicyEngine permits default notification');

  // 4. Agent Tool Registry Test
  const evalTool = ToolRegistry.getTool('evaluateProactiveEvents');
  assert(evalTool !== undefined, 'evaluateProactiveEvents agent tool registered in ToolRegistry');
  assert(evalTool?.permission === 'READ_ONLY', 'evaluateProactiveEvents tool is classified READ_ONLY');

  const briefTool = ToolRegistry.getTool('getDailyFarmBrief');
  assert(briefTool !== undefined, 'getDailyFarmBrief agent tool registered in ToolRegistry');

  console.log(`\nSTEP 27 TEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep27Tests();
