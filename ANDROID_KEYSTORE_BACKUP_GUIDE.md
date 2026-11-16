# THE KHEDUT — PRODUCTION ANDROID KEYSTORE BACKUP & DISASTER RECOVERY GUIDE

**Application Name:** The Khedut  
**Application ID:** `com.thekhedut.app`  
**Keystore Path:** `C:\AndroidSigning\thekhedut-release-key.jks`  
**Key Alias:** `thekhedut`  
**Certificate SHA-256:** `D1:E1:3E:1A:28:0F:CE:05:E7:F9:1C:1B:5E:68:E8:93:96:78:3F:A9:77:B1:24:DA:58:38:97:0F:14:2D:72:5F`  
**Audience:** Platform Founder, Engineering Leads, DevOps  

---

## 1. Why Keystore Permanence is Mission-Critical

Android applications uploaded to Google Play Store require a cryptographic digital signature to establish app authenticity and integrity across releases.

### How Google Play App Signing Works
1. **Upload Key:** When you build and upload the Android App Bundle (`app-release.aab`), it is signed locally with your private key in `C:\AndroidSigning\thekhedut-release-key.jks`.
2. **Google Verification:** Google Play verifies the bundle against the registered upload key certificate (`SHA-256: D1:E1:3E:1A...`).
3. **App Signing by Google:** Google strips the upload key and re-signs the application with Google's managed production App Signing key before generating and distributing device-optimized APKs.

> [!WARNING]
> **What Happens If You Lose the Signing Key?**
> - You will **not be able to sign or publish updates** for The Khedut on the Google Play Store.
> - Resetting an upload key requires contacting Google Play Developer Support, verifying organization identity, and waiting 48–72 hours for certificate registration.
> - Direct APK installs or side-loaded enterprise builds outside Google Play would become completely un-updatable without uninstallation (which causes farmer user data loss).

---

## 2. Cryptographic Identity of Record

Keep this metadata in your secure company records alongside the backup:

| Property | Value |
| :--- | :--- |
| **Keystore File** | `thekhedut-release-key.jks` (PKCS12) |
| **Key Alias** | `thekhedut` |
| **Key Algorithm** | RSA 2048-bit |
| **Distinguished Name (DN)** | `CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN` |
| **Serial Number** | `234522953dd035d8` |
| **Validity Period** | November 16, 2026 to April 03, 2054 (10,000 days) |
| **SHA-256 Fingerprint** | `D1:E1:3E:1A:28:0F:CE:05:E7:F9:1C:1B:5E:68:E8:93:96:78:3F:A9:77:B1:24:DA:58:38:97:0F:14:2D:72:5F` |
| **SHA-1 Fingerprint** | `71:F2:DC:F5:D6:F8:F6:17:12:A8:0C:F8:66:E4:85:0F:3D:3E:14:24` |

---

## 3. Keystore Backup Checklist

Create an encrypted offline backup containing:

| Backup Component | Description | Recommended Storage Method |
| :--- | :--- | :--- |
| **Keystore File** | `thekhedut-release-key.jks` | 2 encrypted hardware USB drives kept in separate physical locations. |
| **Keystore Password** | Password unlocking the JKS container | Enterprise Password Manager (1Password, Bitwarden, KeePass). |
| **Key Password** | Password unlocking the private key | Enterprise Password Manager. |
| **Key Alias** | `thekhedut` | Secure vault record. |
| **SHA-256 Fingerprint** | `D1:E1:3E:1A...` | Vault record & Release documentation. |

> [!CAUTION]
> **Never commit keystore files or passwords to GitHub, Slack, email, or unencrypted cloud drives.** Keep them out of Git repositories at all times.

---

## 4. Disaster Recovery Workflow (Restoring on a New Workstation or CI/CD)

If a developer machine is replaced or a CI/CD runner is configured:

1. **Restore Keystore File:**
   Copy `thekhedut-release-key.jks` to `C:\AndroidSigning\thekhedut-release-key.jks` (or a dedicated CI secrets directory).

2. **Verify Certificate Fingerprint Matches:**
   ```powershell
   & "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot\bin\keytool.exe" -list -v -keystore "C:\AndroidSigning\thekhedut-release-key.jks" -alias thekhedut
   ```
   Confirm the output matches SHA-256 `D1:E1:3E:1A:28:0F:CE:05:E7:F9:1C:1B:5E:68:E8:93:96:78:3F:A9:77:B1:24:DA:58:38:97:0F:14:2D:72:5F`.

3. **Recreate Untracked `frontend/android/keystore.properties`:**
   ```properties
   storeFile=C:/AndroidSigning/thekhedut-release-key.jks
   storePassword=<RETRIEVED_FROM_PASSWORD_VAULT>
   keyAlias=thekhedut
   keyPassword=<RETRIEVED_FROM_PASSWORD_VAULT>
   ```

4. **Run Signed Build:**
   ```powershell
   cd frontend/android
   .\gradlew.bat bundleRelease
   ```
