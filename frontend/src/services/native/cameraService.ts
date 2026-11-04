import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { PermissionStatus } from '@capacitor/camera';

export interface NativePhotoResult {
  file: File | null;
  previewUrl: string | null;
  cancelled: boolean;
  error?: string;
}

/**
 * Capture a photo using the device camera or select one from the gallery.
 * In native Android, uses @capacitor/camera with runtime permission handling.
 * In web browsers, seamlessly falls back or works with web camera/file input.
 */
export async function captureOrPickPhoto(options?: {
  source?: 'prompt' | 'camera' | 'photos';
  quality?: number;
}): Promise<NativePhotoResult> {
  const chosenSource = 
    options?.source === 'camera' ? CameraSource.Camera :
    options?.source === 'photos' ? CameraSource.Photos :
    CameraSource.Prompt;

  const quality = options?.quality ?? 90;

  if (Capacitor.isNativePlatform()) {
    try {
      // Check and request permissions if needed
      const currentPerms: PermissionStatus = await Camera.checkPermissions();
      
      if (currentPerms.camera === 'prompt' || currentPerms.photos === 'prompt') {
        const reqResult = await Camera.requestPermissions({
          permissions: ['camera', 'photos']
        });
        if (reqResult.camera === 'denied' && chosenSource === CameraSource.Camera) {
          return {
            file: null,
            previewUrl: null,
            cancelled: false,
            error: 'Camera permission was denied. Please enable camera access in app settings.'
          };
        }
      } else if (currentPerms.camera === 'denied' && chosenSource === CameraSource.Camera) {
        return {
          file: null,
          previewUrl: null,
          cancelled: false,
          error: 'Camera permission is permanently denied. Please enable it in Android Settings.'
        };
      }

      // Invoke native camera capture or gallery picker
      const image = await Camera.getPhoto({
        quality,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: chosenSource,
        saveToGallery: false,
      });

      if (!image.webPath) {
        return { file: null, previewUrl: null, cancelled: true };
      }

      // Convert webPath into standard JavaScript File object for existing backend compatibility
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const extension = image.format ? `.${image.format}` : '.jpg';
      const filename = `leaf_scan_${Date.now()}${extension}`;
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

      return {
        file,
        previewUrl: image.webPath,
        cancelled: false,
      };
    } catch (err: any) {
      // User cancellation detection in Capacitor
      const message = err?.message?.toLowerCase() || '';
      if (
        message.includes('cancelled') || 
        message.includes('canceled') || 
        message.includes('user closed') ||
        message.includes('no image picked')
      ) {
        return { file: null, previewUrl: null, cancelled: true };
      }

      console.error('[NativeCamera] Error capturing photo:', err);
      return {
        file: null,
        previewUrl: null,
        cancelled: false,
        error: err?.message || 'Failed to capture photo from device camera.'
      };
    }
  }

  // Fallback for Web: Programmatically trigger file input
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (options?.source === 'camera') {
      input.capture = 'environment';
    }

    input.onchange = (e: any) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        const preview = URL.createObjectURL(selectedFile);
        resolve({
          file: selectedFile,
          previewUrl: preview,
          cancelled: false,
        });
      } else {
        resolve({ file: null, previewUrl: null, cancelled: true });
      }
    };

    input.oncancel = () => {
      resolve({ file: null, previewUrl: null, cancelled: true });
    };

    input.click();
  });
}
