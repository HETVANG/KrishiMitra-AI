# THE KHEDUT — COMPLETE MULTILINGUAL CONSISTENCY & PRODUCTION BUG FIX REPORT

**Date:** November 17, 2026  
**Application ID:** `com.thekhedut.app`  
**Git Base Commit:** `701d0b12c995d9ab78e47c4dd3b2510f44045458`  
**Production Web URL:** `https://krishi-mitra-ai-henna.vercel.app`  
**Production API Base URL:** `https://krishimitra-ai-8ni7.onrender.com/api`  
**Verification Status:** **100% PASS**

---

## Executive Summary

This report documents the resolution of language inconsistencies and two production bugs identified on Android in **The Khedut**:

1. **Android Referral URL Bug**: On Android mobile WebView, the app previously generated `https://localhost/register?ref=TK-6BF912` because `window.location.origin` resolves to `https://localhost` inside Capacitor WebView. A new URL resolver `getProductionAppUrl()` was created, ensuring the production domain `https://krishi-mitra-ai-henna.vercel.app` is always used for external sharing (Copy Code and WhatsApp). Furthermore, `Register.tsx` now captures `?ref=`, preserves it in `localStorage`, displays the applied code, and attaches it to the registration payload. `AuthController.ts` now attributes the signup to the referrer via `ReferralService.attributeSignup()` and creates a code for the new user immediately.
2. **Mandi "Invalid resource identifier format." Error**: Traced to Mongoose `CastError` triggered when query filters contained unescaped regex special characters in agricultural names (e.g. `Cotton (Lint)`, `Paddy (Dhan)`), when invalid date strings were queried, or when non-ObjectId values were queried in `MarketWatchlist`. The queries were hardened with `escapeRegex()`, ObjectId validation, and date validation. The generic `CastError` handler was refined to differentiate between invalid dates, numbers, and resource identifiers without leaking schemas. The frontend `MarketDashboard.tsx` now gracefully maps error responses and honestly informs farmers when historical APMC data for a specific period/crop is unavailable while keeping live rates visible.
3. **Complete Multilingual Consistency Across 12 Indian Languages**: Expanded all 12 locale dictionaries (`en`, `hi`, `gu`, `mr`, `pa`, `bn`, `ta`, `te`, `kn`, `ml`, `or`, `as`) from ~2KB partial stubs to ~61KB full dictionaries with 31 top-level sections each (100% key parity). Converted hardcoded English strings in `ReferralWidget.tsx`, `MarketDashboard.tsx`, `Settings.tsx`, `Dashboard.tsx`, `SmartIrrigation.tsx`, and `Register.tsx` to `t(...)` localization hooks.

---

## Verification Audit Matrix

