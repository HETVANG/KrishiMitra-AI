import { Request, Response } from 'express';
import { AgentRegistry } from '../services/agents/agentRegistry';
import { AgentOrchestrator } from '../services/agents/agentOrchestrator';
import { AgentPolicyEngine } from '../services/agents/agentPolicyEngine';
import { AgentActivity } from '../models/AgentActivity';
import { AgentPolicy } from '../models/AgentPolicy';
import { FarmTask } from '../models/FarmTask';
import { User } from '../models/User';

export class AgentController {
  /**
   * GET /api/agents/status
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const agents = AgentRegistry.getAllAgents().map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        status: 'Active'
      }));

      const pendingTasksCount = await FarmTask.countDocuments({
        user: userId,
        status: 'WAITING_APPROVAL'
      });

      const recentActivityCount = await AgentActivity.countDocuments({ user: userId });

      res.json({
        success: true,
        data: {
          agents,
          pendingTasksCount,
          recentActivityCount,
          lastEvaluatedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/agents/activity
   */
  static async getActivity(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const limit = Number(req.query.limit) || 20;
      const activities = await AgentActivity.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.json({
        success: true,
        count: activities.length,
        data: activities
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/agents/tasks
   */
  static async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const tasks = await FarmTask.find({ user: userId }).sort({ createdAt: -1 }).lean();

      const pendingApprovals = tasks.filter((t: any) => t.status === 'WAITING_APPROVAL');
      const activeTasks = tasks.filter((t: any) => t.status === 'TODO' || t.status === 'IN_PROGRESS');

      res.json({
        success: true,
        data: {
          pendingApprovals,
          activeTasks,
          allTasks: tasks
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/agents/tasks/:id/approve
   */
  static async approveTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id;

      const userRec = await User.findById(userId).lean();
      const userName = userRec?.name || 'Farmer';

      const task = await FarmTask.findOne({ _id: taskId, user: userId });
      if (!task) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }

      task.status = 'TODO';
      task.approvalRequired = false;
      task.approvedBy = userName;
      await task.save();

      // Update audit activity
      await AgentActivity.updateMany(
        { user: userId, 'action.summary': task.title, status: 'WAITING_APPROVAL' },
        { status: 'VERIFIED', approvedBy: userName, completedAt: new Date() }
      );

      res.json({
        success: true,
        message: 'Agent recommendation approved and added to farm tasks.',
        data: task
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/agents/tasks/:id/reject
   */
  static async rejectTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id;

      const task = await FarmTask.findOne({ _id: taskId, user: userId });
      if (!task) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }

      task.status = 'DISMISSED';
      await task.save();

      await AgentActivity.updateMany(
        { user: userId, 'action.summary': task.title, status: 'WAITING_APPROVAL' },
        { status: 'REJECTED', completedAt: new Date() }
      );

      res.json({
        success: true,
        message: 'Agent recommendation rejected.',
        data: task
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/agents/policies
   */
  static async getPolicies(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const policy = await AgentPolicyEngine.getUserPolicy(userId);
      res.json({
        success: true,
        data: policy
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * PUT /api/agents/policies
   */
  static async updatePolicies(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { autoAlertsEnabled, autoRemindersEnabled, autoTaskCreationEnabled, expertConsultationPolicy, externalActionsEnabled } = req.body;

      const policy = await AgentPolicy.findOneAndUpdate(
        { user: userId },
        {
          user: userId,
          ...(autoAlertsEnabled !== undefined && { autoAlertsEnabled }),
          ...(autoRemindersEnabled !== undefined && { autoRemindersEnabled }),
          ...(autoTaskCreationEnabled !== undefined && { autoTaskCreationEnabled }),
          ...(expertConsultationPolicy && { expertConsultationPolicy }),
          ...(externalActionsEnabled !== undefined && { externalActionsEnabled })
        },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        message: 'Agent policy preferences updated.',
        data: policy
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/agents/run
   */
  static async triggerRun(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const result = await AgentOrchestrator.runOrchestrator(userId, 'MANUAL_TRIGGER');

      res.json({
        success: true,
        message: 'Agent intelligence cycle executed successfully.',
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
