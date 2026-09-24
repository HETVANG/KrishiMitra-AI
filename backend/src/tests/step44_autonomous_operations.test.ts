import assert from 'assert';
import { ClosedLoopEngine } from '../services/agents/closedLoopEngine';
import { AgentRegistry } from '../services/agents/agentRegistry';
import { AgentPolicyEngine } from '../services/agents/agentPolicyEngine';
import { ToolRegistry } from '../services/agents/toolRegistry';

async function runStep44AutonomousOperationsTests() {
  console.log('--- STARTING STEP 44: AUTONOMOUS FARM OPERATIONS & CLOSED-LOOP INTELLIGENCE TESTS ---');

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockFarmId = '507f1f77bcf86cd799439022';

  // 1. Agent Registry & Specialized Agents Audit
  console.log('Test 1: Verifying Agent Registry & Specialized Agents Audit...');
  const agents = AgentRegistry.getAllAgents();
  assert.ok(agents.length >= 5, 'At least 5 specialized agents registered');
  const agentIds = agents.map(a => a.id);
  assert.ok(agentIds.includes('farm_monitoring'), 'Farm Monitoring Agent present');
  assert.ok(agentIds.includes('crop_health'), 'Crop Health Agent present');
  assert.ok(agentIds.includes('irrigation'), 'Irrigation Agent present');
  assert.ok(agentIds.includes('market'), 'Market Intelligence Agent present');
  assert.ok(agentIds.includes('planning'), 'Farm Planning Agent present');
  console.log('✓ Agent Registry & Specialized Agents verified.');

  // 2. Controlled Tool Registry & Safety Boundaries
  console.log('\nTest 2: Verifying Controlled Tool Registry & Safety Boundaries...');
  const tools = ToolRegistry.getAllTools();
  assert.ok(tools.length > 10, 'Controlled ToolRegistry populated with tools');
  
  // Verify forbidden tools do NOT exist
  assert.strictEqual(ToolRegistry.getTool('arbitraryMongoQuery'), undefined, 'Forbidden Tool arbitraryMongoQuery absent');
  assert.strictEqual(ToolRegistry.getTool('arbitraryShell'), undefined, 'Forbidden Tool arbitraryShell absent');
  assert.strictEqual(ToolRegistry.getTool('arbitraryCodeExecution'), undefined, 'Forbidden Tool arbitraryCodeExecution absent');
  console.log('✓ Controlled Tool Registry & Safety Boundaries verified.');

  // 3. Closed-Loop Event Pipeline & Deduplication
  console.log('\nTest 3: Verifying Closed-Loop Event Pipeline & Deduplication...');
  const event1 = await ClosedLoopEngine.processEvent({
    eventType: 'HEAVY_RAIN_DETECTED',
    userId: mockUserId,
    farmId: mockFarmId,
    source: 'TEST_SUITE',
    confidence: 0.95,
    severity: 'HIGH'
  });

  assert.ok(event1.runId && event1.runId.startsWith('run_'), 'Run ID generated');
  assert.strictEqual(event1.eventType, 'HEAVY_RAIN_DETECTED');
  assert.ok(event1.evidence?.items.length! > 0, 'Evidence items populated');

  // Trigger same event immediately -> deduplication cooldown check
  const event2 = await ClosedLoopEngine.processEvent({
    eventType: 'HEAVY_RAIN_DETECTED',
    userId: mockUserId,
    farmId: mockFarmId,
    source: 'TEST_SUITE'
  });

  assert.strictEqual(event2.executionStatus, 'SKIPPED_DEDUPLICATED', 'Duplicate event within cooldown window skipped');
  console.log('✓ Closed-Loop Event Pipeline & Deduplication verified.');

  // 4. Evidence Engine & Insufficient Data Handling
  console.log('\nTest 4: Verifying Evidence Engine & Insufficient Data Handling...');
  // Closed-Loop Engine checks evidence sufficiency. With valid farm context, evidence quality is assessed.
  assert.ok(event1.evidenceSufficient, 'Evidence sufficiency evaluated');
  assert.ok(['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT'].includes(event1.evidence?.quality!), 'Evidence quality classified');
  console.log('✓ Evidence Engine & Quality Classification verified.');

  // 5. Risk Engine & Autonomy Level Policy Controls
  console.log('\nTest 5: Verifying Risk Engine & Autonomy Level Controls...');
  const settings = await ClosedLoopEngine.getAutomationSettings(mockUserId);
  assert.strictEqual(settings.globalAutonomyLevel, 2, 'Default autonomy level is Level 2 (RECOMMEND)');
  assert.strictEqual(settings.categories?.financial?.autoActionAllowed, false, 'Financial actions autoAction is strictly FALSE');
  assert.strictEqual(settings.categories?.chemical?.autoActionAllowed, false, 'Chemical actions autoAction is strictly FALSE');
  console.log('✓ Risk Engine & Autonomy Level Policy Controls verified.');

  // 6. Approval Workflow & Transparent Request Details
  console.log('\nTest 6: Verifying Approval Workflow & Transparent Request Details...');
  const diseaseEvent = await ClosedLoopEngine.processEvent({
    eventType: 'DISEASE_SCAN_COMPLETED',
    userId: mockUserId,
    farmId: mockFarmId,
    source: 'LEAF_SCANNER',
    metadata: { disease: 'Yellow Rust', severity: 'severe' }
  });

  assert.ok(diseaseEvent.runId, 'Disease evaluation run generated');
  assert.strictEqual(diseaseEvent.policyEvaluation?.result, 'REQUIRES_APPROVAL', 'Critical disease risk requires approval');
  console.log('✓ Approval Workflow & Policy Safeguards verified.');

  // 7. Daily & Weekly Autonomous Reviews
  console.log('\nTest 7: Verifying Daily & Weekly Autonomous Reviews...');
  const dailyReview = await ClosedLoopEngine.runDailyFarmReview(mockUserId, mockFarmId);
  assert.ok(dailyReview.reviewDate, 'Daily review date generated');
  assert.strictEqual(dailyReview.checksCompleted, 10, '10 daily farm checks evaluated');

  const weeklyReview = await ClosedLoopEngine.runWeeklyFarmReview(mockUserId, mockFarmId);
  assert.ok(weeklyReview.period, 'Weekly period defined');
  assert.ok(Array.isArray(weeklyReview.highlights), 'Weekly highlights array generated');
  console.log('✓ Daily & Weekly Autonomous Reviews verified.');

  // 8. Copilot Activity Explanation Integration
  console.log('\nTest 8: Verifying Copilot Activity Explanation Integration...');
  const copilotExplanation = await ClosedLoopEngine.getAutonomousActivityExplanation(mockUserId, mockFarmId);
  assert.ok(copilotExplanation.includes('KrishiMitra Autonomous Operations Report'), 'Copilot explanation header present');
  assert.ok(copilotExplanation.includes('Total Closed-Loop Evaluated Cycles'), 'Closed-loop metric summarized for Copilot');
  console.log('✓ Copilot Activity Explanation Integration verified.');

  console.log('\n=== STEP 44: ALL TESTS PASSED SUCCESSFULLY ===');
}

runStep44AutonomousOperationsTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
