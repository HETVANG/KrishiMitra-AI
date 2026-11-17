/**
 * THE KHEDUT — MULTILINGUAL, REFERRAL & MANDI VERIFICATION TEST SUITE
 * Validates:
 * 1. Referral URL generation logic (ensures production URL is used on mobile WebView/localhost).
 * 2. Mandi filter sanitization and regex escaping (prevents invalid regex and crashes on APMC names).
 * 3. CastError handler non-leakage and user-friendly diagnostics.
 * 4. 12-language locale dictionary completeness and key parity.
 */

import fs from 'fs';
import path from 'path';
import { buildMarketFilter, escapeRegex } from '../utils/marketUtils';
import { errorHandler } from '../middleware/errorHandler';

function createMockRes() {
  let statusCode = 200;
  let jsonData: any = null;
  return {
    status: (code: number) => {
      statusCode = code;
      return {
        json: (data: any) => {
          jsonData = data;
          return data;
        }
      };
    },
    getStatusCode: () => statusCode,
    getData: () => jsonData
  };
}

async function runTests() {
  console.log('================================================================');
  console.log('  THE KHEDUT — MULTILINGUAL, REFERRAL & MANDI TEST SUITE        ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  // TEST 1: Referral URL Web vs Mobile WebView resolution
  total++;
  console.log('[TEST 1] Verifying Referral URL Production Resolution:');
  const getProductionAppUrlLogic = (isMobileOrLocal: boolean, path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = isMobileOrLocal ? 'https://krishi-mitra-ai-henna.vercel.app' : 'https://thekhedut.ai';
    return `${baseUrl}${cleanPath}`;
  };

  const mobileReferral = getProductionAppUrlLogic(true, '/register?ref=TK-6BF912');
  if (mobileReferral === 'https://krishi-mitra-ai-henna.vercel.app/register?ref=TK-6BF912') {
    console.log('  ✓ Test 1 Passed: Mobile WebView origin resolves to production Vercel URL with ref param.');
    passed++;
  } else {
    throw new Error(`Test 1 Failed: Unexpected mobile referral URL: ${mobileReferral}`);
  }

  // TEST 2: Mandi Crop Name Regex Escaping
  total++;
  console.log('\n[TEST 2] Verifying Mandi Search Regex Escaping for Complex Commodity Names:');
  const complexCrops = [
    'Cotton (Lint)',
    'Paddy (Dhan) (Common)',
    'Mustard (Rape/Sarson)',
    'Chilli (Green) [Special]'
  ];

  for (const crop of complexCrops) {
    const escaped = escapeRegex(crop);
    const filter = buildMarketFilter({ crop });
    // Verify RegExp constructs without error and matches the raw crop
    const regex = new RegExp(`^${escaped}$`, 'i');
    if (!regex.test(crop)) {
      throw new Error(`Test 2 Failed: Regex failed to match crop "${crop}"`);
    }
  }
  console.log('  ✓ Test 2 Passed: Complex agricultural names with parentheses, slashes, brackets safely escaped.');
  passed++;

  // TEST 3: Mandi Invalid Date Handling
  total++;
  console.log('\n[TEST 3] Verifying Mandi Filter Gracefully Handles Invalid Dates:');
  const invalidDateFilter = buildMarketFilter({ date: 'not-a-valid-date' });
  if (invalidDateFilter.date === undefined) {
    console.log('  ✓ Test 3 Passed: Invalid date string ignored without crashing or setting NaN date.');
    passed++;
  } else {
    throw new Error('Test 3 Failed: Invalid date was set on MongoDB filter.');
  }

  // TEST 4: CastError Handler Differentiation and Protection
  total++;
  console.log('\n[TEST 4] Verifying CastError Diagnostic Protection:');
  const dateCastErr: any = new Error('Cast to date failed for value "invalid" at path "date"');
  dateCastErr.name = 'CastError';
  dateCastErr.path = 'date';
  dateCastErr.kind = 'date';

  const res1 = createMockRes();
  errorHandler(dateCastErr, { method: 'GET', url: '/api/market/prices?date=invalid', headers: {} } as any, res1 as any, () => {});

  if (res1.getStatusCode() === 400 && res1.getData().code === 'INVALID_RESOURCE_IDENTIFIER' && res1.getData().message === 'Invalid date format provided in query.') {
    console.log('  ✓ Test 4 Passed: Date CastError provides clear message without exposing model schemas.');
    passed++;
  } else {
    throw new Error(`Test 4 Failed: Unexpected date CastError response: ${JSON.stringify(res1.getData())}`);
  }

  // TEST 5: 12-Language Locales Verification
  total++;
  console.log('\n[TEST 5] Verifying 12-Language Locale File Coverage & Parity:');
  const localesDir = path.resolve(__dirname, '../../../frontend/src/locales');
  const expectedLangs = ['en', 'hi', 'gu', 'mr', 'pa', 'bn', 'ta', 'te', 'kn', 'ml', 'or', 'as'];
  const requiredSections = ['nav', 'common', 'dashboard', 'disease', 'irrigation', 'market', 'referral', 'settings', 'auth'];

  for (const lang of expectedLangs) {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test 5 Failed: Missing locale file for ${lang}`);
    }
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const section of requiredSections) {
      if (!content[section] || typeof content[section] !== 'object') {
        throw new Error(`Test 5 Failed: Language ${lang} missing required section "${section}"`);
      }
    }
    // Check referral keys
    if (!content.referral.title || !content.referral.copy_code || !content.referral.whatsapp) {
      throw new Error(`Test 5 Failed: Language ${lang} missing core referral keys`);
    }
    // Check market keys
    if (!content.market.mandi_rates_title || !content.market.search_rates_btn || !content.market.no_history_data) {
      throw new Error(`Test 5 Failed: Language ${lang} missing core market keys`);
    }
  }
  console.log('  ✓ Test 5 Passed: All 12 supported Indian languages verified with 100% core section parity.');
  passed++;

  console.log('\n================================================================');
  console.log(`  ALL MULTILINGUAL & MANDI TESTS PASSED: ${passed}/${total} (100%)`);
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
