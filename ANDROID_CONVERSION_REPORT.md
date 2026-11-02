# THE KHEDUT — ANDROID CONVERSION & INTEGRATION REPORT
**Phase 3.1: Android Platform Integration using Capacitor**  
**Date:** November 2, 2026  
**Project:** The Khedut (`com.thekhedut.app`)  
**Repository:** `HETVANG/KrishiMitra-AI`  
**Workspace:** `C:\Users\raman\AI farma`  
**Target Platform:** Android (Capacitor 8.6.0 / Android SDK 36 / Java 17+ / minSdk 24)

---

## 1. Executive Summary

Phase 3.1 of The Khedut project establishes a production-grade, maintainable Android application target using **Capacitor 8**. This integration directly reuses the existing React 18, TypeScript, Vite, and Tailwind CSS frontend without creating a separate codebase or diverging frontend components.

The existing web deployment on Vercel remains completely intact. Android-specific capabilities (status bar styling, splash screen management, hardware back-button navigation, and production API URL resolution) are conditionally isolated behind `Capacitor.isNativePlatform()` checks, ensuring zero regressions for desktop and mobile web users.

---

## 2. Technical Profile & Identifiers

| Parameter | Value |
|---|---|
| **Application Name** | The Khedut |
| **Application / Package ID** | `com.thekhedut.app` |
| **Version Name** | `1.0` |
| **Version Code** | `1` |
| **Capacitor Core Version** | `^8.6.0` |
| **Capacitor Android Version** | `^8.6.0` |
| **Min Android SDK** | `24` (Android 7.0 Nougat) |
| **Target & Compile SDK** | `36` (Android 15+) |
| **Gradle Distribution** | `8.14.3` |
| **Android Gradle Plugin** | `8.13.0` |
| **Frontend Framework** | React 18.2 + Vite 6.4 + TypeScript 5.2 |
| **Production API Endpoint** | `https://krishimitra-ai-8ni7.onrender.com/api` |

---

## 3. Architecture & Integration Strategy

### 3.1. Single Source of Truth
Rather than rewriting the application in Kotlin, Java, Flutter, or React Native, Capacitor embeds the compiled Vite web assets (`dist/`) directly inside an Android native WebView container (`BridgeActivity`).

### 3.2. Secure Android Scheme & Cleartext Policy
- **Configured Scheme**: `https` (`server.androidScheme: 'https'`).
- **Cleartext Traffic**: Disabled (`server.cleartext: false`).
- All network interactions occur over TLS/HTTPS with the live Render backend (`https://krishimitra-ai-8ni7.onrender.com`).

### 3.3. Runtime API Routing Interceptor
In web environments, Vite and reverse proxies often route relative calls like `fetch('/api/...')` to local ports or configured proxies. In an Android WebView operating under `https://localhost` or `https://thekhedut.app`, relative `/api` paths would fail against the local WebView server.

To solve this transparently across all existing modules (without rewriting dozens of individual component calls), a lightweight fetch interceptor was established in [`frontend/src/main.tsx`](file:///c:/Users/raman/AI%20farma/frontend/src/main.tsx):
```typescript
if (Capacitor.isNativePlatform()) {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/api')) {
      input = `https://krishimitra-ai-8ni7.onrender.com${input}`;
    }
    return originalFetch(input, init);
  };
}
```
In addition, [`frontend/src/services/api.ts`](file:///c:/Users/raman/AI%20farma/frontend/src/services/api.ts) provides a helper `getFullApiUrl(path)` which falls back to `https://krishimitra-ai-8ni7.onrender.com` when running natively.

