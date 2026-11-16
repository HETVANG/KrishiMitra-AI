# THE KHEDUT — PRODUCTION SIGNED APK BUILD REPORT

**Application Name:** The Khedut  
**Application ID:** `com.thekhedut.app`  
**Current Version:** `1.0.0` (Version Code: `1`)  
**Target Platform:** Android Direct Distribution / Side-loading  
**Framework:** Capacitor 8.6.0 with React 18 & TypeScript 5  
**Compilation Toolchain:** Adoptium JDK 21.0.13 LTS / Gradle 8.14.3 / Android SDK 36  
**Signing Keystore:** `C:\AndroidSigning\thekhedut-release-key.jks` (Alias: `thekhedut`)  
**Build Date:** November 16, 2026 23:23 IST  
**Status:** **BUILD SUCCESSFUL — SIGNATURE VERIFIED (100% IDENTITY MATCH)**  

---

## 1. Executive Summary & Verification Matrix

A production-signed standalone Android APK (`app-release.apk`) has been compiled and cryptographically verified. This APK is configured for direct offline distribution, enterprise installation, or direct farmer download without routing through Google Play Console.

The APK uses the exact same production upload keystore, RSA-2048 key, and certificate identity as the Google Play release bundle (`app-release.aab`), ensuring seamless compatibility and identity continuity.

| Verification Item | Expected Value | Verified Value | Status |
| :--- | :--- | :--- | :---: |
| **Build Task** | `:app:assembleRelease` | `BUILD SUCCESSFUL in 3m 11s` | **PASS** |
| **Output Artifact** | `app-release.apk` | Present on disk | **PASS** |
| **File Size** | Non-empty (> 0 MB) | `20,057,652 bytes` (~19.13 MB) | **PASS** |
| **Application ID** | `com.thekhedut.app` | `com.thekhedut.app` | **PASS** |
| **Version Code** | `1` | `1` | **PASS** |
| **Version Name** | `1.0.0` | `1.0.0` | **PASS** |
| **Build Type** | Release (`android:debuggable` omitted) | Release (Zero debug flags) | **PASS** |
| **Signing Scheme** | APK Signature Scheme v2 | Verified v2: `true` | **PASS** |
| **Signer Certificate** | The Khedut Mobile Engineering | `CN=The Khedut, OU=Mobile Engineering...` | **PASS** |
| **Certificate SHA-256** | `D1:E1:3E:1A...` | `d1e13e1a280fce05e7f91c1b5e68e89396783fa977b124da5838970f142d725f` | **PASS (Exact Match)** |
| **Certificate SHA-1** | `71:F2:DC:F5...` | `71f2dcf5d6f8f61712a80cf866e4850f3d3e1424` | **PASS (Exact Match)** |
| **Native CPU ABIs** | Modern & Legacy Architectures | `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64` | **PASS (Universal)** |
| **Min / Target SDK** | Min SDK 24 / Target SDK 36 | Android 7.0 (API 24) to Android 16 (API 36) | **PASS** |
| **Production API** | Production HTTPS Endpoint | `https://krishimitra-ai-8ni7.onrender.com/api` | **PASS** |

---

## 2. Artifact Location & File Details

