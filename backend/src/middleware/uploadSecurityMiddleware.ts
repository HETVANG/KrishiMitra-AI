import { Request, Response, NextFunction } from 'express';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
const DANGEROUS_EXTENSIONS = ['.exe', '.sh', '.bat', '.js', '.php', '.py', '.cmd', '.vbs', '.dll', '.so'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateUploadedFile(file: { originalname: string; mimetype: string; size: number }): FileValidationResult {
  if (!file) {
    return { valid: false, reason: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, reason: 'File size exceeds maximum permitted limit of 10MB' };
  }

  const filename = file.originalname.toLowerCase();
  
  // Directory traversal check
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { valid: false, reason: 'Invalid filename containing path traversal characters' };
  }

  // Dangerous extension check
  if (DANGEROUS_EXTENSIONS.some(ext => filename.endsWith(ext))) {
    return { valid: false, reason: 'Security alert: Executable or script file upload rejected' };
  }

  // Allowed extension check
  if (!ALLOWED_EXTENSIONS.some(ext => filename.endsWith(ext))) {
    return { valid: false, reason: 'Unsupported file type. Permitted formats: JPG, PNG, WEBP, PDF' };
  }

  return { valid: true };
}

export function uploadSecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  const file = (req as any).file;
  if (file) {
    const check = validateUploadedFile(file);
    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.reason || 'File upload rejected due to security policy'
      });
    }
  }
  next();
}