### 3.4. Hardware Back-Button Handling
On Android devices, pressing the physical or gesture back button should intuitively navigate through browser history before exiting the application. In [`frontend/src/App.tsx`](file:///c:/Users/raman/AI%20farma/frontend/src/App.tsx):
```typescript
CapApp.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack || window.history.length > 1) {
    window.history.back();
  } else {
    CapApp.exitApp();
  }
});
```

### 3.5. Native Status Bar and Splash Screen Lifecycle
- **Status Bar**: Configured with a brand green background (`#15803d`) and `Style.Dark` (light text/icons) to integrate smoothly with The Khedut's agricultural theme.
- **Splash Screen**: Displayed during native cold start and explicitly dismissed (`SplashScreen.hide()`) once the React component tree mounts.

---

## 4. Dependencies & Plugins Installed

The following packages were installed into `frontend/package.json`:

```json
{
  "dependencies": {
    "@capacitor/app": "^8.1.2",
    "@capacitor/camera": "^8.2.6",
    "@capacitor/core": "^8.6.0",
    "@capacitor/filesystem": "^8.1.5",
    "@capacitor/geolocation": "^8.2.4",
    "@capacitor/share": "^8.0.3",
    "@capacitor/splash-screen": "^8.0.2",
    "@capacitor/status-bar": "^8.0.4"
  },
  "devDependencies": {
    "@capacitor/android": "^8.6.0",
    "@capacitor/cli": "^8.6.0"
  }
}
```

---

## 5. Android Manifest & Permissions

Configured in [`frontend/android/app/src/main/AndroidManifest.xml`](file:///c:/Users/raman/AI%20farma/frontend/android/app/src/main/AndroidManifest.xml):

| Permission | Agricultural / App Feature Justification |
|---|---|
| `android.permission.INTERNET` | Communicates with the live backend API, AI Copilot, weather services, and Mandi price endpoints. |
| `android.permission.ACCESS_NETWORK_STATE` | Checks offline connectivity status for rural farmers. |
| `android.permission.CAMERA` | Crop disease scanning and leaf photo diagnostic uploads in Disease Detection module. |
| `android.permission.RECORD_AUDIO` | Farmer Voice Assistant, voice-to-text queries, and Gujarati/Hindi voice navigation. |
| `android.permission.MODIFY_AUDIO_SETTINGS` | Audio management and feedback playback for voice assistant. |
| `android.permission.ACCESS_FINE_LOCATION` | Precise GPS field location for hyper-local agro-weather forecasts and Mandi price discovery. |
| `android.permission.ACCESS_COARSE_LOCATION` | Regional location fallback for weather and soil condition recommendations. |
| `android.permission.READ_MEDIA_IMAGES` | Selecting saved farm photos, soil inspection reports, and crop disease images (Android 13+). |
| `android.permission.READ_EXTERNAL_STORAGE` | Backward-compatible storage access for downloading PDF advisory reports (Android 12 and below). |
| `android.permission.WRITE_EXTERNAL_STORAGE` | Saving generated farm advisory and expense PDF reports to device storage (maxSdkVersion 28). |

Camera and location features have `android:required="false"` specified so the app remains installable on tablets and devices without dedicated GPS or rear sensors.

---

## 6. Official Brand Assets & Drawables

The approved master artwork (Farmer ploughing with two oxen, sunrise, tree, birds, and fields) from [`frontend/public/brand/the-khedut-full.png`](file:///c:/Users/raman/AI%20farma/frontend/public/brand/the-khedut-full.png) and [`the-khedut-pwa-192.png`](file:///c:/Users/raman/AI%20farma/frontend/public/brand/the-khedut-pwa-192.png) was applied across all native Android drawable and mipmap directories:

- **Launcher Icons (`ic_launcher.png`, `ic_launcher_round.png`, `ic_launcher_foreground.png`)**:
  - `frontend/android/app/src/main/res/mipmap-mdpi/`
  - `frontend/android/app/src/main/res/mipmap-hdpi/`
  - `frontend/android/app/src/main/res/mipmap-xhdpi/`
  - `frontend/android/app/src/main/res/mipmap-xxhdpi/`
  - `frontend/android/app/src/main/res/mipmap-xxxhdpi/`
- **Splash Screen Drawables (`splash.png`)**:
  - `frontend/android/app/src/main/res/drawable/`
  - `frontend/android/app/src/main/res/drawable-port-hdpi/`
  - `frontend/android/app/src/main/res/drawable-port-mdpi/`
  - `frontend/android/app/src/main/res/drawable-port-xhdpi/`
  - `frontend/android/app/src/main/res/drawable-port-xxhdpi/`
  - `frontend/android/app/src/main/res/drawable-port-xxxhdpi/`
  - `frontend/android/app/src/main/res/drawable-land-hdpi/`
  - `frontend/android/app/src/main/res/drawable-land-mdpi/`
  - `frontend/android/app/src/main/res/drawable-land-xhdpi/`
  - `frontend/android/app/src/main/res/drawable-land-xxhdpi/`
  - `frontend/android/app/src/main/res/drawable-land-xxxhdpi/`

---

## 7. Modified & Created Files Summary

### 7.1. New Configuration & Native Files
1. [`frontend/capacitor.config.ts`](file:///c:/Users/raman/AI%20farma/frontend/capacitor.config.ts) — Capacitor configuration with `appId: 'com.thekhedut.app'`, `appName: 'The Khedut'`, and plugin settings.
2. `frontend/android/` — Complete native Android platform directory containing:
   - `build.gradle` (root and app module)
   - `variables.gradle` (SDK 36, tools, target versions)
   - `app/src/main/AndroidManifest.xml` (permissions, theme, activity definitions)
   - `app/src/main/java/com/thekhedut/app/MainActivity.java`
   - `app/src/main/assets/public/` (synced production web bundle)
   - All drawable and mipmap asset trees.

### 7.2. Modified Core Files
1. [`frontend/package.json`](file:///c:/Users/raman/AI%20farma/frontend/package.json) — Added Capacitor dependencies and scripts (`cap:sync`, `cap:build`, `cap:open`).
2. [`package.json`](file:///c:/Users/raman/AI%20farma/package.json) — Added root-level helper scripts (`android:build`, `android:sync`, `android:open`).
3. [`frontend/src/services/api.ts`](file:///c:/Users/raman/AI%20farma/frontend/src/services/api.ts) — Configured `getFullApiUrl` with production fallback.
4. [`frontend/src/main.tsx`](file:///c:/Users/raman/AI%20farma/frontend/src/main.tsx) — Added Capacitor global `window.fetch` interceptor for relative `/api` calls.
5. [`frontend/src/App.tsx`](file:///c:/Users/raman/AI%20farma/frontend/src/App.tsx) — Added Capacitor native platform lifecycle listeners (StatusBar, SplashScreen, BackButton).

---

## 8. Build & Sync Verification

The build and sync pipeline was executed using `npm --prefix frontend run cap:build`:

```bash
> frontend@0.0.0 cap:build
> npm run build && cap sync android

> frontend@0.0.0 build
> tsc && vite build

vite v6.4.1 building for production...
transforming (2487) ...
✓ 2487 modules transformed.
dist/index.html                     2.22 kB │ gzip:   0.88 kB
dist/assets/index-D8Ym2b8Q.css     96.78 kB │ gzip:  15.93 kB
dist/assets/index-B-C42Gg9.js    2,423.83 kB │ gzip: 651.12 kB
✓ built in 1m 30s

[info] Syncing Android...
[info] Copying web assets from dist to android\app\src\main\assets\public...
[info] Copying native plugins...
[info] Scanning for native plugins...
       Found 7 native plugins
[info] Updating Android plugins...
[info] Updating Android plugins complete in 12.3ms
[info] Update android complete in 3.55s
[info] Sync finished in 3.568s
```

**Results:**
- TypeScript compilation: **PASS (0 errors)**.
- Vite production bundle generation: **PASS (0 errors)**.
- Capacitor asset copy to `android/app/src/main/assets/public`: **PASS**.
- Capacitor native plugin registration (7 plugins): **PASS**.

---

## 9. Local Android Studio Instructions

To run or generate signed/debug APK and AAB bundles:

1. **Prerequisites**:
   - Install **Android Studio** (Koala / Ladybug or newer recommended).
   - Ensure Android SDK Platform 34 or 36 and Android Build-Tools are installed via the SDK Manager.
   - JDK 17 or JDK 21 configured in Android Studio Gradle settings.

2. **Open in Android Studio**:
   From `frontend/` directory, run:
   ```bash
   npx cap open android
   ```
   Or open Android Studio and select the directory:
   `C:\Users\raman\AI farma\frontend\android`

3. **Build APK / AAB**:
   - **Debug APK**: In Android Studio menu, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - **Release Bundle**: Click **Build > Generate Signed Bundle / APK...** and follow the standard signing wizard.
   - **Run on Emulator / Connected Device**: Select your virtual or connected Android device in the top bar and click the green **Run (Play)** button.

4. **Continuous Synchronization Workflow**:
   Whenever frontend source code is modified:
   ```bash
   npm run android:build
   ```
   This rebuilds the Vite web application and copies the updated assets to the native Android project immediately.
