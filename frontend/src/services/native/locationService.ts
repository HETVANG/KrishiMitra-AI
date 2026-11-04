import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import type { Position, PermissionStatus } from '@capacitor/geolocation';

export interface DeviceCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
}

export interface DeviceLocationResult {
  coords: DeviceCoordinates | null;
  error?: string;
  isPermissionDenied?: boolean;
  isLocationDisabled?: boolean;
}

/**
 * Retrieve device geographic coordinates.
 * On Android, uses @capacitor/geolocation with runtime fine/coarse permission checks.
 * On web, falls back cleanly to navigator.geolocation.
 */
export async function getDeviceLocation(options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
}): Promise<DeviceLocationResult> {
  const enableHighAccuracy = options?.enableHighAccuracy ?? true;
  const timeout = options?.timeout ?? 12000;

  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Check current permissions
      let perms: PermissionStatus = await Geolocation.checkPermissions();

      if (perms.location === 'prompt' || perms.location === 'prompt-with-rationale') {
        perms = await Geolocation.requestPermissions({ permissions: ['location'] });
      }

      if (perms.location === 'denied') {
        return {
          coords: null,
          isPermissionDenied: true,
          error: 'Location permission denied. Please grant location access in device Settings to view localized weather and Mandi prices.'
        };
      }

      // 2. Fetch current coordinates with timeout
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge: 60000,
      });

      return {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
        }
      };
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || '';
      console.warn('[NativeLocation] Geolocation error:', err);

      if (msg.includes('disabled') || msg.includes('location services') || msg.includes('gps')) {
        return {
          coords: null,
          isLocationDisabled: true,
          error: 'Device location (GPS) is turned off. Please turn on location services.'
        };
      }

      if (msg.includes('denied') || msg.includes('permission')) {
        return {
          coords: null,
          isPermissionDenied: true,
          error: 'Location access was not granted.'
        };
      }

      if (msg.includes('timeout') || msg.includes('timed out')) {
        return {
          coords: null,
          error: 'Location request timed out. Please check GPS signal or try again.'
        };
      }

      return {
        coords: null,
        error: err?.message || 'Unable to retrieve location coordinates.'
      };
    }
  }

  // Web fallback using standard navigator.geolocation
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        coords: null,
        error: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
          }
        });
      },
      (err) => {
        let errorMsg = 'Failed to retrieve location.';
        let isDenied = false;
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied.';
          isDenied = true;
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'Location request timed out.';
        }
        resolve({
          coords: null,
          isPermissionDenied: isDenied,
          error: errorMsg,
        });
      },
      { enableHighAccuracy, timeout, maximumAge: 60000 }
    );
  });
}
