import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

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
        role: role || 'farmer',
        settings: settings || { language: 'en', theme: 'light' },
        farmLocation,
        plan: 'free',
        subscriptionStatus: 'trialing',
        subscriptionType: 'trial',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
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
