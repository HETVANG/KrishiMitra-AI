# THE KHEDUT — GOOGLE PLAY PRODUCTION LAUNCH CHECKLIST
**Phase 3.5: Google Play Console Integration & Production Launch Preparation**  
**Application ID:** `com.thekhedut.app`  
**Target Release:** Version 1.0.0 (versionCode 1)

---

## 1. Production Launch Gate Checklist

This checklist tracks every mandatory milestone required by Google Play Console before an app can be publicly distributed on the Google Play Store.

### Section 1: Developer Account & Legal Prerequisites
- [ ] **Account Registration**: Founder completes registration at [play.google.com/console](https://play.google.com/console) ($25 USD one-time fee paid).
- [ ] **Identity Verification**: Personal ID (Passport/PAN/Aadhaar) or Organization docs (CIN/GST/D-U-N-S) approved by Google.
- [ ] **Merchant Account (Optional)**: Set up only if direct Google Play In-App Billing is used; not required for Razorpay web payments.
- [ ] **Public Developer Profile**: Support email (`support@thekhedut.ai`), website (`https://thekhedut.ai`), and phone verified.

---

### Section 2: Store Presence & Branding Assets
- [ ] **App Title**: `The Khedut` (exactly 10 characters, within 30-char limit).
- [ ] **Short Description**: `Smart digital agriculture platform for crop health, soil NPK, and mandi prices.` (79 characters, within 80-char limit).
- [ ] **Full Description**: Complete 4,000-character description added covering Crop Disease, Soil NPK, APMC Mandi, and Voice Assistant.
- [ ] **High-Res App Icon**: 512 × 512 PNG, 32-bit color, no transparency, official master artwork uploaded.
- [ ] **Feature Graphic**: 1024 × 500 PNG/JPEG, official artwork with tagline uploaded.
- [ ] **Phone Screenshots**: Minimum 4 phone screenshots (1080 × 1920 or 1080 × 2400) showing Dashboard, Disease Scanner, Soil NPK, and Mandi Prices.
- [ ] **Tablet Screenshots (Recommended)**: 7-inch and 10-inch screenshots uploaded for tablet optimization badge.

---

### Section 3: Policy, Data Safety & Privacy Declarations
- [ ] **Privacy Policy URL**: Published and accessible at `https://thekhedut.ai/privacy`.
- [ ] **Data Safety Form**: Completed matching `GOOGLE_PLAY_DATA_SAFETY_MAPPING.md` (Location, Photos, Audio, Personal Identifiers, Payments).
- [ ] **Account Deletion URL**: In-app path (**Settings > Account & Privacy > Delete Account**) and web URL (`https://thekhedut.ai/privacy#account-deletion`) declared.
- [ ] **Content Rating (IARC)**: Questionnaire completed; rating confirmed as **Everyone / PEGI 3**.
- [ ] **Target Audience**: Confirmed as **18 and over**; "Appeals to children" set to **No**.
- [ ] **Ads Declaration**: Set to **No, my app does not contain ads**.
- [ ] **COVID-19 Status**: Declared as **Not a COVID-19 contact tracing app**.
- [ ] **Government Status**: Declared as **Not representing a government agency**.
- [ ] **App Access Instructions**: Provided test credentials for Google Play reviewers:
  - Phone / Email: `+91 9876543210` / `reviewer@thekhedut.ai`
  - Password / OTP: Configured test password / `123456`
  - Guidance: *"Log in to access farmer dashboard, crop pathology scanner, and mandi price indices."*

---

### Section 4: Technical Build & Artifact Verification
- [ ] **Application ID**: `com.thekhedut.app` verified in `app/build.gradle`.
- [ ] **Versioning**: `versionCode 1`, `versionName "1.0.0"` verified.
- [ ] **Target SDK**: `targetSdkVersion 36` (Android 15+) verified (exceeds Google minimum API 34+).
- [ ] **Min SDK**: `minSdkVersion 24` (Android 7.0+) verified.
- [ ] **Format**: Android App Bundle (`.aab`) verified.
- [ ] **Release Signing**: Signed with founder's upload key (`thekhedut-upload.keystore`).
- [ ] **Zero Cleartext**: `android:usesCleartextTraffic="false"` and `server.cleartext: false` verified.
- [ ] **FileProvider**: Non-exported (`android:exported="false"`) with scoped cache paths verified.
- [ ] **Build Validation**: Clean production build (`npm --prefix frontend run build`) and asset sync (`cap:sync`) verified.

---

### Section 5: Testing Tracks & Promotion to Production
- [ ] **Internal Testing**: Upload `app-release.aab` to Internal Track; test on team devices.
- [ ] **Closed Testing Gate**: If Personal account, recruit 20 testers and maintain active opt-in for 14 continuous days.
- [ ] **Pre-Launch Report Review**: Review Firebase Test Lab automated runs; verify 0 crashes and 0 ANRs.
- [ ] **Apply for Production**: Click "Apply for production" in Play Console after testing conditions are satisfied.
- [ ] **Staged Rollout**: Begin 10% staged rollout; monitor Android Vitals before ramping to 100%.
