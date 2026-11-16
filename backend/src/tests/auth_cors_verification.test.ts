import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
process.env.NODE_ENV = 'production';
import app from '../app';

async function testEndpoint(
  server: http.Server,
  port: number,
  path: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: data,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runAuthCorsVerification() {
  console.log('================================================================');
  console.log('  THE KHEDUT — AUTHENTICATION & CORS VERIFICATION SUITE         ');
  console.log('================================================================\n');

  let passCount = 0;
  let testCount = 0;

  const testServer = http.createServer(app);
  await new Promise<void>((resolve) => testServer.listen(0, '127.0.0.1', () => resolve()));
  const port = (testServer.address() as any).port;

  try {
    // --------------------------------------------------------------------------
    // TEST 1: Android Capacitor Origin (https://localhost) Preflight OPTIONS
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 1] Verifying Preflight OPTIONS for Android Capacitor (https://localhost)...');
    const resOptHttps = await testEndpoint(
      testServer,
      port,
      '/api/auth/login',
      'OPTIONS',
      {
        'Origin': 'https://localhost',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Accept-Language,Authorization',
      }
    );

    if (resOptHttps.headers['access-control-allow-origin'] !== 'https://localhost') {
      throw new Error(`Test 1 Failed: Expected access-control-allow-origin to be 'https://localhost', got: ${resOptHttps.headers['access-control-allow-origin']}`);
    }
    if (!resOptHttps.headers['access-control-allow-headers']?.toLowerCase().includes('accept-language')) {
      throw new Error(`Test 1 Failed: Expected access-control-allow-headers to include 'accept-language'`);
    }
    console.log(`  ✓ Test 1 Passed: Android WebView origin (https://localhost) preflight approved.`);
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 2: iOS Capacitor Origin (capacitor://localhost) Preflight OPTIONS
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 2] Verifying Preflight OPTIONS for iOS Capacitor (capacitor://localhost)...');
    const resOptCap = await testEndpoint(
      testServer,
      port,
      '/api/auth/register',
      'OPTIONS',
      {
        'Origin': 'capacitor://localhost',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Accept-Language',
      }
    );

    if (resOptCap.headers['access-control-allow-origin'] !== 'capacitor://localhost') {
      throw new Error(`Test 2 Failed: Expected access-control-allow-origin to be 'capacitor://localhost', got: ${resOptCap.headers['access-control-allow-origin']}`);
    }
    console.log(`  ✓ Test 2 Passed: iOS Capacitor origin (capacitor://localhost) preflight approved.`);
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 3: POST /api/auth/login with Origin: https://localhost
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 3] Verifying POST /api/auth/login CORS headers with missing fields...');
    const resPostLogin = await testEndpoint(
      testServer,
      port,
      '/api/auth/login',
      'POST',
      {
        'Origin': 'https://localhost',
        'Content-Type': 'application/json',
        'Accept-Language': 'gu',
      },
      JSON.stringify({})
    );

    if (resPostLogin.headers['access-control-allow-origin'] !== 'https://localhost') {
      throw new Error(`Test 3 Failed: Missing access-control-allow-origin on POST response: got ${resPostLogin.headers['access-control-allow-origin']}`);
    }
    if (resPostLogin.status !== 400) {
      throw new Error(`Test 3 Failed: Expected 400 for empty body, got: ${resPostLogin.status}`);
    }
    console.log(`  ✓ Test 3 Passed: POST /api/auth/login returns CORS headers and validates missing body.`);
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 4: POST /api/auth/register with Origin: https://localhost
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 4] Verifying POST /api/auth/register CORS headers with missing fields...');
    const resPostReg = await testEndpoint(
      testServer,
      port,
      '/api/auth/register',
      'POST',
      {
        'Origin': 'https://localhost',
        'Content-Type': 'application/json',
        'Accept-Language': 'hi',
      },
      JSON.stringify({ name: 'Ramesh' })
    );

    if (resPostReg.headers['access-control-allow-origin'] !== 'https://localhost') {
      throw new Error(`Test 4 Failed: Missing access-control-allow-origin on POST register response`);
    }
    if (resPostReg.status !== 400) {
      throw new Error(`Test 4 Failed: Expected 400 for missing email and password, got: ${resPostReg.status}`);
    }
    const regJson = JSON.parse(resPostReg.body);
    if (!regJson.message?.includes('email') || !regJson.message?.includes('password')) {
      throw new Error(`Test 4 Failed: Expected message indicating missing fields: ${resPostReg.body}`);
    }
    console.log(`  ✓ Test 4 Passed: POST /api/auth/register returns CORS headers and validation response: ${regJson.message}`);
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 5: Unauthorized Origin Rejection (e.g., https://malicious-site.com)
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 5] Verifying Unauthorized Origin Rejection...');
    const resMalicious = await testEndpoint(
      testServer,
      port,
      '/api/auth/login',
      'OPTIONS',
      {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'POST',
      }
    );

    if (resMalicious.headers['access-control-allow-origin']) {
      throw new Error(`Test 5 Failed: Malicious origin was permitted! Header: ${resMalicious.headers['access-control-allow-origin']}`);
    }
    console.log(`  ✓ Test 5 Passed: Malicious origin (https://malicious-site.com) denied CORS headers.`);
    passCount++;

    // --------------------------------------------------------------------------
    // TEST 6: Production Vercel Origin (https://krishi-mitra-ai-henna.vercel.app)
    // --------------------------------------------------------------------------
    testCount++;
    console.log('[TEST 6] Verifying Web Production Vercel Origin...');
    const resVercel = await testEndpoint(
      testServer,
      port,
      '/api/auth/login',
      'OPTIONS',
      {
        'Origin': 'https://krishi-mitra-ai-henna.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Accept-Language',
      }
    );

    if (resVercel.headers['access-control-allow-origin'] !== 'https://krishi-mitra-ai-henna.vercel.app') {
      throw new Error(`Test 6 Failed: Production Vercel origin not permitted`);
    }
    console.log(`  ✓ Test 6 Passed: Production Vercel origin preflight approved.`);
    passCount++;

    console.log('\n================================================================');
    console.log(`  ALL AUTH & CORS TESTS PASSED: ${passCount}/${testCount} (100%)`);
    console.log('================================================================\n');

  } finally {
    testServer.close();
  }
}

runAuthCorsVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal Verification Error:', err);
    process.exit(1);
  });
