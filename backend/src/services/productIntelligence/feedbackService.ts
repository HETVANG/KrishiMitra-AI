import mongoose from 'mongoose';
import { UserFeedback, FeedbackType, AIClassificationCategory } from '../../models/UserFeedback';

export interface SubmitFeedbackPayload {
  userId: string;
  farmId?: string;
  feature: string;
  type: FeedbackType;
  rating?: number;
  message: string;
  category?: string;
}

export class FeedbackService {
  /**
   * Submit farmer feedback and classify category
   */
  static async submitFeedback(payload: SubmitFeedbackPayload): Promise<any> {
    const classification = this.classifyFeedbackText(payload.message, payload.type);

    if (mongoose.connection.readyState !== 1) {
      return {
        _id: 'offline_feedback_id',
        ...payload,
        status: 'NEW',
        aiClassification: classification,
        createdAt: new Date()
      };
    }

    try {
      const feedback = await UserFeedback.create({
        userId: payload.userId,
        farmId: payload.farmId,
        feature: payload.feature,
        type: payload.type,
        rating: payload.rating,
        message: payload.message,
        category: payload.category || 'GENERAL',
        status: 'NEW',
        aiClassification: classification
      });

      return feedback;
    } catch (err: any) {
      console.warn('[FeedbackService] Submission warning:', err.message);
      return {
        _id: 'fallback_feedback_id',
        ...payload,
        status: 'NEW',
        aiClassification: classification,
        createdAt: new Date()
      };
    }
  }

  /**
   * Rule-based & heuristic classifier for feedback categorization
   */
  static classifyFeedbackText(message: string, type: FeedbackType): { category: AIClassificationCategory; confidence: number; reasoning: string } {
    const text = message.toLowerCase();

    if (text.includes('bug') || text.includes('error') || text.includes('crash') || text.includes('fail') || text.includes('broken')) {
      return { category: 'BUG', confidence: 0.9, reasoning: 'Contains error/crash key terms.' };
    }
    if (text.includes('price') || text.includes('mandi') || text.includes('weather') || text.includes('wrong data') || text.includes('incorrect')) {
      return { category: 'DATA_QUALITY', confidence: 0.85, reasoning: 'Identified telemetry or market price data report.' };
    }
    if (text.includes('translation') || text.includes('translate') || text.includes('translat') || text.includes('hindi') || text.includes('gujarat') || text.includes('language')) {
      return { category: 'TRANSLATION', confidence: 0.85, reasoning: 'Identified regional translation query.' };
    }
    if (text.includes('feature') || text.includes('add') || text.includes('request') || text.includes('want') || text.includes('please make')) {
      return { category: 'FEATURE_REQUEST', confidence: 0.8, reasoning: 'Identified feature enhancement suggestion.' };
    }
    if (type === 'AI_FEEDBACK' || text.includes('copilot') || text.includes('ai') || text.includes('answer')) {
      return { category: 'AI_QUALITY', confidence: 0.8, reasoning: 'Identified AI response feedback.' };
    }

    return { category: 'UX', confidence: 0.7, reasoning: 'General product usability feedback.' };
  }

  /**
   * Retrieve farmer's own feedback history
   */
  static async getUserFeedback(userId: string): Promise<any[]> {
    if (mongoose.connection.readyState !== 1) return [];
    try {
      return await UserFeedback.find({ userId }).sort({ createdAt: -1 }).lean();
    } catch (err: any) {
      console.warn('[FeedbackService] User feedback fetch notice:', err.message);
      return [];
    }
  }

  /**
   * Retrieve all feedback queue for admin inspection
   */
  static async getAllFeedback(status?: string, feature?: string): Promise<any[]> {
    if (mongoose.connection.readyState !== 1) return [];
    try {
      const query: any = {};
      if (status) query.status = status;
      if (feature) query.feature = feature;

      return await UserFeedback.find(query)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    } catch (err: any) {
      console.warn('[FeedbackService] Admin feedback queue query notice:', err.message);
      return [];
    }
  }
}
