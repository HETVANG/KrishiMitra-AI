import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OnboardingService } from '../services/onboardingService';

export class OnboardingController {
  /**
   * Get farmer onboarding status
   */
  static async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const status = await OnboardingService.getOnboardingStatus(userId);
      res.status(200).json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch onboarding status' });
    }
  }

  /**
   * Start farmer onboarding
   */
  static async start(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const status = await OnboardingService.startOnboarding(userId);
      res.status(200).json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to start onboarding' });
    }
  }

  /**
   * Update onboarding step and incremental preferences
   */
  static async updateStep(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { step, data } = req.body;
      if (typeof step !== 'number') {
        res.status(400).json({ success: false, message: 'Numeric step is required' });
        return;
      }

      const status = await OnboardingService.updateStep(userId, step, data);
      res.status(200).json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update onboarding step' });
    }
  }

  /**
   * Skip optional onboarding steps
   */
  static async skip(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const status = await OnboardingService.skipOnboarding(userId);
      res.status(200).json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to skip onboarding' });
    }
  }

  /**
   * Complete farmer onboarding
   */
  static async complete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const status = await OnboardingService.completeOnboarding(userId);
      res.status(200).json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to complete onboarding' });
    }
  }

  /**
   * Get activation metrics (Admin only)
   */
  static async getActivationMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const metrics = await OnboardingService.getActivationMetrics();
      res.status(200).json({ success: true, metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch activation metrics' });
    }
  }
}
