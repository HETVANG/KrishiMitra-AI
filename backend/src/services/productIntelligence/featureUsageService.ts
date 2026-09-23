import mongoose from 'mongoose';
import { ProductEvent } from '../../models/ProductEvent';

export interface FeatureUsageMetric {
  feature: string;
  totalEvents: number;
  uniqueUsers: number;
  completionRatePercent: number;
  errorCount: number;
}

export class FeatureUsageService {
  /**
   * Aggregate feature usage telemetry over a specified number of days
   */
  static async getFeatureUsageMetrics(days: number = 30): Promise<FeatureUsageMetric[]> {
    if (mongoose.connection.readyState !== 1) {
      return [
        { feature: 'Dashboard', totalEvents: 0, uniqueUsers: 0, completionRatePercent: 100, errorCount: 0 },
        { feature: 'Disease Detection', totalEvents: 0, uniqueUsers: 0, completionRatePercent: 100, errorCount: 0 },
        { feature: 'Farm Copilot', totalEvents: 0, uniqueUsers: 0, completionRatePercent: 100, errorCount: 0 },
        { feature: 'Agri Marketplace', totalEvents: 0, uniqueUsers: 0, completionRatePercent: 100, errorCount: 0 }
      ];
    }

    try {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      const aggregation = await ProductEvent.aggregate([
        { $match: { createdAt: { $gte: sinceDate } } },
        {
          $group: {
            _id: '$feature',
            totalEvents: { $sum: 1 },
            users: { $addToSet: '$userId' },
            completedCount: {
              $sum: {
                $cond: [{ $in: ['$eventType', ['DISEASE_SCAN_COMPLETED', 'AGENT_RECOMMENDATION_APPROVED', 'TASK_COMPLETED']] }, 1, 0]
              }
            },
            errorCount: {
              $sum: {
                $cond: [{ $eq: ['$eventType', 'ERROR_OCCURRED'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { totalEvents: -1 } }
      ]);

      if (!aggregation || aggregation.length === 0) {
        return [
          { feature: 'Dashboard', totalEvents: 0, uniqueUsers: 0, completionRatePercent: 100, errorCount: 0 },
          { feature: 'Disease Detection', totalEvents: 0, uniqueUsers: 0, completionRatePercent: 100, errorCount: 0 },
          { feature: 'Farm Copilot', totalEvents: 0, uniqueUsers: 0, completionRatePercent: 100, errorCount: 0 },
          { feature: 'Agri Marketplace', totalEvents: 0, uniqueUsers: 0, completionRatePercent: 100, errorCount: 0 }
        ];
      }

      return aggregation.map((item: any) => {
        const uniqueUsersCount = item.users ? item.users.filter(Boolean).length : 0;
        const total = item.totalEvents || 1;
        const completed = item.completedCount || 0;
        const completionRatePercent = Math.min(100, Math.round((completed / total) * 100));

        return {
          feature: item._id,
          totalEvents: item.totalEvents,
          uniqueUsers: uniqueUsersCount,
          completionRatePercent,
          errorCount: item.errorCount || 0
        };
      });
    } catch (err: any) {
      console.warn('[FeatureUsageService] Metrics aggregation notice:', err.message);
      return [];
    }
  }
}