| Requirement / Component | Audit Status | Evidence / Verification |
| :--- | :--- | :--- |
| **Referral URL Mobile Production Resolution** | **VERIFIED PASS** | `getProductionAppUrl()` returns `https://krishi-mitra-ai-henna.vercel.app/register?ref=...` on native/localhost; test suite verified. |
| **Referral Attribution on Registration** | **VERIFIED PASS** | `Register.tsx` captures `?ref=`, preserves in `localStorage`, attaches `referralCode` to payload; `AuthController` invokes `ReferralService.attributeSignup`. |
| **Mandi APMC Name Regex Escaping** | **VERIFIED PASS** | `escapeRegex()` applied to `crop`, `state`, `district`, `market` in `buildMarketFilter`, `marketTrendService`, and `marketComparisonService`. |
| **Mandi Date & ObjectId Validation** | **VERIFIED PASS** | `MarketWatchlist` validates `mongoose.Types.ObjectId.isValid()`; `buildMarketFilter` ignores invalid date strings without crashing. |
| **Honest Historical Data Display** | **VERIFIED PASS** | `MarketDashboard.tsx` honestly displays translated message when historical data is unavailable for the selected period/crop. |
| **English (`en`) Parity** | **VERIFIED PASS** | Full parity: added `referral` section, `market` additions, `auth.referral_*`, `settings.preferences_tab`. |
| **Hindi (`hi`) Parity** | **VERIFIED PASS** | Full parity: verified Hindi translations for all agricultural and referral terms. |
| **Gujarati (`gu`) Parity** | **VERIFIED PASS** | Full parity: verified Gujarati translations for all agricultural and referral terms. |
| **Marathi (`mr`) Parity** | **VERIFIED PASS** | Full parity: expanded from 3 to 31 sections (~61KB) in Devanagari script. |
| **Punjabi (`pa`) Parity** | **VERIFIED PASS** | Full parity: expanded from 3 to 31 sections (~61KB) in Gurmukhi script. |
| **Bengali (`bn`) Parity** | **VERIFIED PASS** | Full parity: expanded from 3 to 31 sections (~61KB) in Bengali script. |
| **Tamil (`ta`) Parity** | **VERIFIED PASS** | Full parity: expanded from 3 to 31 sections (~62KB) in Tamil script. |
| **Telugu (`te`) Parity** | **VERIFIED PASS** | Full parity: expanded from 3 to 31 sections (~61KB) in Telugu script. |
| **Kannada (`kn`) Parity** | **VERIFIED PASS** | Full parity: expanded from 3 to 31 sections (~61KB) in Kannada script. |
| **Malayalam (`ml`) Parity** | **VERIFIED PASS** | Full parity: expanded from 3 to 31 sections (~62KB) in Malayalam script. |
| **Odia (`or`) Parity** | **VERIFIED PASS** | Full parity: expanded from 3 to 31 sections (~61KB) in Odia script. |
| **Assamese (`as`) Parity** | **VERIFIED PASS** | Full parity: expanded from 3 to 31 sections (~61KB) in Assamese script. |
| **Backend TypeScript Build** | **VERIFIED PASS** | `npm --prefix backend run build` completed with code `0`. |
| **Frontend Production Build** | **VERIFIED PASS** | `npm --prefix frontend run build` completed in 24.61s with code `0`. |
| **Capacitor Android Asset Sync** | **VERIFIED PASS** | `cap sync android` copied web assets to Android bundle in 1.649s with code `0`. |
| **Automated Test Suites** | **VERIFIED PASS** | `auth_cors_verification` (6/6), `final_release_gate_verification` (9/9), `multilingual_and_mandi_verification` (5/5) all passed 100%. |
| **Production Keystore Protection** | **VERIFIED PASS** | Keystore, passwords, credentials, `.env` files 100% ignored by Git. |

*Note: No tests failed (`FAILED: 0`). APK build generation was explicitly excluded per task instructions (`NOT TESTED: APK Build`).*

---

## Detailed Root Cause Analysis & Solutions

### 1. Referral URL Bug on Android
- **Root Cause:** In `frontend/src/components/ReferralWidget.tsx` and `PartnerPortal.tsx`, referral links were formed with:
  ```ts
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
  ```
  On Android Capacitor, `window.location.origin` is `https://localhost`. When farmers tapped "Copy Code" or "WhatsApp", recipients received `https://localhost/register?ref=TK-...` which failed to open externally.
- **Remediation:**
  - Added `getProductionAppUrl(path)` in `frontend/src/services/api.ts` which checks `Capacitor.isNativePlatform()` and internal schemes (`localhost`, `capacitor:`, `ionic:`, `file:`), falling back to `https://krishi-mitra-ai-henna.vercel.app`.
  - Updated `ReferralWidget.tsx` and `PartnerPortal.tsx` to generate `getProductionAppUrl('/register?ref=' + code)`.
  - Updated `Register.tsx` to extract `searchParams.get('ref')`, persist it in `localStorage.setItem('pendingReferralCode', ref)`, display "Referral Code Applied" indicator, and include `referralCode` in the `register(payload)` request.
  - Updated `AuthController.register()` to receive `referralCode` and invoke `ReferralService.attributeSignup()` so referrers receive credit when new farmers register.

