# THE KHEDUT — MANDI LOCATION FILTERING BUG FIX REPORT

**Date:** 2026-11-23  
**Project:** KrishiMitra AI – The Khedut  
**Subsystem:** Mandi Prices & Market Intelligence Location Filtering  
**Repository:** `KrishiMitra-AI`  
**Status:** Complete & Verified  

---

## 1. Executive Summary

A critical issue was identified where the Mandi Prices section could display Madhya Pradesh (MP) mandis when the selected or authenticated user location was Surat, Gujarat (or other Gujarat locations).

A comprehensive architectural investigation revealed multiple contributing factors across frontend state lifecycle management, query handoff, and backend MongoDB filtering / fallback hierarchies.

All root causes have been resolved, verified via clean production builds (`tsc && vite build` on frontend, `tsc` on backend), and validated with **100% passing scores across 42 regression and targeted unit tests**.

Existing functionality—including crop search, pagination, price history, comparison distance calculations, watchlist, Hindi/Gujarati/English translations, and explicit national comparisons—was strictly preserved.

---

## 2. Root Cause Analysis

| # | Component | Root Cause | Impact |
|---|---|---|---|
| **RC-1** | `frontend/src/pages/MarketDashboard.tsx` | `handleDetectLocation` checked `if (resolvedState && !searchState) setSearchState(...)`. Because `searchState` initialized to default `'Gujarat'`, `!searchState` was always `false`, blocking GPS geocoding from updating state and district. | Stale default location remained active even when GPS resolved the actual device location. |
| **RC-2** | `frontend/src/pages/MarketDashboard.tsx` | Profile location loaded asynchronously after component mount, but `initialLoc` was only computed once during initial render. | If profile loaded after mount (e.g. from network or token auth), the user's saved farm state/district was not synchronized to active filter state. |
| **RC-3** | `frontend/src/pages/MarketDashboard.tsx` | In `runMasterFetch()`, child fetchers (`fetchPrices`, `fetchMarketIntelligence`, `fetchHistory`) read closure state `searchState` and `searchDistrict` rather than arguments passed from callers. | Asynchronous state updates caused race conditions where fetches used previous/stale location states. |
| **RC-4** | `frontend/src/pages/MarketDashboard.tsx` | Selecting a new state (e.g., Gujarat $\rightarrow$ MP) or entering a new district did not reconcile or clear incompatible pairs. | An impossible combination like State: "Gujarat", District: "Ujjain" could be queried. |
| **RC-5** | `backend/src/utils/marketUtils.ts` | `buildMarketFilter()` created an unanchored regex: `new RegExp(escapeRegex(query.state), 'i')` without canonical state normalization. | Could match partial substrings or non-canonical state names across state lines. |
| **RC-6** | `backend/src/services/MarketPriceService.ts` | Level 4 fallback (`latest-country`) checked `if (total === 0 && (!query.state || query.allowNationalFallback))`. | If `query.state` was empty or missing, Level 4 silently deleted the state filter and dumped mandis across all of India (including MP) into local views. |
| **RC-7** | `backend/src/services/market/marketComparisonService.ts` | In `compareNearbyMarkets()`, if `!canonicalState`, it immediately queried `MarketPrice.find(cropFilter)` nationally without checking `allowNationalFallback`. | Multi-state/national mandis were returned when state was omitted. |

---

## 3. Files Modified & Exact Fixes

### 1. `backend/src/utils/geoNormalization.ts`
- Added comprehensive `DISTRICT_TO_STATE_MAP` mapping major districts across Gujarat, Madhya Pradesh, Maharashtra, Rajasthan, Punjab, and Haryana to their canonical states.
- Implemented `getCanonicalStateForDistrict(districtName)` with exact match, alias resolution, and substring lookup.
- Enhanced `normalizeState(rawState)`:
  - Handles "All States", "National", "India" by returning empty string (preventing literal regex matching against "All States").
  - Handles compound strings (e.g. `"Surat, Gujarat"` $\rightarrow$ `"Gujarat"`).
  - Handles abbreviations (e.g. `"GJ"` $\rightarrow$ `"Gujarat"`, `"MP"` $\rightarrow$ `"Madhya Pradesh"`).
  - Uses word-boundary regex matching to avoid substring collision.

### 2. `backend/src/utils/marketUtils.ts`
- In `normalizeMarketRecord()`, state is canonically normalized via `normalizeState()` before persistence.
- In `buildMarketFilter()`:
  - Normalizes `query.state` using `normalizeState()`.
  - Auto-infers canonical state from `query.district` or `query.market` if state is missing or conflicting.
  - Strictly anchors state in regex: `new RegExp(`^${escapeRegex(canonicalState)}$`, 'i')` ensuring cross-state substring matches are impossible.

### 3. `backend/src/services/MarketPriceService.ts`
- Upgraded cache key to include canonicalized state, district, crop, page, limit, date, and `nat` vs `loc` mode flag.
- Added state guard: if no state could be resolved and `allowNationalFallback` is `false`, immediately returns clean empty results instead of falling back to national records.
- Level 4 fallback (`latest-country`) is strictly gated: `if (total === 0 && allowNational)`.

### 4. `backend/src/services/market/marketComparisonService.ts`
- Infers canonical state from `options.district` via `getCanonicalStateForDistrict()`.
- If `!canonicalState`, records are queried nationally **only** when `options.allowNationalFallback === true`. Otherwise, returns empty candidates with zero leakage.

