import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { User } from '../models/User';

/**
 * Resets daily scan/chat limits automatically if a new day has arrived
 */
const resetDailyLimitsIfNeeded = async (user: any) => {
  const today = new Date().toDateString();
  const lastReset = user.lastLimitResetDate ? new Date(user.lastLimitResetDate).toDateString() : '';
  
  if (lastReset !== today) {
    user.scansUsedToday = 0;
    user.chatMessagesToday = 0;
    user.lastLimitResetDate = new Date();
    
    try {
      await User.findByIdAndUpdate(user._id, {
        scansUsedToday: 0,
        chatMessagesToday: 0,
        lastLimitResetDate: new Date()
      });
    } catch (err) {
      console.error('[Limit Reset Error]', err);
    }
  }
};

/**
 * Helper to determine if a user currently has Premium privileges (via active subscription or active trial)
 */
export const hasPremiumAccess = (user: any): boolean => {
  if (user.plan === 'premium' || user.plan === 'enterprise') {
    return true;
  }
  
  // Check if still trialing
  if (user.subscriptionStatus === 'trialing') {
    const trialEnd = user.trialEndDate ? new Date(user.trialEndDate).getTime() : 0;
    if (Date.now() < trialEnd) {
      return true;
    }
  }
  
  return false;
};

/**
 * Middleware: Protect premium tools (soil evaluation, crop recommendations, expert consults, PDF downloading)
 */
export const requirePremium = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await resetDailyLimitsIfNeeded(user);

    if (hasPremiumAccess(user)) {
      return next();
    }

    // Trial expired, redirect to premium upgrade warning
    return res.status(403).json({
      success: false,
      code: 'PREMIUM_UPGRADE_REQUIRED',
      message: 'Premium feature – Coming Soon'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Rate limit free accounts for daily scans and chatbot messages
 */
export const limitScansAndChats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await resetDailyLimitsIfNeeded(user);

    // If they have premium, bypass limit checks
    if (hasPremiumAccess(user)) {
      return next();
    }

    // Free account checks
    const path = req.path;
    
    if (path.includes('diagnose')) {
      if (user.scansUsedToday >= 10) {
        return res.status(429).json({
          success: false,
          code: 'SCAN_LIMIT_EXCEEDED',
          message: 'Daily limit of 10 free scans reached. Upgrade to Premium for unlimited scans!'
        });
      }
    } 
    
    else if (path.includes('message')) {
      if (user.chatMessagesToday >= 20) {
        return res.status(429).json({
          success: false,
          code: 'CHAT_LIMIT_EXCEEDED',
          message: 'Daily limit of 20 free chatbot messages reached. Upgrade to Premium for unlimited chats!'
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
