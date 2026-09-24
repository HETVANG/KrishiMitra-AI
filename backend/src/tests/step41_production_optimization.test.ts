import assert from 'assert';
import { AppError, errorHandler } from '../middleware/errorHandler';
import { ObservabilityService } from '../services/observabilityService';
import { AIProviderManager, GeminiAIProvider, FallbackRuleAIProvider } from '../services/ai/aiProviderManager';
import { marketPriceService } from '../services/MarketPriceService';
import { validateUploadedFile } from '../middleware/uploadSecurityMiddleware';
import { RegionRegistry } from '../config/regions/regionRegistry';
import { ProviderResolver } from '../services/providers/providerResolver';

async function runStep41ProductionOptimizationTests() {
  console.log('--- STARTING STEP 41: PRODUCTION OPTIMIZATION & QUALITY ENGINE TESTS ---');

  // 1. Centralized Error Standardization
  console.log('Test 1: Verifying Centralized Error Standardization & AppError Class...');
  const appErr = new AppError('Database connection timed out', 503, 'DB_TIMEOUT', 'Unable to connect to database. Please retry.');
  assert.strictEqual(appErr.statusCode, 503);
  assert.strictEqual(appErr.code, 'DB_TIMEOUT');
  assert.strictEqual(appErr.userMessage, 'Unable to connect to database. Please retry.');

  let mockResponseJson: any = null;
  let mockStatusCode = 0;

  const mockReq: any = { method: 'GET', url: '/api/test', id: 'req_test_12345' };
  const mockRes: any = {
    status(code: number) {
      mockStatusCode = code;
      return this;
    },
    json(data: any) {
      mockResponseJson = data;
      return this;
    }
  };

  errorHandler(appErr, mockReq, mockRes, () => {});

  assert.strictEqual(mockStatusCode, 503);
  assert.strictEqual(mockResponseJson.success, false);
  assert.strictEqual(mockResponseJson.code, 'DB_TIMEOUT');
  assert.strictEqual(mockResponseJson.userMessage, 'Unable to connect to database. Please retry.');
  assert.strictEqual(mockResponseJson.requestId, 'req_test_12345');
  assert.ok(mockResponseJson.timestamp, 'Timestamp must be attached to error response');
  console.log('✓ Centralized Error Standardization verified successfully.');

  // 2. Health & Observability Endpoints
  console.log('\nTest 2: Verifying Production Health & Observability Telemetry...');
  const telemetry = ObservabilityService.getTelemetry();
  assert.ok(['HEALTHY', 'DEGRADED', 'UNAVAILABLE'].includes(telemetry.status), 'Telemetry status must be valid enum');
  assert.ok(typeof telemetry.uptimeSeconds === 'number', 'Uptime must be a number');
  assert.ok(telemetry.memoryUsageMb.heapUsed > 0, 'Memory usage must be reported');
  assert.ok(typeof telemetry.database.connected === 'boolean', 'Database status reported');
  console.log('✓ Production Health & Observability Telemetry verified successfully.');

  // 3. AI Provider Abstraction & Fallback Engine
  console.log('\nTest 3: Verifying AI Provider Abstraction & Fallback Engine...');
  const primaryProvider = AIProviderManager.getPrimaryProvider();
  assert.ok(primaryProvider.id, 'Primary AI provider must be resolved');

  const advisoryResult = await AIProviderManager.generateAdvisory('What fertilizer should I use for tomatoes?');
  assert.strictEqual(advisoryResult.success, true);
  assert.ok(advisoryResult.answer, 'AI advisory answer returned');
  assert.ok(advisoryResult.providerName, 'Provider name must be attached to AI output');
  assert.ok(['HIGH', 'MODERATE', 'LOW'].includes(advisoryResult.confidence as string), 'AI response must contain confidence score');

  // Verify FallbackRuleAIProvider
  const fallbackProvider = new FallbackRuleAIProvider();
  const fallbackRes = await fallbackProvider.generateAdvisory('How much water does wheat need?');
  assert.strictEqual(fallbackRes.success, true);
  assert.strictEqual(fallbackRes.providerName, 'KrishiMitra Deterministic Agronomic Rule Engine');

  // Vision leaf diagnosis fallback when no image provided
  const dummyBuffer = Buffer.from('fake image content');
  const leafDiag = await fallbackProvider.diagnoseLeaf(dummyBuffer, 'image/png');
  assert.strictEqual(leafDiag.success, false);
  assert.strictEqual(leafDiag.code, 'INSUFFICIENT_DATA');
  console.log('✓ AI Provider Abstraction & Fallback Engine verified successfully.');

  // 4. Market Data Integrity & Price Unavailable Rule
  console.log('\nTest 4: Verifying Market Data Integrity (No Fake 0 Price)...');
  const emptyAnalytics = (marketPriceService as any).buildAnalytics([], null);
  assert.strictEqual(emptyAnalytics.priceStatus, 'PRICE_UNAVAILABLE');
  assert.strictEqual(emptyAnalytics.todayPrice, 0);

  const validAnalytics = (marketPriceService as any).buildAnalytics([{ avgPrice: 2400, modalPrice: 2400, maxPrice: 2500, minPrice: 2300 }], null);
  assert.strictEqual(validAnalytics.priceStatus, 'AVAILABLE');
  assert.strictEqual(validAnalytics.todayPrice, 2400);
  console.log('✓ Market Data Integrity verified successfully.');

  // 5. File Upload Security
  console.log('\nTest 5: Verifying File Upload Security Validation...');
  const validImage = validateUploadedFile({ originalname: 'leaf_scan.jpg', mimetype: 'image/jpeg', size: 1024 * 1024 });
  assert.strictEqual(validImage.valid, true);

  const dangerousFile = validateUploadedFile({ originalname: 'malicious_script.exe', mimetype: 'application/x-msdownload', size: 500 });
  assert.strictEqual(dangerousFile.valid, false);
  assert.strictEqual(dangerousFile.reason, 'Security alert: Executable or script file upload rejected');

  const oversizedFile = validateUploadedFile({ originalname: 'huge_scan.png', mimetype: 'image/png', size: 15 * 1024 * 1024 });
  assert.strictEqual(oversizedFile.valid, false);
  assert.strictEqual(oversizedFile.reason, 'File size exceeds maximum permitted limit of 10MB');
  console.log('✓ File Upload Security Validation verified successfully.');

  // 6. Regional Provider Resolution & Precedence
  console.log('\nTest 6: Verifying Regional Provider Resolution & Precedence...');
  const inPaymentProv = ProviderResolver.getPaymentProvider('IN');
  assert.strictEqual(inPaymentProv.available, true);
  assert.strictEqual(inPaymentProv.id, 'razorpay_india');

  const usPaymentProv = ProviderResolver.getPaymentProvider('US');
  assert.strictEqual(usPaymentProv.available, false);
  assert.strictEqual(usPaymentProv.code, 'FEATURE_NOT_SUPPORTED_IN_REGION');

  const isIndiaWeatherActive = RegionRegistry.isFeatureAvailable('IN', 'weather');
  assert.strictEqual(isIndiaWeatherActive, true);
  console.log('✓ Regional Provider Resolution & Precedence verified successfully.');

  console.log('\n=============================================================');
  console.log('🎉 ALL STEP 41 PRODUCTION OPTIMIZATION TESTS PASSED CLEANLY! 🎉');
  console.log('=============================================================\n');
}

runStep41ProductionOptimizationTests().catch(err => {
  console.error('❌ STEP 41 TEST FAILURE:', err);
  process.exit(1);
});
