import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

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
          folder: 'the-khedut-docs',
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

  /**
   * Uploads a generated Report PDF buffer to Cloudinary with secure parameters
   * Falls back to disk buffer if Cloudinary is not configured or fails
   */
  static async uploadReportPdf(buffer: Buffer, filename: string): Promise<{ url: string; publicId: string; storageType: 'cloudinary' | 'local' }> {
    this.validateFilePayload(buffer, 'application/pdf', 'DOC');

    if (!isCloudinaryConfigured) {
      console.warn('[Cloudinary Service] Cloudinary keys not configured. Storing report in local persistent cache.');
      const localDir = path.resolve(process.cwd(), 'uploads/reports');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      const cleanFileName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(localDir, cleanFileName);
      fs.writeFileSync(filePath, buffer);

      return {
        url: `/api/reports/storage/${cleanFileName}`,
        publicId: `local_${cleanFileName}`,
        storageType: 'local'
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'the-khedut-reports',
          resource_type: 'raw',
          public_id: filename.replace(/\.pdf$/i, ''),
          format: 'pdf',
          access_mode: 'public'
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Report Upload Error]', error);
            // Fallback to local storage on network/API failure
            try {
              const localDir = path.resolve(process.cwd(), 'uploads/reports');
              if (!fs.existsSync(localDir)) {
                fs.mkdirSync(localDir, { recursive: true });
              }
              const cleanFileName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
              fs.writeFileSync(path.join(localDir, cleanFileName), buffer);
              return resolve({
                url: `/api/reports/storage/${cleanFileName}`,
                publicId: `local_${cleanFileName}`,
                storageType: 'local'
              });
            } catch (localErr) {
              return reject(error);
            }
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              storageType: 'cloudinary'
            });
          } else {
            reject(new Error('Cloudinary report upload returned empty result'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }
}