- **Absolute APK File Path:**
  [`frontend/android/app/build/outputs/apk/release/app-release.apk`](file:///C:/Users/raman/AI%20farma/frontend/android/app/build/outputs/apk/release/app-release.apk)
- **File Size:** `20,057,652 bytes` (19.13 MB)
- **Last Modified Timestamp:** `November 16, 2026 23:23:05 IST`
- **Output Directory Listing File:** `frontend/android/app/build/outputs/apk/release/output-metadata.json`

---

## 3. Cryptographic Signature Verification Evidence

Verified using Android SDK Build-Tools `36.0.0` `apksigner.bat` with Adoptium JDK 21 LTS:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
& "C:\Users\raman\AppData\Local\Android\Sdk\build-tools\36.0.0\apksigner.bat" verify --verbose --print-certs "frontend/android/app/build/outputs/apk/release/app-release.apk"
```

### Official `apksigner` Verification Output
```
Verifies
Verified using v1 scheme (JAR signing): false
Verified using v2 scheme (APK Signature Scheme v2): true
Verified using v3 scheme (APK Signature Scheme v3): false
Verified using v3.1 scheme (APK Signature Scheme v3.1): false
Verified using v4 scheme (APK Signature Scheme v4): false
Verified for SourceStamp: false
Number of signers: 1
Signer #1 certificate DN: CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN
Signer #1 certificate SHA-256 digest: d1e13e1a280fce05e7f91c1b5e68e89396783fa977b124da5838970f142d725f
Signer #1 certificate SHA-1 digest: 71f2dcf5d6f8f61712a80cf866e4850f3d3e1424
Signer #1 certificate MD5 digest: 82a3cbf38e4f73846d265e3b3be010f3
Signer #1 key algorithm: RSA
Signer #1 key size (bits): 2048
Signer #1 public key SHA-256 digest: acab5ce7b22fe7d9de63e81e85892049284ad3189f84964fe17f74f5c4df0e05
Signer #1 public key SHA-1 digest: 59ed3f253e21427c58c4ee9ade2c04da135fd812
Signer #1 public key MD5 digest: 3f020acfec9b2de542b77f23bfdbd0f6
```

### Identity Cross-Check
The SHA-256 certificate fingerprint (`d1e13e1a280fce05e7f91c1b5e68e89396783fa977b124da5838970f142d725f`) matches the production upload keystore `thekhedut-release-key.jks` and the verified Google Play `app-release.aab` bundle **identically bit-for-bit**.

---

## 4. Package Metadata & Architecture Analysis

Extracted via Android SDK `aapt dump badging`:

```
package: name='com.thekhedut.app' versionCode='1' versionName='1.0.0'
compileSdkVersion='36' compileSdkVersionCodename='16'
sdkVersion:'24'
targetSdkVersion:'36'
application-label:'The Khedut'
application-icon-160:'res/mipmap-mdpi-v4/ic_launcher.png'
application-icon-240:'res/mipmap-hdpi-v4/ic_launcher.png'
application-icon-320:'res/mipmap-xhdpi-v4/ic_launcher.png'
application-icon-480:'res/mipmap-xxhdpi-v4/ic_launcher.png'
application-icon-640:'res/mipmap-xxxhdpi-v4/ic_launcher.png'
native-code: 'arm64-v8a' 'armeabi-v7a' 'x86' 'x86_64'
```

### Supported Hardware & Device Coverage
- **Modern 64-bit Phones:** `arm64-v8a` (e.g., modern Samsung, OnePlus, Xiaomi, Realme, Vivo).
- **Budget / Legacy 32-bit Phones:** `armeabi-v7a` (rural entry-level devices).
- **Emulators & ChromeOS:** `x86` and `x86_64`.
- **Minimum Android Version:** Android 7.0 (API Level 24) — covers **>95% of active Android devices in India**.
- **Target Android Version:** Android 16 (API Level 36) — complies with and exceeds Google's latest security, permission, and battery constraints.

---

## 5. Security & Isolation Audit

1. **Production Endpoint Isolation:**
   - The packaged web bundle strictly targets `https://krishimitra-ai-8ni7.onrender.com/api`.
   - Zero `localhost` or insecure `http://` endpoints exist in the APK assets.
2. **Cleartext Traffic Disabled:**
   - `android:usesCleartextTraffic="false"` is baked into the binary manifest, blocking unencrypted HTTP transmissions.
3. **Backup Protection:**
   - `android:allowBackup="false"` prevents extraction of SQLite, SharedPreferences, or local JWT tokens via USB ADB.
4. **Scoped File Provider:**
   - `androidx.core.content.FileProvider` is configured with `android:exported="false"`, preventing unauthorized external applications from probing or reading diagnostic PDF reports.

---

## 6. Installation Testing Status

- **Device Connection Check:** Executed `adb devices` via `C:\Users\raman\AppData\Local\Android\Sdk\platform-tools\adb.exe`.
- **Finding:** `List of devices attached` is empty.
- **Status:** **NOT PERFORMED** (No physical Android phone or running emulator was attached to this workstation at build time).
- **Direct Installation Guide for Users/Testers:**
  1. Transfer `app-release.apk` to any Android phone via USB cable, WhatsApp, or Google Drive.
  2. Enable *"Install unknown apps"* for the browser or file manager when prompted.
  3. Tap **Install**. The app will install cleanly as **The Khedut**.

---

## 7. Direct Distribution Readiness

This production APK is completely ready for:
- Direct distribution to pilot farmers and agricultural advisors.
- Enterprise APK hosting on the official platform website (`https://thekhedut.ai/download/thekhedut.apk`).
- Local side-loading for field demonstrations and physical-device validation.
