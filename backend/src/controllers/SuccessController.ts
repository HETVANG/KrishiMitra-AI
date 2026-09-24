import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FarmerSuccessService } from '../services/success/farmerSuccessService';
import { DailyBriefService } from '../services/success/dailyBriefService';
import { WeeklyBriefService } from '../services/success/weeklyBriefService';
import { RetentionAnalyticsService } from '../services/success/retentionAnalyticsService';

export class SuccessController {
  /**
   * Get complete farmer success context
   */
  static async getContext(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const farmId = req.query.farmId as string;
      const context = await FarmerSuccessService.getFarmerSuccessContext(userId, farmId);
      res.status(200).json({ success: true, context });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch success context' });
    }
  }

  /**
   * Get personalized Daily Farm Brief
   */
  static async getDailyBrief(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const farmId = req.query.farmId as string;
      const brief = await DailyBriefService.getDailyBrief(userId, farmId);
      res.status(200).json({ success: true, brief });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to generate daily brief' });
    }
  }

  /**
   * Get 7-day Weekly Farm Summary Brief
   */
  static async getWeeklyBrief(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const farmId = req.query.farmId as string;
      const brief = await WeeklyBriefService.getWeeklyBrief(userId, farmId);
      res.status(200).json({ success: true, brief });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to generate weekly brief' });
    }
  }

  /**
   * Get chronological farm timeline
   */
  static async getTimeline(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const farmId = req.query.farmId as string;
      const timeline = await FarmerSuccessService.getFarmerTimeline(userId, farmId);
      res.status(200).json({ success: true, timeline });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch farm timeline' });
    }
  }

  /**
   * Complete task with outcome and optional feedback
   */
  static async completeTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { taskId } = req.params;
      const { result, feedbackRating, comment } = req.body;

      if (!taskId) {
        res.status(400).json({ success: false, message: 'taskId is required' });
        return;
      }

      const response = await FarmerSuccessService.completeTaskWithOutcome({
        userId,
        taskId,
        result: result || 'completed_successfully',
        feedbackRating,
        comment
      });

      res.status(200).json(response);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to complete task' });
    }
  }

  /**
   * Submit farmer feedback on features / advisories
   */
  static async submitFeedback(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { feature, rating, comment } = req.body;
      if (!feature || !rating) {
        res.status(400).json({ success: false, message: 'feature and rating are required' });
        return;
      }

      const profile = await FarmerSuccessService.getOrCreateProfile(userId);
      profile.feedbackHistory.push({
        feature,
        rating,
        comment,
        createdAt: new Date()
      });
      await profile.save();

      res.status(200).json({ success: true, message: 'Feedback recorded successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to record feedback' });
    }
  }

  /**
   * Get Admin Retention Analytics (Admin only)
   */
  static async getAdminRetentionAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const metrics = await RetentionAnalyticsService.getRetentionMetrics();
      res.status(200).json({ success: true, metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch retention analytics' });
    }
  }
}
