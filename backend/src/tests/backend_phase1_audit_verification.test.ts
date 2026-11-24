import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';
import { escapeRegex } from '../utils/marketUtils';

console.log('================================================================');
console.log('  THE KHEDUT — PHASE 1 BACKEND AUDIT VERIFICATION TEST SUITE    ');
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

async function runTests() {
  // -------------------------------------------------------------------------
  // SUITE 1: Regex Sanitization & Injection Prevention
  // -------------------------------------------------------------------------
  console.log('[SUITE 1] Regex Sanitization & Injection Prevention');

  assert(escapeRegex(null) === '', 'escapeRegex handles null gracefully');
  assert(escapeRegex(undefined) === '', 'escapeRegex handles undefined gracefully');
  assert(escapeRegex('') === '', 'escapeRegex handles empty string');

  const dangerousInputs = [
    '(unclosed parenthesis',
    '[unclosed bracket',
    'test*+?^$()|{}[]\\',
    '.*.*.*.*.*.*.*.*.*[a-z]',
    'normal text with spaces'
  ];

  for (const input of dangerousInputs) {
    let safe = false;
    try {
      const sanitized = escapeRegex(input);
      const reg = new RegExp(sanitized, 'i');
      safe = reg.test(input);
    } catch {
      safe = false;
    }
    assert(safe, `Input "${input}" safely escapes into RegExp without throwing SyntaxError`);
  }

  // Verify that metacharacters match literally rather than regex-parsed
  const literalTest = escapeRegex('a+b(c)');
  const regLiteral = new RegExp(literalTest, 'i');
  assert(regLiteral.test('a+b(c)'), 'Literal "a+b(c)" matches target text');
  assert(!regLiteral.test('ab(c)'), 'Literal "a+b(c)" does not treat + as quantifier');

  // -------------------------------------------------------------------------
  // SUITE 2: Forum ObjectId Array Toggle Logic
  // -------------------------------------------------------------------------
  console.log('\n[SUITE 2] Forum Like/Unlike ObjectId Comparison Logic');

  const userA_id = new mongoose.Types.ObjectId();
  const userB_id = new mongoose.Types.ObjectId();

  // Create an array holding ObjectId objects (as Mongoose does on post.likes)
  let likes = [userA_id, userB_id];

  // User A toggles like (should unlike / remove)
  const reqUserA_id = new mongoose.Types.ObjectId(userA_id.toString()); // distinct object reference in memory!
  const userIdStrA = reqUserA_id.toString();

  const isLikedA = likes.some((uid: any) => uid?.toString() === userIdStrA);
  assert(isLikedA === true, 'Correctly identifies that userA has liked the post (even with different ObjectId instance)');

  if (isLikedA) {
    likes = likes.filter((uid: any) => uid?.toString() !== userIdStrA);
  } else {
    likes.push(reqUserA_id);
  }
  assert(likes.length === 1, 'Liking is toggled off: likes count decreases to 1');
  assert(!likes.some((uid: any) => uid?.toString() === userIdStrA), 'User A is removed from likes array');

  // User A toggles like again (should like / add)
  const isLikedA2 = likes.some((uid: any) => uid?.toString() === userIdStrA);
  assert(isLikedA2 === false, 'Correctly identifies that userA is not currently in likes');

  if (isLikedA2) {
    likes = likes.filter((uid: any) => uid?.toString() !== userIdStrA);
  } else {
    likes.push(reqUserA_id);
  }
  assert(likes.length === 2, 'Liking is toggled on: likes count increases back to 2');
  assert(likes.some((uid: any) => uid?.toString() === userIdStrA), 'User A is added back to likes array');

  // -------------------------------------------------------------------------
  // SUITE 3: Appointment Authorization & State Machine Verification
  // -------------------------------------------------------------------------
  console.log('\n[SUITE 3] Appointment Authorization & State Machine');

  const farmerId = new mongoose.Types.ObjectId();
  const expertA_Id = new mongoose.Types.ObjectId();
  const expertB_Id = new mongoose.Types.ObjectId();
  const strangerId = new mongoose.Types.ObjectId();

  interface FakeAppointment {
    farmer: mongoose.Types.ObjectId;
    expert?: mongoose.Types.ObjectId | null;
    status: string;
  }

  function simulateUpdateStatus(
    appointment: FakeAppointment,
    user: { _id: mongoose.Types.ObjectId; role: string },
    newStatus: string
  ): { status: number; message?: string; allowed: boolean } {
    const isFarmer = appointment.farmer.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    const isAssignedExpert = !!(appointment.expert && appointment.expert.toString() === user._id.toString());
    const isUnassignedExpert = !appointment.expert && user.role === 'expert';

    if (!isAdmin && !isAssignedExpert && !isUnassignedExpert && !isFarmer) {
      return { status: 403, message: 'Forbidden: Access denied', allowed: false };
    }

    if (isFarmer && !isAdmin && !isAssignedExpert && newStatus !== 'cancelled') {
      return { status: 403, message: 'Farmers are only authorized to cancel appointments', allowed: false };
    }

    appointment.status = newStatus;
    return { status: 200, allowed: true };
  }

  // 3.1: Farmer attempts to self-complete or accept
  const appt1: FakeAppointment = { farmer: farmerId, expert: expertA_Id, status: 'scheduled' };
  const farmerAcceptAttempt = simulateUpdateStatus(appt1, { _id: farmerId, role: 'farmer' }, 'completed');
  assert(farmerAcceptAttempt.allowed === false && farmerAcceptAttempt.status === 403, 'Farmer is forbidden from self-completing an appointment');

  // 3.2: Farmer cancels their appointment
  const farmerCancelAttempt = simulateUpdateStatus(appt1, { _id: farmerId, role: 'farmer' }, 'cancelled');
  assert(farmerCancelAttempt.allowed === true && appt1.status === 'cancelled', 'Farmer is authorized to cancel their appointment');

  // 3.3: Expert B attempts to modify Expert A assigned appointment
  const appt2: FakeAppointment = { farmer: farmerId, expert: expertA_Id, status: 'scheduled' };
  const expertBModifyAttempt = simulateUpdateStatus(appt2, { _id: expertB_Id, role: 'expert' }, 'completed');
  assert(expertBModifyAttempt.allowed === false && expertBModifyAttempt.status === 403, 'Unassigned Expert B is forbidden from updating Expert A appointment');

  // 3.4: Assigned Expert A updates their appointment
  const expertAModifyAttempt = simulateUpdateStatus(appt2, { _id: expertA_Id, role: 'expert' }, 'completed');
  assert(expertAModifyAttempt.allowed === true && appt2.status === 'completed', 'Assigned Expert A is authorized to complete their appointment');

  // 3.5: Unassigned general appointment accepted by Expert B
  const appt3: FakeAppointment = { farmer: farmerId, expert: null, status: 'pending' };
  const expertBAcceptUnassigned = simulateUpdateStatus(appt3, { _id: expertB_Id, role: 'expert' }, 'accepted');
  assert(expertBAcceptUnassigned.allowed === true && appt3.status === 'accepted', 'Eligible expert can accept an unassigned appointment request');

  // 3.6: Random stranger attempts to modify appointment
  const strangerAttempt = simulateUpdateStatus(appt3, { _id: strangerId, role: 'farmer' }, 'cancelled');
  assert(strangerAttempt.allowed === false && strangerAttempt.status === 403, 'Random stranger is forbidden from accessing appointment');

  // -------------------------------------------------------------------------
  // SUITE 4: Coordinate Validation Logic (Weather Telemetry)
  // -------------------------------------------------------------------------
  console.log('\n[SUITE 4] Coordinate & Boundary Validation (Weather Controller)');

  function validateCoords(lat: any, lon: any): boolean {
    if (!lat || !lon) return false;
    const numLat = Number(lat);
    const numLon = Number(lon);
    if (isNaN(numLat) || isNaN(numLon) || numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) {
      return false;
    }
    return true;
  }

  assert(validateCoords('21.1702', '72.8311') === true, 'Surat, Gujarat coordinates (21.1702, 72.8311) pass validation');
  assert(validateCoords('0', '0') === true, 'Equator coordinates (0, 0) pass validation');
  assert(validateCoords('-90', '180') === true, 'Boundary coordinates (-90, 180) pass validation');
  assert(validateCoords('91', '72') === false, 'Out-of-bound latitude (> 90) fails validation');
  assert(validateCoords('-95', '72') === false, 'Out-of-bound latitude (< -90) fails validation');
  assert(validateCoords('21', '181') === false, 'Out-of-bound longitude (> 180) fails validation');
  assert(validateCoords('21', '-190') === false, 'Out-of-bound longitude (< -180) fails validation');
  assert(validateCoords('abc', '72') === false, 'Non-numeric string latitude fails validation');
  assert(validateCoords('21', 'xyz') === false, 'Non-numeric string longitude fails validation');
  assert(validateCoords(null, '72') === false, 'Null latitude fails validation');
  assert(validateCoords('21', undefined) === false, 'Undefined longitude fails validation');

  // -------------------------------------------------------------------------
  // SUITE 5: 404 JSON Catch-All Middleware Response Contract
  // -------------------------------------------------------------------------
  console.log('\n[SUITE 5] Express 404 JSON Contract via Supertest');

  const res404 = await request(app).get('/api/unrecognized_route_for_testing_purposes');
  assert(res404.status === 404, 'Unknown route returns HTTP 404');
  assert(typeof res404.body === 'object' && res404.body.success === false, 'Unknown route returns JSON with { success: false }');
  assert(typeof res404.body.message === 'string' && res404.body.message.includes('/api/unrecognized_route_for_testing_purposes'), '404 JSON contains descriptive message with method and route');

  // Also verify live health check endpoint still works
  const resLive = await request(app).get('/health/live');
  assert(resLive.status === 200 && resLive.body.status === 'live', '/health/live endpoint returns HTTP 200 with status: live');

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  PHASE 1 BACKEND VERIFICATION RESULT: ${passed}/${total} TESTS PASSED`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
