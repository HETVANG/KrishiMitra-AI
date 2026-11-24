import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_phase5_audit_key_32_bytes_long_ok';
}

import assert from 'assert';
import request from 'supertest';
import app from '../app';
import { isAllowedImageSignature } from '../middleware/upload';
import { cleanNoSqlPayload } from '../middleware/sanitize';
import jwt from 'jsonwebtoken';

async function runPhase5AuditSuite() {
  console.log('================================================================');
  console.log('  THE KHEDUT — PHASE 5 SECURITY & PERFORMANCE AUDIT SUITE       ');
  console.log('================================================================\n');

  // WORKFLOW 1: Password Validation on Registration
  console.log('[AUDIT 1] Password Validation & Complexity Enforcement');
  
  // 1.1 Short password (< 6 chars) rejected
  const shortPassRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Security Test',
      email: 'shortpass@example.com',
      password: '123'
    });
  
  assert(shortPassRes.status === 400, `Expected 400 for short password, got: ${shortPassRes.status}`);
  assert(shortPassRes.body.success === false, 'Expected success: false for short password');
  assert(
    shortPassRes.body.message.includes('Password must be at least 6 characters long'),
    `Expected password length error message, got: ${shortPassRes.body.message}`
  );
  console.log('  ✓ [PASS] Short password (< 6 chars) is rejected with HTTP 400 and clear error message');

  // 1.2 Non-string password rejected
  const nonStringPassRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Security Test',
      email: 'nonstring@example.com',
      password: 12345
    });
  assert(nonStringPassRes.status === 400, 'Expected 400 for non-string password');
  console.log('  ✓ [PASS] Non-string password payload is rejected with HTTP 400');

  // WORKFLOW 2: Binary Magic Byte Signature Validation (File Upload Security)
  console.log('\n[AUDIT 2] Image Binary Magic Byte Signature Validation');
  
  // 2.1 Genuine JPEG (FF D8 FF)
  const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
  assert(isAllowedImageSignature(jpegBuffer) === true, 'JPEG buffer signature must be recognized');
  console.log('  ✓ [PASS] Legitimate JPEG magic bytes (FF D8 FF) recognized');

  // 2.2 Genuine PNG (89 50 4E 47)
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
  assert(isAllowedImageSignature(pngBuffer) === true, 'PNG buffer signature must be recognized');
  console.log('  ✓ [PASS] Legitimate PNG magic bytes (89 50 4E 47) recognized');

  // 2.3 Genuine WebP (RIFF....WEBP)
  const webpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // 'RIFF'
    0x24, 0x00, 0x00, 0x00, // file size
    0x57, 0x45, 0x42, 0x50, // 'WEBP'
    0x56, 0x50, 0x38, 0x20  // 'VP8 '
  ]);
  assert(isAllowedImageSignature(webpBuffer) === true, 'WebP buffer signature must be recognized');
  console.log('  ✓ [PASS] Legitimate WebP magic bytes (RIFF....WEBP) recognized');

  // 2.4 Spoofed executable/PHP/HTML with .jpg extension
  const maliciousPhpBuffer = Buffer.from('<?php echo "malicious code execution"; ?>');
  assert(isAllowedImageSignature(maliciousPhpBuffer) === false, 'Spoofed PHP script must be rejected');
  console.log('  ✓ [PASS] Spoofed PHP script masked as image is rejected by signature validator');

  const maliciousExeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]); // MZ executable header
  assert(isAllowedImageSignature(maliciousExeBuffer) === false, 'Windows PE executable header must be rejected');
  console.log('  ✓ [PASS] Windows PE executable binary header is rejected by signature validator');

  // WORKFLOW 3: NoSQL Injection Defense & Sanitization
  console.log('\n[AUDIT 3] NoSQL Injection Prevention & Recursive Key Stripping');
  const attackPayload = {
    email: 'farmer@thekhedut.app',
    password: { $ne: null },
    $where: 'this.password.length > 0',
    nestedObject: {
      legitKey: 'normal_value',
      $gt: 0,
      'dotted.key': 'injection'
    },
    arrayField: [
      { normal: 'value' },
      { $regex: '.*' }
    ]
  };

  const sanitized = cleanNoSqlPayload(attackPayload);
  assert(sanitized.email === 'farmer@thekhedut.app', 'Legitimate field preserved');
  assert((sanitized.password as any).$ne === undefined, '$ne operator must be stripped from password');
  assert((sanitized as any).$where === undefined, '$where operator must be stripped from root');
  assert(sanitized.nestedObject.legitKey === 'normal_value', 'Legitimate nested key preserved');
  assert((sanitized.nestedObject as any).$gt === undefined, '$gt operator stripped from nested object');
  assert((sanitized.nestedObject as any)['dotted.key'] === undefined, 'Dotted key stripped from nested object');
  assert((sanitized.arrayField[1] as any).$regex === undefined, '$regex operator stripped from array objects');
  console.log('  ✓ [PASS] cleanNoSqlPayload strips $ne, $where, $gt, $regex and dotted keys across all depths');

  // WORKFLOW 4: IDOR Protection & Unauthenticated Route Guards
  console.log('\n[AUDIT 4] IDOR Protection & Route Access Control');
  
  const unauthRes1 = await request(app).get('/api/crops/farm');
  assert(unauthRes1.status === 401, 'Unauthenticated /api/crops/farm returns HTTP 401');
  console.log('  ✓ [PASS] Unauthenticated access to /api/crops/farm returns HTTP 401');

  const unauthRes2 = await request(app).get('/api/expenses');
  assert(unauthRes2.status === 401, 'Unauthenticated /api/expenses returns HTTP 401');
  console.log('  ✓ [PASS] Unauthenticated access to /api/expenses returns HTTP 401');

  const unauthRes3 = await request(app).get('/api/reports/my-reports');
  assert(unauthRes3.status === 401, 'Unauthenticated /api/reports/my-reports returns HTTP 401');
  console.log('  ✓ [PASS] Unauthenticated access to /api/reports/my-reports returns HTTP 401');

  const unauthRes4 = await request(app).get('/api/admin/users');
  assert(unauthRes4.status === 401, 'Unauthenticated /api/admin/users returns HTTP 401');
  console.log('  ✓ [PASS] Unauthenticated access to /api/admin/users returns HTTP 401');

  // WORKFLOW 5: JWT Security & Algorithm Confusion Defense
  console.log('\n[AUDIT 5] JWT Token Integrity & Algorithm Confusion Defense');
  
  // 5.1 Rejection of "none" algorithm token
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ id: 'mock_user_id', role: 'admin' })).toString('base64url');
  const noneToken = `${header}.${payload}.`;
  
  const noneTokenRes = await request(app)
    .get('/api/crops/farm')
    .set('Authorization', `Bearer ${noneToken}`);
  assert(noneTokenRes.status === 401, 'Token with alg "none" must be rejected with HTTP 401');
  console.log('  ✓ [PASS] JWT with "none" algorithm is rejected with HTTP 401 (prevents algorithm confusion)');

  // 5.2 Expired token rejection
  const expiredToken = jwt.sign(
    { id: 'mock_user_id' },
    process.env.JWT_SECRET as string,
    { expiresIn: -10, algorithm: 'HS256' }
  );
  const expiredRes = await request(app)
    .get('/api/crops/farm')
    .set('Authorization', `Bearer ${expiredToken}`);
  assert(expiredRes.status === 401, 'Expired JWT must be rejected with HTTP 401');
  console.log('  ✓ [PASS] Expired JWT token is strictly rejected with HTTP 401');

  // WORKFLOW 6: Server Health & Fast Non-Blocking Startup Contract
  console.log('\n[AUDIT 6] Server Health & Startup Readiness Contract');
  const healthRes = await request(app).get('/health/live');
  assert(healthRes.status === 200, '/health/live must return HTTP 200');
  assert(healthRes.body.status === 'live', '/health/live must return status: live');
  console.log('  ✓ [PASS] /health/live returns HTTP 200 { status: "live" } for instant readiness probes');

  console.log('\n================================================================');
  console.log('  PHASE 5 SECURITY AUDIT VERIFICATION: ALL AUDITS PASSED        ');
  console.log('================================================================\n');
}

runPhase5AuditSuite().catch((err) => {
  console.error('\n❌ PHASE 5 AUDIT VERIFICATION FAILED:\n', err);
  process.exit(1);
});
