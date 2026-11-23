import { getCanonicalStateForDistrict, normalizeState } from '../utils/geoNormalization';
import { buildMarketFilter } from '../utils/marketUtils';

console.log('================================================================');
console.log('  THE KHEDUT — TARGETED MANDI LOCATION FIX VERIFICATION TEST    ');
console.log('================================================================\n');

let passed = 0;
let total = 0;

function assert(condition: boolean, desc: string) {
  total++;
  if (condition) {
    console.log(`  ✓ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${desc}`);
    process.exitCode = 1;
  }
}

// 1. District-to-State Canonical Mapping
console.log('[SUITE 1] District-to-State Canonical Mapping');
assert(getCanonicalStateForDistrict('Surat') === 'Gujarat', 'Surat maps to Gujarat');
assert(getCanonicalStateForDistrict('ahmedabad') === 'Gujarat', 'ahmedabad (lowercase) maps to Gujarat');
assert(getCanonicalStateForDistrict('Rajkot') === 'Gujarat', 'Rajkot maps to Gujarat');
assert(getCanonicalStateForDistrict('Ujjain') === 'Madhya Pradesh', 'Ujjain maps to Madhya Pradesh');
assert(getCanonicalStateForDistrict('Indore') === 'Madhya Pradesh', 'Indore maps to Madhya Pradesh');
assert(getCanonicalStateForDistrict('Bhopal') === 'Madhya Pradesh', 'Bhopal maps to Madhya Pradesh');
assert(getCanonicalStateForDistrict('Nashik') === 'Maharashtra', 'Nashik maps to Maharashtra');
assert(getCanonicalStateForDistrict('Pune') === 'Maharashtra', 'Pune maps to Maharashtra');
assert(getCanonicalStateForDistrict('Jaipur') === 'Rajasthan', 'Jaipur maps to Rajasthan');
assert(getCanonicalStateForDistrict('Ludhiana') === 'Punjab', 'Ludhiana maps to Punjab');
assert(getCanonicalStateForDistrict('Karnal') === 'Haryana', 'Karnal maps to Haryana');
assert(getCanonicalStateForDistrict('UnknownDistrictXYZ') === null, 'Unknown district returns null');

// 2. State Normalization Robustness
console.log('\n[SUITE 2] State Normalization Robustness');
assert(normalizeState('Gujarat') === 'Gujarat', 'Normalize "Gujarat"');
assert(normalizeState('GUJARAT') === 'Gujarat', 'Normalize "GUJARAT"');
assert(normalizeState('GJ') === 'Gujarat', 'Normalize abbreviation "GJ"');
assert(normalizeState('Surat, Gujarat') === 'Gujarat', 'Extract state from "Surat, Gujarat"');
assert(normalizeState('Madhya Pradesh') === 'Madhya Pradesh', 'Normalize "Madhya Pradesh"');
assert(normalizeState('MP') === 'Madhya Pradesh', 'Normalize abbreviation "MP"');
assert(normalizeState('All States') === '', 'Handle "All States" sentinel value');
assert(normalizeState('') === '', 'Handle empty string');

// 3. buildMarketFilter Anchoring and State Inference
console.log('\n[SUITE 3] buildMarketFilter Anchoring and State Inference');

// Surat, Gujarat query
const filterSurat = buildMarketFilter({ state: 'Gujarat', district: 'Surat', crop: 'Wheat' });
assert(filterSurat.state instanceof RegExp, 'Filter state is a RegExp');
assert((filterSurat.state as RegExp).test('Gujarat'), 'Filter matches "Gujarat"');
assert(!(filterSurat.state as RegExp).test('Madhya Pradesh'), 'Filter rejects "Madhya Pradesh"');
assert(!(filterSurat.state as RegExp).test('Gujarat State'), 'Filter anchored strictly, rejects "Gujarat State"');

// Surat district with missing state
const filterSuratNoState = buildMarketFilter({ district: 'Surat', crop: 'Wheat' });
assert((filterSuratNoState.state as RegExp).test('Gujarat'), 'Auto-infers state "Gujarat" from district "Surat"');
assert(!(filterSuratNoState.state as RegExp).test('Madhya Pradesh'), 'Reject MP when district is Surat');

// Ujjain district with missing state
const filterUjjainNoState = buildMarketFilter({ district: 'Ujjain', crop: 'Wheat' });
assert((filterUjjainNoState.state as RegExp).test('Madhya Pradesh'), 'Auto-infers state "Madhya Pradesh" from district "Ujjain"');
assert(!(filterUjjainNoState.state as RegExp).test('Gujarat'), 'Reject Gujarat when district is Ujjain');

// Incompatible state/district query (e.g. state Gujarat, district Ujjain)
const filterIncompatible = buildMarketFilter({ state: 'Gujarat', district: 'Ujjain', crop: 'Wheat' });
assert((filterIncompatible.state as RegExp).test('Madhya Pradesh'), 'Reconciles state to "Madhya Pradesh" when district is known to be in MP');

// Missing state and unknown district without national fallback
const filterNoStateNoDistrict = buildMarketFilter({ crop: 'Wheat', allowNationalFallback: false });
assert(filterNoStateNoDistrict.state === undefined, 'No state set when omitted');

console.log('\n================================================================');
console.log(`  TEST RESULTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
