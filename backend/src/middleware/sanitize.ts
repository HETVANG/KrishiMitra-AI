import { Request, Response, NextFunction } from 'express';

/**
 * Recursively scans and cleans an object or array to strip keys containing '$' prefix or '.'
 * which are utilized in MongoDB NoSQL injection attacks (such as $ne, $gt, $where, $regex).
 */
export function cleanNoSqlPayload<T = any>(payload: T): T {
  if (payload === null || payload === undefined || typeof payload !== 'object') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(item => cleanNoSqlPayload(item)) as unknown as T;
  }

  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(payload as Record<string, any>)) {
    // Drop keys that begin with '$' or contain '.'
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[Security Alert] Stripped potential NoSQL injection key: "${key}"`);
      continue;
    }
    cleaned[key] = cleanNoSqlPayload((payload as Record<string, any>)[key]);
  }

  return cleaned as T;
}

/**
 * Express middleware to sanitize incoming request body, query parameters, and route parameters.
 */
export const noSqlSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanNoSqlPayload(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = cleanNoSqlPayload(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanNoSqlPayload(req.params);
  }
  next();
};
