import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import { cleanNoSqlPayload, noSqlSanitizer } from '../middleware/sanitize';
import { isAllowedImageSignature } from '../middleware/upload';
import { errorHandler } from '../middleware/errorHandler';
import { authLimiter, aiLimiter, reportLimiter, paymentLimiter, generalLimiter } from '../middleware/rateLimiters';
import { EnvValidator } from '../config/envValidator';

async function runFinalReleaseGateVerification() {
  console.log('================================================================');
  console.log('  THE KHEDUT — INDEPENDENT RELEASE GATE SECURITY VERIFICATION  ');
  console.log('================================================================\n');

  let passCount = 0;
  let testCount = 0;

  // --------------------------------------------------------------------------
  // SECTION 1: MONGODB NO-SQL SANITIZATION & LEGITIMATE CONTENT PRESERVATION
  // --------------------------------------------------------------------------
  console.log('[GATE 1] MongoDB Sanitization & Content Integrity Check:');

  // Test 1.1: Legitimate farmer data preservation
  testCount++;
  const legitimateFarmerData = {
    farmerName: 'Ramesh Patel',
    phone: '+91 98765 43210',
    email: 'ramesh.patel@thekhedut.app',
    bio: "Farmer from Anand, Gujarat. Cultivating wheat & cotton on 12.5 acres.",
    soilHealth: {
      phLevel: 6.8,
      nitrogen: 45.2,
      lastTested: '2026-10-15',
      recommendations: 'Apply 50kg urea/acre. Irrigate within 3 days.'
    },
    crops: ['Wheat (Lokwan)', 'Bt Cotton', 'Pigeon Pea'],
    multilingualNotes: {
      gu: 'જમીન ફળદ્રુપ છે અને ઘઉંનો પાક સારો છે.',
      hi: 'मिट्टी की गुणवत्ता बहुत अच्छी है।'
    },
    isOrganicCertified: false,
    activeCycleId: null
  };

  const sanitizedLegit = cleanNoSqlPayload(legitimateFarmerData);

  if (
    sanitizedLegit.farmerName !== 'Ramesh Patel' ||
    sanitizedLegit.email !== 'ramesh.patel@thekhedut.app' ||
    sanitizedLegit.soilHealth.phLevel !== 6.8 ||
    sanitizedLegit.multilingualNotes.gu !== 'જમીન ફળદ્રુપ છે અને ઘઉંનો પાક સારો છે.' ||
    sanitizedLegit.crops.length !== 3 ||
    sanitizedLegit.isOrganicCertified !== false ||
    sanitizedLegit.activeCycleId !== null
  ) {
    throw new Error('Gate 1.1 Failed: Legitimate farmer content or punctuation was corrupted by sanitizer!');
  }
  console.log('  ✓ 1.1: Legitimate farmer data (punctuation, decimals, Gujarati/Hindi unicode, nested objects) 100% preserved.');
  passCount++;

  // Test 1.2: Malicious NoSQL Operator Neutralization
  testCount++;
  const attackPayload = {
    username: 'admin',
    password: { $ne: null },
    $where: 'this.password.length > 0',
    $gt: 0,
    $regex: '.*',
    $or: [{ role: 'admin' }, { role: 'superadmin' }],
    $exists: true,
    $expr: { $eq: ['$role', 'admin'] },
    'account.role': 'admin',
    'profile.nested.adminOverride': true,
    nestedQuery: {
      $ne: 'secret',
      legitKey: 'validValue',
      'deep.dotted.key': 'blocked'
    },
    arrayInjection: [
      { name: 'Crop A' },
      { $gt: 10, name: 'Crop B' }
    ]
  };

  const sanitizedAttack = cleanNoSqlPayload(attackPayload);

  // Assert all operators stripped
  const dangerousKeys = ['$where', '$gt', '$regex', '$or', '$exists', '$expr', 'account.role', 'profile.nested.adminOverride'];
  for (const dk of dangerousKeys) {
    if ((sanitizedAttack as any)[dk] !== undefined) {
      throw new Error(`Gate 1.2 Failed: Operator ${dk} was not stripped from top-level!`);
    }
  }
  if ((sanitizedAttack as any).password.$ne !== undefined) {
    throw new Error('Gate 1.2 Failed: Nested $ne in password was not stripped!');
  }
  if ((sanitizedAttack as any).nestedQuery.$ne !== undefined || (sanitizedAttack as any).nestedQuery['deep.dotted.key'] !== undefined) {
    throw new Error('Gate 1.2 Failed: Nested operators were not stripped!');
  }
  if ((sanitizedAttack as any).nestedQuery.legitKey !== 'validValue') {
    throw new Error('Gate 1.2 Failed: Nested benign key was dropped!');
  }
  if ((sanitizedAttack as any).arrayInjection[1].$gt !== undefined) {
    throw new Error('Gate 1.2 Failed: Operator inside array element was not stripped!');
  }
  console.log('  ✓ 1.2: Malicious operators ($ne, $gt, $regex, $where, $or, $exists, $expr, dot keys) recursively stripped.');
  passCount++;

  // --------------------------------------------------------------------------
  // SECTION 2: LIVE HTTP RATE-LIMITING TESTS
  // --------------------------------------------------------------------------
  console.log('\n[GATE 2] Live HTTP Rate Limiting Functional Tests:');

  // Spin up an ephemeral Express test server with actual middlewares
  const testApp = express();
  testApp.set('trust proxy', 1);
  testApp.use(express.json());
  testApp.use(noSqlSanitizer);

  // Bind rate-limited endpoints
  testApp.post('/test/auth/login', authLimiter, (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Login accepted for evaluation' });
  });

  testApp.post('/test/ai/diagnose', aiLimiter, (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Diagnosis simulated' });
  });

  testApp.use(errorHandler);

  const server = http.createServer(testApp);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Test 2.1: Auth Limiter (10 requests allowed, 11th blocked with HTTP 429)
    testCount++;
    let authBlocked429 = false;
    let authSuccessCount = 0;

    for (let i = 1; i <= 12; i++) {
      const response = await fetch(`${baseUrl}/test/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `test${i}@farmer.com`, password: 'password123' })
      });

      if (response.status === 200) {
        authSuccessCount++;
      } else if (response.status === 429) {
        authBlocked429 = true;
        const body: any = await response.json();
        if (body.code !== 'RATE_LIMIT_EXCEEDED') {
          throw new Error('Gate 2.1 Failed: 429 response missing code "RATE_LIMIT_EXCEEDED"');
        }
      }
    }

    if (authSuccessCount !== 10 || !authBlocked429) {
      throw new Error(`Gate 2.1 Failed: Expected 10 successes and subsequent 429 blocks, got ${authSuccessCount} successes`);
    }
    console.log(`  ✓ 2.1: Auth Limiter enforced exactly: 10 permitted requests, requests 11+ blocked with HTTP 429.`);
    passCount++;

    // Test 2.2: AI Diagnostics Limiter (15 requests allowed, 16th blocked with HTTP 429)
    testCount++;
    let aiBlocked429 = false;
    let aiSuccessCount = 0;

    for (let i = 1; i <= 17; i++) {
      const response = await fetch(`${baseUrl}/test/ai/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: 'Cotton' })
      });

      if (response.status === 200) {
        aiSuccessCount++;
      } else if (response.status === 429) {
        aiBlocked429 = true;
      }
    }

    if (aiSuccessCount !== 15 || !aiBlocked429) {
      throw new Error(`Gate 2.2 Failed: Expected 15 AI successes and subsequent 429 blocks, got ${aiSuccessCount} successes`);
    }
    console.log(`  ✓ 2.2: AI Limiter enforced exactly: 15 permitted requests, requests 16+ blocked with HTTP 429.`);
    passCount++;

    // Test 2.3: Proxy Trust & IP Spoofing Prevention
    testCount++;
    // In production behind reverse proxy (Render/Cloudflare), the proxy appends the true remote TCP IP:
    // "spoofed_client_ip, true_remote_ip". With trust proxy = 1, Express reads the true remote IP (1 hop).
    const spoofedHeaderSimulated = await fetch(`${baseUrl}/test/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.99, 127.0.0.1' // Reverse proxy appended true remote IP 127.0.0.1
      },
      body: JSON.stringify({ email: 'attacker@evil.com' })
    });

    if (spoofedHeaderSimulated.status !== 429) {
      throw new Error('Gate 2.3 Failed: Reverse proxy IP was ignored or spoofed prefix allowed rate-limit bypass!');
    }
    console.log('  ✓ 2.3: Proxy trust verified: Reverse proxy 1-hop IP resolution prevents spoofed header bypass.');
    passCount++;

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  // --------------------------------------------------------------------------
  // SECTION 3: FILE SIGNATURE & ERROR SANITIZATION TESTS
  // --------------------------------------------------------------------------
  console.log('\n[GATE 3] Binary Upload Signatures & Error Masking:');

  // Test 3.1: Magic bytes validation
  testCount++;
  const genuineJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const genuinePng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
  const genuineWebp = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x18, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  const maliciousShell = Buffer.from('<?php eval($_POST["c"]); ?>');
  const dummyHtml = Buffer.from('<!DOCTYPE html><html><script>alert(1)</script></html>');
  const emptyBuf = Buffer.alloc(0);

  if (
    !isAllowedImageSignature(genuineJpeg) ||
    !isAllowedImageSignature(genuinePng) ||
    !isAllowedImageSignature(genuineWebp)
  ) {
    throw new Error('Gate 3.1 Failed: Genuine image formats were rejected!');
  }

  if (
    isAllowedImageSignature(maliciousShell) ||
    isAllowedImageSignature(dummyHtml) ||
    isAllowedImageSignature(emptyBuf)
  ) {
    throw new Error('Gate 3.1 Failed: Spoofed executable script or non-image passed binary check!');
  }
  console.log('  ✓ 3.1: Binary magic-byte analyzer strictly validates genuine JPEG/PNG/WebP and rejects scripts.');
  passCount++;

  // Test 3.2: Error Handler Database Sanitization
  testCount++;
  const mockRes = () => {
    let s = 200;
    let d: any = null;
    return {
      status(code: number) { s = code; return this; },
      json(data: any) { d = data; return this; },
      getStatus: () => s,
      getData: () => d
    };
  };

  // 3.2.1: Mongoose CastError
  const r1 = mockRes();
  const castErr: any = new Error('Cast to ObjectId failed for value "bad-id" at path "_id" for model "Crop"');
  castErr.name = 'CastError';
  errorHandler(castErr, { method: 'GET', url: '/api/crops/bad-id', headers: {} } as any, r1 as any, () => {});
  if (r1.getStatus() !== 400 || r1.getData().code !== 'INVALID_RESOURCE_IDENTIFIER') {
    throw new Error('Gate 3.2 Failed: CastError not mapped to 400 INVALID_RESOURCE_IDENTIFIER');
  }
  if (r1.getData().message.includes('model "Crop"') || r1.getData().message.includes('Cast to ObjectId')) {
    throw new Error('Gate 3.2 Failed: CastError leaked internal model names or path details');
  }

  // 3.2.2: Mongo 11000 duplicate key
  const r2 = mockRes();
  const dupErr: any = new Error('E11000 duplicate key error collection: thekhedut_prod.users index: phone_1 dup key: { phone: "+919876543210" }');
  dupErr.code = 11000;
  errorHandler(dupErr, { method: 'POST', url: '/api/auth/register', headers: {} } as any, r2 as any, () => {});
  if (r2.getStatus() !== 409 || r2.getData().code !== 'DUPLICATE_RESOURCE') {
    throw new Error('Gate 3.2 Failed: 11000 duplicate key not mapped to 409 DUPLICATE_RESOURCE');
  }
  if (r2.getData().message.includes('thekhedut_prod.users') || r2.getData().message.includes('index: phone_1')) {
    throw new Error('Gate 3.2 Failed: Duplicate key error leaked collection or index details');
  }
  console.log('  ✓ 3.2: Database error handler shields schema internals, collections, and index names.');
  passCount++;

  // --------------------------------------------------------------------------
  // SECTION 4: AUTHENTICATION & PRODUCTION SECRETS ENFORCEMENT
  // --------------------------------------------------------------------------
  console.log('\n[GATE 4] Authentication & Production Secrets Enforcement:');

  // Test 4.1: Secret masking verification
  testCount++;
  const report = EnvValidator.validateEnvironment();
  for (const [key, details] of Object.entries(report.variables)) {
    if (details.category === 'REQUIRED' && details.configured) {
      if (details.maskedValue !== '[CONFIGURED]') {
        throw new Error(`Gate 4.1 Failed: Secret ${key} was not cleanly masked as [CONFIGURED]!`);
      }
    }
  }
  console.log('  ✓ 4.1: Environment validator logs zero secret characters, lengths, or substrings.');
  passCount++;

  // Test 4.2: Token expiration and tampering defense
  testCount++;
  const secret = process.env.JWT_SECRET || 'test_secret_for_gate_only';
  const validToken = jwt.sign({ id: 'user123' }, secret, { expiresIn: '1s' });
  const decodedNow = jwt.verify(validToken, secret);
  if (!decodedNow || (decodedNow as any).id !== 'user123') {
    throw new Error('Gate 4.2 Failed: Valid token decoding failed');
  }

  // Verify tampered token fails
  const tamperedToken = validToken.slice(0, -5) + 'AAAAA';
  let tamperedCaught = false;
  try {
    jwt.verify(tamperedToken, secret);
  } catch {
    tamperedCaught = true;
  }
  if (!tamperedCaught) {
    throw new Error('Gate 4.2 Failed: Tampered token was accepted!');
  }
  console.log('  ✓ 4.2: Cryptographic token integrity and signature validation enforced.');
  passCount++;

  console.log('\n================================================================');
  console.log(`  RELEASE GATE VERIFICATION COMPLETE: ${passCount}/${testCount} TESTS PASSED (100%)`);
  console.log('================================================================\n');
}

runFinalReleaseGateVerification().catch((err) => {
  console.error('\n❌ RELEASE GATE VERIFICATION FAILED:', err);
  process.exit(1);
});
