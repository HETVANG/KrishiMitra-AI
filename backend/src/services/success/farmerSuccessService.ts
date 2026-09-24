import mongoose from 'mongoose';
import { User } from '../../models/User';
import { Farm } from '../../models/Farm';
import { CropCycle } from '../../models/CropCycle';
import { FarmTask } from '../../models/FarmTask';
import { FarmActivity } from '../../models/FarmActivity';
import { DiseaseHistory } from '../../models/DiseaseHistory';
import { FarmerSuccessProfile } from '../../models/FarmerSuccessProfile';
import { ProductEventService } from '../productIntelligence/productEventService';

export class FarmerSuccessService {
  /**
   * Get or create farmer success profile
   */
  static async getOrCreateProfile(userId: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        user: userId,
        lastMeaningfulActivityAt: new Date(),
        completedTasksCount: 0,
        milestones: [{ key: 'FIRST_FARM', title: 'First Farm Created', achievedAt: new Date() }],
        healthCompletenessScore: 65
      };
    }

    let profile = await FarmerSuccessProfile.findOne({ user: userId });
    if (!profile) {
      profile = await FarmerSuccessProfile.create({
        user: new mongoose.Types.ObjectId(userId),
        lastMeaningfulActivityAt: new Date(),
        completedTasksCount: 0,
        milestones: [],
        feedbackHistory: [],
        outcomesRecorded: [],
        healthCompletenessScore: 50
      });
    }
    return profile;
  }

  /**
   * Record a meaningful farmer activity and evaluate milestone unlocks
   */
  static async recordMeaningfulActivity(
    userId: string,
    activityType: string,
    details?: Record<string, any>
  ): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;

    try {
      const profile = await this.getOrCreateProfile(userId);
      profile.lastMeaningfulActivityAt = new Date();

      // Check milestones
      const milestonesMap = new Set(profile.milestones.map((m: any) => m.key));
      const newMilestones: Array<{ key: string; title: string }> = [];

      if (activityType === 'FARM_CREATED' && !milestonesMap.has('FIRST_FARM')) {
        newMilestones.push({ key: 'FIRST_FARM', title: 'First Farm Added' });
      } else if (activityType === 'CROP_ADDED' && !milestonesMap.has('FIRST_CROP')) {
        newMilestones.push({ key: 'FIRST_CROP', title: 'First Crop Cycle Initialized' });
      } else if (activityType === 'DISEASE_SCAN' && !milestonesMap.has('FIRST_SCAN')) {
        newMilestones.push({ key: 'FIRST_SCAN', title: 'First Leaf Scan Diagnosed' });
      } else if (activityType === 'TASK_COMPLETED' && !milestonesMap.has('FIRST_TASK')) {
        newMilestones.push({ key: 'FIRST_TASK', title: 'First Farm Task Completed' });
      } else if (activityType === 'IRRIGATION_RECORDED' && !milestonesMap.has('FIRST_IRRIGATION')) {
        newMilestones.push({ key: 'FIRST_IRRIGATION', title: 'First Irrigation Logged' });
      }

      for (const m of newMilestones) {
        profile.milestones.push({ key: m.key, title: m.title, achievedAt: new Date() });
      }

      // Re-calculate completeness score
      const farmCount = await Farm.countDocuments({ user: userId });
      const cropCount = await CropCycle.countDocuments({ user: userId });
      const taskCount = profile.completedTasksCount || 0;

      let score = 30;
      if (farmCount > 0) score += 25;
      if (cropCount > 0) score += 25;
      if (taskCount > 0) score += 20;

      profile.healthCompletenessScore = Math.min(100, score);
      await profile.save();
    } catch (err: any) {
      console.error('[FarmerSuccessService] Error recording activity:', err.message);
    }
  }

  /**
   * Complete task with outcome and optional feedback
   */
  static async completeTaskWithOutcome(input: {
    userId: string;
    taskId: string;
    result: 'completed_successfully' | 'partially_completed' | 'not_completed' | 'farmer_reported_result';
    feedbackRating?: 'HELPFUL' | 'NOT_HELPFUL' | 'INCORRECT' | 'OUTDATED' | 'NOT_RELEVANT';
    comment?: string;
  }): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return { success: true };
    }

    const task = await FarmTask.findOne({ _id: input.taskId, user: input.userId });
    if (task) {
      task.completed = true;
      task.status = 'COMPLETED';
      await task.save();
    }

    const profile = await this.getOrCreateProfile(input.userId);
    profile.completedTasksCount = (profile.completedTasksCount || 0) + 1;
    profile.lastMeaningfulActivityAt = new Date();

    profile.outcomesRecorded.push({
      taskId: new mongoose.Types.ObjectId(input.taskId),
      activityType: task?.category || 'general',
      result: input.result,
      notes: input.comment,
      recordedAt: new Date()
    });

    if (input.feedbackRating) {
      profile.feedbackHistory.push({
        feature: `Task:${task?.category || 'general'}`,
        rating: input.feedbackRating,
        comment: input.comment,
        createdAt: new Date()
      });
    }

    await profile.save();
    await this.recordMeaningfulActivity(input.userId, 'TASK_COMPLETED');

    ProductEventService.logEvent({
      eventType: 'TASK_COMPLETED',
      userId: input.userId,
      feature: 'Farm Tasks',
      metadata: { taskId: input.taskId, result: input.result }
    });

    return { success: true, task };
  }

  /**
   * Build complete Farmer Success Context
   */
  static async getFarmerSuccessContext(userId: string, farmId?: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        userId,
        onboardingStatus: 'COMPLETED',
        activationStatus: 'ACTIVATED',
        healthCompletenessScore: 75,
        milestones: [{ key: 'FIRST_FARM', title: 'First Farm Added', achievedAt: new Date() }],
        pendingTasksCount: 1,
        completedTasksCount: 3,
        lastMeaningfulActivityAt: new Date(),
        generatedAt: new Date()
      };
    }

    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');

    const profile = await this.getOrCreateProfile(userId);
    const farmFilter = farmId ? { _id: farmId, user: userId } : { user: userId };
    const farm = await Farm.findOne(farmFilter).lean();

    const activeCropCycles = farm
      ? await CropCycle.find({ farm: farm._id, status: 'ACTIVE' }).lean()
      : [];

    const pendingTasks = farm
      ? await FarmTask.find({ farm: farm._id, completed: false }).limit(5).lean()
      : [];

    const recentActivities = farm
      ? await FarmActivity.find({ farm: farm._id }).sort({ date: -1 }).limit(5).lean()
      : [];

    return {
      userId,
      activeFarmId: farm?._id || null,
      activeFarmName: farm?.name || 'Primary Farm',
      activeCropCyclesCount: activeCropCycles.length,
      activeCrops: activeCropCycles.map(c => ({ id: c._id, cropName: c.cropName, stage: c.currentGrowthStage || 'ACTIVE' })),
      onboardingStatus: (user as any).onboardingStatus || 'COMPLETED',
      healthCompletenessScore: profile.healthCompletenessScore || 50,
      milestones: profile.milestones || [],
      pendingTasksCount: pendingTasks.length,
      pendingTasks: pendingTasks.map(t => ({ id: t._id, title: t.title, priority: t.priority, dueDate: t.dueDate })),
      recentActivities: recentActivities.map(a => ({ id: a._id, title: a.title, type: a.type, date: a.date })),
      lastMeaningfulActivityAt: profile.lastMeaningfulActivityAt,
      generatedAt: new Date()
    };
  }

  /**
   * Get chronological farm activity timeline
   */
  static async getFarmerTimeline(userId: string, farmId?: string): Promise<any[]> {
    if (mongoose.connection.readyState !== 1) {
      return [
        { id: '1', type: 'farm_created', title: 'Farm Initialized', date: new Date() },
        { id: '2', type: 'crop_inspection', title: 'Crop Health Routine Check', date: new Date() }
      ];
    }

    const farmFilter = farmId ? { user: userId, _id: farmId } : { user: userId };
    const farm = await Farm.findOne(farmFilter).lean();
    if (!farm) return [];

    const [activities, tasks, diseaseScans] = await Promise.all([
      FarmActivity.find({ farm: farm._id }).sort({ date: -1 }).limit(10).lean(),
      FarmTask.find({ farm: farm._id, completed: true }).sort({ updatedAt: -1 }).limit(10).lean(),
      DiseaseHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const timeline: any[] = [];

    activities.forEach(a => {
      timeline.push({
        id: `act_${a._id}`,
        type: a.type,
        title: a.title,
        description: a.description,
        date: a.date
      });
    });

    tasks.forEach(t => {
      timeline.push({
        id: `task_${t._id}`,
        type: 'task_completed',
        title: `Completed Task: ${t.title}`,
        description: t.reason,
        date: (t as any).updatedAt || (t as any).createdAt || new Date()
      });
    });

    diseaseScans.forEach(d => {
      timeline.push({
        id: `scan_${d._id}`,
        type: 'disease_scan',
        title: `Scanned ${d.crop || 'Crop'}: ${d.diseaseName}`,
        description: `Confidence: ${Math.round((d.confidenceScore || 0.8) * 100)}%`,
        date: (d as any).createdAt || new Date()
      });
    });

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return timeline.slice(0, 15);
  }
}
