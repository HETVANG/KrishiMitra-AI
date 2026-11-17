# THE KHEDUT — SIGNED PRODUCTION APK BUILD REPORT

**Product:** The Khedut — Smart Agriculture. Better Decisions.  
**Package Name:** `com.thekhedut.app`  
**Version Code:** `2`  
**Version Name:** `1.0.1`  
**Git Commit Hash:** `a36ec100c61cd26b42e2ff80cab0b67b9e012b7f` (`a36ec10`)  
**Build Tool:** Gradle 8.14.3 + OpenJDK 21.0.13 (Temurin LTS)  
**Build Command:** `.\gradlew.bat clean assembleRelease`  
**Build Result:** `BUILD SUCCESSFUL in 6m 32s` (422 actionable tasks, 0 errors)  
**Execution Timestamp:** November 17, 2026 (15:46 IST)  
**Release Engineer:** Senior Android Release Engineer  

---

## 1. APK Deliverable Details

| Metric / Parameter | Value |
|---|---|
| **APK Output Full Path** | `C:\Users\raman\AI farma\frontend\android\app\build\outputs\apk\release\app-release.apk` |
| **File Size (Bytes)** | `20,195,662 bytes` |
| **File Size (MB)** | `19.26 MB` |
| **Application ID** | `com.thekhedut.app` |
| **Version Code** | `2` (Incremented by 1 from previous release 1) |
| **Version Name** | `1.0.1` |
| **Min SDK** | `24` (Android 7.0 Nougat) |
| **Target SDK / Compile SDK** | `36` (Android 16 preview / API 35 compatible) |
| **Debuggable** | `false` (Production release mode) |
| **Launchable Activity** | `com.thekhedut.app.MainActivity` |

---

## 2. Cryptographic Signing & Keystore Verification

The existing production keystore was reused without modification or regeneration:
- **Keystore Location:** `C:\AndroidSigning\thekhedut-release-key.jks`
- **Keystore Alias:** `thekhedut`
- **Verification Tool:** Android SDK `apksigner` (Build-Tools 35.0.0)
- **Signature Scheme v1:** `false`
- **Signature Scheme v2 (Full APK Verification):** `true`
- **Signature Scheme v3 / v4:** `false`
- **Signer Distinguished Name (DN):**  
  `CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN`
- **Certificate SHA-256 Digest:**  
  `D1:E1:3E:1A:28:0F:CE:05:E7:F9:1C:1B:5E:68:E8:93:96:78:3F:A9:77:B1:24:DA:58:38:97:0F:14:2D:72:5F`  
  *(Exact 100% cryptographic match with Google Play Console and production records)*
- **Certificate SHA-1 Digest:** `71:F2:DC:F5:D6:F8:F6:17:12:A8:0C:F8:66:E4:85:0F:3D:3E:14:24`
- **Public Key Algorithm:** RSA 2048 bits

---

## 3. Frontend & Production Telemetry Embedded in APK

1. **Production Backend URL:**  
   `https://krishimitra-ai-8ni7.onrender.com/api` (Inlined and verified in JavaScript bundle)
2. **Zero Localhost Endpoints:**  
   Verified `0` occurrences of `localhost:5000`, `localhost:3000`, or `127.0.0.1` in the release assets.
3. **Capacitor Mobile Sync:**  
   All 7 core Capacitor plugins synchronized (`@capacitor/app`, `@capacitor/camera`, `@capacitor/filesystem`, `@capacitor/geolocation`, `@capacitor/share`, `@capacitor/splash-screen`, `@capacitor/status-bar`).
4. **12 Regional Language Dictionaries:**  
   Verified embedded inside `public/assets/index-mHWJzC1v.js` across Hindi, Gujarati, Marathi, Punjabi, Bengali, Tamil, Telugu, Kannada, Malayalam, Odia, Assamese, and English.
5. **Quality Improvements Included:**
   - AI Copilot responsive viewport and single-line horizontal suggestion chip rail.
   - Status bar safe-area top inset padding (`safe-area-pt`) preventing header notch overlap.
   - Agricultural Weather intelligence page and WMO weather code mapping.
   - Crop diagnosis report actions: localized Read Aloud TTS, clipboard fallback, native share sheet, print CSS overrides.
   - Report preview modal Interactive Document View with 2.8s iframe timeout fallback.
   - Mandi `/api/mandi` endpoint alias compatibility.

---

## 4. Hardware Testing Status

- **Host ADB Audit:** Executed `adb devices -l` — **No physical Android device was connected to ADB** at build time.
- **Physical Device Testing:** **NOT CLAIMED AS PASSED**. Physical installation and touch/sensor regression tests remain ready for founder execution.
- **Installation Command for Founder:**
  ```powershell
  & "C:\Users\raman\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r "frontend\android\app\build\outputs\apk\release\app-release.apk"
  ```

---

## 5. Security & Exclusions

- The production keystore (`C:\AndroidSigning\thekhedut-release-key.jks`) was preserved untouched.
- `keystore.properties` and `.env` files remain strictly excluded via `.gitignore`.
- No binary APK or AAB files have been pushed to GitHub.
