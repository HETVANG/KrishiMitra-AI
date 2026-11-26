import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore
}

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../app';
import { User } from '../models/User';
import { DeviceToken } from '../models/DeviceToken';
import { FCMService } from '../services/fcmService';

console.log('================================================================');
console.log('  THE KHEDUT — FIREBASE PUSH NOTIFICATION & FCM VERIFICATION   ');
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

async function runVerification() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishimitra_test';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for FCM verification test.\n');

    const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_minimum_32_characters_long';

    // Create test user records in MongoDB so authenticate middleware resolves them
    const userADoc = await User.create({
      name: 'FCM Test Farmer A',
      email: `fcm_test_a_${Date.now()}@example.com`,
      password: 'TestPassword@123',
      role: 'farmer'
    });
    const userBDoc = await User.create({
      name: 'FCM Test Farmer B',
      email: `fcm_test_b_${Date.now()}@example.com`,
      password: 'TestPassword@123',
      role: 'farmer'
    });

    const testUserAId = userADoc._id.toString();
    const testUserBId = userBDoc._id.toString();

    const tokenA = jwt.sign({ id: testUserAId, role: 'farmer' }, jwtSecret, { expiresIn: '1h' });
    const tokenB = jwt.sign({ id: testUserBId, role: 'farmer' }, jwtSecret, { expiresIn: '1h' });

    const dummyFcmToken = 'fcm_test_device_token_' + Date.now();

    // Clean up any test tokens
    await DeviceToken.deleteMany({ token: dummyFcmToken });

    // -------------------------------------------------------------
    // SUITE 1: Firebase Admin Configuration & Standby Gracefulness
    // -------------------------------------------------------------
    console.log('[SUITE 1] Firebase Admin Initialization & Standby Gracefulness');
    const isConfigured = FCMService.isConfigured();
    console.log(`  * FCM Service Configured status: ${isConfigured}`);
    assert(typeof isConfigured === 'boolean', 'FCMService.isConfigured returns a valid boolean');

    const standbyResult = await FCMService.sendToUser(testUserAId, {
      title: 'Test',
      body: 'Test Body'
    });
    if (!isConfigured) {
      assert(
        standbyResult.success === false && standbyResult.reason === 'FCM_NOT_CONFIGURED',
        'FCMService gracefully handles unconfigured state without throwing exception'
      );
    } else {
      assert(typeof standbyResult.success === 'boolean', 'FCMService responds properly when configured');
    }

    // -------------------------------------------------------------
    // SUITE 2: Endpoint Authentication & Payload Validation
    // -------------------------------------------------------------
    console.log('\n[SUITE 2] Endpoint Authentication & Validation');

    // Unauthenticated registration
    const resNoAuth = await request(app)
      .post('/api/notifications/devices/register')
      .send({ token: dummyFcmToken });
    assert(resNoAuth.status === 401, 'POST /api/notifications/devices/register rejects unauthenticated calls (401)');

    // Missing token in body
    const resEmpty = await request(app)
      .post('/api/notifications/devices/register')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({});
    assert(resEmpty.status === 400, 'POST /api/notifications/devices/register rejects missing token payload (400)');

    // -------------------------------------------------------------
    // SUITE 3: Token Registration & User Association
    // -------------------------------------------------------------
    console.log('\n[SUITE 3] Device Token Registration & User Association');

    const resRegisterA = await request(app)
      .post('/api/notifications/devices/register')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        token: dummyFcmToken,
        platform: 'android',
        deviceModel: 'Pixel 8 Pro (Test)',
        appVersion: '1.0.7'
      });

    assert(resRegisterA.status === 200 && resRegisterA.body.success === true, 'Device token registered successfully for User A (200)');

    const recordA = await DeviceToken.findOne({ token: dummyFcmToken });
    assert(recordA !== null, 'Device token record persisted in database');
    assert(recordA?.user.toString() === testUserAId, 'Device token correctly associated with User A ID');
    assert(recordA?.platform === 'android', 'Device token platform stored as android');
    assert(recordA?.isActive === true, 'Device token isActive flag initialized to true');

    // -------------------------------------------------------------
    // SUITE 4: Deduplication & Re-association Across Users
    // -------------------------------------------------------------
    console.log('\n[SUITE 4] Token Deduplication & Re-association');

    // Re-register same device token under User B
    const resRegisterB = await request(app)
      .post('/api/notifications/devices/register')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        token: dummyFcmToken,
        platform: 'android'
      });

    assert(resRegisterB.status === 200 && resRegisterB.body.success === true, 'Same token re-registered under User B without duplicate error');

    const countAll = await DeviceToken.countDocuments({ token: dummyFcmToken });
    assert(countAll === 1, 'Exactly one record exists in database for this token (no duplicates)');

    const recordB = await DeviceToken.findOne({ token: dummyFcmToken });
    assert(recordB?.user.toString() === testUserBId, 'Token ownership securely transferred to authenticated User B');

    // -------------------------------------------------------------
    // SUITE 5: Secure Token Removal & Unregistration
    // -------------------------------------------------------------
    console.log('\n[SUITE 5] Device Token Removal & Access Control');

    // User A attempts to unregister User B's token
    const resUnregA = await request(app)
      .post('/api/notifications/devices/unregister')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ token: dummyFcmToken });
    assert(resUnregA.status === 200, 'Unregister endpoint responds with 200');

    // Verify token was NOT deleted because User A is not the owner
    const recordStillExists = await DeviceToken.findOne({ token: dummyFcmToken });
    assert(recordStillExists !== null, 'Unauthorized user cannot unregister another user’s device token');

    // User B unregisters their own token
    const resUnregB = await request(app)
      .post('/api/notifications/devices/unregister')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ token: dummyFcmToken });
    assert(resUnregB.status === 200 && resUnregB.body.success === true, 'Authorized User B unregisters device token');

    const recordDeleted = await DeviceToken.findOne({ token: dummyFcmToken });
    assert(recordDeleted === null, 'Device token completely removed from database upon legitimate unregister');

    // -------------------------------------------------------------
    // SUITE 6: Authenticated Test FCM Dispatch Endpoint
    // -------------------------------------------------------------
    console.log('\n[SUITE 6] Authenticated Test Push Notification Endpoint');

    const resTestNoAuth = await request(app)
      .post('/api/notifications/test-fcm')
      .send();
    assert(resTestNoAuth.status === 401, 'POST /api/notifications/test-fcm requires authentication (401)');

    const resTestAuth = await request(app)
      .post('/api/notifications/test-fcm')
      .set('Authorization', `Bearer ${tokenA}`)
      .send();

    if (!isConfigured) {
      assert(
        resTestAuth.status === 503 && resTestAuth.body.code === 'FCM_UNCONFIGURED',
        'POST /api/notifications/test-fcm returns 503 FCM_UNCONFIGURED when service account is not yet configured'
      );
    } else {
      assert(
        resTestAuth.status === 200,
        'POST /api/notifications/test-fcm dispatches test notification when configured'
      );
    }

    console.log('\n================================================================');
    console.log(`  VERIFICATION COMPLETE: ${passed} / ${total} CHECKS PASSED`);
    console.log('================================================================\n');

    await DeviceToken.deleteMany({ token: dummyFcmToken });
    await User.deleteMany({ _id: { $in: [userADoc._id, userBDoc._id] } });
    await mongoose.disconnect();
    process.exit(passed === total ? 0 : 1);
  } catch (err: any) {
    console.error('Verification error:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

runVerification();
