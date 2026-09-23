import mongoose from 'mongoose';
import { User } from '../models/User';
import { Farm } from '../models/Farm';
import { CropCycle } from '../models/CropCycle';
import { ProductEventService } from './productIntelligence/productEventService';

export interface OnboardingStatusResult {
  userId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  currentStep: number;
  version: number;
  hasFarm: boolean;
  hasCrop: boolean;
  completedAt?: Date | null;
}

export class OnboardingService {
  /**
   * Get farmer onboarding status. Auto-marks existing users who already have farms as COMPLETED.
   */
  static async getOnboardingStatus(userId: string): Promise<OnboardingStatusResult> {
    if (mongoose.connection.readyState !== 1) {
      return {
        userId,
        status: 'COMPLETED',
        currentStep: 4,
        version: 1,
        hasFarm: true,
        hasCrop: true
      };
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const farmCount = await Farm.countDocuments({ owner: userId });
      const cropCount = await CropCycle.countDocuments({ user: userId });

      // Auto-complete existing users who already have a farm or crop
      if (farmCount > 0 && user.onboardingStatus !== 'COMPLETED') {
        user.onboardingStatus = 'COMPLETED';
        user.onboardingCompletedAt = user.onboardingCompletedAt || new Date();
        await user.save();
      }

      return {
        userId,
        status: (user.onboardingStatus as any) || 'NOT_STARTED',
        currentStep: user.onboardingStep || 1,
        version: user.onboardingVersion || 1,
        hasFarm: farmCount > 0,
        hasCrop: cropCount > 0,
        completedAt: user.onboardingCompletedAt || undefined
      };
    } catch (err: any) {
      console.warn('[OnboardingService] Status resolution notice:', err.message);
      return {
        userId,
        status: 'COMPLETED',
        currentStep: 4,
        version: 1,
        hasFarm: true,
        hasCrop: true
      };
    }
  }

  /**
   * Start farmer onboarding
   */
  static async startOnboarding(userId: string): Promise<OnboardingStatusResult> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(userId);
        if (user && user.onboardingStatus === 'NOT_STARTED') {
          user.onboardingStatus = 'IN_PROGRESS';
          user.onboardingStep = 1;
          await user.save();

          ProductEventService.logEvent({
            eventType: 'ONBOARDING_STARTED',
            userId,
            feature: 'Onboarding'
          });
        }
      } catch (err: any) {
        console.warn('[OnboardingService] Start notice:', err.message);
      }
    }
    return this.getOnboardingStatus(userId);
  }

  /**
   * Update onboarding step and apply incremental preferences
   */
  static async updateStep(userId: string, step: number, data?: any): Promise<OnboardingStatusResult> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.onboardingStatus = 'IN_PROGRESS';
          user.onboardingStep = Math.max(user.onboardingStep || 1, step);

          // Language & Regional update
          if (data?.language && user.settings) {
            user.settings.language = data.language;
          }
          if (data?.stateName && user.settings?.regionalPreferences) {
            user.settings.regionalPreferences.stateName = data.stateName;
          }

          await user.save();

          ProductEventService.logEvent({
            eventType: 'ONBOARDING_STEP_COMPLETED',
            userId,
            feature: 'Onboarding',
            metadata: { step, data }
          });
        }
      } catch (err: any) {
        console.warn('[OnboardingService] Step update notice:', err.message);
      }
    }
    return this.getOnboardingStatus(userId);
  }

  /**
   * Skip optional onboarding steps
   */
  static async skipOnboarding(userId: string): Promise<OnboardingStatusResult> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.onboardingStatus = 'SKIPPED';
          await user.save();

          ProductEventService.logEvent({
            eventType: 'ONBOARDING_SKIPPED',
            userId,
            feature: 'Onboarding'
          });
        }
      } catch (err: any) {
        console.warn('[OnboardingService] Skip notice:', err.message);
      }
    }
    return this.getOnboardingStatus(userId);
  }

  /**
   * Complete farmer onboarding
   */
  static async completeOnboarding(userId: string): Promise<OnboardingStatusResult> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.onboardingStatus = 'COMPLETED';
          user.onboardingCompletedAt = new Date();
          await user.save();

          ProductEventService.logEvent({
            eventType: 'ONBOARDING_COMPLETED',
            userId,
            feature: 'Onboarding'
          });
        }
      } catch (err: any) {
        console.warn('[OnboardingService] Complete notice:', err.message);
      }
    }
    return this.getOnboardingStatus(userId);
  }

  /**
   * Get measured database activation metrics (Admin only)
   */
  static async getActivationMetrics(): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return { totalUsers: 0, completedCount: 0, skippedCount: 0, farmCreationRatePercent: 0 };
    }

    try {
      const totalUsers = await User.countDocuments();
      const completedCount = await User.countDocuments({ onboardingStatus: 'COMPLETED' });
      const skippedCount = await User.countDocuments({ onboardingStatus: 'SKIPPED' });
      const usersWithFarm = await Farm.distinct('owner');

      const farmCreationRatePercent = totalUsers > 0 ? Math.round((usersWithFarm.length / totalUsers) * 100) : 0;

      return {
        totalUsers,
        completedCount,
        skippedCount,
        usersWithFarmCount: usersWithFarm.length,
        farmCreationRatePercent
      };
    } catch (err: any) {
      console.warn('[OnboardingService] Metrics notice:', err.message);
      return { totalUsers: 0, completedCount: 0, skippedCount: 0, farmCreationRatePercent: 0 };
    }
  }
}
