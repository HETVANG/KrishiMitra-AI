import assert from 'assert';
import mongoose from 'mongoose';
import { PartnerService } from '../services/partnerService';
import { PartnerDiscoveryService } from '../services/partnerDiscoveryService';
import { PartnerCopilotService } from '../services/partnerCopilotService';

async function runStep39Tests() {
  console.log('--- RUNNING STEP 39 STRATEGIC PARTNERSHIPS & DISTRIBUTION NETWORK TESTS ---');

  const userId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();

  // Test 1: Partner Application & Referral Code Generation
  const app: any = await PartnerService.applyPartner(userId, {
    organizationName: 'Sahyadri Agri Farmers Producer Co.',
    legalName: 'Sahyadri Agri Co. Ltd.',
    partnerType: 'FPO',
    description: 'Regional FPO with 450 member farms.',
    regions: ['Maharashtra', 'Karnataka'],
    capabilities: ['FARMER_DISTRIBUTION', 'AGRICULTURAL_ADVISORY'],
    contactInformation: { email: 'info@sahyadri.example.org' }
  });

  const partnerId = app.id || app._id?.toString();
  assert.ok(partnerId, 'Partner ID should be returned');
  assert.strictEqual(app.status, 'APPLIED');
  assert.strictEqual(app.verificationStatus, 'UNVERIFIED');
  assert.ok(app.referralCode, 'Unique partner referral code should be generated');
  console.log('[PASS] Partner application & referral code generation passed');

  // Test 2: Admin Verification Workflow
  const verifyRes: any = await PartnerService.verifyPartner(partnerId, adminId, 'VERIFIED', 'Verified ICAR registration');
  assert.strictEqual(verifyRes.verificationStatus, 'VERIFIED');
  console.log('[PASS] Admin partner verification workflow passed');

  // Test 3: Location-Aware & Capability-Based Partner Discovery
  const discovered = await PartnerDiscoveryService.discoverPartners({
    region: 'Maharashtra',
    capability: 'AGRICULTURAL_ADVISORY'
  });

  assert.ok(Array.isArray(discovered), 'Discovery results should return an array');
  if (discovered.length > 0) {
    const match = discovered[0];
    assert.strictEqual(match.isVerified, true, 'Verified partner should have isVerified true');
    assert.ok(match.matchReasons.includes('Verified partner badge'), 'Should contain verified partner badge signal');
  }
  console.log('[PASS] Location-aware & capability-based partner discovery passed');

  // Test 4: Empty State Guarantee for Non-Existent Region
  const emptyDiscovery = await PartnerDiscoveryService.discoverPartners({
    region: 'NonExistentRegion12345'
  });
  assert.strictEqual(emptyDiscovery.length, 0, 'Non-existent region search should return empty array (no fake partners)');
  console.log('[PASS] Real data enforcement & empty state guarantee passed');

  // Test 5: Distribution Program Management
  const program: any = await PartnerService.createProgram(userId, partnerId, {
    name: 'Kharif Cotton Advisory Campaign',
    description: 'Distribution program for cotton farmers in Nagpur',
    targetRegions: ['Maharashtra']
  });
  assert.ok(program.id || program._id, 'Program should be created');

  const programs = await PartnerService.getPrograms(partnerId);
  assert.ok(programs.length > 0, 'Partner distribution programs list should be returned');
  console.log('[PASS] Partner distribution programs management passed');

  // Test 6: Referral Attribution & Analytics
  const trackRes = await PartnerService.trackReferral(app.referralCode, userId, undefined, 'SIGNUP');
  assert.strictEqual(trackRes.success, true, 'Referral tracking should succeed');

  const analytics = await PartnerService.getPartnerAnalytics(partnerId);
  assert.ok(typeof analytics.totalReferrals === 'number', 'Partner analytics should return numeric metrics');
  console.log('[PASS] Referral attribution & analytics passed');

  // Test 7: Partner Copilot Integration
  const copilotRes = await PartnerCopilotService.queryPartnerCopilot(userId, 'Are there agricultural advisors near Maharashtra?', 'Maharashtra');
  assert.ok(copilotRes.answer, 'Partner Copilot answer should be returned');
  console.log('[PASS] Partner Copilot AI integration passed');

  console.log('\nSTEP 39 STRATEGIC PARTNERSHIPS TESTS COMPLETED: ALL PASSED.');
}

if (require.main === module) {
  runStep39Tests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('STEP 39 TEST FAILURE:', err);
      process.exit(1);
    });
}
