import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const createJsonLimitHandler = (tierName: string, userMessage: string) => {
  return (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests on ${tierName} endpoint. Please try again later.`,
      userMessage,
      retryAfterSeconds: Math.ceil((res.getHeader('Retry-After') as number) || 60),
      timestamp: new Date().toISOString()
    });
  };
};

const resolveClientKey = (req: Request): string => {
  const user = (req as any).user;
  if (user && (user._id || user.id)) {
    return `user_${user._id || user.id}`;
  }
  return req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown_client';
};

/**
 * 1. General API Rate Limiter
 * 200 requests per 15-minute window per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createJsonLimitHandler(
    'General API',
    'Too many requests received from your network. Please wait a few minutes before trying again.'
  )
});

/**
 * 2. Authentication Rate Limiter
 * 10 requests per 15-minute window per IP (brute-force defense)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createJsonLimitHandler(
    'Authentication',
    'Too many sign-in or registration attempts. Please wait 15 minutes before trying again.'
  )
});

/**
 * 3. AI Diagnostics & Vision Operations Rate Limiter
 * 15 requests per 15-minute window per user/IP (prevents token abuse)
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: resolveClientKey,
  handler: createJsonLimitHandler(
    'AI Diagnostics',
    'AI analysis quota reached for this window. Please wait a few minutes before submitting another scan or query.'
  )
});

/**
 * 4. Report Generation & Download Rate Limiter
 * 20 requests per 15-minute window per user/IP (PDF rendering resource protection)
 */
export const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: resolveClientKey,
  handler: createJsonLimitHandler(
    'Reports',
    'Report download frequency exceeded. Please wait a moment before downloading additional reports.'
  )
});

/**
 * 5. Payment & Order Verification Rate Limiter
 * 20 requests per 15-minute window per user/IP
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: resolveClientKey,
  handler: createJsonLimitHandler(
    'Payment Checkout',
    'Payment request rate limit exceeded. Please wait before retrying your transaction.'
  )
});
