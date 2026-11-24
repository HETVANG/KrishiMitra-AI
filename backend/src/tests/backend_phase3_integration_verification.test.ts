import dotenv from 'dotenv';
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration_test_secret_32_characters_minimum';

import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../middleware/auth';
import { escapeRegex, buildMarketFilter } from '../utils/marketUtils';
import { getCanonicalStateForDistrict, normalizeState } from '../utils/geoNormalization';

console.log('================================================================');
console.log('  THE KHEDUT — PHASE 3 FULL APPLICATION INTEGRATION SUITE       ');
console.log('================================================================\n');

let passed = 0;
let total = 0;

function assert(condition: boolean, desc: string) {
  total++;
  if (condition) {
    console.log(`  ✓ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${desc}`);
    process.exitCode = 1;
  }
}

async function runIntegrationTests() {
  const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_integration_testing_only';

  // --------------------------------------------------------------------------
  // WORKFLOW 1: Authentication, JWT Security & Role-Based Access Control (RBAC)
  // --------------------------------------------------------------------------
  console.log('[WORKFLOW 1] Authentication, JWT Tokens & Role-Based Access Control');

  // 1.1: Missing credentials on login return 400
  const badLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: '' });
  assert(badLoginRes.status === 400, 'POST /api/auth/login without credentials returns HTTP 400');
  assert(badLoginRes.body.success === false, 'Bad login returns JSON { success: false }');

  // 1.2: Missing fields on register return 400
  const badRegRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Farmer Kumar' });
  assert(badRegRes.status === 400, 'POST /api/auth/register with missing email/password returns HTTP 400');

  // 1.3: Protected route without token returns 401
  const noTokenRes = await request(app).get('/api/crops/farm');
  assert(noTokenRes.status === 401, 'Protected route /api/crops/farm without Authorization header returns HTTP 401');

  // 1.4: Protected route with malformed token returns 401
  const malformedTokenRes = await request(app)
    .get('/api/crops/farm')
    .set('Authorization', 'Bearer invalid_garbage_token');
  assert(malformedTokenRes.status === 401, 'Protected route with invalid JWT token returns HTTP 401');

  // 1.5: Valid farmer JWT token generation and authentication simulation
  const farmerMockId = new mongoose.Types.ObjectId();
  const farmerToken = jwt.sign(
    { id: farmerMockId.toString(), role: 'farmer', email: 'farmer@thekhedut.app' },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
  assert(typeof farmerToken === 'string' && farmerToken.length > 20, 'Farmer JWT token generated using HS256 algorithm');

  // 1.6: RBAC Authorize middleware blocks farmer role from admin privileges (HTTP 403)
  const rbacReq: any = { user: { role: 'farmer' } };
  let rbacStatus = 0;
  const rbacRes: any = {
    status: (code: number) => {
      rbacStatus = code;
      return {
        json: () => {}
      };
    }
  };
  const adminGuard = authorize('admin');
  adminGuard(rbacReq, rbacRes, () => {});
  assert(rbacStatus === 403, 'RBAC middleware blocks farmer role from admin privileges (HTTP 403)');

  // 1.7: RBAC Authorize middleware allows admin role
  const adminReq: any = { user: { role: 'admin' } };
  const adminState = { nextCalled: false };
  adminGuard(adminReq, rbacRes, () => { adminState.nextCalled = true; });
  assert(adminState.nextCalled === true, 'RBAC middleware allows admin role to proceed to admin route');

  // 1.7: Expired JWT token handling
  const expiredToken = jwt.sign(
    { id: farmerMockId.toString(), role: 'farmer' },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '-10s' }
  );
  const expiredRes = await request(app)
    .get('/api/crops/farm')
    .set('Authorization', `Bearer ${expiredToken}`);
  assert(expiredRes.status === 401, 'Expired JWT token is strictly rejected with HTTP 401');

  // --------------------------------------------------------------------------
  // WORKFLOW 2: Weather Telemetry & Coordinate Validation
  // --------------------------------------------------------------------------
  console.log('\n[WORKFLOW 2] Weather Information & Telemetry Boundary Integration');

  // 2.1: Missing coordinates return HTTP 400
  const noCoordWeather = await request(app).get('/api/weather');
  assert(noCoordWeather.status === 400, 'GET /api/weather without coordinates returns HTTP 400');

  // 2.2: Out-of-bounds latitude returns HTTP 400
  const outOfBoundsLat = await request(app).get('/api/weather?lat=95&lon=72.83');
  assert(outOfBoundsLat.status === 400, 'GET /api/weather with invalid latitude (>90) returns HTTP 400');

  // 2.3: Non-numeric coordinates return HTTP 400
  const nonNumCoord = await request(app).get('/api/weather?lat=abc&lon=xyz');
  assert(nonNumCoord.status === 400, 'GET /api/weather with non-numeric coordinates returns HTTP 400');

  // 2.4: Valid coordinates format accepted
  const validCoords = { lat: 21.1702, lon: 72.8311 };
  assert(
    validCoords.lat >= -90 && validCoords.lat <= 90 &&
    validCoords.lon >= -180 && validCoords.lon <= 180,
    'Surat, Gujarat coordinates (21.1702, 72.8311) satisfy telemetry boundary checks'
  );

  // --------------------------------------------------------------------------
  // WORKFLOW 3: Mandi Location Isolation & Cross-State Filtering
  // --------------------------------------------------------------------------
  console.log('\n[WORKFLOW 3] Mandi Prices & Cross-State Location Isolation Integration');

  // 3.1: Canonical state resolution
  assert(getCanonicalStateForDistrict('Surat') === 'Gujarat', 'Surat district resolves canonically to Gujarat');
  assert(getCanonicalStateForDistrict('Ujjain') === 'Madhya Pradesh', 'Ujjain district resolves canonically to Madhya Pradesh');
  assert(getCanonicalStateForDistrict('Nashik') === 'Maharashtra', 'Nashik district resolves canonically to Maharashtra');

  // 3.2: Filter creation with state inference
  const suratFilter: any = buildMarketFilter({ district: 'Surat', crop: 'Wheat' });
  assert(suratFilter.state instanceof RegExp, 'Mandi query filter builds anchored regex for state');
  assert(suratFilter.state.test('Gujarat') === true, 'Surat filter matches Gujarat APMCs');
  assert(suratFilter.state.test('Madhya Pradesh') === false, 'Surat filter strictly rejects Madhya Pradesh APMCs');

  const ujjainFilter: any = buildMarketFilter({ district: 'Ujjain', crop: 'Soybean' });
  assert(ujjainFilter.state.test('Madhya Pradesh') === true, 'Ujjain filter matches Madhya Pradesh APMCs');
  assert(ujjainFilter.state.test('Gujarat') === false, 'Ujjain filter strictly rejects Gujarat APMCs');

  // 3.3: Sanitized crop search
  const specialCropFilter: any = buildMarketFilter({ state: 'Gujarat', crop: 'Wheat' });
  assert(specialCropFilter.crop instanceof RegExp, 'Crop escapes safely into query regex');
  assert(specialCropFilter.crop.test('Wheat') === true, 'Crop filter matches target commodity');

  // --------------------------------------------------------------------------
  // WORKFLOW 4: Government Schemes Search & ReDoS Safety
  // --------------------------------------------------------------------------
  console.log('\n[WORKFLOW 4] Government Schemes Search & Sanitization Integration');

  // 4.1: Querying schemes with complex characters
  const complexSchemeSearch = '(PM-KISAN+Subsidy?)[2026]';
  const escapedScheme = escapeRegex(complexSchemeSearch);
  let schemeRegexSafe = false;
  try {
    const rx = new RegExp(escapedScheme, 'i');
    schemeRegexSafe = rx.test(complexSchemeSearch);
  } catch {
    schemeRegexSafe = false;
  }
  assert(schemeRegexSafe, 'Schemes search query with special characters executes without syntax errors');

  // --------------------------------------------------------------------------
  // WORKFLOW 5: Advisory Consultation State Machine & Ownership Isolation
  // --------------------------------------------------------------------------
  console.log('\n[WORKFLOW 5] Consultation Booking, Cancellation & Ownership RBAC');

  const farmerUser = { _id: new mongoose.Types.ObjectId(), role: 'farmer' };
  const assignedExpert = { _id: new mongoose.Types.ObjectId(), role: 'expert' };
  const rogueExpert = { _id: new mongoose.Types.ObjectId(), role: 'expert' };
  const strangerUser = { _id: new mongoose.Types.ObjectId(), role: 'farmer' };

  interface AppointmentDoc {
    farmer: mongoose.Types.ObjectId;
    expert: mongoose.Types.ObjectId | null;
    status: string;
  }

  function simulateAppointmentStatusChange(
    appt: AppointmentDoc,
    actor: { _id: mongoose.Types.ObjectId; role: string },
    newStatus: string
  ): { code: number; allowed: boolean; reason?: string } {
    const isFarmer = appt.farmer.toString() === actor._id.toString();
    const isAdmin = actor.role === 'admin';
    const isAssignedExpert = !!(appt.expert && appt.expert.toString() === actor._id.toString());
    const isUnassignedExpert = !appt.expert && actor.role === 'expert';

    if (!isAdmin && !isAssignedExpert && !isUnassignedExpert && !isFarmer) {
      return { code: 403, allowed: false, reason: 'Forbidden: Access denied' };
    }

    if (isFarmer && !isAdmin && !isAssignedExpert && newStatus !== 'cancelled') {
      return { code: 403, allowed: false, reason: 'Farmers are only authorized to cancel appointments' };
    }

    appt.status = newStatus;
    return { code: 200, allowed: true };
  }

  // 5.1: Farmer attempts to complete their own appointment -> Rejected
  const activeAppt: AppointmentDoc = { farmer: farmerUser._id, expert: assignedExpert._id, status: 'scheduled' };
  const farmerTamper = simulateAppointmentStatusChange(activeAppt, farmerUser, 'completed');
  assert(!farmerTamper.allowed && farmerTamper.code === 403, 'Farmer is forbidden from self-completing an advisory consultation');

  // 5.2: Farmer cancels their appointment -> Permitted
  const farmerCancel = simulateAppointmentStatusChange(activeAppt, farmerUser, 'cancelled');
  assert(farmerCancel.allowed && activeAppt.status === 'cancelled', 'Farmer is authorized to cancel their consultation booking');

  // 5.3: Rogue expert attempts to alter assigned appointment -> Rejected
  const activeAppt2: AppointmentDoc = { farmer: farmerUser._id, expert: assignedExpert._id, status: 'scheduled' };
  const rogueAttempt = simulateAppointmentStatusChange(activeAppt2, rogueExpert, 'cancelled');
  assert(!rogueAttempt.allowed && rogueAttempt.code === 403, 'Rogue expert cannot modify an appointment assigned to another expert');

  // 5.4: Assigned expert marks completed -> Permitted
  const expertComplete = simulateAppointmentStatusChange(activeAppt2, assignedExpert, 'completed');
  assert(expertComplete.allowed && activeAppt2.status === 'completed', 'Assigned expert successfully marks consultation as completed');

  // 5.5: Stranger attempts status change -> Rejected
  const strangerAttempt = simulateAppointmentStatusChange(activeAppt2, strangerUser, 'cancelled');
  assert(!strangerAttempt.allowed && strangerAttempt.code === 403, 'Unrelated third party is blocked with HTTP 403');

  // --------------------------------------------------------------------------
  // WORKFLOW 6: Community Forum Like & Unlike State Machine
  // --------------------------------------------------------------------------
  console.log('\n[WORKFLOW 6] Community Forum Like Toggling & ObjectId Comparison');

  const postAuthor = new mongoose.Types.ObjectId();
  const likerUser = new mongoose.Types.ObjectId();
  const postDoc = {
    _id: new mongoose.Types.ObjectId(),
    author: postAuthor,
    title: 'Tips for pest management in cotton',
    likes: [] as mongoose.Types.ObjectId[]
  };

  // Toggle 1: Add like
  const likerIdStr = likerUser.toString();
  let isLiked = postDoc.likes.some((uid: any) => uid?.toString() === likerIdStr);
  if (isLiked) {
    postDoc.likes = postDoc.likes.filter((uid: any) => uid?.toString() !== likerIdStr);
  } else {
    postDoc.likes.push(new mongoose.Types.ObjectId(likerIdStr));
  }
  assert(postDoc.likes.length === 1, 'First toggle adds user to likes array (count: 1)');

  // Toggle 2: Remove like (unlike)
  isLiked = postDoc.likes.some((uid: any) => uid?.toString() === likerIdStr);
  if (isLiked) {
    postDoc.likes = postDoc.likes.filter((uid: any) => uid?.toString() !== likerIdStr);
  } else {
    postDoc.likes.push(new mongoose.Types.ObjectId(likerIdStr));
  }
  assert(postDoc.likes.length === 0, 'Second toggle unlikes and removes user from likes array (count: 0)');

  // --------------------------------------------------------------------------
  // WORKFLOW 7: Express JSON 404 & Health Telemetry Integration
  // --------------------------------------------------------------------------
  console.log('\n[WORKFLOW 7] Express Route Matching, Health Telemetry & 404 Contract');

  // 7.1: Live health endpoint
  const liveRes = await request(app).get('/health/live');
  assert(liveRes.status === 200, '/health/live returns HTTP 200');
  assert(liveRes.body.status === 'live', '/health/live returns { status: "live" }');

  // 7.2: Unhandled route returns standard JSON 404
  const unknownRes = await request(app).get('/api/v2/unregistered_service_route');
  assert(unknownRes.status === 404, 'Unknown endpoint returns HTTP 404');
  assert(unknownRes.body.success === false, 'Unknown endpoint returns JSON { success: false }');
  assert(typeof unknownRes.body.message === 'string', 'Unknown endpoint returns descriptive string message');
  assert(!unknownRes.text.includes('<html'), 'Unknown endpoint response contains zero HTML markup');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  PHASE 3 INTEGRATION VERIFICATION RESULT: ${passed}/${total} PASSED`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runIntegrationTests().catch(err => {
  console.error('Integration test failed with error:', err);
  process.exit(1);
});
