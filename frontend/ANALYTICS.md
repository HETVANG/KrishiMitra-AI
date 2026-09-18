# KrishiMitra AI Analytics Integration

In Version 1.1, Google Analytics and Microsoft Clarity trackers are dynamic and driven entirely by environment variables. Hardcoded development mock values have been stripped from static source files.

## Local Configuration

To enable trackers locally or in staging/production environments, specify the tracking keys in your client environment file (`frontend/.env`):

```bash
# Google Analytics 4 Measurement ID (e.g. G-XXXXXX)
VITE_GA_MEASUREMENT_ID=your_real_google_analytics_id

# Microsoft Clarity Project Tracking ID (e.g. 9-character code)
VITE_CLARITY_PROJECT_ID=your_real_clarity_project_id
```

## Production Configurations

Add `VITE_GA_MEASUREMENT_ID` and `VITE_CLARITY_PROJECT_ID` as environment keys in your host provider control panel (e.g., Vercel, Netlify, AWS Amplify).

## Dynamic Loading Workflow

KrishiMitra AI mounts trackers dynamically inside `App.tsx` upon app instantiation:
* If the environment keys are missing, the scripts fail silently with browser log notifications, ensuring guest sessions run without tracking overhead.
* No raw cookies or tracker scripts are loaded unless valid IDs are mapped in.
