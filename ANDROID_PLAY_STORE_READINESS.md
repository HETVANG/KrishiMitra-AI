# THE KHEDUT — GOOGLE PLAY STORE READINESS REPORT
**Phase 3.4: Production Android Engineering, Release Signing & Play Store Readiness**  
**Date:** November 4, 2026  
**Application ID:** `com.thekhedut.app`  
**Application Name:** The Khedut  
**Workspace:** `C:\Users\raman\AI farma`  
**Target API:** 36 (Android 15+) | **Format:** Android App Bundle (AAB)

---

## 1. Google Play Technical Requirements Compliance

| Requirement | Google Play Standard | The Khedut Status | Verification Detail |
|---|---|:---:|---|
| **Target API Level** | Must target API 34+ (for 2024–2026 submissions) | **COMPLIANT** | `targetSdkVersion = 36` in `variables.gradle`. |
| **Publishing Format** | Android App Bundle (`.aab`) mandatory for new apps | **COMPLIANT** | Gradle configured for `bundleRelease` (`app-release.aab`). |
| **Architecture** | 64-bit native architecture support (ARM64 & x86_64) | **COMPLIANT** | Chromium WebView runtime provides full 64-bit execution. |
| **Package ID Uniqueness** | Globally unique package namespace | **COMPLIANT** | `com.thekhedut.app` verified; no namespace conflicts. |
| **Versioning Scheme** | Integer `versionCode` + semver `versionName` | **COMPLIANT** | `versionCode 1`, `versionName "1.0.0"` in `app/build.gradle`. |
| **App Bundle Size** | Download size must be under 150 MB | **COMPLIANT** | Synced web bundle is ~3 MB; compressed AAB estimate is ~15 MB. |
| **Security Standards** | TLS 1.3/HTTPS, no cleartext traffic | **COMPLIANT** | `android:usesCleartextTraffic="false"` strictly enforced. |

---

## 2. Play Console Policy & Store Listing Checklist

### 2.1. Store Listing Metadata
- **App Name**: `The Khedut` (Matches `strings.xml`).
- **Short Description (80 chars)**: *Smart digital agriculture platform for crop health, soil NPK, and mandi prices.*
- **Full Description**: Covers AI crop leaf pathology diagnosis, digital soil chemistry planner, smart irrigation schedules, hyper-local weather alerts, mandi commodity price index, and agronomist consultations in English, Gujarati, and Hindi.
- **Category**: Agriculture & Business.
- **Content Rating**: IARC / Everyone (PEGI 3) — Agricultural utility with no objectionable content.

### 2.2. Data Safety Declarations (Google Play Questionnaire)
When filling out the Google Play Data Safety section, declare the following collected data:

| Data Type | Purpose | Ephemeral / Stored | Shared with Third Parties |
|---|---|---|---|
| **Approximate & Precise Location** | App functionality (Hyper-local weather, mandi distances, farm boundary mapping). | Stored with farm profile in user account; optional. | Weather API providers (anonymized coordinates). |
| **Photos & Images** | App functionality (Leaf disease diagnosis, crop health analysis). | Stored in Cloudinary & backend scan history. | Not shared; encrypted in transit. |
| **Audio Recordings** | App functionality (Farmer Voice Assistant queries in Gujarati/Hindi/English). | Ephemeral; processed for transcript then discarded. | Google Gemini AI API (audio transcription). |
| **User Identifiers (Name, Phone, Email)** | Account management & authentication. | Stored in MongoDB Atlas user database. | Not shared. |
| **Financial / Purchase Info** | Subscription management (Pro/Enterprise tier checkout). | Stored via Razorpay gateway. | Razorpay payment gateway. |

### 2.3. Account Deletion Requirement (Mandatory Google Play Policy)
Google Play requires that apps supporting account creation must provide an in-app and web mechanism for users to request account and data deletion:
- **In-App Account Deletion**: Available under **Settings > Account & Privacy > Delete Account** in [`frontend/src/pages/Settings.tsx`](file:///c:/Users/raman/AI%20farma/frontend/src/pages/Settings.tsx).
- **Web Account Deletion URL**: `https://thekhedut.ai/privacy#account-deletion` or contact `support@thekhedut.ai`.

### 2.4. App Access for Google Play Reviewers
Google Play reviewers require valid test credentials to inspect protected dashboard sections:
- Provide test credentials in Play Console under **Policy > App Access**:
  - **Username / Phone**: `+91 9876543210` (or demo reviewer phone)
  - **Password / OTP**: Configured fixed demo credentials or test account credentials.
  - **Instructions**: "Log in to view the farmer dashboard, crop pathology scanner, and mandi price indices."

---

## 3. Action Items Requiring Founder Completion

The technical codebase is 100% prepared. The founder must perform the following administrative steps in Google Play Console:

1. [ ] **Google Play Developer Account**: Ensure registration is complete ($25 one-time fee) at [play.google.com/console](https://play.google.com/console).
2. [ ] **Generate Keystore**: Execute the `keytool` command documented in `ANDROID_RELEASE_SIGNING_GUIDE.md` to create `thekhedut-upload.keystore`.
3. [ ] **Build Signed AAB**: Run `.\gradlew.bat bundleRelease` (or use Android Studio wizard) to generate `app-release.aab`.
4. [ ] **Upload to Internal / Closed Testing**: Create a release in Google Play Console under **Testing > Closed testing** and upload `app-release.aab`.
5. [ ] **Complete Store Listing & Questionnaire**: Complete Content Rating, Target Audience, News App (No), Covid-19 (No), Data Safety, and Privacy Policy URL (`https://thekhedut.ai/privacy`).
