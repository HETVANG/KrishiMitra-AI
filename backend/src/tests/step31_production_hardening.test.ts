import { sanitizeData } from '../utils/logger';
import { validateUploadedFile } from '../middleware/uploadSecurityMiddleware';
import { ObservabilityService } from '../services/observabilityService';
import { ProviderHealthService } from '../services/providers/ProviderHealthService';

async function runStep31Tests() {
  console.log('--- RUNNING STEP 31 PRODUCTION HARDENING & OBSERVABILITY TESTS ---');

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

  // 1. Logger Secret Masking Test
  const sensitivePayload = {
    username: 'farmer1',
    password: 'SuperSecretPassword123!',
    token: 'bearer_token_abc123',
    keySecret: 'razorpay_secret_key_456',
    nested: {
      authorization: 'Bearer secret_auth_token'
    },
    cropName: 'Wheat'
  };

  const sanitized = sanitizeData(sensitivePayload);
  assert(sanitized.password === '[REDACTED_SECRET]', 'Logger masks password fields in logs');
  assert(sanitized.token === '[REDACTED_SECRET]', 'Logger masks token fields in logs');
  assert(sanitized.keySecret === '[REDACTED_SECRET]', 'Logger masks keySecret fields in logs');
  assert(sanitized.nested.authorization === '[REDACTED_SECRET]', 'Logger recursively masks nested authorization headers');
  assert(sanitized.cropName === 'Wheat', 'Logger preserves non-sensitive agricultural data');

  // 2. Upload File Security Validation Test
  const validFile = { originalname: 'leaf_photo.jpg', mimetype: 'image/jpeg', size: 1024 * 1024 };
  const validResult = validateUploadedFile(validFile);
  assert(validResult.valid === true, 'Upload validator permits valid leaf photo JPG upload');

  const exeFile = { originalname: 'malicious.exe', mimetype: 'application/octet-stream', size: 500 };
  const exeResult = validateUploadedFile(exeFile);
  assert(exeResult.valid === false, 'Upload validator rejects executable .exe file upload');

  const scriptFile = { originalname: 'script.sh', mimetype: 'text/x-sh', size: 200 };
  const scriptResult = validateUploadedFile(scriptFile);
  assert(scriptResult.valid === false, 'Upload validator rejects script .sh file upload');

  const traversalFile = { originalname: '../../etc/passwd', mimetype: 'text/plain', size: 200 };
  const traversalResult = validateUploadedFile(traversalFile);
  assert(traversalResult.valid === false, 'Upload validator rejects path traversal in filenames');

  const oversizedFile = { originalname: 'huge.png', mimetype: 'image/png', size: 15 * 1024 * 1024 };
  const oversizedResult = validateUploadedFile(oversizedFile);
  assert(oversizedResult.valid === false, 'Upload validator enforces 10MB max file size limit');

  // 3. Observability Service Telemetry Test
  const telemetry = ObservabilityService.getTelemetry();
  assert(telemetry.status !== undefined, 'ObservabilityService returns system health status');
  assert(typeof telemetry.uptimeSeconds === 'number', 'ObservabilityService tracks process uptime seconds');
  assert(telemetry.memoryUsageMb.heapUsed > 0, 'ObservabilityService tracks real process memory usage');
  assert(telemetry.database.readyStateText !== undefined, 'ObservabilityService inspects real MongoDB connection state');

  // 4. Provider Health Observability Telemetry Test
  ProviderHealthService.recordSuccess('obs_weather_feed', 'Weather Feed', 'WEATHER', 90);
  const healthRecords = ProviderHealthService.getAllHealthRecords();
  assert(healthRecords.length > 0, 'ProviderHealthService tracks operational provider health records');

  console.log(`\nSTEP 31 TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep31Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
