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

      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

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
        marketingConsent: Boolean(req.body.marketingConsent),
        marketingConsentTimestamp: req.body.marketingConsent ? new Date() : undefined,
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
      const { email, phone, mobile, phoneNumber, password } = req.body;
      const rawIdentifier = (phone || mobile || phoneNumber || email || '').toString().trim();

      if (!rawIdentifier || !password) {
        return res.status(400).json({ success: false, message: 'Mobile number and password are required' });
      }

      let user = null;

      // 1. If identifier contains '@', try email lookup first
      if (rawIdentifier.includes('@')) {
        const normalizedEmail = rawIdentifier.toLowerCase();
        user = await User.findOne({ email: normalizedEmail }).select('+password');
      } else {
        // 2. Mobile number lookup: normalize digits
        const cleanDigits = rawIdentifier.replace(/\D/g, '');
        const tenDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

        // Build search variants matching various phone formats stored in database
        const searchVariants = Array.from(new Set([
          rawIdentifier,
          cleanDigits,
          tenDigits,
          `+91${tenDigits}`,
          `+91 ${tenDigits}`,
          `0${tenDigits}`,
          `91${tenDigits}`,
        ])).filter(Boolean);

        user = await User.findOne({
          $or: [
            { phone: { $in: searchVariants } },
            { email: rawIdentifier.toLowerCase() }
          ]
        }).select('+password');
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
      }

      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
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

  static async requestDataDeletion(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, phone, reason } = req.body;
      let targetUser = null;

      const authUser = (req as AuthRequest).user;
      if (authUser) {
        targetUser = await User.findById(authUser._id);
      } else if (email || phone) {
        const query: any = {};
        if (email) query.email = String(email).trim().toLowerCase();
        if (phone) query.phone = String(phone).trim();
        targetUser = await User.findOne(query);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please provide registered email or phone number to submit deletion request.'
        });
      }

      if (!targetUser) {
        return res.json({
          success: true,
          message: 'If an account matches your details, your data deletion request has been registered and will be processed within 30 days.'
        });
      }

      targetUser.deletionRequested = true;
      targetUser.deletionRequestedAt = new Date();
      targetUser.deletionReason = reason ? String(reason).slice(0, 500) : 'User requested account closure';
      targetUser.deletionScheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      targetUser.isBlocked = true;
      await targetUser.save();

      return res.json({
        success: true,
        message: 'Your account deletion request has been registered. Account access has been deactivated, and all diagnostic, chat, and agronomic personal data will be completely purged within 30 days in accordance with the DPDP Act 2023 and Google Play Store policies. Statutory tax records will be retained for 7 years as mandated by Indian GST law.',
        scheduledDate: targetUser.deletionScheduledFor
      });
    } catch (error) {
      next(error);
    }
  }

  static async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { emailOrPhone, channels } = req.body;
      if (!emailOrPhone) {
        return res.status(400).json({ success: false, message: 'Email or phone number is required.' });
      }

      const cleanInput = String(emailOrPhone).trim().toLowerCase();
      const user = await User.findOne({
        $or: [{ email: cleanInput }, { phone: cleanInput }]
      });

      if (user) {
        user.marketingConsent = false;
        user.unsubscribedAt = new Date();
        user.unsubscribePreferences = {
          marketingEmails: channels?.marketingEmails ?? true,
          promotionalWhatsapp: channels?.promotionalWhatsapp ?? true,
          promotionalPush: channels?.promotionalPush ?? true
        };
        await user.save();
      }

      return res.json({
        success: true,
        message: 'You have been successfully unsubscribed from promotional marketing communications. Essential transactional notifications (such as OTPs, security alerts, and payment receipts) will remain active to safeguard your account.'
      });
    } catch (error) {
      next(error);
    }
  }
}
