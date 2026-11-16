# THE KHEDUT — FINAL GOOGLE PLAY PRE-SUBMISSION AUDIT REPORT

**Application Name:** The Khedut  
**Application ID:** `com.thekhedut.app`  
**Current Version:** `1.0.0` (Version Code: `1`)  
**Target Platform:** Android (Google Play Store)  
**Framework:** Capacitor 8.6.0 with React 18 & TypeScript 5  
**Compilation Toolchain:** Adoptium JDK 21.0.13 LTS / Gradle 8.14.3 / Android SDK 36  
**Auditor:** Senior Android Release & Security Engineer  
**Audit Date:** November 16, 2026  

---

## 1. Executive Summary & Verdict

This comprehensive, read-only final release-readiness audit was performed on the production artifacts, source configurations, permissions, network security, backend API services, and Google Play policy requirements for **The Khedut** (`com.thekhedut.app`).

### Release Readiness Matrix
| Area | Verified Status | Key Evidence / Highlights |
| :--- | :---: | :--- |
| **AAB Cryptographic Signing** | **PASS** | RSA-2048 production upload key, `jar verified.`, 10,000-day validity. |
| **AAB Binary & Metadata** | **PASS** | 18.31 MB, Package ID `com.thekhedut.app`, Version `1.0.0 (1)`, Target SDK `36`. |
| **Manifest Security & Isolation** | **PASS** | `allowBackup="false"`, `usesCleartextTraffic="false"`, FileProvider unexported. |
| **Permissions Justification** | **PASS** | Camera, Mic, Geolocation, Storage are 100% matched to functional features. |
| **Network & API Endpoints** | **PASS** | Zero `localhost` or HTTP leaks; production HTTPS (`krishimitra-ai-8ni7.onrender.com`). |
| **Backend Defensive Hardening** | **PASS** | 9/9 Release Gate tests pass (NoSQL injection stripping, rate limiting, error masking). |
| **Frontend Production Build** | **PASS** | `tsc && vite build` completed in 17.87s with 0 errors. |
| **In-App Privacy Policy** | **PASS** | Documented at `/privacy` covering agronomic data ownership & security. |
| **Hardware Device Testing** | **NOT TESTED** | 5 physical-device tests pending hardware execution on target devices. |
| **Google Play Account Deletion** | **FOUNDER ACTION REQUIRED** | In-app deletion button and public deletion URL required by Google Play policy. |
| **Google Play Store Assets** | **FOUNDER ACTION REQUIRED** | Icon, Feature Graphic, Screenshots, and Data Safety form setup in Console. |

### Final Audit Verdict
```
================================================================================
  FINAL AUDIT VERDICT: READY FOR PLAY CONSOLE TESTING
================================================================================
  The application is technically, architecturally, and cryptographically
  prepared for upload to Google Play Console (Internal / Closed Testing tracks).
  
  Prior to promoting from Closed Testing to full Public Production rollout,
  the Founder must fulfill the Play Console listing assets and host the
  public Privacy Policy & Account Deletion URLs as detailed in Section 8.
================================================================================
```

---

## 2. AAB Verification Evidence

