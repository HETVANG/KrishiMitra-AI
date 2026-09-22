import { Request, Response, NextFunction } from 'express';
import { CopilotService } from '../services/CopilotService';
import { CopilotContextService } from '../services/CopilotContextService';
import { CopilotConversation } from '../models/CopilotConversation';
import { FarmTask } from '../models/FarmTask';

export class CopilotController {
  /**
   * POST /api/copilot/chat
   * Main AI Copilot Question Endpoint
   */
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { question, farmId, conversationId, language } = req.body;

      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ success: false, message: 'Question prompt is required.' });
      }

      const result = await CopilotService.processFarmerQuestion(
        userId,
        question.trim(),
        farmId,
        conversationId,
        language || 'en'
      );

      return res.json({
        success: true,
        conversationId: result.conversationId,
        structured: result.structured,
        contextSummary: result.contextSummary
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/copilot/context/:farmId?
   * Retrieve normalized FarmContext
   */
  static async getContext(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId !== 'undefined' ? req.params.farmId : undefined;

      const context = await CopilotContextService.getFarmContext(userId, farmId);
      return res.json({ success: true, context });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/copilot/insights/:farmId?
   * Retrieve proactive farm insights
   */
  static async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId !== 'undefined' ? req.params.farmId : undefined;

      const insights = await CopilotService.getProactiveInsights(userId, farmId);
      return res.json({ success: true, insights });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/copilot/daily-plan/:farmId?
   * Retrieve Today's Farm Plan
   */
  static async getDailyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId !== 'undefined' ? req.params.farmId : undefined;

      const tasks = await CopilotService.getDailyFarmPlan(userId, farmId);
      return res.json({ success: true, tasks });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/copilot/weekly-plan/:farmId?
   * Retrieve Weekly Farm Plan
   */
  static async getWeeklyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId !== 'undefined' ? req.params.farmId : undefined;

      const schedule = await CopilotService.getWeeklyFarmPlan(userId, farmId);
      return res.json({ success: true, schedule });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/copilot/tasks/:taskId/toggle
   * Mark farm task completed or incomplete
   */
  static async toggleTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { taskId } = req.params;

      const task = await FarmTask.findOne({ _id: taskId, user: userId });
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      task.completed = !task.completed;
      await task.save();

      return res.json({ success: true, task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/copilot/conversations
   */
  static async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const conversations = await CopilotConversation.find({ user: userId })
        .select('_id title farm lastUpdated createdAt')
        .sort({ lastUpdated: -1 })
        .lean();

      return res.json({ success: true, conversations });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/copilot/conversations/:id
   */
  static async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const conversation = await CopilotConversation.findOne({ _id: id, user: userId }).lean();
      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      return res.json({ success: true, conversation });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/copilot/conversations/:id
   */
  static async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await CopilotConversation.deleteOne({ _id: id, user: userId });
      return res.json({ success: true, message: 'Conversation deleted' });
    } catch (error) {
      next(error);
    }
  }
}
