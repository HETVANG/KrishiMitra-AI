# THE KHEDUT — ANDROID DEVICE TEST CHECKLIST
**Phase 3.2: Native Android Integration & Device Capability Engineering**  
**Date:** November 4, 2026  
**Application Name:** The Khedut (`com.thekhedut.app`)  
**APK Target:** `frontend/android/app/build/outputs/apk/debug/app-debug.apk`  
**Test Matrix:** Android 11 (API 30), Android 13 (API 33), Android 14/15 (API 34/35)

---

## 1. Classification Overview

This checklist defines the physical device verification protocols for The Khedut Android application. Each item is classified under one of four rigorous engineering statuses:

- **[VERIFIED]**: Implemented and verified via automated build, TypeScript validation, and static asset pipeline.
- **[AWAITING DEVICE]**: Implemented in code and bridge, awaiting manual verification on a physical Android handset with hardware sensors.
- **[NOT IMPLEMENTED]**: Intentionally deferred or out-of-scope for Phase 3.2.
- **[BLOCKED]**: Dependent on missing external configuration or hardware environment.

---

## 2. Test Execution Checklist

### Group A: Camera & Image Pipeline
| ID | Test Case | Expected Behavior | Status | Physical Device Steps |
|---|---|---|---|---|
| **CAM-01** | Leaf Scanner: Launch Camera | Tapping "Take Photo" opens Android camera viewfinder. | **[AWAITING DEVICE]** | Tap Disease Detection > Take Photo. Verify camera opens without crashing. |
| **CAM-02** | Camera Permission Request | First use displays Android system dialog "Allow The Khedut to take pictures and record video?". | **[AWAITING DEVICE]** | Trigger fresh install; tap Take Photo; verify prompt. |
| **CAM-03** | Camera Permission Denial | Denying permission displays user-friendly banner: "Camera permission was denied. Please enable camera access in app settings." | **[VERIFIED]** | Tested via mock bridge rejection; verify native UI display on device. |
| **CAM-04** | Leaf Scanner: Gallery Selection | Tapping "Open Gallery" opens Android media picker / photo gallery. | **[AWAITING DEVICE]** | Select leaf image from gallery; verify image loads into preview box. |
| **CAM-05** | Image Upload to Backend | Captured photo is sent as `multipart/form-data` to `/diseases/analyze`. | **[VERIFIED]** | Automated TypeScript bridge validated; verify live server response on device. |
| **CAM-06** | Camera Cancellation | Pressing back or cancelling viewfinder returns to app with no error. | **[VERIFIED]** | Open camera and press back; confirm uploader remains ready. |

---

### Group B: Geolocation & Localized Services
| ID | Test Case | Expected Behavior | Status | Physical Device Steps |
|---|---|---|---|---|
| **GEO-01** | First-Launch Location Prompt | Displays Android system permission "Allow The Khedut to access this device's location?". | **[AWAITING DEVICE]** | Clear app data; launch Dashboard; observe native prompt. |
| **GEO-02** | Precise Location Lock | App retrieves GPS coordinates; calls `/weather/reverse-geocode` to show local village/city. | **[AWAITING DEVICE]** | Allow "While using the app"; verify city name updates in Dashboard weather card. |
| **GEO-03** | GPS Disabled Handling | Turning off device location displays notification to enable GPS services. | **[VERIFIED]** | Disable GPS toggle in Android quick settings; tap Locate; verify warning. |
| **GEO-04** | Permission Denial Fallback | Denying location does not crash; falls back to manual search bar. | **[VERIFIED]** | Deny permission; verify search input is available. |
| **GEO-05** | Leaflet Map GPS Pin | Tapping GPS locate on farm map centers view with green animated pulse marker. | **[AWAITING DEVICE]** | Open Leaflet Map > tap Locate Me > verify map flyTo animation and pin popup. |

---