### 2.1 Artifact Details
- **File Location:** [`frontend/android/app/build/outputs/bundle/release/app-release.aab`](file:///C:/Users/raman/AI%20farma/frontend/android/app/build/outputs/bundle/release/app-release.aab)
- **File Size:** `19,200,734 bytes` (~18.31 MB)
- **Last Modified:** `November 16, 2026 22:59:09 IST`
- **Integrity Status:** Non-empty, valid ZIP archive containing `base/` module, DEX files, resources, assets, and metadata.

### 2.2 Cryptographic Signature Verification
Verification command:
```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot\bin\jarsigner.exe" -verify -verbose -certs "frontend/android/app/build/outputs/bundle/release/app-release.aab"
```
**Verification Evidence:**
- **Result:** `jar verified.`
- **Signer Identity:** `CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN`
- **Key Algorithm:** `2048-bit RSA key`
- **Signature Algorithm:** `SHA256withRSA`
- **Digest Algorithm:** `SHA-256`
- **Validity Window:** `Nov 16, 2026 until Apr 03, 2054` (10,000 days / 27+ years)
- **SHA-256 Fingerprint:**
  `D1:E1:3E:1A:28:0F:CE:05:E7:F9:1C:1B:5E:68:E8:93:96:78:3F:A9:77:B1:24:DA:58:38:97:0F:14:2D:72:5F`
- **SHA-1 Fingerprint:**
  `71:F2:DC:F5:D6:F8:F6:17:12:A8:0C:F8:66:E4:85:0F:3D:3E:14:24`

### 2.3 Identity & Target SDK
Verified from [`frontend/android/app/build.gradle`](file:///C:/Users/raman/AI%20farma/frontend/android/app/build.gradle) and [`frontend/android/variables.gradle`](file:///C:/Users/raman/AI%20farma/frontend/android/variables.gradle):
- **Application ID:** `com.thekhedut.app` (**PASS**)
- **Version Code:** `1` (**PASS**)
- **Version Name:** `1.0.0` (**PASS**)
- **Compile SDK Version:** `36` (**PASS**)
- **Target SDK Version:** `36` (Meets and exceeds Google Play's requirement of API 34+ for Android 14) (**PASS**)
- **Minimum SDK Version:** `24` (Android 7.0 Nougat, supporting 95%+ of active devices in India) (**PASS**)

---

## 3. Security, Manifest & Privacy Findings

### 3.1 AndroidManifest.xml Security Configuration
Inspected from [`frontend/android/app/src/main/AndroidManifest.xml`](file:///C:/Users/raman/AI%20farma/frontend/android/app/src/main/AndroidManifest.xml):

| Manifest Property | Configured Value | Status | Security / Compliance Impact |
| :--- | :---: | :---: | :--- |
| `android:allowBackup` | `false` | **PASS** | Prevents unauthorized data exfiltration via `adb backup`. |
| `android:usesCleartextTraffic` | `false` | **PASS** | Enforces strict TLS/HTTPS; blocks insecure plain HTTP. |
| `FileProvider.exported` | `false` | **PASS** | Prevents other apps from reading internal application files. |
| `FileProvider.grantUriPermissions` | `true` | **PASS** | Safely issues temporary scoped access when sharing PDFs. |
| `MainActivity.launchMode` | `singleTask` | **PASS** | Prevents multiple task instance creation and overlay hijacking. |
| `MainActivity.exported` | `true` | **PASS** | Required for launcher activity with `MAIN` and `LAUNCHER` intent filter. |

### 3.2 Network Security & Endpoint Leak Audit
- **Frontend Source Check:** Executed recursive search across `frontend/src` for `http://localhost`, `127.0.0.1`, and unencrypted `http://`.
  - **Result:** **0 matches found.** All internal references use dynamic environment variables or relative paths.
- **Production URL Fallback:** Verified in [`frontend/src/services/api.ts`](file:///C:/Users/raman/AI%20farma/frontend/src/services/api.ts):
  - Primary URL: `import.meta.env.VITE_API_URL` (`https://krishimitra-ai-8ni7.onrender.com`).
  - Native Fallback: If `VITE_API_URL` is absent, native Capacitor builds automatically resolve to `https://krishimitra-ai-8ni7.onrender.com/api` (never `localhost`).
- **Capacitor Configuration:** Verified in [`frontend/capacitor.config.ts`](file:///C:/Users/raman/AI%20farma/frontend/capacitor.config.ts):
  - `server.androidScheme: 'https'`
  - `server.cleartext: false`

### 3.3 Backend Defensive Security Verification
Executed test suite: `backend/src/tests/final_release_gate_verification.test.ts`
- **Gate 1 (NoSQL Injection Protection):** **PASS**
  - Malicious operators (`$ne`, `$where`, `$gt`, `$regex`, `$or`, `$exists`, `$expr`, dotted keys) are recursively stripped.
  - Farmer data containing punctuation, decimals, and Gujarati/Hindi Unicode text remains 100% intact.
- **Gate 2 (Rate Limiting Enforcement):** **PASS**
  - Authentication limiter strictly blocks excessive attempts with HTTP 429.
  - AI analysis limiter strictly caps resource-intensive operations with HTTP 429.
  - Reverse proxy trust configuration handles single-hop proxies securely.
- **Gate 3 (Upload Validation & Error Masking):** **PASS**
  - Magic-byte binary verification validates genuine JPEG, PNG, WebP image headers and rejects scripts/executables.
  - Centralized database error handler converts MongoDB `CastError` and duplicate index errors into generic user-friendly responses, completely hiding database collection names and schema fields.
- **Gate 4 (Credential Masking):** **PASS**
  - Environment validator logs output `[CONFIGURED]` without printing passwords, secrets, lengths, or substrings.

---

## 4. Android Permissions & Privacy Review

Every requested permission in `AndroidManifest.xml` has been audited against actual application functionality:

| Permission | Android Scope | App Feature Justification | Play Policy Status |
| :--- | :--- | :--- | :---: |
| `android.permission.INTERNET` | All APIs | Required to communicate with cloud backend, AI diagnostic engine, and mandi price feeds. | **PASS — Normal** |
| `android.permission.ACCESS_NETWORK_STATE` | All APIs | Required to detect offline connectivity and display the offline warning banner. | **PASS — Normal** |
| `android.permission.CAMERA` | Dangerous | Required for taking live photos of infected crops for AI disease detection. | **PASS — Justified** |
| `android.permission.RECORD_AUDIO` | Dangerous | Required for farmer voice assistant input in regional languages. | **PASS — Justified** |
| `android.permission.MODIFY_AUDIO_SETTINGS` | Normal | Required for voice query playback and feedback. | **PASS — Normal** |
| `android.permission.ACCESS_COARSE_LOCATION` | Dangerous | Required for local weather alerts, soil condition data, and nearest mandi search. | **PASS — Justified** |
| `android.permission.ACCESS_FINE_LOCATION` | Dangerous | Required for precise farm plot geolocation and soil advisory. | **PASS — Justified** |
| `android.permission.READ_MEDIA_IMAGES` | API 33+ | Required to upload existing crop leaf photos from device gallery. | **PASS — Justified** |
| `android.permission.READ_EXTERNAL_STORAGE` | `maxSdkVersion=32` | Properly scoped to legacy devices (Android 12 and below). | **PASS — Scoped** |
| `android.permission.WRITE_EXTERNAL_STORAGE` | `maxSdkVersion=28` | Properly scoped to legacy devices (Android 9 and below) for PDF saving. | **PASS — Scoped** |

### Hardware Features (`uses-feature`)
All non-universal hardware components are properly marked with `android:required="false"`:
- `android.hardware.camera` (`required=false`)
- `android.hardware.camera.autofocus` (`required=false`)
- `android.hardware.location.gps` (`required=false`)
- `android.hardware.microphone` (`required=false`)
> **Play Store Benefit:** Ensures devices without GPS sensors or high-end autofocus cameras can still download the app from Google Play.

---

## 5. Functional Test Results & Execution Status

| Functional Area | Test Method | Execution Status | Finding / Evidence |
| :--- | :--- | :---: | :--- |
| **Frontend Production Compilation** | `npm run build` | **PASS** | 2,512 modules transformed; Vite production build completed in 17.87s. |
| **Backend Release Gate Tests** | `ts-node-dev final_release_gate_verification.test.ts` | **PASS** | 9/9 tests passed (100%). |
| **Backend Security Suite** | `ts-node-dev pre_launch_security_hardening.test.ts` | **PASS** | 5/5 tests passed (100%). |
| **Release Bundle Compilation** | `gradlew bundleRelease` | **PASS** | 378 tasks executed; `app-release.aab` generated successfully. |
| **Cryptographic Bundle Signature** | `jarsigner -verify` | **PASS** | `jar verified.` with RSA-2048 key. |
| **Splash Screen & Branding** | UI Inspection & Capacitor Config | **PASS** | Verified green `#15803d` splash and updated tagline hierarchy. |
| **Authentication Flow & Error Shielding** | Unit & Middleware Tests | **PASS** | JWT session handling, rate limits, and sanitization verified. |
| **Physical Camera Sensor Capture** | Physical device test | **NOT TESTED** | Pending execution on physical test phone in sunlight. |
| **Physical GPS Sensor Lock** | Physical device test | **NOT TESTED** | Pending execution on physical test phone in field conditions. |
| **Android 14 Gesture Navigation Bar** | Physical device test | **NOT TESTED** | Pending edge-to-edge hardware navigation bar test. |
| **Cellular/Wi-Fi Toggle Offline Banner** | Physical device test | **NOT TESTED** | Pending physical airplane mode / cellular switch test. |
| **Physical Thermal & Battery Stability** | Physical device test | **NOT TESTED** | Pending multi-cycle diagnostic stress test on physical hardware. |

---

## 6. Google Play Policy & Regulatory Compliance Checklist

| Policy Requirement | Compliant? | Audit Analysis & Verification |
| :--- | :---: | :--- |
| **Target API Level (API 34+)** | **PASS** | Target SDK is set to `36`, which satisfies the current Google Play target API policy. |
| **64-bit Architecture** | **PASS** | Capacitor 8 packages native 64-bit binaries (`arm64-v8a`, `x86_64`) alongside 32-bit binaries. |
| **App Bundle Format (.aab)** | **PASS** | Built strictly as Android App Bundle; legacy monolithic APKs are not used for release. |
| **In-App Privacy Policy Screen** | **PASS** | Present at `/privacy` in the web application and packaged in the native bundle. |
| **Public Web Privacy Policy URL** | **FOUNDER ACTION REQUIRED** | Google Play Console requires a public HTTPS URL (e.g., `https://thekhedut.ai/privacy` or GitHub Pages). |
| **Account Deletion Policy (In-App & Web)** | **FOUNDER ACTION REQUIRED** | Google Play requires user account deletion within the app and via a public web link. |
| **Data Safety Questionnaire** | **READY** | Full mapping provided in `GOOGLE_PLAY_DATA_SAFETY_MAPPING.md`. |
| **Financial / Payments Declaration** | **PASS** | In-app billing is not active in the binary; declare "No in-app purchases" in Play Console. |
| **Ads Declaration** | **PASS** | The application does not contain advertising SDKs (AdMob, etc.); declare "No Ads". |
| **Target Audience & Families Policy** | **PASS** | Agricultural productivity tool targeted at adults (18+). Declare 18+ to avoid COPPA / Families restrictions. |

---

## 7. Outstanding Blockers & Risk Analysis

### Blocker 1: Public URLs Required by Play Console
- **Issue:** Google Play Console requires:
  1. A public **Privacy Policy URL** accessible in any web browser without logging in.
  2. A public **Account Deletion URL** explaining how farmers can request data deletion.
- **Risk if omitted:** Google Play Console will reject the store listing submission or reject app review.
- **Remediation:** Deploy a static landing page or host the existing `Privacy.tsx` content on a public URL (e.g., `https://thekhedut.com/privacy` or GitHub Pages).

### Blocker 2: Account Deletion Mechanism
- **Issue:** The backend does not currently have a dedicated `DELETE /api/auth/me` endpoint, and the frontend settings page does not have a "Delete Account" button.
- **Risk if omitted:** Google Play's User Data policy mandates that apps with account creation must support account deletion.
- **Remediation:** For immediate Closed Testing, declare the manual deletion contact link in the Data Safety form. Add the self-serve `DELETE` button before public production rollout.

### Blocker 3: Closed Testing Track Requirements (Google Play Policy for New Accounts)
- **Issue:** Personal Google Play developer accounts created after November 13, 2023 must run a **Closed Test with at least 14 to 20 testers opted in for at least 14 days** before Google enables the option to apply for Production release.
- **Status:** This is an operational Google requirement, not a code defect. The signed `app-release.aab` is ready for this track immediately.

---

## 8. Exact Founder Action Plan

To launch The Khedut on Google Play, the Founder should follow these sequential steps:

### Phase A: Prepare Store Listing Assets (Before Upload)
1. **App Icon:** Provide a `512 x 512 px` PNG (up to 1 MB, 32-bit color, no alpha transparency).
2. **Feature Graphic:** Provide a `1024 x 500 px` PNG or JPEG (up to 15 MB).
3. **Phone Screenshots:** Capture 4–8 high-resolution screenshots (16:9 or 9:16 aspect ratio, min 1080px) showing:
   - Login / Regional Language Selection
   - Farmer Dashboard
   - AI Crop Disease Scanner
   - Mandi Market Prices & Weather Forecast
4. **Host Privacy Policy:** Publish the privacy policy to a public URL (e.g., `https://thekhedut.ai/privacy`).

### Phase B: Play Console Initial Setup & Upload
1. Log in to [Google Play Console](https://play.google.com/console).
2. Select **The Khedut** (`com.thekhedut.app`).
3. Complete **App Content declarations**:
   - **Privacy Policy:** Paste public URL.
   - **Ads:** Select "No, my app does not contain ads".
   - **App Access:** Select "All functionality is available without restrictions" (or provide demo test credentials: `farmer@test.com` / password).
   - **Content Ratings:** Complete questionnaire (utility/farming, select 18+).
   - **Target Audience:** Select 18+.
   - **News Apps / COVID-19 / Gov Apps:** Select "No" for all.
   - **Data Safety:** Fill using declarations from [`GOOGLE_PLAY_DATA_SAFETY_MAPPING.md`](file:///C:/Users/raman/AI%20farma/GOOGLE_PLAY_DATA_SAFETY_MAPPING.md).
4. Navigate to **Testing > Closed testing** (or **Internal testing**).
5. Click **Create new release**.
6. Upload [`frontend/android/app/build/outputs/bundle/release/app-release.aab`](file:///C:/Users/raman/AI%20farma/frontend/android/app/build/outputs/bundle/release/app-release.aab).
   - Google Play App Signing will automatically register your upload key certificate (`SHA-256: D1:E1:3E:1A...`).
7. Enter Release Notes (e.g., *"Initial release of The Khedut — Smart Agriculture, Weather & AI Crop Pathology"*).
8. Save and roll out the release to internal testers.

### Phase C: Closed Testing Period & Physical Device Verification
1. Invite internal testers / farmers to install the app via the Play Console opt-in link.
2. Complete the 5 physical-device tests:
   - Test camera scan on live tomato/cotton leaves in daylight.
   - Test GPS location fetch in rural APMC areas.
   - Verify Android 14 bottom gesture bar padding.
   - Verify offline warning banner when mobile data is toggled off.
   - Verify battery consumption during 15 minutes of continuous use.
3. Once the 14-day closed testing period concludes, apply for Production Access in Play Console.
