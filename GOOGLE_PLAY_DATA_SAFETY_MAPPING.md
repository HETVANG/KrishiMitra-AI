# THE KHEDUT — GOOGLE PLAY DATA SAFETY DECLARATION & PRIVACY MAPPING
**Application ID:** `com.thekhedut.app`  
**Compliance Target:** Google Play Data Safety Form & Indian DPDP Act (2023) Guidelines  
**Date:** November 7, 2026

---

## 1. Overview of Data Practices

The Khedut collects and processes only the minimum data necessary to provide agronomic intelligence, crop pathology detection, soil analysis, and mandi price indices.

- **Data Encryption in Transit**: **YES** (All data transferred between the client application and backend servers is encrypted over TLS 1.3 / HTTPS).
- **User Account Creation**: **YES** (Farmers create an account with email/phone to persist farm data, crop cycles, and diagnostic history).
- **Account Deletion Supported**: **YES** (Farmers can delete their account directly inside the app under **Settings > Account & Privacy > Delete Account**, or submit a web request at `https://thekhedut.ai/privacy#account-deletion`).

---

## 2. Google Play Data Safety Questionnaire Mapping

Fill out the Google Play Data Safety form in Play Console using the exact declarations below:

### 2.1. Location Data
| Field | Declaration Value | Detail |
|---|---|---|
| **Data Types** | Approximate Location & Precise Location | GPS coordinates or user-selected village/city. |
| **Collected?** | **Yes** | Sent to backend for hyper-local weather & mandi distance. |
| **Shared with 3rd parties?** | **Yes** | Shared with Open-Meteo / Weather API providers (anonymized coordinates). |
| **Required or Optional?** | **Optional** | Farmers can deny GPS and enter location manually. |
| **Encrypted in Transit?** | **Yes** | Sent over HTTPS/TLS 1.3. |
| **Purpose** | App functionality, Personalization | Local weather alerts, nearest APMC mandis. |
| **Retention & Deletion** | Associated with farm profile | Deleted when user deletes farm profile or account. |

### 2.2. Personal Information (User Identifiers)
| Field | Declaration Value | Detail |
|---|---|---|
| **Data Types** | Name, Email Address, Phone Number | User registration details. |
| **Collected?** | **Yes** | Stored in MongoDB Atlas user database. |
| **Shared with 3rd parties?** | **No** | Never sold or shared with advertisers. |
| **Required or Optional?** | **Required** (for account creation) | Required to maintain farm records and session. |
| **Encrypted in Transit?** | **Yes** | Sent over HTTPS/TLS 1.3. |
| **Purpose** | Account management, Developer communications | Authentication, password reset, advisory updates. |
| **Retention & Deletion** | Stored during active account tenure | Deleted within 30 days upon account deletion request. |

### 2.3. Photos and Videos
| Field | Declaration Value | Detail |
|---|---|---|
| **Data Types** | Photos (Leaf pathology images) | Crop leaf scans taken by camera or uploaded from gallery. |
| **Collected?** | **Yes** | Uploaded to secure Cloudinary storage and linked to user ID. |
| **Shared with 3rd parties?** | **No** | Only sent to internal AI pathology diagnosis engine. |
| **Required or Optional?** | **Optional** | Only collected when user uses Disease Detection tool. |
| **Encrypted in Transit?** | **Yes** | Sent over HTTPS/TLS 1.3. |
| **Purpose** | App functionality | Diagnosing plant diseases and providing treatment advice. |
| **Retention & Deletion** | Stored in diagnostic history | Can be deleted by user or upon account deletion. |

### 2.4. Audio Files (Voice Assistant)
| Field | Declaration Value | Detail |
|---|---|---|
| **Data Types** | Voice or Sound recordings | Farmer voice input queries in Gujarati, Hindi, or English. |
| **Collected?** | **Yes (Ephemeral)** | Streamed to Google Gemini / Speech API for transcription. |
| **Shared with 3rd parties?** | **Yes** | Sent to Google Gemini AI API for text transcription. |
| **Required or Optional?** | **Optional** | Farmers can type queries manually instead of speaking. |
| **Encrypted in Transit?** | **Yes** | Sent over TLS 1.3 / Secure WebSockets. |
| **Purpose** | App functionality | Voice-to-text input for agricultural queries. |
| **Retention & Deletion** | **Ephemeral** | Audio bytes are processed in memory and immediately discarded; NOT stored. |

### 2.5. Financial Info (Purchases & Subscriptions)
| Field | Declaration Value | Detail |
|---|---|---|
| **Data Types** | Purchase History | Payment transaction records for Pro/Enterprise tier. |
| **Collected?** | **Yes** | Transaction ID, plan tier, and payment timestamp. |
| **Shared with 3rd parties?** | **Yes** | Processed securely by Razorpay payment gateway. |
| **Required or Optional?** | **Optional** | Free tier requires no payment information. |
| **Encrypted in Transit?** | **Yes** | End-to-end PCI-DSS compliant TLS encryption. |
| **Purpose** | Account management, Fraud prevention | Billing history, receipt generation, subscription status. |
| **Retention & Deletion** | Stored for legal financial compliance | Retained as required by Indian financial accounting laws. |

---

## 3. Mandatory Google Play Policy Declarations

### 3.1. Target Age & Families Policy
- **Target Age Group**: **18 and over** (Primary audience is adult agricultural farm operators and agribusiness professionals).
- **Appeal to Children**: Does the app intentionally appeal to children under 13? Select **No**.

### 3.2. Advertising & Monetization
- **Contains Ads**: Select **No, my app does not contain ads**. (The Khedut operates on a clean subscription model with zero third-party ad networks).

### 3.3. COVID-19 Tracing / Status
- Select **My app is not a publicly available COVID-19 contact tracing or status app**.

### 3.4. Government Affiliation
- Does this app represent a government entity? Select **No**. (The Khedut is a private agritech platform that indexes public APMC mandi prices and government scheme information for farmer education, with prominent disclaimers).

### 3.5. Mandatory Account Deletion Implementation
- **In-App Deletion Path**: Verified in [`frontend/src/pages/Settings.tsx`](file:///c:/Users/raman/AI%20farma/frontend/src/pages/Settings.tsx) under **Account & Privacy > Delete Account**.
- **Public Web Deletion URL**: `https://thekhedut.ai/privacy#account-deletion`
- **Deletion Processing Time**: Account profile, crop records, and diagnostic images are deleted within 30 days of request.
