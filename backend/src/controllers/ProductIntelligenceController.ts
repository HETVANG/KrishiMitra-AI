import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProductEventService } from '../services/productIntelligence/productEventService';
import { FeedbackService } from '../services/productIntelligence/feedbackService';
import { FeatureUsageService } from '../services/productIntelligence/featureUsageService';
import { ProductInsightService } from '../services/productIntelligence/productInsightService';
import { IssueReport } from '../models/IssueReport';
import { FeatureRequest } from '../models/FeatureRequest';

export class ProductIntelligenceController {
  /**
   * Log asynchronous product telemetry event
   */
  static async logEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventType, feature, farmId, region, metadata } = req.body;
      const userId = (req as AuthRequest).user?._id?.toString();

      if (!eventType || !feature) {
        res.status(400).json({ success: false, message: 'eventType and feature are required' });
        return;
      }

      ProductEventService.logEvent({
        eventType,
        userId,
        farmId,
        feature,
        region,
        metadata
      });

      res.status(200).json({ success: true, message: 'Telemetry event accepted' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to record telemetry' });
    }
  }

  /**
   * Submit farmer feedback
   */
  static async submitFeedback(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { farmId, feature, type, rating, message, category } = req.body;

      if (!feature || !type || !message) {
        res.status(400).json({ success: false, message: 'feature, type, and message are required' });
        return;
      }

      const feedback = await FeedbackService.submitFeedback({
        userId,
        farmId,
        feature,
        type,
        rating,
        message,
        category
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for your feedback. Our team has received your submission.',
        feedback
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to submit feedback' });
    }
  }

  /**
   * Get farmer's own feedback history
   */
  static async getUserFeedback(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const feedback = await FeedbackService.getUserFeedback(userId);
      res.status(200).json({ success: true, feedback });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch feedback history' });
    }
  }

  /**
   * Report technical issue or data problem
   */
  static async reportIssue(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { category, description, feature } = req.body;
      if (!category || !description) {
        res.status(400).json({ success: false, message: 'category and description are required' });
        return;
      }

      const report = await IssueReport.create({
        userId,
        category,
        description,
        feature: feature || 'SYSTEM',
        status: 'OPEN'
      });

      res.status(201).json({ success: true, message: 'Issue report submitted successfully', report });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to submit issue report' });
    }
  }

  /**
   * Submit feature request idea
   */
  static async submitFeatureRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { title, description, category, region, language } = req.body;
      if (!title || !description) {
        res.status(400).json({ success: false, message: 'title and description are required' });
        return;
      }

      const featureReq = await FeatureRequest.create({
        userId,
        title,
        description,
        category: category || 'GENERAL',
        region: region || 'IN',
        language: language || 'en',
        status: 'SUBMITTED'
      });

      res.status(201).json({ success: true, message: 'Feature request submitted', featureRequest: featureReq });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to submit feature request' });
    }
  }

  /**
   * Get Admin product intelligence analytics (Admin only)
   */
  static async getAdminAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string, 10) || 30;
      const usageMetrics = await FeatureUsageService.getFeatureUsageMetrics(days);
      const insights = await ProductInsightService.generateInsights();
      const feedbackQueue = await FeedbackService.getAllFeedback();

      res.status(200).json({
        success: true,
        periodDays: days,
        usageMetrics,
        insights,
        feedbackQueue
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch product analytics' });
    }
  }
}
