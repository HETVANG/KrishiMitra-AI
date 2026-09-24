import mongoose from 'mongoose';
import { User } from '../../models/User';
import { FarmTask } from '../../models/FarmTask';
import { FarmActivity } from '../../models/FarmActivity';
import { FarmerSuccessProfile } from '../../models/FarmerSuccessProfile';

export class RetentionAnalyticsService {
  /**
   * Get real production farmer retention metrics & engagement statistics
   */
  static async getRetentionMetrics(): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        totalFarmers: 0,
        activeFarmersD1: 0,
        activeFarmersD7: 0,
        activeFarmersD30: 0,
        taskCompletionRate: 0,
        avgCompletenessScore: 50,
        milestonesAchieved: 0,
        feedbackSummary: { HELPFUL: 0, NOT_HELPFUL: 0, INCORRECT: 0 }
      };
    }

    const now = new Date();
    const d1Date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const d7Date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30Date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalFarmers,
      activeFarmersD1,
      activeFarmersD7,
      activeFarmersD30,
      totalTasks,
      completedTasks,
      profiles
    ] = await Promise.all([
      User.countDocuments(),
      FarmerSuccessProfile.countDocuments({ lastMeaningfulActivityAt: { $gte: d1Date } }),
      FarmerSuccessProfile.countDocuments({ lastMeaningfulActivityAt: { $gte: d7Date } }),
      FarmerSuccessProfile.countDocuments({ lastMeaningfulActivityAt: { $gte: d30Date } }),
      FarmTask.countDocuments(),
      FarmTask.countDocuments({ completed: true }),
      FarmerSuccessProfile.find().select('healthCompletenessScore milestones feedbackHistory').lean()
    ]);

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let totalScore = 0;
    let totalMilestones = 0;
    const feedbackCounts: Record<string, number> = { HELPFUL: 0, NOT_HELPFUL: 0, INCORRECT: 0 };

    profiles.forEach(p => {
      totalScore += p.healthCompletenessScore || 50;
      totalMilestones += (p.milestones || []).length;
      (p.feedbackHistory || []).forEach(f => {
        if (feedbackCounts[f.rating] !== undefined) {
          feedbackCounts[f.rating]++;
        }
      });
    });

    const avgCompletenessScore = profiles.length > 0 ? Math.round(totalScore / profiles.length) : 50;

    return {
      totalFarmers,
      activeFarmersD1,
      activeFarmersD7,
      activeFarmersD30,
      taskCompletionRate,
      avgCompletenessScore,
      milestonesAchieved: totalMilestones,
      feedbackSummary: feedbackCounts
    };
  }
}
