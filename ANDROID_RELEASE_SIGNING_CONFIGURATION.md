# THE KHEDUT — ANDROID RELEASE SIGNING CONFIGURATION GUIDE

**Application Name:** The Khedut  
**Application ID:** `com.thekhedut.app`  
**Framework:** Capacitor 8  
**Gradle Build File:** `frontend/android/app/build.gradle`  
**Configuration File:** `frontend/android/keystore.properties`  
**Status:** **CONFIGURED, VERIFIED & OPERATIONAL**  

---

## 1. Release Signing Architecture

The Khedut Android release signing pipeline is engineered with zero hardcoded credentials and automated fail-safe protection.

```
+-------------------------------------------------------------+
|               Local Developer / CI Environment              |
+-------------------------------------------------------------+
                              |
        (Reads from frontend/android/keystore.properties)
                              v
+-------------------------------------------------------------+
|             frontend/android/app/build.gradle               |
|                                                             |
|  - Reads storeFile, storePassword, keyAlias, keyPassword    |
|  - Validates keystore file presence before packaging        |
|  - Throws clean GradleException if keystore is missing      |
|  - Signs release bundle with RSA-2048 key (thekhedut)       |
+-------------------------------------------------------------+
                              |
        (Signs bundle using Android bundletool)
                              v
+-------------------------------------------------------------+
|    app/build/outputs/bundle/release/app-release.aab         |
|              (Verified: 18.31 MB, jar verified)             |
+-------------------------------------------------------------+
```

---

## 2. Hardened Gradle Configuration (`frontend/android/app/build.gradle`)

```groovy
android {
    ...
    signingConfigs {
        release {
            def keystorePropsFile = rootProject.file('keystore.properties')
            if (keystorePropsFile.canRead()) {
                def props = new Properties()
                props.load(new FileInputStream(keystorePropsFile))
                def configuredPath = props['storeFile']
                if (configuredPath) {
                    File ks = file(configuredPath)
                    if (!ks.isAbsolute()) {
                        ks = rootProject.file(configuredPath)
                    }
                    storeFile = ks
                    storePassword = props['storePassword']
                    keyAlias = props['keyAlias']
                    keyPassword = props['keyPassword']
                }
            } else if (System.getenv("RELEASE_KEYSTORE_PATH")) {
                storeFile = file(System.getenv("RELEASE_KEYSTORE_PATH"))
                storePassword = System.getenv("RELEASE_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("RELEASE_KEY_ALIAS")
                keyPassword = System.getenv("RELEASE_KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            if (signingConfigs.release.storeFile != null) {
                signingConfig signingConfigs.release
            }
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

gradle.taskGraph.whenReady { taskGraph ->
    if (taskGraph.hasTask(':app:signReleaseBundle')) {
        if (android.signingConfigs.release.storeFile == null || !android.signingConfigs.release.storeFile.exists()) {
            throw new GradleException(
                "\n[RELEASE SIGNING ERROR] Production release keystore was not found!\n" +
                "Configured location: " + (android.signingConfigs.release.storeFile ?: "Not configured in frontend/android/keystore.properties") + "\n" +
                "Please ensure the keystore exists at 'C:/AndroidSigning/thekhedut-release-key.jks' and credentials are provided in 'frontend/android/keystore.properties'.\n"
            )
        }
    }
}
```

---

## 3. Local Keystore Properties Configuration

The file `frontend/android/keystore.properties` is active on this workstation:

```properties
storeFile=C:/AndroidSigning/thekhedut-release-key.jks
storePassword=[CRYPTOGRAPHICALLY_SECURE_PASSWORD]
keyAlias=thekhedut
keyPassword=[CRYPTOGRAPHICALLY_SECURE_PASSWORD]
```

### Git Exclusion Verification
`frontend/android/.gitignore`:
```gitignore
# Keystore & Signing files
*.jks
*.keystore
keystore.properties
```

Running `git status` verifies that `keystore.properties` is untracked and completely ignored by Git.

---

## 4. How to Generate the Signed Release Bundle

In a PowerShell terminal with Adoptium JDK 21 LTS:
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
cd "C:\Users\raman\AI farma\frontend\android"
.\gradlew.bat bundleRelease
```

Build artifact generated:
`frontend/android/app/build/outputs/bundle/release/app-release.aab`
