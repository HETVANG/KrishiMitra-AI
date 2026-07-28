import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

let isCloudinaryConfigured = false;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  isCloudinaryConfigured = true;
  console.log('[Cloudinary Service] Live Cloudinary client configured successfully.');
} else {
  console.log('[Cloudinary Service] Running in mock/fallback mode (Cloudinary keys missing).');
}

export class CloudinaryService {
  /**
   * Uploads an image buffer directly to Cloudinary and returns the secure URL
   */
  static async uploadImageBuffer(buffer: Buffer, mimetype: string): Promise<string> {
    if (!isCloudinaryConfigured) {
      console.warn('[Cloudinary Service] Cloudinary not configured. Returning fallback placeholder.');
      return 'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=600';
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'krishimitra-scans',
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Cloudinary upload returned empty result'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  static async uploadVideoBuffer(buffer: Buffer, mimetype: string): Promise<string> {
    if (!isCloudinaryConfigured) {
      console.warn('[Cloudinary Service] Cloudinary not configured. Returning fallback mock video.');
      return 'https://www.w3schools.com/html/mov_bbb.mp4';
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'krishimitra-videos',
          resource_type: 'video',
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Video Upload Error]', error);
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Cloudinary video upload returned empty result'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  static async uploadFileBuffer(buffer: Buffer, mimetype: string): Promise<string> {
    if (!isCloudinaryConfigured) {
      console.warn('[Cloudinary Service] Cloudinary not configured. Returning fallback document.');
      return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'krishimitra-docs',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary File Upload Error]', error);
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Cloudinary file upload returned empty result'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }
}
