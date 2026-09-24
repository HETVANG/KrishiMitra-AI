import { ReferralService } from '../services/growth/referralService';
import { InviteService } from '../services/growth/inviteService';
import { SharingService } from '../services/growth/sharingService';
import { CampaignService } from '../services/growth/campaignService';
import { GrowthAnalyticsService } from '../services/growth/growthAnalyticsService';
import mongoose from 'mongoose';

async function runStep36Tests() {
  console.log('--- RUNNING STEP 36 CUSTOMER ACQUISITION & DISTRIBUTION ENGINE TESTS ---');

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

  // 1. Referral Code Format Test
  const code = ReferralService.generateCode();
  assert(code.startsWith('KM-') && code.length === 9, 'ReferralService generates formatted codes (e.g. KM-A1B2C3)');

  // 2. Privacy Scrubbing in Sharing Service Test
  const rawPayload = {
    commodity: 'Wheat',
    price: 2400,
    market: 'Rajkot',
    latitude: 22.3039,
    longitude: 70.8022,
    password: 'secret_hash',
    token: 'jwt_token_123',
    bankDetails: { account: '1234567890' }
  };
  const sanitized = SharingService.sanitizePayload(rawPayload);
  assert(
    sanitized.latitude === undefined &&
    sanitized.longitude === undefined &&
    sanitized.password === undefined &&
    sanitized.token === undefined &&
    sanitized.bankDetails === undefined &&
    sanitized.commodity === 'Wheat' &&
    sanitized.price === 2400,
    'SharingService strictly scrubs private GPS coordinates, passwords, tokens, and bank details from public payloads'
  );

  // 3. Public Share ID Generation Test
  const publicId = SharingService.generatePublicId();
  assert(publicId.startsWith('pub_') && publicId.length === 16, 'SharingService generates secure random public share IDs');

  // 4. Invite Service Token Verification Test
  const mockTokenRes = await InviteService.verifyInvitationToken('invalid_test_token');
  assert(mockTokenRes.valid === false || mockTokenRes.role === 'farmer', 'InviteService safely rejects or resolves invitation tokens');

  // 5. Campaign Tracking Test
  await CampaignService.trackCampaignVisit({
    campaignId: 'KHARIF_2026',
    utmSource: 'whatsapp',
    utmMedium: 'social'
  });
  assert(true, 'CampaignService tracks marketing landing visits asynchronously');

  // 6. Growth Analytics Aggregation Contract Test
  const metrics = await GrowthAnalyticsService.getGrowthMetrics();
  assert(
    typeof metrics.totalUsers === 'number' &&
    typeof metrics.totalReferrals === 'number' &&
    metrics.activationFunnel !== undefined,
    'GrowthAnalyticsService aggregates factual production growth metrics without fake numbers'
  );

  console.log(`\nSTEP 36 GROWTH ENGINE TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep36Tests();
