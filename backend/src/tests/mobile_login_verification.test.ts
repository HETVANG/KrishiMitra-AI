import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
process.env.NODE_ENV = 'production';
import app from '../app';
import { User } from '../models/User';
import { DeviceToken } from '../models/DeviceToken';

async function testRequest(
  server: http.Server,
  port: number,
  path: string,
  method: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 0, body: JSON.parse(data || '{}') });
          } catch {
            resolve({ status: res.statusCode || 0, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runMobileLoginVerification() {
  console.log('================================================================');
  console.log('  THE KHEDUT — MOBILE NUMBER LOGIN VERIFICATION SUITE           ');
  console.log('================================================================\n');

  let passCount = 0;
  let testCount = 0;

  // Ensure remote or local DB connection
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to run mobile login verification.');
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  const testServer = http.createServer(app);
  await new Promise<void>((resolve) => testServer.listen(0, '127.0.0.1', () => resolve()));
  const port = (testServer.address() as any).port;

  const ts = Date.now();
  const testPhone = '98765' + String(ts).slice(-5); // 10-digit Indian mobile
  const testEmail = `farmer_mobile_${ts}@test.internal`;
  const testPassword = 'SecureFarmerPassword@123';

  let createdUserId: string | null = null;
  let authToken: string | null = null;

  try {
    // --------------------------------------------------------------------------
    // SETUP: Create a test farmer account with both email and phone
    // --------------------------------------------------------------------------
    console.log('[SETUP] Creating test farmer account with email and mobile number...');
    const regRes = await testRequest(testServer, port, '/api/auth/register', 'POST', {
      name: 'Ramesh Patel',
      email: testEmail,
      phone: testPhone,
      password: testPassword,
      role: 'farmer',
      settings: { language: 'gu', theme: 'light' },
    });

    if (regRes.status !== 201 || !regRes.body.success) {
      throw new Error(`Setup Failed: Unable to create test farmer: ${JSON.stringify(regRes.body)}`);
    }
    createdUserId = regRes.body.user.id;
    console.log(`  ✓ Test farmer created: ID=${createdUserId}, Phone=${testPhone}, Email=${testEmail}\n`);

    // --------------------------------------------------------------------------
    // TEST 1: Login with 10-digit mobile number and correct password
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 1] Testing login with plain 10-digit mobile number...');
    const login1 = await testRequest(testServer, port, '/api/auth/login', 'POST', {
      phone: testPhone,
      password: testPassword,
    });

    if (login1.status !== 200 || !login1.body.success || !login1.body.token) {
      throw new Error(`Test 1 Failed: Expected 200 with JWT token, got: ${JSON.stringify(login1.body)}`);
    }
    authToken = login1.body.token;
    if (login1.body.user.phone !== testPhone || login1.body.user.name !== 'Ramesh Patel') {
      throw new Error(`Test 1 Failed: User payload mismatch: ${JSON.stringify(login1.body.user)}`);
    }
    console.log('  ✓ Test 1 Passed: 10-digit mobile number login succeeded with JWT and correct profile.');
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 2: Login with +91 prefixed mobile number (+9198765XXXXX)
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 2] Testing login with +91 prefixed mobile number...');
    const login2 = await testRequest(testServer, port, '/api/auth/login', 'POST', {
      phone: `+91${testPhone}`,
      password: testPassword,
    });

    if (login2.status !== 200 || !login2.body.success || !login2.body.token) {
      throw new Error(`Test 2 Failed: Expected 200 for +91 prefix, got: ${JSON.stringify(login2.body)}`);
    }
    console.log('  ✓ Test 2 Passed: +91 prefixed mobile number matched and authenticated successfully.');
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 3: Login with formatted phone number (+91 98765 XXXXX)
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 3] Testing login with spaced/formatted mobile number...');
    const formattedPhone = `+91 ${testPhone.slice(0, 5)} ${testPhone.slice(5)}`;
    const login3 = await testRequest(testServer, port, '/api/auth/login', 'POST', {
      mobile: formattedPhone,
      password: testPassword,
    });

    if (login3.status !== 200 || !login3.body.success || !login3.body.token) {
      throw new Error(`Test 3 Failed: Expected 200 for spaced phone, got: ${JSON.stringify(login3.body)}`);
    }
    console.log('  ✓ Test 3 Passed: Formatted/spaced mobile number normalized and authenticated.');
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 4: Existing farmer account email login fallback (backward compatibility)
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 4] Testing backward compatibility email login for existing accounts...');
    const login4 = await testRequest(testServer, port, '/api/auth/login', 'POST', {
      email: testEmail,
      password: testPassword,
    });

    if (login4.status !== 200 || !login4.body.success || !login4.body.token) {
      throw new Error(`Test 4 Failed: Expected 200 for email login fallback, got: ${JSON.stringify(login4.body)}`);
    }
    console.log('  ✓ Test 4 Passed: Email login backward compatibility preserved for existing accounts.');
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 5: Login with incorrect password
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 5] Testing login with incorrect password...');
    const login5 = await testRequest(testServer, port, '/api/auth/login', 'POST', {
      phone: testPhone,
      password: 'WrongPassword123!',
    });

    if (login5.status !== 401 || login5.body.success !== false) {
      throw new Error(`Test 5 Failed: Expected 401 for bad password, got: ${login5.status}`);
    }
    console.log(`  ✓ Test 5 Passed: Incorrect password safely rejected with 401: "${login5.body.message}".`);
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 6: Login with unregistered mobile number
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 6] Testing login with unregistered mobile number...');
    const login6 = await testRequest(testServer, port, '/api/auth/login', 'POST', {
      phone: '9990001112',
      password: testPassword,
    });

    if (login6.status !== 401 || login6.body.success !== false) {
      throw new Error(`Test 6 Failed: Expected 401 for non-existent mobile, got: ${login6.status}`);
    }
    console.log(`  ✓ Test 6 Passed: Unregistered mobile number safely rejected with 401.`);
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 7: Login with missing credentials (empty payload)
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 7] Testing login validation with empty body...');
    const login7 = await testRequest(testServer, port, '/api/auth/login', 'POST', {});

    if (login7.status !== 400 || login7.body.success !== false) {
      throw new Error(`Test 7 Failed: Expected 400 for empty body, got: ${login7.status}`);
    }
    console.log(`  ✓ Test 7 Passed: Missing credentials caught by validator with 400.`);
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 8: Session validation (GET /api/auth/me) with token from mobile login
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 8] Verifying JWT session handling (GET /api/auth/me)...');
    const meRes = await testRequest(testServer, port, '/api/auth/me', 'GET', null, {
      Authorization: `Bearer ${authToken}`,
    });

    if (meRes.status !== 200 || !meRes.body.success || meRes.body.user.phone !== testPhone) {
      throw new Error(`Test 8 Failed: Session verification failed: ${JSON.stringify(meRes.body)}`);
    }
    console.log('  ✓ Test 8 Passed: JWT authentication and session state validated cleanly.');
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 9: Push notification device token registration after mobile login
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 9] Verifying Firebase push notification token registration with mobile session...');
    const testDeviceToken = `fcm_device_token_${ts}`;
    const pushRegRes = await testRequest(
      testServer,
      port,
      '/api/notifications/devices/register',
      'POST',
      {
        token: testDeviceToken,
        platform: 'android',
        deviceId: `android_device_${ts}`,
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );

    if (pushRegRes.status !== 200 || !pushRegRes.body.success) {
      throw new Error(`Test 9 Failed: Device registration failed: ${JSON.stringify(pushRegRes.body)}`);
    }

    // Verify token exists in database and is linked to the farmer
    const savedToken = await DeviceToken.findOne({ token: testDeviceToken });
    if (!savedToken || savedToken.user.toString() !== createdUserId) {
      throw new Error('Test 9 Failed: Device token was not properly saved or linked to farmer!');
    }
    console.log('  ✓ Test 9 Passed: Push notification device token linked to farmer account after mobile login.');
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 10: Device token unregistration
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 10] Verifying device token unregistration...');
    const pushUnregRes = await testRequest(
      testServer,
      port,
      '/api/notifications/devices/unregister',
      'POST',
      {
        token: testDeviceToken,
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );

    if (pushUnregRes.status !== 200 || !pushUnregRes.body.success) {
      throw new Error(`Test 10 Failed: Device unregistration failed: ${JSON.stringify(pushUnregRes.body)}`);
    }
    console.log('  ✓ Test 10 Passed: Device token successfully unregistered.');
    passCount++;

    console.log('\n================================================================');
    console.log(`  ALL MOBILE LOGIN TESTS PASSED: ${passCount}/${testCount} (100%)`);
    console.log('================================================================\n');
  } finally {
    // --------------------------------------------------------------------------
    // CLEANUP: Purge test records from MongoDB
    // --------------------------------------------------------------------------
    console.log('[CLEANUP] Cleaning up test records from database...');
    try {
      if (createdUserId) {
        await User.deleteOne({ _id: createdUserId });
        await DeviceToken.deleteMany({ token: new RegExp(`fcm_device_token_${ts}`) });
        console.log('  ✓ Temporary test user and device tokens purged cleanly.');
      }
    } catch (cleanupErr) {
      console.warn('  ⚠️ Cleanup warning:', cleanupErr);
    }
    testServer.close();
    await mongoose.disconnect();
  }
}

runMobileLoginVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal Verification Error:', err);
    process.exit(1);
  });
