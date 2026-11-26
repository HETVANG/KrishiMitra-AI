import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import type {
  Token,
  PushNotificationSchema,
  ActionPerformed,
  RegistrationError,
} from '@capacitor/push-notifications';
import { api } from '../api';
import { toast } from 'react-toastify';

const FCM_TOKEN_KEY = 'khedut_fcm_token';

/**
 * Register the FCM token with the backend for the currently authenticated user.
 */
export async function registerTokenWithBackend(fcmToken?: string): Promise<boolean> {
  const token = fcmToken || localStorage.getItem(FCM_TOKEN_KEY);
  const authToken = localStorage.getItem('token');

  if (!token || !authToken) {
    return false;
  }

  try {
    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
    await api.post('/notifications/devices/register', {
      token,
      platform,
      appVersion: '1.0.7',
    });
    console.log('[FCM] Device token successfully registered with backend');
    return true;
  } catch (err: any) {
    console.warn('[FCM] Failed to register device token with backend:', err.response?.data?.error || err.message);
    return false;
  }
}

/**
 * Unregister the FCM token from the backend (e.g., on user logout).
 */
export async function unregisterTokenFromBackend(fcmToken?: string): Promise<boolean> {
  const token = fcmToken || localStorage.getItem(FCM_TOKEN_KEY);
  const authToken = localStorage.getItem('token');

  if (!token || !authToken) {
    return false;
  }

  try {
    await api.post('/notifications/devices/unregister', { token });
    console.log('[FCM] Device token unregistered from backend');
    return true;
  } catch (err: any) {
    console.warn('[FCM] Failed to unregister device token from backend:', err.response?.data?.error || err.message);
    return false;
  }
}

/**
 * Prompt the user for notification permissions on native Android 13+ / iOS.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive === 'granted') {
      await PushNotifications.register();
      return true;
    }

    return false;
  } catch (err: any) {
    console.warn('[FCM] Permission request error:', err);
    return false;
  }
}

/**
 * Resolve target navigation route from notification payload.
 */
function resolveNotificationRoute(data: Record<string, any> = {}): string | null {
  if (data.actionUrl && typeof data.actionUrl === 'string') return data.actionUrl;
  if (data.url && typeof data.url === 'string') return data.url;
  if (data.route && typeof data.route === 'string') return data.route;
  if (data.path && typeof data.path === 'string') return data.path;

  // Infer route from notification type
  switch (data.type) {
    case 'weather':
      return '/weather';
    case 'disease':
      return '/disease-detection';
    case 'market':
      return '/market';
    case 'scheme':
      return '/schemes';
    case 'crop_lifecycle':
      return '/crop-lifecycle';
    case 'irrigation':
      return '/smart-irrigation';
    case 'copilot':
    case 'chat':
      return '/copilot';
    case 'forum':
    case 'community':
      return '/forum';
    default:
      return null;
  }
}

/**
 * Initialize native push notifications, channels, and event listeners.
 */
export function initPushNotifications(navigateFn?: (path: string) => void): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  const setupPush = async () => {
    try {
      // 1. Android Notification Channel (Required for Android 8.0+ / Oreo through Android 15)
      if (Capacitor.getPlatform() === 'android') {
        await PushNotifications.createChannel({
          id: 'khedut_default_channel',
          name: 'The Khedut Alerts',
          description: 'Timely agricultural alerts, mandi price updates, and weather advisories',
          importance: 4, // High importance (banners & sounds)
          visibility: 1, // Public on lockscreen
          vibration: true,
          lights: true,
          lightColor: '#15803d',
        });
      }

      // 2. Registration Token Listener
      const regListener = await PushNotifications.addListener('registration', async (token: Token) => {
        console.log('[FCM] Device registered with FCM token');
        localStorage.setItem(FCM_TOKEN_KEY, token.value);
        await registerTokenWithBackend(token.value);
      });
      cleanups.push(() => regListener.remove());

      // 3. Registration Error Listener
      const errListener = await PushNotifications.addListener('registrationError', (error: RegistrationError) => {
        console.warn('[FCM] Push registration error:', error.error);
      });
      cleanups.push(() => errListener.remove());

      // 4. Foreground Push Notification Handler
      const receivedListener = await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          console.log('[FCM] Foreground notification received:', notification.title);
          
          const title = notification.title ? `${notification.title}: ` : '';
          const body = notification.body || 'New agricultural update available';
          
          toast.info(`${title}${body}`, {
            position: 'top-right',
            autoClose: 5000,
            icon: '🌾',
            onClick: () => {
              const targetRoute = resolveNotificationRoute(notification.data);
              if (targetRoute) {
                if (navigateFn) navigateFn(targetRoute);
                else window.location.href = targetRoute;
              }
            },
          });
        }
      );
      cleanups.push(() => receivedListener.remove());

      // 5. Notification Action / Tap Performed (Background & Foreground notification taps)
      const actionListener = await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action: ActionPerformed) => {
          console.log('[FCM] Notification tapped:', action.actionId, action.notification.title);
          const targetRoute = resolveNotificationRoute(action.notification.data);
          if (targetRoute) {
            if (navigateFn) {
              navigateFn(targetRoute);
            } else {
              window.location.href = targetRoute;
            }
          }
        }
      );
      cleanups.push(() => actionListener.remove());

      // 6. Check & Request Permissions
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
      } else {
        console.log('[FCM] Push notifications permission status:', permStatus.receive);
      }
    } catch (err: any) {
      console.warn('[FCM] Push notification initialization notice:', err.message);
    }
  };

  setupPush();

  return () => {
    cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch {
        // ignore
      }
    });
  };
}
