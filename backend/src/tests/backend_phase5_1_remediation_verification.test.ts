import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { marketSyncService } from '../services/MarketSyncService';
import { ObservabilityService } from '../services/observabilityService';

console.log('================================================================');
console.log('  THE KHEDUT — PHASE 5.1 PERFORMANCE REMEDIATION TEST SUITE     ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

async function it(desc: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      await res;
    }
    passedTests++;
    console.log(`  ✓ [PASS] ${desc}`);
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${desc}: ${err.message}`);
    throw err;
  }
}

async function run() {
  console.log('[REMEDIATION 1] Mandi Background Sync Concurrency Lock & Status');

  await it('MarketSyncService reports initial idle status', () => {
    const status = marketSyncService.getSyncStatus();
    assert.strictEqual(status.isSyncing, false);
    assert.strictEqual(status.lastSyncTime, null);
    assert.strictEqual(status.lastSyncResult, null);
  });

  await it('MarketSyncService concurrency guard blocks duplicate concurrent runs', async () => {
    // Manually set isSyncing = true to simulate a running sync
    (marketSyncService as any).isSyncing = true;
    const statusBefore = marketSyncService.getSyncStatus();
    assert.strictEqual(statusBefore.isSyncing, true);

    // Calling syncLatestPrices while syncing should immediately skip and return without re-entering
    const result = await marketSyncService.syncLatestPrices();
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.message, 'Synchronization already in progress');
    assert.strictEqual(result.recordsInserted, 0);

    // Reset lock
    (marketSyncService as any).isSyncing = false;
  });

  await it('Observability health report includes marketSync telemetry', () => {
    const health = ObservabilityService.getTelemetry();
    assert.ok(health.marketSync, 'Observability payload must include marketSync section');
    assert.strictEqual(typeof health.marketSync.isSyncing, 'boolean');
  });

  console.log('\n[REMEDIATION 2] Logo SVG & Brand Asset Size Optimization');

  await it('khedut-logo-horizontal.svg is optimized (< 300 KB)', () => {
    const filePath = path.resolve(__dirname, '../../../frontend/public/khedut-logo-horizontal.svg');
    assert.ok(fs.existsSync(filePath), 'File must exist');
    const size = fs.statSync(filePath).size;
    assert.ok(size < 300 * 1024, `Size must be under 300 KB, was ${(size / 1024).toFixed(1)} KB`);
    assert.ok(size < 250 * 1024, `Size was ${(size / 1024).toFixed(1)} KB (target ~236 KB)`);
  });

  await it('khedut-logo-horizontal-dark.svg is optimized (< 300 KB)', () => {
    const filePath = path.resolve(__dirname, '../../../frontend/public/khedut-logo-horizontal-dark.svg');
    assert.ok(fs.existsSync(filePath), 'File must exist');
    const size = fs.statSync(filePath).size;
    assert.ok(size < 300 * 1024, `Size must be under 300 KB, was ${(size / 1024).toFixed(1)} KB`);
    assert.ok(size < 250 * 1024, `Size was ${(size / 1024).toFixed(1)} KB (target ~236 KB)`);
  });

  console.log('\n[REMEDIATION 3] Accessibility & Contrast in Landing Page');

  await it('Landing.tsx contains main landmark with #main-content', () => {
    const landingPath = path.resolve(__dirname, '../../../frontend/src/pages/Landing.tsx');
    const content = fs.readFileSync(landingPath, 'utf8');
    assert.ok(content.includes('<main id="main-content"'), 'Must have <main id="main-content" landmark');
    assert.ok(content.includes('</main>'), 'Must have closing </main> landmark');
  });

  await it('Landing.tsx footer uses semantic h3 headings instead of h4', () => {
    const landingPath = path.resolve(__dirname, '../../../frontend/src/pages/Landing.tsx');
    const content = fs.readFileSync(landingPath, 'utf8');
    const footerContent = content.substring(content.indexOf('<footer'));
    assert.ok(footerContent.includes('<h3 className="font-bold text-white'), 'Footer must use h3 headings');
    assert.ok(!footerContent.includes('<h4 className="font-bold text-white'), 'Footer must not use h4 headings after h2');
  });

  await it('Landing.tsx footer links meet minimum 24px tap-target height', () => {
    const landingPath = path.resolve(__dirname, '../../../frontend/src/pages/Landing.tsx');
    const content = fs.readFileSync(landingPath, 'utf8');
    const footerContent = content.substring(content.indexOf('<footer'));
    assert.ok(footerContent.includes('min-h-[24px]'), 'Footer links must have min-h-[24px]');
  });

  await it('Landing.tsx footer text uses high-contrast text-slate-300 and text-slate-400', () => {
    const landingPath = path.resolve(__dirname, '../../../frontend/src/pages/Landing.tsx');
    const content = fs.readFileSync(landingPath, 'utf8');
    const footerContent = content.substring(content.indexOf('<footer'));
    assert.ok(footerContent.includes('text-slate-300'), 'Footer links must use text-slate-300 for WCAG AA compliance');
    assert.ok(footerContent.includes('text-slate-400'), 'Footer text must use text-slate-400 for WCAG AA compliance');
    assert.ok(!footerContent.includes('text-slate-600'), 'Footer must not use low-contrast text-slate-600');
  });

  console.log('\n================================================================');
  console.log(`  PHASE 5.1 VERIFICATION: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');
}

run().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
