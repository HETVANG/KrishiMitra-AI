import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  userMessage?: string;
}

export class AppError extends Error implements CustomError {
  statusCode: number;
  code: string;
  userMessage: string;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', userMessage?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.userMessage = userMessage || message;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isProd = process.env.NODE_ENV === 'production';
  const requestId = (req as any).id || (req.headers['x-request-id'] as string) || 'unknown';

  let statusCode = err.statusCode || 500;
  let code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  let message = err.message || 'Internal Server Error';
  let userMessage = err.userMessage;

  // 1. Mongoose invalid ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_RESOURCE_IDENTIFIER';
    if (err.kind === 'date' || err.path === 'date') {
      message = 'Invalid date format provided in query.';
      userMessage = 'Please provide a valid date format.';
    } else if (err.kind === 'number' || err.path === 'number') {
      message = 'Invalid numeric parameter format.';
      userMessage = 'Please provide a valid numeric value.';
    } else {
      message = 'Invalid resource identifier format.';
      userMessage = 'The requested item identifier is invalid.';
    }
  }

  // 2. Mongoose schema validation failure
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    const fields = err.errors ? Object.keys(err.errors).join(', ') : 'fields';
    message = `Validation failed for: ${fields}`;
    userMessage = 'Please verify the submitted details and ensure all required fields are valid.';
  }

  // 3. MongoDB duplicate key (11000)
  else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    message = 'A resource with this unique identifier or field already exists.';
    userMessage = 'A record with this information already exists in the system.';
  }

  // 4. Multer upload errors
  else if (err.name === 'MulterError') {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    code = 'FILE_UPLOAD_ERROR';
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File size exceeds maximum allowed limit.' : (err.message || 'File upload error.');
    userMessage = 'Uploaded file could not be processed. Please check file type and size.';
  }

  // 5. JWT token errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid or expired authorization token.';
    userMessage = 'Your session has expired. Please sign in again.';
  }

  // Fallback userMessage for 500 errors
  if (!userMessage) {
    userMessage = statusCode >= 500
      ? 'An unexpected error occurred on the server. Please try again later.'
      : message;
  }

  // Production sanitization of internal server error messages
  const sanitizedMessage = (isProd && statusCode >= 500)
    ? 'An unexpected error occurred. Please contact support.'
    : message;

  console.error(`[Error Handler] [${req.method}] ${req.url} - Status ${statusCode} [${code}] - ReqID: ${requestId} - Internal: ${message}`);
  if (err.stack && !isProd) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message: sanitizedMessage,
    userMessage,
    requestId,
    timestamp: new Date().toISOString()
  });
};