### Group C: PDF Generation, Caching & Native Sharing
| ID | Test Case | Expected Behavior | Status | Physical Device Steps |
|---|---|---|---|---|
| **PDF-01** | Statement Download Trigger | Tapping "Download PDF" in Reports writes document to internal cache (`Directory.Cache`). | **[VERIFIED]** | Automated build & FileProvider verified. |
| **PDF-02** | Android Share Sheet Invocation | App invokes native Android share dialog with document title and `content://` URI. | **[AWAITING DEVICE]** | Tap Download PDF on a generated advisory report; verify share bottom sheet opens. |
| **PDF-03** | Open in PDF Viewer | Selecting Google Drive / Adobe Reader opens and renders the advisory report correctly. | **[AWAITING DEVICE]** | Choose Google PDF Viewer; confirm farmer name, logo, and table layout render sharply. |
| **PDF-04** | Share to WhatsApp | Selecting WhatsApp shares the PDF document directly to farmer contacts. | **[AWAITING DEVICE]** | Choose WhatsApp in share sheet; verify file attachment sends cleanly. |
| **PDF-05** | Soil Analysis Export | Tapping Download in Soil Chemistry planner exports and triggers share sheet. | **[VERIFIED]** | Code updated in `SoilAnalysis.tsx`; test on physical handset. |

---

### Group D: Hardware Navigation & App Lifecycle
| ID | Test Case | Expected Behavior | Status | Physical Device Steps |
|---|---|---|---|---|
| **NAV-01** | History Navigation | Pressing hardware back button on sub-pages (e.g. `/disease` or `/reports`) returns to previous page. | **[VERIFIED]** | Navigate Dashboard > Reports > Back button; confirm returns to Dashboard. |
| **NAV-02** | Drawer Priority Close | If sidebar drawer is open, back button closes drawer without navigating away. | **[VERIFIED]** | Open hamburger menu; press hardware back; confirm drawer closes. |
| **NAV-03** | Double-Tap Exit Guard | Pressing back on Dashboard displays "Press back again to exit The Khedut" toast; second tap within 2s exits. | **[VERIFIED]** | On Dashboard, press back once (observe toast), press back again (app exits). |
| **NAV-04** | Background Audio Cancellation | Moving app to background while voice assistant or read-aloud is active halts speech synthesis immediately. | **[VERIFIED]** | Start reading aloud crop diagnosis; press home button; confirm speech terminates. |
| **NAV-05** | Foreground Token Verification | Resuming app from background keeps farmer session active without redirect to login. | **[VERIFIED]** | Switch to another app for 1 minute; switch back; confirm dashboard remains loaded. |

---

### Group E: Visual & System UI Integration
| ID | Test Case | Expected Behavior | Status | Physical Device Steps |
|---|---|---|---|---|
| **UI-01** | Status Bar Styling | Status bar background is brand green (`#15803d`) with legible white icons. | **[VERIFIED]** | Observe top system bar on launch; verify color matches The Khedut theme. |
| **UI-02** | Display Cutout / Notch Inset | Content does not get clipped behind camera punch-holes or notches. | **[VERIFIED]** | Tested on device with camera cutout; verify header padding. |
| **UI-03** | Mobile Bottom Nav Insets | Bottom navigation bar respects Android 3-button or gesture bar safe area (`safe-area-pb`). | **[VERIFIED]** | Check on device with gesture navigation; ensure bottom nav is not obscured. |
| **UI-04** | Splash Screen Transition | Displays official farmer-and-oxen artwork during cold start; hides smoothly on mount. | **[VERIFIED]** | Cold start app; verify splash duration and smooth transition to login/dashboard. |
| **UI-05** | Virtual Keyboard Behavior | Opening keyboard in input fields scrolls field into view without breaking layout. | **[VERIFIED]** | Tap notes input in Disease Detection; verify keyboard does not cover input. |

---

## 3. Physical Device Testing Execution Guide

1. **Install Pre-built APK on Connected Handset**:
   ```bash
   adb install -r "frontend/android/app/build/outputs/apk/debug/app-debug.apk"
   ```
2. **Launch & Monitor System Logs**:
   ```bash
   adb logcat -s "Capacitor:*" "Capacitor/Console:*" "TheKhedut:*"
   ```
3. **Record Findings**:
   Log any visual anomalies, latency, or permission quirks directly against the IDs in this checklist for resolution in subsequent phases.