### 5. `backend/src/controllers/MarketPriceController.ts`
- Forwarded `allowNationalFallback: req.query.allowNationalFallback === 'true'` in both `searchPrices()` and `getPrices()` endpoints.

### 6. `frontend/src/utils/mandiLocationUtils.ts`
- Added `DISTRICT_TO_STATE_MAP` and `getCanonicalStateForDistrict()` for client-side state/district validation.

### 7. `frontend/src/pages/MarketDashboard.tsx`
- Added `isUserManualSelection` ref to track when a farmer has manually chosen a state or district.
- Enhanced `resolveInitialLocation()` to infer state from district when state is omitted in stored/user objects.
- Added `useEffect` listening to `user?.farmLocation` to synchronize late-loading authenticated profile location without overriding manual selection.
- Updated `handleDetectLocation(isManualClick = false)` to remove the blocking `!searchState` condition, updating location on manual click or when no manual selection was made.
- Added `handleStateChange(newState)` to clear incompatible districts when switching states.
- Added `handleDistrictChange(newDistrict)` to auto-synchronize state when a recognized district from another state is typed.
- Refactored `fetchPrices`, `fetchMarketIntelligence`, `fetchHistory`, and `fetchComparison` to accept explicit `targetState` and `targetDistrict` parameters, eliminating stale closure variables in `runMasterFetch`.
- In `handleResetFilters()`, resets `isUserManualSelection.current = false` and restores default Gujarat location.

---

## 4. Verification and Test Results

### Build Verification
1. **Frontend Build:** `npm --prefix frontend run build`
   - Command: `tsc && vite build`
   - Result: **0 Errors, 2529 modules transformed**, production bundle created cleanly.
2. **Backend Build:** `npm --prefix backend run build`
   - Command: `tsc && node -e "require('fs').cpSync('src/assets', 'dist/assets', {recursive: true})"`
   - Result: **0 TypeScript Errors**, compiled cleanly.

### Test Execution
1. **Mandi Location & Quality Regression Suite (12/12 Passed - 100%):**
   - Test 1: Surat, Gujarat location canonically normalized and accurately matches Surat APMC without MP/Bihar.
   - Test 2: Ahmedabad & Ahmadabad aliases correctly match Ahmedabad, Dholka, and Sanand.
   - Test 3: Ujjain maps to Madhya Pradesh, with clean neighbor hierarchy.
   - Test 4: Location transition updates state boundaries cleanly without stale retention.
   - Test 5: Explicit user selection strictly takes precedence over saved location.
   - Test 6: GPS denial enables manual state selection without crashing.
   - Test 7: Unknown coordinates return null; no fabricated distance generated.
   - Test 8: Surat to Ujjain (377 km) classified as "Distant Market", NEVER "Local Mandi".
   - Test 9: Surat to Bardoli (29 km) classified as "Local APMC" with verified ground coordinates.
   - Test 10: Staleness indicator correctly differentiates live vs historical prices.
   - Test 11: Helpful, specific empty state generated on 0 results.
   - Test 12: National markets strictly gated; never silently mixed into local view.

2. **Targeted Mandi Location Fix Verification Suite (30/30 Passed - 100%):**
   - District-to-State Canonical Mapping (12 tests): Surat, Ahmedabad, Rajkot, Ujjain, Indore, Bhopal, Nashik, Pune, Jaipur, Ludhiana, Karnal, and unknown fallback.
   - State Normalization Robustness (8 tests): Gujarat, GUJARAT, GJ, "Surat, Gujarat", Madhya Pradesh, MP, "All States", empty string.
   - Filter Anchoring & State Inference (10 tests):
     - Exact state anchored with `^...$`.
     - Rejects non-matching states.
     - Auto-infers state from district when omitted.
     - Reconciles conflicting state when district is known to belong to another state.
     - No state filter set when omitted without national fallback.

---

## 5. Database Records Assessment

- **Policy Compliance:** In accordance with the prompt instructions, **no bulk updates or deletions were executed on the database**.
- **Ingestion Protection:** `normalizeMarketRecord()` in `backend/src/utils/marketUtils.ts` now intercepts and canonicalizes all incoming sync records through `normalizeState()`. Any future Government API syncs automatically persist normalized state names.
- **Query Protection:** Database queries are safeguarded at the filter layer via anchored regex (`^...$`) and canonical normalization, ensuring that even if legacy records with varying casing or whitespace exist, cross-state leakage is impossible.

---

## 6. Feature Preservation Confirmation

The following existing features remain intact and functional:
- **Crop Selection & Search:** Searchable dropdown with popular commodity carousel works seamlessly.
- **Pagination:** Next/Previous page controls function with preserved state/district parameters.
- **Price History Trends:** 7, 30, and 90-day historical chart data fetches respect selected state/district.
- **Nearby Mandi Comparisons:** Tier-1 (local), Tier-2 (state), and Tier-3 (neighboring) distance calculations and APMC distance rankings operate correctly.
- **Farmer Watchlist:** Add/remove watchlist items with live rates.
- **Localization:** Hindi, Gujarati, and English translations and commodity name lookups function as designed.
- **Explicit National Comparison:** Farmers can still deliberately enable national comparison via the toggle/parameter without cross-state pollution in the default local view.
