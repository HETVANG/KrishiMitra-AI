import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProductEventService } from '../services/productIntelligence/productEventService';
import { FeedbackService } from '../services/productIntelligence/feedbackService';
import { FeatureUsageService } from '../services/productIntelligence/featureUsageService';
import { ProductInsightService } from '../services/productIntelligence/productInsightService';
import { IssueReport } from '../models/IssueReport';
import { FeatureRequest } from '../models/FeatureRequest';
import { SupportTicketService } from '../services/feedback/supportTicketService';
import { SafetyReportService } from '../services/feedback/safetyReportService';
import { FeatureRequestService } from '../services/feedback/featureRequestService';
import { ProductFeedbackService } from '../services/feedback/productFeedbackService';

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

      const { farmId, feature, type, rating, message, category, referenceId } = req.body;

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
   * Create support ticket
   */
  static async createSupportTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { category, priority, subject, description, farmId, organizationId, language } = req.body;
      if (!category || !subject || !description) {
        res.status(400).json({ success: false, message: 'category, subject, and description are required' });
        return;
      }

      const ticket = await SupportTicketService.createTicket({
        userId,
        farmId,
        organizationId,
        category,
        priority,
        subject,
        description,
        language
      });

      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully. Our team will review your request.',
        ticket
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create support ticket' });
    }
  }

  /**
   * Get user's own support tickets
   */
  static async getUserSupportTickets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const tickets = await SupportTicketService.getUserTickets(userId);
      res.status(200).json({ success: true, tickets });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch support tickets' });
    }
  }

  /**
   * Submit agricultural AI safety hazard report
   */
  static async submitSafetyReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { category, feature, description, referenceId, farmId } = req.body;
      if (!category || !feature || !description) {
        res.status(400).json({ success: false, message: 'category, feature, and description are required' });
        return;
      }

      const report = await SafetyReportService.submitReport({
        userId,
        farmId,
        category,
        feature,
        referenceId,
        description
      });

      res.status(201).json({
        success: true,
        message: 'Safety hazard report received and routed to product safety review team.',
        report
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to submit safety report' });
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

      const result = await FeatureRequestService.createRequest({
        userId,
        title,
        description,
        category,
        region,
        language
      });

      res.status(201).json({ success: true, message: 'Feature request submitted', ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to submit feature request' });
    }
  }

  /**
   * Get Admin product intelligence analytics & feedback queues (Admin only)
   */
  static async getAdminAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string, 10) || 30;
      const usageMetrics = await FeatureUsageService.getFeatureUsageMetrics(days);
      const insights = await ProductInsightService.generateInsights();
      const feedbackQueue = await FeedbackService.getAllFeedback();
      const openSafetyReports = await SafetyReportService.getOpenReports();
      const knowledgeGaps = await ProductFeedbackService.getKnowledgeGaps();
      const regionalGaps = await ProductFeedbackService.getRegionalGaps();

      res.status(200).json({
        success: true,
        periodDays: days,
        usageMetrics,
        insights,
        feedbackQueue,
        openSafetyReports,
        knowledgeGaps,
        regionalGaps
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch product analytics' });
    }
  }
}

