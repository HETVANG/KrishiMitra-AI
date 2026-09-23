import crypto from 'crypto';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'creditcard',
  'cvv',
  'keysecret',
  'razorpay_signature',
  'jwt_secret',
  'apikey'
];

/**
 * Mask sensitive values in objects before logging
 */
export function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
      sanitized[key] = '[REDACTED_SECRET]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class Logger {
  static info(message: string, meta?: Record<string, any>, requestId?: string) {
    this.log('info', message, meta, requestId);
  }

  static warn(message: string, meta?: Record<string, any>, requestId?: string) {
    this.log('warn', message, meta, requestId);
  }

  static error(message: string, meta?: Record<string, any>, requestId?: string) {
    this.log('error', message, meta, requestId);
  }

  static debug(message: string, meta?: Record<string, any>, requestId?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, meta, requestId);
    }
  }

  private static log(level: LogLevel, message: string, meta?: Record<string, any>, requestId?: string) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = meta ? sanitizeData(meta) : undefined;

    const logPayload = {
      timestamp,
      level: level.toUpperCase(),
      requestId: requestId || 'sys',
      message,
      ...(sanitizedMeta ? { meta: sanitizedMeta } : {})
    };

    if (level === 'error') {
      console.error(JSON.stringify(logPayload));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logPayload));
    } else {
      console.log(JSON.stringify(logPayload));
    }
  }
}
