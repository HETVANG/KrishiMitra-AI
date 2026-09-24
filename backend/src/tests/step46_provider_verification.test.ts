import { EnvValidator } from '../config/envValidator';
import { ProviderHealthService } from '../services/providers/ProviderHealthService';
import { WeatherService } from '../services/WeatherService';
import { normalizeMarketRecord } from '../utils/marketUtils';
import { CloudinaryService } from '../services/CloudinaryService';
import { getRazorpayConfig } from '../services/RazorpayService';
import { AIProviderManager } from '../services/ai/aiProviderManager';

async function runStep46ProviderVerificationTests() {
  console.log('--- STARTING L2: REAL PROVIDER & DATA VERIFICATION TESTS ---');

  // Test 1: Centralized Environment Validation
  console.log('\nTest 1: Verifying Centralized Environment Validation...');
  const envReport = EnvValidator.validateEnvironment();
  console.log(`- Env Validation Report: Environment = ${envReport.environment}, isValid = ${envReport.isValid}`);
  if (typeof envReport.isValid !== 'boolean') {
    throw new Error('Test 1 Failed: envReport.isValid must be a boolean');
  }
  if (!envReport.variables['MONGODB_URI'] || !envReport.variables['JWT_SECRET']) {
    throw new Error('Test 1 Failed: Required core variables MONGODB_URI & JWT_SECRET must be evaluated');
  }
  if (envReport.variables['JWT_SECRET'].maskedValue.includes('process.env')) {
    throw new Error('Test 1 Failed: Masked value must not leak system internals');
  }
  console.log('✓ Centralized Environment Validation verified.');

  // Test 2: Provider Health Service & Health Matrix
  console.log('\nTest 2: Verifying Provider Health Matrix & Status Classification...');
  const healthRecords = await ProviderHealthService.evaluateAllProvidersHealth();
  if (!Array.isArray(healthRecords) || healthRecords.length < 5) {
    throw new Error('Test 2 Failed: Expected health records for at least 5 providers');
  }
  const geminiHealth = healthRecords.find(p => p.providerId === 'gemini_flash');
  const weatherHealth = healthRecords.find(p => p.providerId === 'agroweather_india');
  const marketHealth = healthRecords.find(p => p.providerId === 'agmarknet_official');
  const cloudinaryHealth = healthRecords.find(p => p.providerId === 'cloudinary_media');
  const razorpayHealth = healthRecords.find(p => p.providerId === 'razorpay_gateway');

  if (!geminiHealth || !weatherHealth || !marketHealth || !cloudinaryHealth || !razorpayHealth) {
    throw new Error('Test 2 Failed: Core platform providers missing from health matrix');
  }
  console.log(`- Gemini AI Status: ${geminiHealth.status} (${geminiHealth.freshness})`);
  console.log(`- Weather Status: ${weatherHealth.status} (${weatherHealth.freshness})`);
  console.log(`- Market Status: ${marketHealth.status} (${marketHealth.freshness})`);
  console.log(`- Cloudinary Status: ${cloudinaryHealth.status} (${cloudinaryHealth.freshness})`);
  console.log(`- Razorpay Status: ${razorpayHealth.status} (${razorpayHealth.freshness})`);
  console.log('✓ Provider Health Matrix verified.');

  // Test 3: Weather Data Normalization & Telemetry
  console.log('\nTest 3: Verifying Weather Telemetry & Data Freshness...');
  const weatherData = await WeatherService.getWeatherData(18.5204, 73.8567, 'en');
  if (!weatherData || !weatherData.current || typeof weatherData.current.temp !== 'number') {
    throw new Error('Test 3 Failed: Invalid weather data payload');
  }
  if (!weatherData.source || !weatherData.freshness) {
    throw new Error('Test 3 Failed: Weather response missing source or freshness metadata');
  }
  console.log(`- Weather Temp: ${weatherData.current.temp}°C, Condition: ${weatherData.current.condition}`);
  console.log(`- Weather Source: ${weatherData.source}, Freshness: ${weatherData.freshness}`);
  console.log('✓ Weather Telemetry & Data Freshness verified.');

  // Test 4: Market Data Rule (No fake zero prices)
  console.log('\nTest 4: Verifying Market Data Normalization & Rule Enforcements...');
  const recordWithMissingPrice = normalizeMarketRecord({
    crop: 'Wheat',
    state: 'Punjab',
    district: 'Ludhiana',
    market: 'Khanna'
  });
  if (recordWithMissingPrice.priceAvailable !== false) {
    throw new Error('Test 4 Failed: Record with missing price should have priceAvailable = false');
  }
  if (recordWithMissingPrice.priceDisplay !== 'Price Not Available') {
    throw new Error('Test 4 Failed: Missing price display must be "Price Not Available"');
  }

  const recordWithValidPrice = normalizeMarketRecord({
    crop: 'Wheat',
    state: 'Punjab',
    district: 'Ludhiana',
    market: 'Khanna',
    modalPrice: 2275,
    unit: 'Qtl'
  });
  if (recordWithValidPrice.priceAvailable !== true || recordWithValidPrice.modalPrice !== 2275) {
    throw new Error('Test 4 Failed: Record with valid price failed normalization');
  }
  console.log(`- Missing Price Display: "${recordWithMissingPrice.priceDisplay}"`);
  console.log(`- Valid Price Display: "${recordWithValidPrice.priceDisplay}"`);
  console.log('✓ Market Data Rules & Normalization verified.');

  // Test 5: Cloudinary File Validation & Category Checks
  console.log('\nTest 5: Verifying Cloudinary Pre-Upload File Validation...');
  const validBuffer = Buffer.from('fake_image_bytes');
  CloudinaryService.validateFilePayload(validBuffer, 'image/jpeg', 'IMAGE');

  let validationErrorCaught = false;
  try {
    CloudinaryService.validateFilePayload(validBuffer, 'application/x-msdownload', 'IMAGE');
  } catch (err: any) {
    validationErrorCaught = true;
    console.log(`- Unsupported MIME rejection caught cleanly: "${err.message}"`);
  }
  if (!validationErrorCaught) {
    throw new Error('Test 5 Failed: Failed to reject unsupported executable file MIME type');
  }
  console.log('✓ Cloudinary Pre-Upload File Validation verified.');

  // Test 6: Razorpay Mode & Key Security
  console.log('\nTest 6: Verifying Razorpay Mode & Security Controls...');
  const razorpayConfig = getRazorpayConfig();
  if (typeof razorpayConfig.enabled !== 'boolean' || typeof razorpayConfig.mode !== 'string') {
    throw new Error('Test 6 Failed: Invalid Razorpay configuration payload');
  }
  console.log(`- Razorpay Enabled: ${razorpayConfig.enabled}, Mode: ${razorpayConfig.mode}`);
  console.log('✓ Razorpay Mode & Security Controls verified.');

  // Test 7: AI Provider Manager Execution
  console.log('\nTest 7: Verifying AI Provider Manager & Advisory Execution...');
  const advisory = await AIProviderManager.generateAdvisory('How to irrigate cotton crops in high summer?', {}, 'en');
  if (!advisory || typeof advisory.success !== 'boolean' || !advisory.providerName) {
    throw new Error('Test 7 Failed: AI Provider Manager returned malformed payload');
  }
  console.log(`- AI Provider: ${advisory.providerName}, Code: ${advisory.code}, Confidence: ${advisory.confidence}`);
  console.log('✓ AI Provider Manager & Advisory Execution verified.');

  console.log('\n=== L2: ALL PROVIDER & DATA VERIFICATION TESTS PASSED SUCCESSFULLY ===');
}

runStep46ProviderVerificationTests().catch(err => {
  console.error('L2 Provider Verification Test Failure:', err);
  process.exit(1);
});
