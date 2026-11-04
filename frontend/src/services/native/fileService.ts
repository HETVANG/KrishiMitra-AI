import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface FileSaveOptions {
  title?: string;
  text?: string;
  dialogTitle?: string;
  mimeType?: string;
}

/**
 * Converts a Blob or ArrayBuffer to a base64 encoded string.
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Strip off the data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = dataUrl.split(',')[1] || dataUrl;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Download or share a PDF / document across native Android and Web.
 * On native Android, saves the file to internal cache via @capacitor/filesystem
 * and invokes the native Android Share sheet via @capacitor/share so the farmer can
 * view in Google Drive / PDF Viewer or share to WhatsApp / Print.
 * On Web, triggers standard browser download link.
 */
export async function downloadOrSharePdf(
  data: Blob | ArrayBuffer | any,
  filename: string,
  options?: FileSaveOptions
): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type: options?.mimeType || 'application/pdf' });

    if (Capacitor.isNativePlatform()) {
      // 1. Convert to Base64 for Capacitor Filesystem
      const base64Data = await blobToBase64(blob);

      // 2. Write to app Cache directory (No broad external storage permissions needed)
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const writeResult = await Filesystem.writeFile({
        path: sanitizedFilename,
        data: base64Data,
        directory: Directory.Cache,
      });

      // 3. Trigger native Android share sheet with file URI
      const shareOptions = {
        title: options?.title || sanitizedFilename,
        text: options?.text || 'The Khedut Official Advisory Report',
        url: writeResult.uri,
        dialogTitle: options?.dialogTitle || 'Open or Share Report',
      };

      try {
        const canShare = await Share.canShare();
        if (canShare.value) {
          await Share.share(shareOptions);
        }
      } catch (shareErr: any) {
        // Sharing cancellation is normal user behavior
        console.info('[NativeFile] Share dialog dismissed or closed:', shareErr?.message);
      }

      return { success: true, uri: writeResult.uri };
    }

    // Web Fallback: Standard browser blob download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);

    return { success: true };
  } catch (err: any) {
    console.error('[NativeFile] Error downloading or sharing file:', err);
    return {
      success: false,
      error: err?.message || 'Failed to download or share document.'
    };
  }
}
