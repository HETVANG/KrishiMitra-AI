import assert from 'assert';
import { RegionRegistry } from '../config/regions/regionRegistry';
import { evaluateCountryReadiness } from '../config/regions/countryConfig';
import { ProviderResolver } from '../services/providers/providerResolver';
import { RegionalContextService } from '../services/regionalContextService';
import { User } from '../models/User';
import { Farm } from '../models/Farm';

async function runStep40GlobalScaleTests() {
  console.log('--- STARTING STEP 40: GLOBAL SCALE & MULTI-COUNTRY AGRICULTURE ENGINE TESTS ---');

  // 1. Centralized Country Registry & Statuses
  console.log('Test 1: Verifying Country Registry & Activation Statuses...');
  const indiaConfig = RegionRegistry.getRegionConfig('IN');
  assert.strictEqual(indiaConfig.countryCode, 'IN');
  assert.strictEqual(indiaConfig.status, 'SUPPORTED');
  assert.strictEqual(indiaConfig.supported, true);
  assert.strictEqual(indiaConfig.currency, 'INR');

  const usConfig = RegionRegistry.getRegionConfig('US');
  assert.strictEqual(usConfig.countryCode, 'US');
  assert.strictEqual(usConfig.status, 'BETA');
  assert.strictEqual(usConfig.supported, true);

  const keConfig = RegionRegistry.getRegionConfig('KE');
  assert.strictEqual(keConfig.countryCode, 'KE');
  assert.strictEqual(keConfig.status, 'COMING_SOON');
  assert.strictEqual(keConfig.supported, false);

  const vnConfig = RegionRegistry.getRegionConfig('VN');
  assert.strictEqual(vnConfig.countryCode, 'VN');
  assert.strictEqual(vnConfig.status, 'PLANNED');

  const allCountries = RegionRegistry.getAllCountries();
  assert(allCountries.length >= 6, 'Registry contains all expected countries');
  console.log('✓ Country Registry & Activation Statuses verified successfully.');

  // 2. Country Readiness Evaluation
  console.log('\nTest 2: Verifying Country Readiness Evaluation...');
  const inReadiness = RegionRegistry.evaluateCountryReadiness('IN');
  assert.strictEqual(inReadiness.countryCode, 'IN');
  assert.strictEqual(inReadiness.readinessScore, 100);
  assert.strictEqual(inReadiness.dataSourcesReady, true);
  assert.strictEqual(inReadiness.paymentsReady, true);
  assert.strictEqual(inReadiness.missingRequirements.length, 0);

  const usReadiness = evaluateCountryReadiness('US');
  assert.strictEqual(usReadiness.countryCode, 'US');
  assert.strictEqual(usReadiness.readinessScore, 85);
  assert.strictEqual(usReadiness.paymentsReady, false);
  assert(usReadiness.missingRequirements.length > 0, 'US lists missing requirements');

  const vnReadiness = RegionRegistry.evaluateCountryReadiness('VN');
  assert.strictEqual(vnReadiness.countryCode, 'VN');
  assert.strictEqual(vnReadiness.readinessScore, 20);
  console.log('✓ Country Readiness Evaluation verified successfully.');

  // 3. Feature Availability Matrix
  console.log('\nTest 3: Verifying Feature Availability Matrix...');
  assert.strictEqual(RegionRegistry.isFeatureAvailable('IN', 'weather'), true);
  assert.strictEqual(RegionRegistry.isFeatureAvailable('IN', 'marketPrices'), true);
  assert.strictEqual(RegionRegistry.isFeatureAvailable('IN', 'payments'), true);

  assert.strictEqual(RegionRegistry.isFeatureAvailable('US', 'weather'), true);
  assert.strictEqual(RegionRegistry.isFeatureAvailable('US', 'marketPrices'), false);
  assert.strictEqual(RegionRegistry.isFeatureAvailable('US', 'payments'), false);

  assert.strictEqual(RegionRegistry.isFeatureAvailable('VN', 'weather'), false);
  assert.strictEqual(RegionRegistry.isFeatureAvailable('VN', 'marketPrices'), false);
  console.log('✓ Feature Availability Matrix verified successfully.');

  // 4. Provider Resolution Architecture
  console.log('\nTest 4: Verifying Multi-Country Provider Resolution...');
  const inMarket = ProviderResolver.getMarketProvider('IN');
  assert.strictEqual(inMarket.id, 'agmarknet_official');

  const usMarket = ProviderResolver.getMarketProvider('US');
  assert(usMarket.id.startsWith('unsupported'), 'US market returns unsupported provider');
  const usMarketRes = await usMarket.getMarketPrices('Corn');
  assert.strictEqual(usMarketRes.available, false);
  assert.strictEqual(usMarketRes.code, 'FEATURE_NOT_SUPPORTED_IN_REGION');

  const inPayment = ProviderResolver.getPaymentProvider('IN');
  assert.strictEqual(inPayment.available, true);
  assert.strictEqual(inPayment.id, 'razorpay_india');

  const usPayment = ProviderResolver.getPaymentProvider('US');
  assert.strictEqual(usPayment.available, false);
  assert.strictEqual(usPayment.code, 'FEATURE_NOT_SUPPORTED_IN_REGION');
  console.log('✓ Provider Resolution Architecture verified successfully.');

  // 5. Farm-Level Authoritative Regional Context
  console.log('\nTest 5: Verifying Farm-Level Authoritative Regional Context...');
  // Mock User and Farm objects in memory for unit test
  const fakeUserId = '507f1f77bcf86cd799439011';
  const fakeUser = {
    _id: fakeUserId,
    countryCode: 'IN',
    settings: {
      regionalPreferences: {
        countryCode: 'IN',
        currency: 'INR',
        temperatureUnit: 'C'
      }
    }
  };

  // Mock User.findById and Farm.findOne
  const originalUserFindById = User.findById;
  const originalFarmFindOne = Farm.findOne;

  (User as any).findById = () => ({
    lean: async () => fakeUser
  });

  (Farm as any).findOne = (query: any) => ({
    sort: () => ({
      lean: async () => ({
        _id: 'farm123',
        user: fakeUserId,
        countryCode: 'US', // Farm is located in US
        state: 'Iowa',
        district: 'Polk',
        landAreaUnit: 'acre',
        temperatureUnit: 'F',
        currency: 'USD'
      })
    })
  });

  try {
    const context = await RegionalContextService.getRegionalContext(fakeUserId);
    assert.strictEqual(context.countryCode, 'US', 'Farm countryCode overrides user default countryCode');
    assert.strictEqual(context.countryName, 'United States');
    assert.strictEqual(context.status, 'BETA');
    assert.strictEqual(context.readinessScore, 85);
    assert.strictEqual(context.features.weather, true);
    assert.strictEqual(context.features.marketPrices, false);
    console.log('✓ Farm-Level Authoritative Regional Context verified successfully.');
  } finally {
    User.findById = originalUserFindById;
    Farm.findOne = originalFarmFindOne;
  }

  console.log('\n=============================================================');
  console.log('🎉 ALL STEP 40 GLOBAL SCALE ENGINE TESTS PASSED CLEANLY! 🎉');
  console.log('=============================================================\n');
}

runStep40GlobalScaleTests().catch(err => {
  console.error('❌ STEP 40 TEST FAILURE:', err);
  process.exit(1);
});
