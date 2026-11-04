# THE KHEDUT — ANDROID SECURITY AUDIT
**Phase 3.4: Production Android Engineering, Release Signing & Play Store Readiness**  
**Date:** November 4, 2026  
**Application ID:** `com.thekhedut.app`  
**Manifest Path:** [`frontend/android/app/src/main/AndroidManifest.xml`](file:///c:/Users/raman/AI%20farma/frontend/android/app/src/main/AndroidManifest.xml)  
**Security Target:** Google Play Security Requirements, OWASP Mobile Top 10 (M1–M10)

---

## 1. Executive Summary

This comprehensive security audit assesses the native Android implementation of **The Khedut** against production criteria, Google Play Store security standards, and modern Android runtime sandboxing.

The audit confirms that the native Android layer introduces no high-risk vulnerabilities, disables dangerous legacy features (such as ADB application backup and cleartext network communication), scopes all runtime permissions to validated agricultural use cases, and encapsulates all sensitive session data within the protected Android application sandbox.

---

## 2. Security Audit Matrix

| Security Domain | Verified Configuration | Assessment / Defense Mechanism | Risk Level |
|---|---|---|:---:|
| **Application Backup** | `android:allowBackup="false"` | Prevents local extraction of JWT tokens, user settings, or cached agricultural records via ADB backup. | **LOW (Secured)** |
| **Network Cleartext Traffic** | `android:usesCleartextTraffic="false"` & `server.cleartext: false` | Strictly enforces HTTPS/TLS for all native and WebView HTTP requests; rejects unencrypted HTTP endpoints. | **LOW (Secured)** |
| **Component Exposure** | `MainActivity` (`exported="true"`) / `FileProvider` (`exported="false"`) | Only the launcher activity is exported to the system launcher; FileProvider is strictly non-exported with granular temporary grant URIs. | **LOW (Secured)** |
| **Storage & File Sharing** | Scoped Cache via FileProvider | Avoids `MANAGE_EXTERNAL_STORAGE`. PDF files are cached in app-private storage (`Directory.Cache`) and shared via `content://` URIs. | **LOW (Secured)** |
| **Release Debuggable State** | `debuggable false` (Default for AGP release) | AGP release build type automatically disables `android:debuggable`, preventing JDWP debug attachment. | **LOW (Secured)** |
| **Credential Hygiene** | 0 hardcoded secrets in native Android source | Keystores, signing passwords, and production secrets are excluded from Git via `.gitignore`. | **LOW (Secured)** |
| **WebView Sandboxing** | Origin isolation under `https://` scheme | Capacitor serves web assets under `https://localhost` with `androidScheme: 'https'`, preventing insecure file scheme attacks. | **LOW (Secured)** |
| **Session Authentication** | JWT in localStorage + 401 Interceptor | Tokens are stored in private WebView storage and sent via `Authorization: Bearer <token>`. 401 automatically clears session. | **LOW (Secured)** |
| **Hardware Features** | `android:required="false"` on all features | No device lock-in; app runs gracefully on devices without dedicated camera or GPS hardware. | **LOW (Secured)** |

---

## 3. Deep-Dive Security Evaluations

### 3.1. Android Manifest Component Audit
```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```
- **Finding**: `MainActivity` is the single entry point. Setting `android:exported="true"` is strictly required for the launcher intent filter so Android OS can start the app.
- **Single Task Launch Mode**: `android:launchMode="singleTask"` prevents task hijacking and duplicate activity stacks when resuming from external intents or deep links.

### 3.2. Secure FileProvider Configuration
```xml
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>
```
- **Finding**: `android:exported="false"` guarantees that external applications cannot directly query or traverse the application's file paths.
- **Granular Permissions**: `android:grantUriPermissions="true"` ensures that only apps explicitly targeted by the Android share intent (e.g., Google PDF Viewer, WhatsApp) receive temporary read permissions for the single shared statement file.

### 3.3. Runtime Permissions Compliance
| Permission | Danger Level | Justification |
|---|---|---|
| `android.permission.CAMERA` | Dangerous (Runtime) | Explicitly prompted only when the farmer taps "Take Photo" in Disease Detection. |
| `android.permission.RECORD_AUDIO` | Dangerous (Runtime) | Explicitly prompted only when the farmer activates voice search or voice assistant. |
| `android.permission.ACCESS_FINE_LOCATION` | Dangerous (Runtime) | Explicitly prompted for hyper-local agricultural weather alerts. |
| `android.permission.READ_MEDIA_IMAGES` | Dangerous (Runtime) | Prompted only when selecting saved leaf images from gallery (Android 13+). |
| `android.permission.READ_EXTERNAL_STORAGE` | Capped (maxSdkVersion 32) | Legacy compatibility only; does not affect modern Android devices. |
| `android.permission.WRITE_EXTERNAL_STORAGE` | Capped (maxSdkVersion 28) | Legacy compatibility only; does not affect modern Android devices. |

---

## 4. Security Findings & Recommendations

1. **No Critical or High Vulnerabilities**: Zero critical security defects were discovered in the Android native platform or JavaScript bridge layer.
2. **Keystore Exclusion**: Verified that `.gitignore` prevents inadvertent leakage of signing credentials into the repository.
3. **Founder Recommendation**: Store the release keystore file and alias passwords in a secure password manager (e.g., 1Password, Bitwarden, or corporate KMS) with at least two offsite backups. If the upload key is lost, Google Play console account owner recovery is required to reset the upload key.
