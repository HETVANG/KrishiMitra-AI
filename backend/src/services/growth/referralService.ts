import mongoose from 'mongoose';
import { User } from '../../models/User';
import { Referral, ReferralStatus } from '../../models/Referral';
import { ProductEventService } from '../productIntelligence/productEventService';
import crypto from 'crypto';

export class ReferralService {
  /**
   * Generate a unique 8-character referral code (e.g. KRISHIMITRA-A9X2B4) for a user
   */
  static generateCode(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `KM-${randomHex}`;
  }

  /**
   * Get or create a unique referral code for a user
   */
  static async getOrCreateReferralCode(userId: string): Promise<string> {
    if (mongoose.connection.readyState !== 1) {
      return 'KM-OFFLINE';
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.referralCode) {
      return user.referralCode;
    }

    let code = this.generateCode();
    let exists = await User.findOne({ referralCode: code });
    let attempts = 0;

    while (exists && attempts < 10) {
      code = this.generateCode();
      exists = await User.findOne({ referralCode: code });
      attempts++;
    }

    user.referralCode = code;
    await user.save();
    return code;
  }

  /**
   * Process referral attribution upon user signup
   */
  static async attributeSignup(input: {
    newUserId: string;
    referralCode?: string;
    source?: string;
    medium?: string;
    campaignId?: string;
  }): Promise<{ success: boolean; referredBy?: string }> {
    if (mongoose.connection.readyState !== 1 || !input.referralCode) {
      return { success: false };
    }

    const cleanCode = input.referralCode.trim().toUpperCase();
    const referrer = await User.findOne({ referralCode: cleanCode });

    if (!referrer) {
      return { success: false };
    }

    // Fraud protection: Prevent self-referral
    if (referrer._id.toString() === input.newUserId) {
      console.warn(`[Referral] Prevented self-referral for user ${input.newUserId}`);
      return { success: false };
    }

    // Attach referrer to new user record
    const newUser = await User.findById(input.newUserId);
    if (newUser && !newUser.referredBy) {
      newUser.referredBy = referrer._id;
      await newUser.save();

      // Increment referrer count atomically
      await User.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } });

      // Create Referral tracking record
      await Referral.create({
        referrerId: referrer._id,
        referredUserId: newUser._id,
        referralCode: cleanCode,
        status: 'SIGNED_UP',
        campaignId: input.campaignId,
        source: input.source || 'referral_link',
        medium: input.medium || 'direct',
        signedUpAt: new Date()
      });

      // Log Product Telemetry Event
      ProductEventService.logEvent({
        eventType: 'ONBOARDING_STARTED',
        userId: input.newUserId,
        feature: 'Referral System',
        metadata: { referrerId: referrer._id.toString(), code: cleanCode }
      });

      return { success: true, referredBy: referrer._id.toString() };
    }

    return { success: false };
  }

  /**
   * Update referral status as referred farmer progresses (ONBOARDED, ACTIVATED, CONVERTED)
   */
  static async updateReferralStatus(
    referredUserId: string,
    newStatus: ReferralStatus
  ): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;

    try {
      const referral = await Referral.findOne({ referredUserId });
      if (!referral) return;

      referral.status = newStatus;
      if (newStatus === 'ACTIVATED') {
        referral.activatedAt = referral.activatedAt || new Date();
      } else if (newStatus === 'CONVERTED') {
        referral.convertedAt = referral.convertedAt || new Date();
      }
      await referral.save();
    } catch (err: any) {
      console.error('[Referral] Failed to update status:', err.message);
    }
  }

  /**
   * Get user referral stats and history
   */
  static async getUserReferralStats(userId: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        referralCode: 'KM-DEMO',
        totalReferrals: 0,
        signedUp: 0,
        activated: 0,
        converted: 0,
        history: []
      };
    }

    const code = await this.getOrCreateReferralCode(userId);
    const referrals = await Referral.find({ referrerId: userId })
      .populate('referredUserId', 'name createdAt onboardingStatus')
      .sort({ createdAt: -1 })
      .lean();

    const signedUp = referrals.filter(r => r.status === 'SIGNED_UP').length;
    const activated = referrals.filter(r => r.status === 'ACTIVATED' || r.status === 'ONBOARDED').length;
    const converted = referrals.filter(r => r.status === 'CONVERTED').length;

    return {
      referralCode: code,
      totalReferrals: referrals.length,
      signedUp,
      activated,
      converted,
      history: referrals.map(r => ({
        id: r._id,
        farmerName: (r.referredUserId as any)?.name || 'Farmer Member',
        status: r.status,
        signedUpAt: r.signedUpAt,
        activatedAt: r.activatedAt
      }))
    };
  }
}
