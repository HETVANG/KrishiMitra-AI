# THE KHEDUT — ANDROID KEYSTORE VERIFICATION REPORT

**Application Name:** The Khedut  
**Application ID:** `com.thekhedut.app`  
**Keystore Location:** `C:\AndroidSigning\thekhedut-release-key.jks`  
**Alias:** `thekhedut`  
**Verification Date:** November 16, 2026  
**Auditor:** Senior Android Release Engineer  
**Status:** **PASSED — PRODUCTION KEYSTORE CREATED & VERIFIED**  

---

## 1. Keystore Verification Checklist

| # | Inspection Item | Status | Verification Evidence / Command | Finding |
| :- | :--- | :-: | :--- | :--- |
| **1** | Keystore directory exists | **PASS** | `Test-Path "C:\AndroidSigning"` -> `True` | Directory `C:\AndroidSigning` exists and is secured on drive C. |
| **2** | Keystore file exists | **PASS** | `Test-Path "C:\AndroidSigning\thekhedut-release-key.jks"` -> `True` | File present on disk, size 2,746 bytes. |
| **3** | File is readable & valid format | **PASS** | PKCS12 storetype inspection via `keytool.exe` | Keystore format is valid PKCS12 container. |
| **4** | Alias `thekhedut` exists | **PASS** | `keytool -list -alias thekhedut` | Alias `thekhedut` present as `PrivateKeyEntry`. |
| **5** | Keystore password is valid | **PASS** | Authenticated via `keystore.properties` | Cryptographically secure 32-character random key unlocks store. |
| **6** | Private key accessible | **PASS** | Certificate chain length: 1 | 2048-bit RSA private key entry accessible and unlocked. |
| **7** | Certificate valid & unexpired | **PASS** | `Nov 16, 2026 until Apr 03, 2054` | Valid for 10,000 days (27+ years). |
| **8** | Certificate SHA-256 fingerprint | **PASS** | Recorded below | Verified and matched with production signing record. |

---

## 2. Cryptographic Certificate Specifications

```
Keystore File:        C:\AndroidSigning\thekhedut-release-key.jks
Alias Name:           thekhedut
Entry Type:           PrivateKeyEntry
Certificate Chain:    1
Owner / Issuer DN:    CN=The Khedut, OU=Mobile Engineering, O=The Khedut, L=Ahmedabad, ST=Gujarat, C=IN
Serial Number:        234522953dd035d8
Valid From:           Mon Nov 16 22:57:08 IST 2026
Valid Until:          Fri Apr 03 22:57:08 IST 2054 (10,000 days)
Subject Public Key:   2048-bit RSA key
Signature Algorithm:  SHA384withRSA
Certificate Version:  3
```

### Certificate Fingerprints
- **SHA-256:** `D1:E1:3E:1A:28:0F:CE:05:E7:F9:1C:1B:5E:68:E8:93:96:78:3F:A9:77:B1:24:DA:58:38:97:0F:14:2D:72:5F`
- **SHA-1:** `71:F2:DC:F5:D6:F8:F6:17:12:A8:0C:F8:66:E4:85:0F:3D:3E:14:24`

---

## 3. Security & Operational Hygiene Summary

1. **Zero Credential Exposure:**
   - The password was generated in memory using a cryptographically secure pseudo-random number generator (`RNGCryptoServiceProvider` / `RandomNumberGenerator`).
   - Passwords were never echoed to the terminal, stdout, stderr, or logged in transcripts.
   - The password is stored exclusively in `frontend/android/keystore.properties` on the local physical build machine.

2. **Git Repository Hygiene:**
   - `frontend/android/keystore.properties` is strictly ignored by `frontend/android/.gitignore` (line 58) and root `.gitignore`.
   - The keystore directory `C:\AndroidSigning` is located outside the Git repository.
   - Verification with `git status` confirms zero credential leak in the staging tree.

3. **Status for Play Console:**
   - When uploading the first release AAB to Google Play Console, Google Play App Signing will register this certificate (`SHA-256: D1:E1:3E:1A...`) as the official **Upload Key Certificate**.
