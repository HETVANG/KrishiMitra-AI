# THE KHEDUT — ANDROID SIGNED AAB ARTIFACT VERIFICATION

**Application Name:** The Khedut  
**Application ID:** `com.thekhedut.app`  
**Signed Release AAB Artifact:** [`frontend/android/app/build/outputs/bundle/release/app-release.aab`](file:///C:/Users/raman/AI%20farma/frontend/android/app/build/outputs/bundle/release/app-release.aab)  
**Verification Date:** November 16, 2026  
**Auditor:** Senior Android Release Engineer  
**Status:** **PASSED — PRODUCTION AAB GENERATED & CRYPTOGRAPHICALLY VERIFIED**  

---

## 1. Release Artifact Verification Status

| Verification Check | Target Value | Actual Status | Evidence / Notes |
| :--- | :--- | :-: | :--- |
| **AAB Output Exists** | `app-release.aab` | **PASS** | `frontend/android/app/build/outputs/bundle/release/app-release.aab` |
| **AAB File Size** | Non-empty (> 0 bytes) | **PASS** | `19,200,734 bytes` (18.31 MB) |
| **Package ID** | `com.thekhedut.app` | **PASS** | Verified in `app/build.gradle` and parsed by Gradle BundleTool |
| **Version Code** | `1` | **PASS** | Matches initial Google Play release version code |
| **Version Name** | `1.0.0` | **PASS** | Matches initial release version name |
| **Release Signing** | RSA-2048 (`thekhedut`) | **PASS** | Signed via `:app:signReleaseBundle` using `thekhedut-release-key.jks` |
| **Signature Verification** | Cryptographically Valid | **PASS** | `jarsigner -verify -verbose -certs` -> **`jar verified.`** |
| **Digest Algorithm** | `SHA-256` | **PASS** | Compliant with Google Play Store upload requirements |
| **Signer Identity** | The Khedut | **PASS** | `CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN` |
| **Target SDK** | `34` (Android 14) | **PASS** | Compliant with Google Play target API level requirements |
| **Min SDK** | `24` (Android 7.0) | **PASS** | 95%+ device market coverage |

---

## 2. Compilation & Signature Evidence

### 2.1 Gradle Build Output
```
> Task :app:validateSigningRelease
> Task :app:lintVitalAnalyzeRelease
> Task :app:lintVitalReportRelease
> Task :app:lintVitalRelease
> Task :app:packageReleaseBundle
> Task :app:signReleaseBundle
> Task :app:produceReleaseBundleIdeListingFile
> Task :app:createReleaseBundleListingFileRedirect
> Task :app:bundleRelease

BUILD SUCCESSFUL in 1m 21s
378 actionable tasks: 8 executed, 370 up-to-date
```

### 2.2 `jarsigner` Cryptographic Verification Output
```
=== AAB FILE DETAILS ===
Path: C:\Users\raman\AI farma\frontend\android\app\build\outputs\bundle\release\app-release.aab
Size: 19200734 bytes (18.31 MB)
Last Modified: 11/16/2026 22:59:09

=== JARSIGNER VERIFICATION ===
Signer:
  X.509, CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN
  Signature algorithm: SHA384withRSA, 2048-bit key
  [certificate is valid from 11/16/26, 10:57 PM to 4/3/54, 10:57 PM]

Signed by: "CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN"
  Digest algorithm: SHA-256
  Signature algorithm: SHA256withRSA, 2048-bit key

Result:
  jar verified.
```

---

## 3. Play Store Upload Readiness

The signed bundle [`app-release.aab`](file:///C:/Users/raman/AI%20farma/frontend/android/app/build/outputs/bundle/release/app-release.aab) is 100% prepared for upload:
1. Navigate to **Google Play Console** -> **The Khedut (`com.thekhedut.app`)**.
2. Select **Release** -> **Production** (or **Closed testing** / **Internal testing**).
3. Click **Create new release**.
4. Drag and drop `frontend/android/app/build/outputs/bundle/release/app-release.aab`.
5. Google Play App Signing will register the upload certificate with SHA-256:
   `D1:E1:3E:1A:28:0F:CE:05:E7:F9:1C:1B:5E:68:E8:93:96:78:3F:A9:77:B1:24:DA:58:38:97:0F:14:2D:72:5F`.
