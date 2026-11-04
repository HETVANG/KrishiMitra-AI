# THE KHEDUT — ANDROID RELEASE SIGNING & KEYSTORE GUIDE
**Phase 3.4: Production Android Engineering, Release Signing & Play Store Readiness**  
**Date:** November 4, 2026  
**Application ID:** `com.thekhedut.app`  
**Workspace:** `C:\Users\raman\AI farma`  
**Target:** Google Play Console & Release AAB/APK Signing

---

## 1. Important Signing Principles

1. **Google Play App Signing**: Google Play uses **Play App Signing**. You sign your Android App Bundle (AAB) with an **Upload Key**. Google verifies your upload key, strips it, and re-signs the application with Google's managed production App Signing key before serving it to farmers.
2. **Key Permanence**: The upload key must remain consistent across all future updates of The Khedut. If you change or lose the upload key without resetting it in the Play Console, Google Play will reject new app version updates.
3. **Secret Isolation**: Keystores (`*.keystore`, `*.jks`) and property files (`keystore.properties`) must **never** be checked into GitHub or shared in public channels. They are strictly ignored in `.gitignore`.

---

## 2. Generating the Production Release Keystore

Run the following command in your terminal (using Java's standard `keytool` utility included with JDK/Android Studio):

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore thekhedut-upload.keystore -alias thekhedut-upload -keyalg RSA -keysize 2048 -validity 10000
```

### Parameter Guide:
- `-keystore thekhedut-upload.keystore`: File name of the generated keystore.
- `-alias thekhedut-upload`: Unique identifier alias for this key entry.
- `-keyalg RSA -keysize 2048`: Recommended cryptographic algorithm and key length.
- `-validity 10000`: Valid for ~27 years (ensures lifetime maintenance without renewal expiration).

When prompted, enter:
- A strong, random keystore password (minimum 16 characters).
- Your organization details:
  - First and Last Name: Founder Name
  - Organization Unit: Mobile Engineering
  - Organization: The Khedut
  - City / Locality: Ahmedabad / Gandhinagar
  - State: Gujarat
  - Country Code: IN

---

## 3. Method A: Automated Gradle Signing (Recommended for CLI / CI)

### Step 1: Place Keystore File
Move your generated `thekhedut-upload.keystore` into the `frontend/android/` directory (it is ignored by Git).

### Step 2: Create `keystore.properties`
Copy `frontend/android/keystore.properties.example` to `frontend/android/keystore.properties`:

```properties
storeFile=thekhedut-upload.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=thekhedut-upload
keyPassword=YOUR_KEY_PASSWORD
```

### Step 3: Build Signed Release Artifacts
From `frontend/android/`:

- **Generate Signed Android App Bundle (AAB) for Play Store**:
  ```bash
  .\gradlew.bat bundleRelease
  ```
  *Output Artifact*: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

- **Generate Signed Release APK for Direct Testing**:
  ```bash
  .\gradlew.bat assembleRelease
  ```
  *Output Artifact*: `frontend/android/app/build/outputs/apk/release/app-release.apk`

---

## 4. Method B: Android Studio GUI Signing (Recommended for First-Time Setup)

If you prefer using the graphical Android Studio wizard:

1. Open Android Studio.
2. Select **Open an Existing Project** and choose:
   `C:\Users\raman\AI farma\frontend\android`
3. Wait for Gradle sync to complete.
4. In the top menu, navigate to:
   **Build > Generate Signed Bundle / APK...**
5. Select **Android App Bundle** and click **Next**.
6. Under **Key store path**:
   - Click **Create new...** to create a new keystore, OR
   - Click **Choose existing...** to locate your `thekhedut-upload.keystore`.
7. Enter the keystore password, key alias (`thekhedut-upload`), and key password.
8. Click **Next**.
9. Select the **release** build variant.
10. Click **Finish**.
11. Android Studio will compile, bundle, and sign the release AAB in:
    `frontend/android/app/release/app-release.aab`

---

## 5. Keystore Backup & Disaster Recovery Protocol

1. **Primary Backup**: Store the `.keystore` file in a secure encrypted company vault or password manager (e.g. 1Password, Bitwarden, KeePass).
2. **Cold Storage**: Keep an encrypted offline backup copy on a dedicated physical flash drive stored in a secure location.
3. **Emergency Key Reset**:
   If the upload key is accidentally lost or compromised:
   - Log in to **Google Play Console**.
   - Navigate to **Release > Setup > App Integrity**.
   - Under **Upload key certificate**, click **Request upload key reset**.
   - Generate a new upload key and upload the PEM certificate. Google will activate the new upload key within 48 hours.
