# THE KHEDUT — FINAL UPDATED PRODUCTION APK REPORT

**Product Name:** The Khedut  
**Application ID:** `com.thekhedut.app`  
**Version Name:** `1.0.0`  
**Version Code:** `1`  
**Build Target:** Android Release APK (Direct Distribution)  
**Output Path:** `frontend/android/app/build/outputs/apk/release/app-release.apk`  
**Build Date:** November 17, 2026, 00:56 IST  
**Git Commit Ingested:** [`701d0b12c995d9ab78e47c4dd3b2510f44045458`](https://github.com/HETVANG/KrishiMitra-AI/commit/701d0b12c995d9ab78e47c4dd3b2510f44045458) (`701d0b1`)  
**Signing Status:** **VERIFIED & CRYPTOGRAPHICALLY MATCHED**

---

## 1. Executive Summary

A fresh, production-signed Android APK has been compiled and assembled for **The Khedut** (`com.thekhedut.app`). This APK incorporates all latest verified responsive mobile UI layouts and the backend CORS whitelisting fixes (`https://localhost` and `capacitor://localhost` origin authorization).

The APK was cryptographically signed using the official production upload keystore (`C:\AndroidSigning\thekhedut-release-key.jks`) via Gradle's automated release signing configuration (`keystore.properties`).

Verification using Android SDK `apksigner` confirmed that the APK signature is **valid**, signed under **APK Signature Scheme v2**, and bears an exact **100% bit-for-bit SHA-256 certificate fingerprint match** with the official Google Play production upload keystore and the previously verified release AAB (`app-release.aab`).

---

## 2. File Metadata & Build Results

| Metric | Property |
| :--- | :--- |
| **Output File** | `frontend/android/app/build/outputs/apk/release/app-release.apk` |
| **File Size (Bytes)** | `20,059,044 bytes` |
| **File Size (MB)** | `19.13 MB` |
| **Assembly Command** | `.\gradlew.bat assembleRelease` |
| **Build Duration** | 3m 30s (`BUILD SUCCESSFUL`) |
| **Actionable Tasks** | 411 tasks (101 executed, 310 up-to-date) |
| **Web Asset Sync** | Synced via `@capacitor/cli` (`cap sync android`) |
| **Target API Base URL** | `https://krishimitra-ai-8ni7.onrender.com/api` (Verified in assets) |
| **Cleartext Traffic** | `android:usesCleartextTraffic="false"` (Enforced) |
| **Debuggable Flag** | `android:debuggable="false"` (Non-debuggable release build) |
| **Backup Allowed** | `android:allowBackup="false"` (Secure) |

---

## 3. Cryptographic Signature Verification (`apksigner`)

Verification was executed using `apksigner.bat` from Android Build-Tools `35.0.0`:

```bash
$ apksigner.bat verify --verbose --print-certs "app-release.apk"
Verifies: true
Verified using v1 scheme (JAR signing): false
Verified using v2 scheme (APK Signature Scheme v2): true
Verified using v3 scheme (APK Signature Scheme v3): false
Verified using v3.1 scheme (APK Signature Scheme v3.1): false
Verified using v4 scheme (APK Signature Scheme v4): false
Verified for SourceStamp: false
Number of signers: 1
```

### Signer Certificate Identity & Fingerprints

| Field | Production APK Value | Production AAB Value | Match Status |
| :--- | :--- | :--- | :---: |
| **Subject DN** | `CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN` | `CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN` | **IDENTICAL** |
| **Alias** | `thekhedut` | `thekhedut` | **IDENTICAL** |
| **Key Algorithm** | `RSA 2048-bit` | `RSA 2048-bit` | **IDENTICAL** |
| **Signature Scheme** | `v2 (APK Signature Scheme v2)` | JAR & APK v2 compatible | **VERIFIED** |
| **Certificate SHA-256** | `d1:e1:3e:1a:28:0f:ce:05:e7:f9:1c:1b:5e:68:e8:93:96:78:3f:a9:77:b1:24:da:58:38:97:0f:14:2d:72:5f` | `D1:E1:3E:1A:28:0F:CE:05:E7:F9:1C:1B:5E:68:E8:93:96:78:3F:A9:77:B1:24:DA:58:38:97:0F:14:2D:72:5F` | **100% MATCH** |
| **Certificate SHA-1** | `71:f2:dc:f5:d6:f8:f6:17:12:a8:0c:f8:66:e4:85:0f:3d:3e:14:24` | `71:F2:DC:F5:D6:F8:F6:17:12:A8:0C:F8:66:E4:85:0F:3D:3E:14:24` | **100% MATCH** |
| **Certificate MD5** | `82:a3:cb:f3:8e:4f:73:84:6d:26:5e:3b:3b:e0:10:f3` | `82:A3:CB:F3:8E:4F:73:84:6D:26:5E:3B:3B:E0:10:F3` | **100% MATCH** |

---

## 4. Package Badging & SDK Alignment (`aapt2`)

Extracted via `aapt2.exe dump badging`:

- **Application ID (Package):** `com.thekhedut.app`
- **Version Code:** `1`
- **Version Name:** `1.0.0`
- **Min SDK Version:** `24` (Android 7.0 Nougat)
- **Target SDK Version:** `36` (Android 16 compatibility)
- **Compile SDK Version:** `36`
- **Main Launchable Activity:** `com.thekhedut.app.MainActivity`
- **Supported Architectures:** `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`
- **Declared Hardware Features:** Camera, GPS Location, Microphone (All configured as `android:required="false"` for broad device compatibility).

---

## 5. Security & Isolation Compliance

1. **Keystore Security:** The upload keystore at `C:\AndroidSigning\thekhedut-release-key.jks` was preserved untouched and was NOT regenerated, renamed, or modified.
2. **Credential Secrecy:** Passwords from `keystore.properties` were loaded via Gradle's local properties handler and were never exposed in logs or terminal outputs.
3. **Repository Cleanliness:** No build binaries, keystores, or `.env` files were staged or committed to Git. The working tree remains cleanly in sync with `origin/main`.
4. **Network Security:** `android:usesCleartextTraffic="false"` prohibits unencrypted HTTP traffic. All requests route over HTTPS to `https://krishimitra-ai-8ni7.onrender.com`.

---

## 6. Distribution Readiness

The APK file at:
`frontend/android/app/build/outputs/apk/release/app-release.apk`
is **100% ready for distribution**, manual side-loading, and device verification by farmers and test users.
