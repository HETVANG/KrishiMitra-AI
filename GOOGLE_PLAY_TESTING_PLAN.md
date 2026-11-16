# THE KHEDUT — GOOGLE PLAY TESTING STRATEGY & ROLLOUT PLAN
**Phase 3.5: Google Play Console Integration & Production Launch Preparation**  
**Application ID:** `com.thekhedut.app`  
**Target Release:** Version 1.0.0 (versionCode 1)

---

## 1. Overview of Release Tracks

Google Play provides three sequential testing tracks before promoting an application to full public production:

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│ 1. Internal Testing    │ ---> │ 2. Closed Testing      │ ---> │ 3. Production Release  │
│ (Immediate; ~100 team) │      │ (20 testers / 14 days) │      │ (100% Public Rollout)  │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

---

## 2. Track 1: Internal Testing (Fast Team Verification)

Internal testing provides instant release access with **zero Google Play review delay** (typically available within 5–10 minutes of upload).

### Step 1: Create an Email List of Internal Testers
1. In Play Console, navigate to **Testing > Internal testing**.
2. Click **Testers** tab.
3. Click **Create email list** (name it: `The Khedut Core Team`).
4. Add tester email addresses (up to 100 Google accounts):
   - Founder & engineering team members.
   - Core agricultural advisors and field pilot farmers.
5. Save the list and copy the **Join on the web** or **Join on Android** invite link.

### Step 2: Upload the Signed AAB to Internal Testing
1. Navigate to **Internal testing > Create new release**.
2. Upload `frontend/android/app/build/outputs/bundle/release/app-release.aab`.
3. Enter Release name: `1.0.0 (Internal Pilot)`.
4. Add release notes detailing the initial feature suite.
5. Click **Next** and **Save release**.

### Step 3: Core Functional Verification Checklist
Testers install the app via the internal test link on physical devices and verify:
- [ ] **Cold Start & Splash**: Splash screen displays official artwork without white flickering.
- [ ] **Authentication**: Sign in with email and password; verify clean loading spinner and session persistence.
- [ ] **Leaf Disease Scanner**: Test "Take Photo" (hardware camera viewfinder) and "Open Gallery".
- [ ] **Soil NPK Calculator**: Enter NPK values and generate custom dosage recommendations.
- [ ] **APMC Mandi Prices**: Query live commodity prices across Gujarat mandis.
- [ ] **Multilingual Parity**: Switch between English, Gujarati (ગુજરાતી), and Hindi (हिन्दी); verify layout integrity.
- [ ] **Farmer Voice Assistant**: Tap mic button, speak query in Gujarati/Hindi/English; verify accurate transcription.
- [ ] **PDF Export & Share Sheet**: Generate a disease statement or soil report; share via WhatsApp or Google Drive.
- [ ] **Offline Resilience**: Turn on Airplane mode; verify amber `OfflineBanner` appears and reconnect banner confirms restoration.

---

## 3. Track 2: Closed Testing (Google Play Compliance Gate)

### 3.1. Google Policy for Personal Accounts (Post-Nov 2023)
> [!IMPORTANT]
> If the founder registers a **Personal Developer Account**, Google Play mandates:
> - **At least 20 testers** must opt in to your closed test.
> - Testers must remain opted in for **at least 14 continuous days**.
> - Only after satisfying this requirement will the **Apply for production** button become active in Play Console.
> 
> *Exemption*: If the founder registers an **Organization Account** (with D-U-N-S), this 14-day gate is waived.

### 3.2. Closed Testing Setup & Recruitment
1. Navigate to **Testing > Closed testing**.
2. Create a track (e.g., `Alpha Closed Test`).
3. Under **Testers**, select **Closed testing list** and add 20+ trusted agricultural testers, agronomists, and partner farmers.
4. Promote the validated internal release AAB to the closed track.
5. Submit for Closed Testing review (Google reviews closed track releases, usually in 24–48 hours).
6. Once approved, distribute the opt-in link to all 20+ testers.
7. Instruct testers to open the link, tap **Accept Invite**, install the app via Google Play, and interact with the app periodically over the 14-day period.

### 3.3. Bug Reporting & Feedback Channel
- Create a dedicated Google Form or WhatsApp community group: `The Khedut Beta Feedback`.
- Fields: Tester name, device model, Android OS version, issue description, screenshot attachment.
- In-app feedback: Directs to `support@thekhedut.ai`.

---

## 4. Track 3: Production Release & Rollout Strategy

### Step 1: Pre-Launch Report Review
Before public release, Google Play automatically executes your AAB on Firebase Test Lab devices:
1. Navigate to **Quality > Pre-launch report**.
2. Inspect:
   - **Crashes & ANRs (Application Not Responding)**: Must be 0.
   - **Accessibility issues**: Check touch targets and contrast.
   - **Security vulnerabilities**: Verify 0 alert flags.

### Step 2: Staged Rollout Schedule
To mitigate unexpected edge-case issues across diverse Indian Android devices:
1. **Day 1**: Roll out to **10%** of users. Monitor Google Play Android Vitals for crash spikes.
2. **Day 3**: Increase to **25%** if crash rate remains < 0.1%.
3. **Day 5**: Increase to **50%**.
4. **Day 7**: Promote to **100% Full Production Rollout**.
