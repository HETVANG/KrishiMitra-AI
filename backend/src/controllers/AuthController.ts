import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { LoginHistory } from '../models/LoginHistory';
import { AuthRequest } from '../middleware/auth';

const parseUserAgent = (userAgentStr: string = '') => {
  const ua = userAgentStr.toLowerCase();
  let browser = 'Unknown Browser';
  let device = 'Desktop';

  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('chrome') && !ua.includes('chromium')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opr') || ua.includes('opera')) browser = 'Opera';

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad') || ua.includes('playbook')) {
    device = 'Tablet';
  }

  return { browser, device };
};

const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'super_secret_krishimitra_token_12345',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );
};

const mapUserPayload = (user: any) => {
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    settings: user.settings,
    farmLocation: user.farmLocation,
    plan: user.plan || 'free',
    subscriptionStatus: user.subscriptionStatus || 'trialing',
    subscriptionType: user.subscriptionType || 'trial',
    trialStartDate: user.trialStartDate,
    trialEndDate: user.trialEndDate,
    subscriptionExpiry: user.subscriptionExpiry,
    scansUsedToday: user.scansUsedToday || 0,
    chatMessagesToday: user.chatMessagesToday || 0
  };
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, phone, role, settings, farmLocation } = req.body;

      // Live MongoDB Mode
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        role: role || 'user',
        settings: settings || { language: 'en', theme: 'light' },
        farmLocation,
        plan: 'free',
        subscriptionStatus: 'trialing',
        subscriptionType: 'trial',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      user.lastLogin = new Date();
      await user.save();

      const userAgent = req.headers['user-agent'] || '';
      const { browser, device } = parseUserAgent(userAgent);
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      await LoginHistory.create({
        userId: user._id,
        loginTime: user.lastLogin,
        browser,
        device,
        ipAddress
      });

      const token = generateToken(user._id.toString());

      return res.status(201).json({
        success: true,
        token,
        user: mapUserPayload(user),
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Live Mode
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      if (user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Account is blocked. Please contact support.' });
      }

      user.lastLogin = new Date();
      await user.save();

      const userAgent = req.headers['user-agent'] || '';
      const { browser, device } = parseUserAgent(userAgent);
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      await LoginHistory.create({
        userId: user._id,
        loginTime: user.lastLogin,
        browser,
        device,
        ipAddress
      });

      const token = generateToken(user._id.toString());

      return res.json({
        success: true,
        token,
        user: mapUserPayload(user),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      return res.json({
        success: true,
        user: mapUserPayload(req.user),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { language, theme, farmLocation } = req.body;

      // Live Mode
      const user: any = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (language) user.settings.language = language;
      if (theme) user.settings.theme = theme;
      if (farmLocation) user.farmLocation = farmLocation;

      await user.save();

      return res.json({
        success: true,
        user: mapUserPayload(user),
      });
    } catch (error) {
      next(error);
    }
  }
}