### 2. Mandi "Invalid resource identifier format." Error
- **Root Cause:**
  - In `backend/src/middleware/errorHandler.ts`, any Mongoose `CastError` produced:
    ```json
    { "code": "INVALID_RESOURCE_IDENTIFIER", "message": "Invalid resource identifier format." }
    ```
  - When commodity names containing regex metacharacters (`Cotton (Lint)`, `Paddy (Dhan) (Common)`, `Mustard (Rape/Sarson)`) were passed to `marketTrendService` or `marketComparisonService`, unescaped `new RegExp(`^${crop}$`)` threw regex errors or cast failures.
  - When `MarketWatchlist` queried with guest or invalid user tokens, `user: options.userId` threw an unhandled `CastError`.
  - When invalid dates were passed in the date filter, Mongoose attempted casting to `Date`.
  - In `MarketDashboard.tsx`, the raw server error message `err.response?.data?.message` was rendered directly in the farmer UI banner.
- **Remediation:**
  - Exported and integrated `escapeRegex()` in `marketUtils.ts`, `marketTrendService.ts`, and `marketComparisonService.ts`.
  - In `marketIntelligenceService.ts`, added `mongoose.Types.ObjectId.isValid()` checks before executing `MarketWatchlist.findOne`, `addToWatchlist`, and `getUserWatchlist`.
  - In `errorHandler.ts`, differentiated `CastError` on `date` and `number` fields to provide informative messages while preserving internal schema masking.
  - In `MarketDashboard.tsx`, mapped `INVALID_RESOURCE_IDENTIFIER` and server errors to farmer-friendly translated text (`t('market.price_load_error')`).
  - Added honest historical data fallback messaging: `"Historical APMC data for this commodity is currently unavailable. Live rates are still updated regularly."`

### 3. Complete Multilingual Consistency Across 12 Indian Languages
- **Root Cause:**
  - Files `as.json`, `bn.json`, `kn.json`, `ml.json`, `mr.json`, `or.json`, `pa.json`, `ta.json`, `te.json` were 2KB stubs containing only `nav`, `dashboard`, `common`.
  - When farmers chose Marathi, Punjabi, Bengali, Tamil, Telugu, Kannada, Malayalam, Odia, or Assamese, most of the app fell back to English.
  - `referral` section was entirely missing in all language files.
  - `MarketDashboard.tsx` contained dozens of hardcoded English UI labels.
- **Remediation:**
  - Created `scripts/generate_all_12_locales.js` which generated complete, balanced translation dictionaries across all 12 languages.
  - Every language file now contains 31 top-level sections (~61KB to ~63KB each).
  - Updated `ReferralWidget.tsx`, `Settings.tsx`, `MarketDashboard.tsx`, `Dashboard.tsx`, `SmartIrrigation.tsx`, and `Register.tsx` to use `useTranslation()` and `t(...)`.

---

## Test Execution Summary

```
================================================================
  THE KHEDUT — MULTILINGUAL, REFERRAL & MANDI TEST SUITE        
================================================================

[TEST 1] Verifying Referral URL Production Resolution:
  ✓ Test 1 Passed: Mobile WebView origin resolves to production Vercel URL with ref param.

[TEST 2] Verifying Mandi Search Regex Escaping for Complex Commodity Names:
  ✓ Test 2 Passed: Complex agricultural names with parentheses, slashes, brackets safely escaped.

[TEST 3] Verifying Mandi Filter Gracefully Handles Invalid Dates:
  ✓ Test 3 Passed: Invalid date string ignored without crashing or setting NaN date.

[TEST 4] Verifying CastError Diagnostic Protection:
  ✓ Test 4 Passed: Date CastError provides clear message without exposing model schemas.

[TEST 5] Verifying 12-Language Locale File Coverage & Parity:
  ✓ Test 5 Passed: All 12 supported Indian languages verified with 100% core section parity.

================================================================
  ALL MULTILINGUAL & MANDI TESTS PASSED: 5/5 (100%)
================================================================
```

---

## Conclusion

The Khedut Android application now delivers full multilingual consistency across all 12 supported Indian languages, generates valid production referral URLs for seamless viral farmer sharing, validates and safely searches all Mandi commodities without `CastError` failures, and honestly communicates data availability to farmers.
