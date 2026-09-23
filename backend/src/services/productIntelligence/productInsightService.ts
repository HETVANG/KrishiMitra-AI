import mongoose from 'mongoose';
import { UserFeedback } from '../../models/UserFeedback';
import { IssueReport } from '../../models/IssueReport';

export interface ProductInsight {
  id: string;
  category: 'FEATURE_USAGE' | 'FEEDBACK_TREND' | 'DATA_QUALITY' | 'AI_QUALITY' | 'ERROR_ALERT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  affectedFeature: string;
  suggestedAction: string;
  createdAt: Date;
}

export class ProductInsightService {
  /**
   * Generate actionable product insights from real database feedback & issue queues
   */
  static async generateInsights(): Promise<ProductInsight[]> {
    const insights: ProductInsight[] = [];

    if (mongoose.connection.readyState !== 1) {
      return insights;
    }

    try {
      // 1. Check for unhandled data error feedback
      const dataErrorCount = await UserFeedback.countDocuments({ type: 'DATA_ERROR', status: 'NEW' });
      if (dataErrorCount > 0) {
        insights.push({
          id: 'insight_data_error',
          category: 'DATA_QUALITY',
          severity: dataErrorCount >= 5 ? 'HIGH' : 'MEDIUM',
          title: 'Unresolved Data Accuracy Reports',
          description: `Farmers have submitted ${dataErrorCount} data error reports regarding mandi prices or weather forecasts.`,
          affectedFeature: 'Marketplace & Weather',
          suggestedAction: 'Review source provider telemetry and verify regional feed accuracy.',
          createdAt: new Date()
        });
      }

      // 2. Check for AI response feedback
      const aiNegativeCount = await UserFeedback.countDocuments({ type: 'AI_FEEDBACK', rating: { $lte: 2 }, status: 'NEW' });
      if (aiNegativeCount > 0) {
        insights.push({
          id: 'insight_ai_quality',
          category: 'AI_QUALITY',
          severity: 'MEDIUM',
          title: 'AI Advisory Feedback Signals',
          description: `Copilot or Agent recommendations received ${aiNegativeCount} low-rating feedback entries.`,
          affectedFeature: 'Farm Copilot / Agent Engine',
          suggestedAction: 'Inspect prompt context grounding and verify agronomic guidance rules.',
          createdAt: new Date()
        });
      }

      // 3. Check open technical issue reports
      const openIssuesCount = await IssueReport.countDocuments({ status: 'OPEN' });
      if (openIssuesCount > 0) {
        insights.push({
          id: 'insight_open_issues',
          category: 'ERROR_ALERT',
          severity: openIssuesCount >= 3 ? 'HIGH' : 'LOW',
          title: 'Open Technical Issue Reports',
          description: `${openIssuesCount} technical or application problem reports are currently open in the review queue.`,
          affectedFeature: 'Platform Application',
          suggestedAction: 'Investigate error stack logs and user session reports.',
          createdAt: new Date()
        });
      }
    } catch (err: any) {
      console.warn('[ProductInsightService] Insight generation notice:', err.message);
    }

    return insights;
  }
}
