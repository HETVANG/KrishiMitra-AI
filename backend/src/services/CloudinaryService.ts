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
  console.log('[Cloudinary Service] Running in fallback mode (Cloudinary keys missing).');
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOC_SIZE = 20 * 1024 * 1024;   // 20MB

export class CloudinaryService {
  /**
   * Validate file payload before processing
   */
  public static validateFilePayload(buffer: Buffer, mimetype: string, category: 'IMAGE' | 'VIDEO' | 'DOC'): void {
    if (!buffer || buffer.length === 0) {
      throw new Error('File buffer is empty');
    }

    const normMime = (mimetype || '').toLowerCase().trim();

    if (category === 'IMAGE') {
      if (!ALLOWED_IMAGE_TYPES.includes(normMime)) {
        throw new Error(`Unsupported image MIME type: ${normMime}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
      }
      if (buffer.length > MAX_IMAGE_SIZE) {
        throw new Error(`Image size exceeds limit of 10MB (${(buffer.length / (1024 * 1024)).toFixed(2)}MB)`);
      }
    } else if (category === 'VIDEO') {
      if (!ALLOWED_VIDEO_TYPES.includes(normMime)) {
        throw new Error(`Unsupported video MIME type: ${normMime}. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`);
      }
      if (buffer.length > MAX_VIDEO_SIZE) {
        throw new Error(`Video size exceeds limit of 50MB (${(buffer.length / (1024 * 1024)).toFixed(2)}MB)`);
      }
    } else if (category === 'DOC') {
      if (!ALLOWED_DOC_TYPES.includes(normMime)) {
        throw new Error(`Unsupported document MIME type: ${normMime}. Allowed: ${ALLOWED_DOC_TYPES.join(', ')}`);
      }
      if (buffer.length > MAX_DOC_SIZE) {
        throw new Error(`Document size exceeds limit of 20MB (${(buffer.length / (1024 * 1024)).toFixed(2)}MB)`);
      }
    }
  }

  /**
   * Uploads an image buffer directly to Cloudinary and returns the secure URL
   */
  static async uploadImageBuffer(buffer: Buffer, mimetype: string): Promise<string> {
    this.validateFilePayload(buffer, mimetype, 'IMAGE');

    if (!isCloudinaryConfigured) {
      console.warn('[Cloudinary Service] Cloudinary not configured. Returning local placeholder URL.');
      return 'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=600';
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'krishimitra-scans' },
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
    this.validateFilePayload(buffer, mimetype, 'VIDEO');

    if (!isCloudinaryConfigured) {
      console.warn('[Cloudinary Service] Cloudinary not configured. Returning local mock video.');
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
    this.validateFilePayload(buffer, mimetype, 'DOC');

    if (!isCloudinaryConfigured) {
      console.warn('[Cloudinary Service] Cloudinary not configured. Returning local document.');
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
