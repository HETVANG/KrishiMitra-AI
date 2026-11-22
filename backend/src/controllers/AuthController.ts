import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { LoginHistory } from '../models/LoginHistory';
import { AuthRequest } from '../middleware/auth';
import { ReferralService } from '../services/growth/referralService';

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
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing.');
  }
  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any, algorithm: 'HS256' }
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
    paymentProvider: user.paymentProvider || 'none',
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
      const { name, email, password, phone, settings, farmLocation, expertProfile, referralCode } = req.body;
      const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
      const safeRole = (req.body.role === 'farmer' || req.body.role === 'expert') ? req.body.role : 'user';

      // Live MongoDB Mode
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({
        name: name ? String(name).trim() : 'User',
        email: normalizedEmail,
        password,
        phone,
        role: safeRole,
        expertProfile: safeRole === 'expert' ? expertProfile : undefined,
        settings: settings || { language: 'en', theme: 'light' },
        farmLocation,
        plan: 'free',
        subscriptionStatus: 'trialing',
        subscriptionType: 'trial',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      // Generate unique referral code for the new user immediately
      try {
        await ReferralService.getOrCreateReferralCode(user._id.toString());
      } catch (refErr) {
        console.warn('[AuthController] Failed to generate referral code for new user:', refErr);
      }

      // Attribute referral signup if referralCode provided
      if (referralCode && typeof referralCode === 'string') {
        try {
          await ReferralService.attributeSignup({
            newUserId: user._id.toString(),
            referralCode: referralCode.trim()
          });
        } catch (attrErr) {
          console.warn('[AuthController] Failed to attribute referral signup:', attrErr);
        }
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
      const normalizedEmail = email ? String(email).trim().toLowerCase() : '';

      // Live Mode - Explicitly select password field to guarantee availability
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
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

      const loginTimestamp = new Date();

      // Parallelize lastLogin update and audit history without blocking on full Mongoose validation cycle
      const updatePromise = User.updateOne({ _id: user._id }, { $set: { lastLogin: loginTimestamp } });

      const userAgent = req.headers['user-agent'] || '';
      const { browser, device } = parseUserAgent(userAgent);
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const historyPromise = LoginHistory.create({
        userId: user._id,
        loginTime: loginTimestamp,
        browser,
        device,
        ipAddress
      }).catch(err => console.error('[LoginHistory Warning] Non-critical audit log error:', err));

      await Promise.all([updatePromise, historyPromise]);

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
