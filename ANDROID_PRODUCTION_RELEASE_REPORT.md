# THE KHEDUT — ANDROID PRODUCTION RELEASE REPORT
**Phase 3.4: Production Android Engineering, Release Signing & Play Store Readiness**  
**Date:** November 4, 2026  
**Application ID:** `com.thekhedut.app`  
**Application Name:** The Khedut  
**Version Name:** `1.0.0` | **Version Code:** `1`  
**Workspace:** `C:\Users\raman\AI farma`  
**Platform Framework:** Capacitor 8.6.0 on Android SDK 36 (AGP 8.13.0)  
**Production Backend API:** `https://krishimitra-ai-8ni7.onrender.com/api`

---

## 1. Executive Summary

Phase 3.4 transitions the native Android application target from development verification into a production-hardened release state ready for Google Play Store deployment.

All production requirements have been configured:
1. **Application Identity**: Fixed to `com.thekhedut.app` with label `The Khedut`, `versionName: "1.0.0"`, and `versionCode: 1`.
2. **Release Signing**: Established an isolated, untracked `keystore.properties` structure and environment-variable bridge in [`frontend/android/app/build.gradle`](file:///c:/Users/raman/AI%20farma/frontend/android/app/build.gradle). Keystores and passwords are unconditionally excluded from version control.
3. **Android Security Hardening**: Disabled ADB backup (`android:allowBackup="false"`), strictly disallowed cleartext traffic (`android:usesCleartextTraffic="false"` and `server.cleartext: false`), and established Capacitor plugin preservation rules in [`proguard-rules.pro`](file:///c:/Users/raman/AI%20farma/frontend/android/app/proguard-rules.pro).
4. **Production Web Bundle Sync**: 2,506 production modules compiled via Vite (`0 errors`) and synced directly into `frontend/android/app/src/main/assets/public/`.

---

## 2. Release Configuration Matrix

| Parameter | Configuration Value | Verification Source |
|---|---|---|
| **Package / Application ID** | `com.thekhedut.app` | `app/build.gradle`, `capacitor.config.ts`, `AndroidManifest.xml` |
| **Application Label** | `The Khedut` | `strings.xml` (`@string/app_name`) |
| **Version Name** | `1.0.0` | `frontend/android/app/build.gradle` (`versionName`) |
| **Version Code** | `1` | `frontend/android/app/build.gradle` (`versionCode`) |
| **Compile SDK** | `36` (Android 15+) | `variables.gradle` (`compileSdkVersion = 36`) |
| **Target SDK** | `36` (Google Play 2024–2026 compliant) | `variables.gradle` (`targetSdkVersion = 36`) |
| **Minimum SDK** | `24` (Android 7.0 Nougat) | `variables.gradle` (`minSdkVersion = 24`) |
| **Build Type** | `release` | `app/build.gradle` (`buildTypes.release`) |
| **Minification / ProGuard** | Rules defined; `minifyEnabled false` for baseline stability | `app/build.gradle`, `proguard-rules.pro` |
| **Signing Configuration** | Dynamic property file (`keystore.properties`) or Env vars | `app/build.gradle` (`signingConfigs.release`) |
| **Backup Policy** | `android:allowBackup="false"` (No auth token dumps) | `AndroidManifest.xml` |
| **Cleartext Policy** | `android:usesCleartextTraffic="false"` | `AndroidManifest.xml` & `capacitor.config.ts` |
| **Production API Host** | `https://krishimitra-ai-8ni7.onrender.com` | `frontend/.env`, `api.ts`, `main.tsx` |

---

## 3. Official Master Brand Assets Verification

The approved master artwork (Farmer ploughing with two oxen, sunrise, tree, birds, and fields) is deployed across all native Android release asset directories:

- **Adaptive & Mipmap Launcher Icons**:
  - `frontend/android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48×48)
  - `frontend/android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72×72)
  - `frontend/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96×96)
  - `frontend/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144×144)
  - `frontend/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192×192)
  - Circular variants: `ic_launcher_round.png` across all density buckets.
  - Adaptive foregrounds: `ic_launcher_foreground.png` across all density buckets.
- **Splash Screen Assets**:
  - `frontend/android/app/src/main/res/drawable/splash.png`
  - Portrait and landscape drawables across `port-mdpi` through `port-xxxhdpi` and `land-mdpi` through `land-xxxhdpi`.
- **Launcher Brand Name**: Verified in `frontend/android/app/src/main/res/values/strings.xml` as `The Khedut`.

---

## 4. Release Artifact Status & Toolchain Architecture

### 4.1. Pre-built Artifacts
- **Debug APK**: `frontend/android/app/build/outputs/apk/debug/app-debug.apk` (21.9 MB) is verified and installable via ADB for local hardware testing.

### 4.2. Release AAB (`app-release.aab`) & Release APK (`app-release.apk`) Generation
- In modern Android engineering, production release AABs must be signed with the founder's upload key before Google Play will accept the package.
- Because private keystores cannot be manufactured with fake credentials or committed to git, the build system has been configured with dual release pathways:
  1. **Automated Gradle Pathway**: Populating `keystore.properties` (using the provided `keystore.properties.example` template) allows `./gradlew bundleRelease` and `./gradlew assembleRelease` to automatically produce signed release artifacts.
  2. **Android Studio GUI Pathway**: Opening `frontend/android` in Android Studio and selecting **Build > Generate Signed Bundle / APK...** provides a guided, secure wizard that creates the production keystore and signs both `app-release.aab` and `app-release.apk` with zero command-line friction.

---

## 5. Modified Files Summary (Phase 3.4)

| File | Change Scope |
|---|---|
| [`frontend/android/app/build.gradle`](file:///c:/Users/raman/AI%20farma/frontend/android/app/build.gradle) | Configured `versionCode 1`, `versionName "1.0.0"`, and dynamic `signingConfigs.release` reading from properties/env. |
| [`frontend/android/app/proguard-rules.pro`](file:///c:/Users/raman/AI%20farma/frontend/android/app/proguard-rules.pro) | Added Capacitor bridge, plugin method, and JavaScript interface preservation rules. |
| [`frontend/android/app/src/main/AndroidManifest.xml`](file:///c:/Users/raman/AI%20farma/frontend/android/app/src/main/AndroidManifest.xml) | Enforced `android:allowBackup="false"` and `android:usesCleartextTraffic="false"`. |
| [`.gitignore`](file:///c:/Users/raman/AI%20farma/.gitignore) | Explicitly excluded `*.keystore`, `*.jks`, `keystore.properties`, `signing.properties`. |
| [`frontend/android/.gitignore`](file:///c:/Users/raman/AI%20farma/frontend/android/.gitignore) | Uncommented keystore exclusions and added `keystore.properties`. |
| [`frontend/android/keystore.properties.example`](file:///c:/Users/raman/AI%20farma/frontend/android/keystore.properties.example) | **New**: Template for founder release signing configuration. |
