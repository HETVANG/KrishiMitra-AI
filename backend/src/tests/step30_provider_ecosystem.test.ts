import { ProviderRegistry } from '../services/providers/ProviderRegistry';
import { ProviderCapabilityService } from '../services/providers/ProviderCapabilityService';
import { ProviderHealthService } from '../services/providers/ProviderHealthService';
import { ProviderConfigService } from '../services/providers/ProviderConfigService';
import { ProviderResolver } from '../services/providers/providerResolver';
import { WeatherProviderAdapter, MarketProviderAdapter, AgricultureKnowledgeAdapter } from '../services/providers/ProviderAdapter';
import { ToolRegistry } from '../services/agents/toolRegistry';

async function runStep30Tests() {
  console.log('--- RUNNING STEP 30 GLOBAL PROVIDER & PARTNER ECOSYSTEM TESTS ---');

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

  // 1. Provider Registry Test
  const providers = await ProviderRegistry.getProviders(undefined, 'IN');
  assert(providers.length >= 4, 'ProviderRegistry initializes standard platform providers (Weather, Market, Agriculture, Soil, Experts)');
  
  const weatherProvider = providers.find(p => p.providerType === 'WEATHER');
  assert(weatherProvider !== undefined && weatherProvider.country === 'IN', 'Weather provider mapped to Indian agricultural region');

  // 2. Capability Service Test
  const weatherMatches = await ProviderCapabilityService.findProvidersWithCapability('weatherForecast', 'WEATHER', 'IN');
  assert(weatherMatches.length > 0, 'ProviderCapabilityService resolves providers supporting weatherForecast');

  const marketMatches = await ProviderCapabilityService.findProvidersWithCapability('marketPrices', 'MARKET', 'IN');
  assert(marketMatches.length > 0, 'ProviderCapabilityService resolves providers supporting marketPrices');

  // 3. Health Monitoring & Circuit Breaker Test
  const pId = 'agroweather_test_feed';
  ProviderHealthService.recordSuccess(pId, 'Test Weather Provider', 'WEATHER', 85);
  let health = ProviderHealthService.getHealthRecord(pId);
  assert(health.status === 'HEALTHY' && health.circuitBreakerOpen === false, 'ProviderHealthService records successful health telemetry');

  ProviderHealthService.recordFailure(pId, 'Test Weather Provider', 'WEATHER', 'Connection timeout');
  ProviderHealthService.recordFailure(pId, 'Test Weather Provider', 'WEATHER', 'Connection timeout');
  ProviderHealthService.recordFailure(pId, 'Test Weather Provider', 'WEATHER', 'Connection timeout');
  health = ProviderHealthService.getHealthRecord(pId);
  assert(health.status === 'UNAVAILABLE' && health.circuitBreakerOpen === true, 'Circuit breaker opens upon 3 consecutive failures');

  // 4. Credential Security Isolation Test
  const config = ProviderConfigService.getProviderConfig('agroweather_india');
  assert(config.isConfigured === true, 'ProviderConfigService returns configuration status');
  assert((config as any).apiKey === undefined, 'ProviderConfigService isolates credentials and never returns API keys or secrets');

  // 5. Provider Adapters & Source Provenance Test
  const weatherAdapter = new WeatherProviderAdapter();
  const weatherRes = await weatherAdapter.getCurrentAndForecastWeather(23.0225, 72.5714, 'en', 'IN');
  assert(weatherRes.source.providerName !== undefined, 'WeatherAdapter attaches source provider name metadata');
  assert(weatherRes.source.freshness !== undefined, 'WeatherAdapter attaches data freshness provenance metadata');

  const marketAdapter = new MarketProviderAdapter();
  const marketRes = await marketAdapter.getMarketPrices('Cotton', 'Gujarat', 'Rajkot');
  assert(marketRes.source.providerId === 'agmarknet_official', 'MarketAdapter attaches official Agmarknet source provenance metadata');

  const agriAdapter = new AgricultureKnowledgeAdapter();
  const agriRes = await agriAdapter.getCropCalendar('Wheat', 'IN');
  assert(agriRes.available === true && agriRes.source.providerId === 'icar_national', 'AgricultureKnowledgeAdapter resolves ICAR national agricultural research calendar');

  // 6. Capability Resolver Test
  const resolved = await ProviderResolver.resolveProviderForCapability('weatherForecast', 'WEATHER', 'IN');
  assert(resolved.available === true && resolved.primary !== undefined, 'ProviderResolver resolves primary provider for capability requests');

  // 7. Agent Tool Registry Integration Test
  const capsTool = ToolRegistry.getTool('getProviderCapabilities');
  assert(capsTool !== undefined, 'getProviderCapabilities tool is registered in ToolRegistry');
  assert(capsTool?.permission === 'READ_ONLY', 'getProviderCapabilities tool is classified READ_ONLY');

  const statusTool = ToolRegistry.getTool('getProviderStatus');
  assert(statusTool !== undefined, 'getProviderStatus tool is registered in ToolRegistry');

  const searchEcosystemTool = ToolRegistry.getTool('searchEcosystemProviders');
  assert(searchEcosystemTool !== undefined, 'searchEcosystemProviders tool is registered in ToolRegistry');

  console.log(`\nSTEP 30 TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStep30Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
