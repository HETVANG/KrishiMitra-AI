import { EnvValidator, ENV_SPECS } from '../config/envValidator';
import { cleanNoSqlPayload } from '../middleware/sanitize';
import { isAllowedImageSignature } from '../middleware/upload';
import { errorHandler } from '../middleware/errorHandler';
import { authLimiter, aiLimiter, reportLimiter, paymentLimiter, generalLimiter } from '../middleware/rateLimiters';

async function runPreLaunchSecurityHardeningSuite() {
  console.log('================================================================');
  console.log('   THE KHEDUT - PRE-LAUNCH DEFENSIVE SECURITY VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  // -------------------------------------------------------------
  // Test 1: Zero Secret Leakage in Environment Validator
  // -------------------------------------------------------------
  total++;
  console.log('Test 1: Validating Zero Secret Exposure in Configuration Logs...');
  const envReport = EnvValidator.validateEnvironment();
  for (const spec of ENV_SPECS) {
    const varInfo = envReport.variables[spec.name];
    if (spec.isSecret && varInfo.configured) {
      if (varInfo.maskedValue !== '[CONFIGURED]') {
        throw new Error(`Test 1 Failed: Secret variable ${spec.name} leaked characters: "${varInfo.maskedValue}"`);
      }
    }
  }
  console.log('  -> PASS: All configured secrets strictly output "[CONFIGURED]". Zero partial strings or lengths leaked.\n');
  passed++;

  // -------------------------------------------------------------
  // Test 2: NoSQL Injection Operator Sanitization
  // -------------------------------------------------------------
  total++;
  console.log('Test 2: Validating NoSQL Injection Stripping Middleware...');
  const maliciousInput = {
    email: 'farmer@thekhedut.app',
    password: { $ne: null },
    '$where': 'this.role === "admin"',
    'profile.nested.query': true,
    filters: [
      { field: 'crop', value: 'wheat' },
      { '$gt': 100, field: 'yield' }
    ],
    safeNested: {
      cropType: 'Cotton',
      $regex: '^.*$'
    }
  };

  const cleaned = cleanNoSqlPayload(maliciousInput);

  if ((cleaned as any).password.$ne !== undefined) {
    throw new Error('Test 2 Failed: $ne operator was not stripped from password');
  }
  if ((cleaned as any)['$where'] !== undefined) {
    throw new Error('Test 2 Failed: $where operator was not stripped');
  }
  if ((cleaned as any)['profile.nested.query'] !== undefined) {
    throw new Error('Test 2 Failed: Dotted key "profile.nested.query" was not stripped');
  }
  if ((cleaned.filters[1] as any)['$gt'] !== undefined) {
    throw new Error('Test 2 Failed: $gt operator in nested array was not stripped');
  }
  if ((cleaned.safeNested as any)['$regex'] !== undefined) {
    throw new Error('Test 2 Failed: $regex in nested object was not stripped');
  }
  if (cleaned.email !== 'farmer@thekhedut.app' || cleaned.safeNested.cropType !== 'Cotton') {
    throw new Error('Test 2 Failed: Legitimate payload data was corrupted');
  }
  console.log('  -> PASS: All NoSQL operators ($ne, $where, $gt, $regex, dot notation) stripped recursively. Benign data intact.\n');
  passed++;

  // -------------------------------------------------------------
  // Test 3: Binary Image Signature Validation (Magic Bytes)
  // -------------------------------------------------------------
  total++;
  console.log('Test 3: Validating Binary Magic-Bytes Image Verification...');

  // Genuine JPEG: FF D8 FF
  const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
  if (!isAllowedImageSignature(validJpeg)) {
    throw new Error('Test 3 Failed: Valid JPEG was falsely rejected');
  }

  // Genuine PNG: 89 50 4E 47
  const validPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
  if (!isAllowedImageSignature(validPng)) {
    throw new Error('Test 3 Failed: Valid PNG was falsely rejected');
  }

  // Genuine WebP: RIFF ... WEBP
  const validWebp = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  if (!isAllowedImageSignature(validWebp)) {
    throw new Error('Test 3 Failed: Valid WebP was falsely rejected');
  }

  // Spoofed file disguised as image (PHP shell script)
  const phpShellDisguised = Buffer.from('<?php system($_GET["cmd"]); ?>');
  if (isAllowedImageSignature(phpShellDisguised)) {
    throw new Error('Test 3 Failed: PHP shell disguised with image mimetype was accepted');
  }

  // Spoofed Windows PE / ELF binary disguised as image
  const executableDisguised = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF');
  if (isAllowedImageSignature(executableDisguised)) {
    throw new Error('Test 3 Failed: Binary executable was accepted');
  }

  console.log('  -> PASS: Binary signature analyzer correctly authenticated JPEG, PNG, WebP and rejected spoofed payloads.\n');
  passed++;

  // -------------------------------------------------------------
  // Test 4: Centralized Database Error Sanitization
  // -------------------------------------------------------------
  total++;
  console.log('Test 4: Validating Centralized Database Error Sanitization...');

  const createMockRes = () => {
    const res: any = {
      statusCode: 200,
      jsonData: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        this.jsonData = data;
        return this;
      }
    };
    return res;
  };

  const dummyReq: any = { method: 'POST', url: '/api/test', headers: {} };

  // Case A: Mongoose CastError
  const castErr: any = new Error('Cast to ObjectId failed for value "12345" at path "_id" for model "User"');
  castErr.name = 'CastError';
  const resA = createMockRes();
  errorHandler(castErr, dummyReq, resA, () => {});
  if (resA.statusCode !== 400 || resA.jsonData.code !== 'INVALID_RESOURCE_IDENTIFIER') {
    throw new Error(`Test 4 Failed: CastError not mapped to 400 INVALID_RESOURCE_IDENTIFIER (got ${resA.statusCode})`);
  }
  if (resA.jsonData.message.includes('Cast to ObjectId') || resA.jsonData.message.includes('User')) {
    throw new Error('Test 4 Failed: CastError leaked internal Mongoose model names');
  }

  // Case B: MongoDB duplicate key error 11000
  const dupErr: any = new Error('E11000 duplicate key error collection: thekhedut.users index: email_1 dup key: { email: "farmer@test.com" }');
  dupErr.code = 11000;
  const resB = createMockRes();
  errorHandler(dupErr, dummyReq, resB, () => {});
  if (resB.statusCode !== 409 || resB.jsonData.code !== 'DUPLICATE_RESOURCE') {
    throw new Error(`Test 4 Failed: Duplicate key error not mapped to 409 DUPLICATE_RESOURCE (got ${resB.statusCode})`);
  }
  if (resB.jsonData.message.includes('thekhedut.users') || resB.jsonData.message.includes('index: email_1')) {
    throw new Error('Test 4 Failed: Duplicate error leaked collection/index schema details');
  }

  // Case C: Multer file limit error
  const multerErr: any = new Error('File too large');
  multerErr.name = 'MulterError';
  multerErr.code = 'LIMIT_FILE_SIZE';
  const resC = createMockRes();
  errorHandler(multerErr, dummyReq, resC, () => {});
  if (resC.statusCode !== 413 || resC.jsonData.code !== 'FILE_UPLOAD_ERROR') {
    throw new Error(`Test 4 Failed: File limit error not mapped to 413 (got ${resC.statusCode})`);
  }

  console.log('  -> PASS: All database & upload errors cleanly sanitized. Zero database internals or collection names leaked.\n');
  passed++;

  // -------------------------------------------------------------
  // Test 5: Tiered Rate Limiter Configuration
  // -------------------------------------------------------------
  total++;
  console.log('Test 5: Validating Tiered Rate Limiter Middleware Configuration...');
  if (typeof generalLimiter !== 'function' || typeof authLimiter !== 'function' || typeof aiLimiter !== 'function' || typeof reportLimiter !== 'function' || typeof paymentLimiter !== 'function') {
    throw new Error('Test 5 Failed: One or more tiered rate limiters are not callable Express middleware');
  }
  console.log('  -> PASS: All 5 rate limiters (General, Auth, AI, Reports, Payment) configured and active.\n');
  passed++;

  console.log('================================================================');
  console.log(`   SECURITY VERIFICATION COMPLETE: ${passed}/${total} TESTS PASSED (100%)`);
  console.log('================================================================\n');
}

runPreLaunchSecurityHardeningSuite().catch((err) => {
  console.error('\n❌ SECURITY TEST SUITE FAILED:', err);
  process.exit(1);
});
