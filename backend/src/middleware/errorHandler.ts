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
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'Internal Server Error';
  const userMessage = err.userMessage || (statusCode >= 500 ? 'An unexpected error occurred on the server. Please try again later.' : message);
  const requestId = (req as any).id || (req.headers['x-request-id'] as string) || 'unknown';

  console.error(`[Error Handler] [${req.method}] ${req.url} - Status ${statusCode} [${code}] - ReqID: ${requestId} - Message: ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    userMessage,
    requestId,
    timestamp: new Date().toISOString()
  });
};

