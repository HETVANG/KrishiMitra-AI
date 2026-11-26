import fs from 'fs';
import path from 'path';
import { initializeApp, cert, applicationDefault, getApps, App } from 'firebase-admin/app';
import { getMessaging, MulticastMessage, SendResponse } from 'firebase-admin/messaging';
import { DeviceToken } from '../models/DeviceToken';

let firebaseApp: App | null = null;

/**
 * Initializes the Firebase Admin SDK securely using environment variables or a service account key file.
 * All credentials remain strictly on the backend.
 */
function initFirebaseAdmin(): boolean {
  if (firebaseApp) {
    return true;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
    return true;
  }

  try {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const renderSecretPaths = [
      '/etc/secrets/serviceAccountKey.json',
      '/etc/secrets/firebase-service-account.json',
      '/etc/secrets/firebaseServiceAccount.json'
    ];
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // 1. Explicit GOOGLE_APPLICATION_CREDENTIALS (Application Default Credentials)
    if (credPath) {
      const resolvedPath = path.isAbsolute(credPath) ? credPath : path.resolve(process.cwd(), credPath);
      if (fs.existsSync(resolvedPath)) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedPath;
        firebaseApp = initializeApp({
          credential: applicationDefault(),
        });
        console.log('[FCM] Firebase Admin SDK initialized successfully via Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS)');
        return true;
      } else {
        console.warn(`[FCM] Specified GOOGLE_APPLICATION_CREDENTIALS path does not exist on disk: ${credPath}`);
      }
    }

    // 2. Render Secret File default path (/etc/secrets/serviceAccountKey.json)
    const detectedRenderSecret = renderSecretPaths.find(p => fs.existsSync(p));
    if (detectedRenderSecret) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = detectedRenderSecret;
      firebaseApp = initializeApp({
        credential: applicationDefault(),
      });
      console.log(`[FCM] Firebase Admin SDK initialized successfully from Render Secret File: ${detectedRenderSecret}`);
      return true;
    }

    // 3. FIREBASE_SERVICE_ACCOUNT_KEY (Raw JSON string or file path)
    if (rawKey) {
      let parsedCred: any = null;
      if (rawKey.trim().startsWith('{')) {
        parsedCred = JSON.parse(rawKey);
      } else if (fs.existsSync(rawKey)) {
        const resolvedPath = path.resolve(rawKey);
        process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedPath;
        firebaseApp = initializeApp({
          credential: applicationDefault(),
        });
        console.log('[FCM] Firebase Admin SDK initialized successfully via FIREBASE_SERVICE_ACCOUNT_KEY path using Application Default Credentials');
        return true;
      } else {
        const resolvedPath = path.resolve(process.cwd(), rawKey);
        if (fs.existsSync(resolvedPath)) {
          process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedPath;
          firebaseApp = initializeApp({
            credential: applicationDefault(),
          });
          console.log('[FCM] Firebase Admin SDK initialized successfully via resolved FIREBASE_SERVICE_ACCOUNT_KEY path');
          return true;
        }
      }

      if (parsedCred) {
        firebaseApp = initializeApp({
          credential: cert(parsedCred),
        });
        console.log('[FCM] Firebase Admin SDK initialized successfully via inline FIREBASE_SERVICE_ACCOUNT_KEY JSON');
        return true;
      }
    }

    // 4. Individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
    if (projectId && clientEmail && privateKey) {
      const formattedKey = privateKey.replace(/\\n/g, '\n');
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        }),
      });
      console.log('[FCM] Firebase Admin SDK initialized successfully via discrete environment credentials');
      return true;
    }

    // 5. Default application credentials fallback in production (e.g. Cloud Run / GCP runtime)
    if (process.env.NODE_ENV === 'production') {
      try {
        firebaseApp = initializeApp({
          credential: applicationDefault(),
        });
        console.log('[FCM] Firebase Admin SDK initialized with standard applicationDefault credentials');
        return true;
      } catch {
        // Fall through to unconfigured standby
      }
    }

    console.log('[FCM] Firebase Admin credentials not provided in environment. Push notification service running in standby.');
    return false;
  } catch (err: any) {
    console.warn('[FCM] Notice: Failed to initialize Firebase Admin SDK:', err.message);
    return false;
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export class FCMService {
  /**
   * Check if Firebase Admin SDK is ready to dispatch notifications
   */
  static isConfigured(): boolean {
    return initFirebaseAdmin();
  }

  /**
   * Send push notification to all active registered devices of a given user
   */
  static async sendToUser(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<{ success: boolean; delivered: number; total: number; reason?: string }> {
    if (!this.isConfigured() || !firebaseApp) {
      return { success: false, delivered: 0, total: 0, reason: 'FCM_NOT_CONFIGURED' };
    }

    try {
      const devices = await DeviceToken.find({ user: userId, isActive: true }).lean();
      if (!devices || devices.length === 0) {
        return { success: true, delivered: 0, total: 0, reason: 'NO_ACTIVE_DEVICES' };
      }

      const tokens = devices.map(d => d.token);

      const message: MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'khedut_default_channel',
            icon: 'ic_launcher',
            color: '#15803d',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
      };

      const messaging = getMessaging(firebaseApp);
      const response = await messaging.sendEachForMulticast(message);

      // Handle invalid or expired tokens
      const tokensToRemove: string[] = [];
      response.responses.forEach((res: SendResponse, index: number) => {
        if (!res.success && res.error) {
          const code = res.error.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            tokensToRemove.push(tokens[index]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        await DeviceToken.updateMany(
          { token: { $in: tokensToRemove } },
          { $set: { isActive: false } }
        );
      }

      return {
        success: true,
        delivered: response.successCount,
        total: tokens.length,
      };
    } catch (err: any) {
      console.error('[FCM] Error dispatching push notification:', err.message);
      return { success: false, delivered: 0, total: 0, reason: err.message };
    }
  }
}
