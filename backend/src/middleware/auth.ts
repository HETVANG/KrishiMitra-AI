import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let authHeader = req.headers.authorization;
    
    // Support token in query parameters (required for direct window.open PDF downloads)
    if (!authHeader && (req.query.Authorization || req.query.token)) {
      const rawToken = (req.query.Authorization || req.query.token) as string;
      authHeader = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required or malformed' });
    }

    // Mandatory JWT Secret validation
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[Auth Error] JWT_SECRET is not configured in environment.');
      return res.status(500).json({ message: 'Authentication service configuration error.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });

    // Fetch user directly from MongoDB Atlas
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found or account deactivated' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Middleware Error] ${error}`);
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
};

export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let authHeader = req.headers.authorization;
    
    if (!authHeader && (req.query.Authorization || req.query.token)) {
      const rawToken = (req.query.Authorization || req.query.token) as string;
      authHeader = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // Optional JWT Secret validation
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });

    const user = await User.findById(decoded.id).select('-password');

    if (user && !user.isBlocked) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Fail silently and proceed as a guest user session
    next();
  }
};
