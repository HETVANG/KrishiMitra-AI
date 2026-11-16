# THE KHEDUT — GOOGLE PLAY CONSOLE SETUP GUIDE
**Phase 3.5: Google Play Console Integration & Production Launch Preparation**  
**Application ID:** `com.thekhedut.app`  
**Target:** Google Play Console Account Registration & Verification  
**Portal URL:** [https://play.google.com/console/](https://play.google.com/console/)

---

## 1. Overview & Account Selection

Google Play Console requires all developers to create and verify a developer account before uploading applications. The founder must complete this process personally, as it involves identity verification, credit card billing, and legal declarations.

### Account Type Comparison

| Criteria | Personal Developer Account | Organization Developer Account (Recommended) |
|---|---|---|
| **Best Suited For** | Individual developers, hobbyists | Registered businesses, startups, LLPs, Pvt Ltd |
| **Registration Requirements** | Government Photo ID (Passport/Aadhaar/PAN/Voter ID) | Company Registration (CIN), GSTIN, D-U-N-S Number, Corporate ID |
| **D-U-N-S Number** | Not required | **Mandatory** (Free via Dun & Bradstreet) |
| **Testing Requirement (Crucial)** | **Mandatory 20 testers for 14 continuous days** in Closed Testing before Production access is unlocked (for accounts created after Nov 13, 2023). | **Exempt from 20-tester requirement**; can request immediate production access after verification. |
| **Public Developer Name** | Your legal individual name | Your registered business name (e.g. *The Khedut Agritech*) |
| **Registration Fee** | $25 USD (one-time fee via International Credit/Debit Card) | $25 USD (one-time fee via International Credit/Debit Card) |

> [!TIP]
> If The Khedut is registered as an enterprise or LLP in India, creating an **Organization Account** is strongly recommended. It eliminates the 14-day mandatory 20-tester testing gate and displays the official company identity on the Play Store listing.

---

## 2. Step-by-Step Registration Guide

### Step 1: Sign In with Dedicated Google Account
1. Open [https://play.google.com/console/signup](https://play.google.com/console/signup).
2. Sign in using a dedicated Google Workspace or Google account (e.g. `founder@thekhedut.ai` or `thekhedut.official@gmail.com`).
3. Avoid using personal consumer accounts tied to unrelated personal services.

### Step 2: Choose Account Type
1. Select **An organization** (if registered business with D-U-N-S) or **Yourself** (Personal).
2. Enter your Developer Account Name (e.g., `The Khedut` or `The Khedut Agritech`).

### Step 3: Verify Identity & Contact Information
Google requires strict multi-factor verification:
- **Email Address**: Must verify via OTP code.
- **Phone Number**: Must verify via SMS OTP.
- **Official Address**: Must match the address on your uploaded government documents.
- **Support Contact Details**: Provide public support email (`support@thekhedut.ai`) and website URL (`https://thekhedut.ai`).

### Step 4: Pay the One-Time Registration Fee
- Cost: **$25 USD** (one-time registration fee, no annual renewal).
- Payment method: Visa, MasterCard, or American Express with **International Transactions enabled** (RBI regulations in India require enabling international e-commerce on your card).

### Step 5: Document Upload & Identity Verification
After payment, Google prompts for document submission:
- **For Personal Accounts**:
  - Passport, Driving License, PAN Card, or Voter ID.
  - Document must be clear, uncropped, with all four corners visible.
- **For Organization Accounts**:
  - Certificate of Incorporation (MCA / RoC).
  - GST Registration Certificate.
  - Dun & Bradstreet D-U-N-S Profile confirmation.
  - Authorized representative photo ID.

Verification typically completes within **24 to 48 hours**.

---

## 3. Initial Application Creation in Play Console

Once the console account is verified:

1. Click **Create app** on the top right of the dashboard.
2. Fill in the initial app details:
   - **App name**: `The Khedut`
   - **Default language**: `English (United States) - en-US` (or `English (India) - en-IN`)
   - **App or game**: Select **App**
   - **Free or paid**: Select **Free** (The Khedut provides free access with internal subscription tiers)
3. Accept the **Declarations**:
   - Developer Program Policies confirmation.
   - US export laws compliance.
4. Click **Create app**.

---

## 4. App Integrity & Play App Signing Setup

Google Play mandates **Play App Signing** for all new applications:

1. In Play Console, navigate to **Release > Setup > App Integrity**.
2. Under **Play App Signing**, ensure Google-managed App Signing is selected (default).
3. Google will generate the master production signing key in Google's secure hardware security modules (HSMs).
4. You will sign the uploaded AAB with your local **Upload Key** (documented in Section 3 of `ANDROID_FINAL_RELEASE_REPORT.md`). Google verifies your upload key, strips it, and re-signs the app with Google's production key before delivering it to farmers.
