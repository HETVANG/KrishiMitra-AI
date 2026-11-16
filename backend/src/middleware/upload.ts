import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// In-memory storage stores files as buffers
const storage = multer.memoryStorage();

/**
 * Validates the true binary magic numbers / signature of an image buffer
 * to guard against extension/MIME-spoofing attacks.
 */
export function isAllowedImageSignature(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;

  // JPEG / JPG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47 (0x89 'P' 'N' 'G')
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }

  // WebP: RIFF container (offset 0..3) + WEBP header (offset 8..11)
  const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46; // 'RIFF'
  const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50; // 'WEBP'
  if (isRiff && isWebp) {
    return true;
  }

  return false;
}

/**
 * Middleware that strictly verifies binary signatures of uploaded images
 */
export const validateImageSignature = (req: Request, res: Response, next: NextFunction) => {
  const filesToCheck: Express.Multer.File[] = [];

  if (req.file) {
    filesToCheck.push(req.file);
  }

  if (req.files) {
    if (Array.isArray(req.files)) {
      filesToCheck.push(...req.files);
    } else {
      for (const field of Object.keys(req.files)) {
        filesToCheck.push(...req.files[field]);
      }
    }
  }

  for (const file of filesToCheck) {
    if (file.mimetype.startsWith('image/')) {
      if (!file.buffer || !isAllowedImageSignature(file.buffer)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_FILE_SIGNATURE',
          message: 'Security validation failed: File binary signature does not match allowed image format (JPEG, PNG, WEBP).',
          userMessage: 'The uploaded file is not a valid image. Please upload a genuine JPEG, PNG, or WebP photo.'
        });
      }
    }
  }

  next();
};

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WEBP image uploads are allowed.') as any, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const audioFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'audio/webm',
    'audio/wav',
    'audio/ogg',
    'audio/mpeg',
    'audio/mp3',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
    'audio/aac',
    'audio/3gpp',
    'video/webm',
    'application/octet-stream'
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid audio file type: ${file.mimetype}. Only standard audio formats are allowed.`) as any, false);
  }
};

export const audioUpload = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const videoFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/avi',
    'video/mpeg'
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid video file type: ${file.mimetype}. Only MP4, MOV, AVI, and WebM video uploads are allowed.`) as any, false);
  }
};

export const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});
