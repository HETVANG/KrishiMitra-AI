import { RegionRegistry } from '../config/regions/regionRegistry';
import { convertTemperature, convertArea } from '../utils/units';
import { formatCurrency } from '../utils/currency';
import { LocationResolver } from '../utils/locationResolver';
import { ProviderResolver } from '../services/providers/providerResolver';

async function runStep23Tests() {
  console.log('--- RUNNING STEP 23 GLOBAL REGIONAL INTELLIGENCE TESTS ---');

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

  // 1. RegionRegistry Tests
  const indiaConfig = RegionRegistry.getRegionConfig('IN');
  assert(indiaConfig.supported === true, 'India is marked as active supported region');
  assert(indiaConfig.currency === 'INR', 'India default currency is INR');
  assert(indiaConfig.currencySymbol === '₹', 'India default currency symbol is ₹');

  const usConfig = RegionRegistry.getRegionConfig('US');
  assert(usConfig.supported === false, 'US is marked as unsupported/future expansion');
  assert(RegionRegistry.hasCountry('IN') === true, 'Registry has IN');
  assert(RegionRegistry.hasCountry('XYZ') === false, 'Registry correctly rejects non-existent country');

  // 2. Agricultural Calendar Tests
  const kharifSeason = RegionRegistry.getSeasonForDate(new Date(2026, 6, 15), 'IN'); // July
  assert(kharifSeason.seasonName === 'Kharif', 'July in India resolves to Kharif season');

  const rabiSeason = RegionRegistry.getSeasonForDate(new Date(2026, 11, 15), 'IN'); // December
  assert(rabiSeason.seasonName === 'Rabi', 'December in India resolves to Rabi season');

  const unsuppSeason = RegionRegistry.getSeasonForDate(new Date(2026, 6, 15), 'US');
  assert(unsuppSeason.available === false, 'Unsupported region returns calendar unavailable status');

  // 3. Unit Conversion Tests
  const tempF = convertTemperature(25, 'C', 'F');
  assert(tempF === 77, '25°C converts to 77°F');
  const tempC = convertTemperature(77, 'F', 'C');
  assert(tempC === 25, '77°F converts back to 25°C');

  const hectares = convertArea(10, 'acre', 'hectare');
  assert(Math.abs(hectares - 4.05) < 0.1, '10 acres converts to ~4.05 hectares');

  const bigha = convertArea(10, 'acre', 'bigha');
  assert(Math.abs(bigha - 16.16) < 0.2, '10 acres converts to ~16.16 bigha');

  // 4. Currency Formatting Tests
  const formattedINR = formatCurrency(5000, 'INR', '₹');
  assert(formattedINR.includes('5,000') || formattedINR.includes('5000'), 'Formatted INR contains 5000');

  // 5. Location Resolver Tests
  const resolvedIndia = LocationResolver.resolveLocation(23.0225, 72.5714, 'Gujarat', 'Ahmedabad');
  assert(resolvedIndia.countryCode === 'IN', 'Ahmedabad coordinates resolve to IN country code');
  assert(resolvedIndia.timezone === 'Asia/Kolkata', 'Ahmedabad coordinates resolve to Asia/Kolkata timezone');

  const resolvedUS = LocationResolver.resolveLocation(37.7749, -122.4194, 'California', 'San Francisco', 'US');
  assert(resolvedUS.countryCode === 'US', 'US input resolves to US config');

  // 6. Provider Resolver Tests
  const inMarket = ProviderResolver.getMarketProvider('IN');
  assert(inMarket.id === 'agmarknet_official', 'India resolves to Agmarknet market provider');

  const usMarket = ProviderResolver.getMarketProvider('US');
  assert(usMarket.id.startsWith('unsupported_'), 'US resolves to UnsupportedMarketProvider');

  console.log(`\nTEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep23Tests();
