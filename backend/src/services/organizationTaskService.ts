import mongoose from 'mongoose';
import { OrganizationTask } from '../models/OrganizationTask';
import { OrganizationAuthorizationService } from './organizationAuthorizationService';
import { Farm } from '../models/Farm';
import crypto from 'crypto';

export class OrganizationTaskService {
  /**
   * Fetch organization tasks (scoped to user's permitted farms)
   */
  static async getOrganizationTasks(userId: string, organizationId: string, status?: string) {
    if (mongoose.connection.readyState !== 1) {
      return [
        {
          id: 't1',
          title: 'Inspect Maize Flower Stage',
          description: 'Routine check',
          category: 'general',
          farmId: 'f1',
          farmName: 'Koppal Block A',
          field: 'Field 1',
          assignedTo: null,
          priority: 'high',
          dueDate: new Date(),
          status: 'PENDING',
          createdAt: new Date()
        }
      ];
    }

    const permittedFarmIds = await OrganizationAuthorizationService.getPermittedFarmIds(userId, organizationId);
    if (permittedFarmIds.length === 0) return [];

    const filter: any = { organization: organizationId, farm: { $in: permittedFarmIds } };
    if (status) filter.status = status;

    const tasks = await OrganizationTask.find(filter)
      .populate('farm', 'name district state')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 })
      .lean();

    return tasks.map((t: any) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      category: t.category,
      farmId: t.farm?._id?.toString() || t.farm?.toString(),
      farmName: t.farm?.name || 'Farm',
      field: t.field || '',
      assignedTo: t.assignedTo ? { id: t.assignedTo._id, name: t.assignedTo.name } : null,
      priority: t.priority,
      dueDate: t.dueDate,
      status: t.status,
      createdAt: t.createdAt
    }));
  }

  /**
   * Create single organization task
   */
  static async createTask(
    userId: string,
    organizationId: string,
    taskData: {
      farmId: string;
      field?: string;
      title: string;
      description?: string;
      category?: string;
      assignedTo?: string;
      priority?: string;
      dueDate: Date;
    }
  ) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.tasks.manage');

    if (mongoose.connection.readyState !== 1) {
      return {
        _id: new mongoose.Types.ObjectId().toString(),
        organization: organizationId,
        farm: taskData.farmId,
        title: taskData.title,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate,
        status: 'PENDING'
      };
    }

    const task = await OrganizationTask.create({
      organization: organizationId,
      farm: taskData.farmId,
      field: taskData.field || '',
      title: taskData.title,
      description: taskData.description || '',
      category: taskData.category || 'general',
      assignedTo: taskData.assignedTo || null,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      createdBy: userId,
      status: 'PENDING'
    });

    return task;
  }

  /**
   * Preview bulk tasks creation across selected organization farms
   */
  static async previewBulkTasks(
    userId: string,
    organizationId: string,
    bulkData: {
      farmIds: string[];
      title: string;
      description?: string;
      category?: string;
      priority?: string;
      dueDate: Date;
    }
  ) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.tasks.manage');

    if (mongoose.connection.readyState !== 1) {
      return {
        title: bulkData.title,
        taskCount: bulkData.farmIds.length,
        affectedFarms: bulkData.farmIds.map(id => ({ id, name: 'Target Farm', location: 'Maharashtra' })),
        dueDate: bulkData.dueDate,
        requiresConfirmation: true
      };
    }

    const permittedFarmIds = await OrganizationAuthorizationService.getPermittedFarmIds(userId, organizationId);
    const targetFarmIds = bulkData.farmIds.filter(id => permittedFarmIds.includes(id));

    const farms = await Farm.find({ _id: { $in: targetFarmIds } }).select('name district state').lean();

    return {
      title: bulkData.title,
      taskCount: farms.length,
      affectedFarms: farms.map(f => ({ id: f._id.toString(), name: f.name, location: `${f.district}, ${f.state}` })),
      dueDate: bulkData.dueDate,
      requiresConfirmation: true
    };
  }

  /**
   * Execute bulk task creation across selected organization farms
   */
  static async executeBulkTasks(
    userId: string,
    organizationId: string,
    bulkData: {
      farmIds: string[];
      title: string;
      description?: string;
      category?: string;
      priority?: string;
      dueDate: Date;
    }
  ) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.tasks.manage');

    if (mongoose.connection.readyState !== 1) {
      return { success: true, batchId: `bulk_${Date.now()}`, createdCount: bulkData.farmIds.length };
    }

    const permittedFarmIds = await OrganizationAuthorizationService.getPermittedFarmIds(userId, organizationId);
    const targetFarmIds = bulkData.farmIds.filter(id => permittedFarmIds.includes(id));
    const batchId = `bulk_${crypto.randomBytes(8).toString('hex')}`;

    const taskDocs = targetFarmIds.map(farmId => ({
      organization: organizationId,
      farm: farmId,
      title: bulkData.title,
      description: bulkData.description || '',
      category: bulkData.category || 'general',
      priority: bulkData.priority || 'medium',
      dueDate: bulkData.dueDate,
      createdBy: userId,
      bulkBatchId: batchId,
      status: 'PENDING'
    }));

    await OrganizationTask.insertMany(taskDocs);

    return {
      success: true,
      batchId,
      createdCount: taskDocs.length
    };
  }
}
