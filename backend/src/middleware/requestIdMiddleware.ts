import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface CorrelatedRequest extends Request {
  id?: string;
  startTime?: number;
}

export function requestIdMiddleware(req: CorrelatedRequest, res: Response, next: NextFunction) {
  const incomingId = req.headers['x-request-id'] as string;
  const requestId = incomingId || `req_${crypto.randomUUID().substring(0, 8)}`;

  req.id = requestId;
  req.startTime = Date.now();

  res.setHeader('X-Request-ID', requestId);

  // Log completion on finish
  res.on('finish', () => {
    const durationMs = Date.now() - (req.startTime || Date.now());
    if (res.statusCode >= 400) {
      console.warn(`[HTTP ${res.statusCode}] ${req.method} ${req.originalUrl} - ${durationMs}ms [ReqID: ${requestId}]`);
    }
  });

  next();
}
