import { Farm } from '../models/Farm';
import { Field } from '../models/Field';
import { CropCycle } from '../models/CropCycle';
import { User } from '../models/User';
import { FarmTask } from '../models/FarmTask';
import { Notification } from '../models/Notification';
import { FarmMembership } from '../models/FarmMembership';
import { Organization } from '../models/Organization';
import { OrganizationMembership } from '../models/OrganizationMembership';
import { FarmAuthorizationService, FarmRole } from './farmAuthorizationService';
import { FarmKnowledgeGraphService } from './knowledgeGraph/farmKnowledgeGraphService';

export class MultiFarmService {
  /**
   * Fetch all active farms accessible by user
   */
  static async getUserFarms(userId: string) {
    const authorizedIds = await FarmAuthorizationService.getAuthorizedFarmIds(userId);
    const farms = await Farm.find({ _id: { $in: authorizedIds }, status: { $ne: 'ARCHIVED' } })
      .sort({ createdAt: -1 })
      .lean();

    const farmSummaries = await Promise.all(
      farms.map(async f => {
        const farmId = f._id.toString();
        const role = await FarmAuthorizationService.getUserRoleInFarm(userId, farmId);
        const fieldsCount = await Field.countDocuments({ farm: farmId, status: 'ACTIVE' });
        const activeCropsCount = await CropCycle.countDocuments({ farm: farmId, status: 'ACTIVE' });
        const pendingTasksCount = await FarmTask.countDocuments({ farm: farmId, status: { $in: ['TODO', 'IN_PROGRESS', 'WAITING_APPROVAL'] } });
        const unreadAlertsCount = await Notification.countDocuments({ farm: farmId, status: 'UNREAD' });

        return {
          id: farmId,
          name: f.name,
          description: f.description || '',
          sizeAcres: f.size,
          soilType: f.soilType,
          waterSource: f.waterSource,
          location: {
            village: f.village,
            district: f.district,
            state: f.state,
            countryCode: f.countryCode || 'IN',
            countryName: f.countryName || 'India',
            timezone: f.timezone || 'Asia/Kolkata',
            currency: f.currency || 'INR'
          },
          currentCrops: f.currentCrops || [],
          isPrimary: f.isPrimary || false,
          role: role || 'VIEWER',
          stats: {
            fieldsCount: fieldsCount || (f.currentCrops?.length ? 1 : 0),
            activeCropsCount,
            pendingTasksCount,
            unreadAlertsCount
          },
          createdAt: f.createdAt.toISOString()
        };
      })
    );

    return farmSummaries;
  }

  /**
   * Fetch detailed farm context by ID
   */
  static async getFarmById(userId: string, farmId: string) {
    const canView = await FarmAuthorizationService.canViewFarm(userId, farmId);
    if (!canView) throw new Error('Access denied: You do not have permission to view this farm.');

    const graph = await FarmKnowledgeGraphService.getFarmGraph(userId, farmId);
    const role = await FarmAuthorizationService.getUserRoleInFarm(userId, farmId);

    const members = await this.getFarmMembers(userId, farmId);

    return {
      farmId: graph.farm.id,
      name: graph.farm.name,
      role,
      graph,
      members
    };
  }

  /**
   * Create a new farm
   */
  static async createFarm(userId: string, farmData: any) {
    const farmDoc = await Farm.create({
      user: userId,
      name: farmData.name,
      description: farmData.description || '',
      size: farmData.size || farmData.sizeAcres || 1,
      soilType: farmData.soilType || 'Loam',
      waterSource: farmData.waterSource || 'Borewell',
      village: farmData.village || '',
      taluka: farmData.taluka || '',
      district: farmData.district || 'Default District',
      state: farmData.state || 'Default State',
      countryCode: farmData.countryCode || 'IN',
      countryName: farmData.countryName || 'India',
      currency: farmData.currency || 'INR',
      timezone: farmData.timezone || 'Asia/Kolkata',
      latitude: farmData.latitude || null,
      longitude: farmData.longitude || null,
      currentCrops: farmData.currentCrops || (farmData.cropName ? [farmData.cropName] : []),
      organization: farmData.organizationId || null,
      isPrimary: farmData.isPrimary || false
    });

    // Automatically create OWNER membership
    await FarmMembership.create({
      user: userId,
      farm: farmDoc._id,
      role: 'OWNER',
      status: 'ACTIVE'
    });

    return farmDoc;
  }

  /**
   * Update existing farm configuration
   */
  static async updateFarm(userId: string, farmId: string, updates: any) {
    const canEdit = await FarmAuthorizationService.canEditFarm(userId, farmId);
    if (!canEdit) throw new Error('Access denied: Insufficient permissions to edit this farm.');

    const updated = await Farm.findByIdAndUpdate(farmId, { $set: updates }, { new: true }).lean();
    return updated;
  }

  /**
   * Archive a farm
   */
  static async archiveFarm(userId: string, farmId: string) {
    const canEdit = await FarmAuthorizationService.canEditFarm(userId, farmId);
    if (!canEdit) throw new Error('Access denied: Insufficient permissions to archive this farm.');

    const updated = await Farm.findByIdAndUpdate(farmId, { $set: { status: 'ARCHIVED' } }, { new: true }).lean();
    return updated;
  }

  /**
   * Fetch team members of a farm
   */
  static async getFarmMembers(userId: string, farmId: string) {
    const canView = await FarmAuthorizationService.canViewFarm(userId, farmId);
    if (!canView) throw new Error('Access denied to farm team members.');

    const memberships = await FarmMembership.find({ farm: farmId, status: { $ne: 'REMOVED' } })
      .populate('user', 'name email phone role')
      .lean();

    return memberships.map(m => ({
      membershipId: m._id.toString(),
      userId: (m.user as any)?._id?.toString() || (m.user as any)?.toString(),
      name: (m.user as any)?.name || 'Team Member',
      email: (m.user as any)?.email || m.invitedEmail || '',
      role: m.role as FarmRole,
      status: m.status,
      joinedAt: m.createdAt.toISOString()
    }));
  }

  /**
   * Invite or add team member to a farm
   */
  static async inviteMember(userId: string, farmId: string, inviteData: { email: string; role: FarmRole }) {
    const canManage = await FarmAuthorizationService.canManageMembers(userId, farmId);
    if (!canManage) throw new Error('Access denied: Insufficient permissions to manage members.');

    const targetUser = await User.findOne({ email: inviteData.email }).lean();

    if (targetUser) {
      const membership = await FarmMembership.findOneAndUpdate(
        { user: targetUser._id, farm: farmId },
        {
          role: inviteData.role,
          status: 'ACTIVE',
          invitedBy: userId
        },
        { upsert: true, new: true }
      );
      return membership;
    } else {
      // Create pending invitation record
      const tempId = new User()._id; // Generate placeholder if user not registered yet
      const membership = await FarmMembership.create({
        user: tempId,
        farm: farmId,
        role: inviteData.role,
        status: 'INVITED',
        invitedEmail: inviteData.email,
        invitedBy: userId
      });
      return membership;
    }
  }

  /**
   * Remove member from farm
   */
  static async removeMember(userId: string, farmId: string, memberUserId: string) {
    const canManage = await FarmAuthorizationService.canManageMembers(userId, farmId);
    if (!canManage) throw new Error('Access denied: Insufficient permissions to remove members.');

    const membership = await FarmMembership.findOneAndUpdate(
      { user: memberUserId, farm: farmId },
      { status: 'REMOVED' },
      { new: true }
    );
    return membership;
  }

  /**
   * Compare two farms side-by-side
   */
  static async compareFarms(userId: string, farmId1: string, farmId2: string) {
    const farm1 = await this.getFarmById(userId, farmId1);
    const farm2 = await this.getFarmById(userId, farmId2);

    return {
      farm1: {
        id: farm1.farmId,
        name: farm1.name,
        sizeAcres: farm1.graph.farm.sizeAcres,
        activeCrops: farm1.graph.activeCropCycles.map(c => c.cropName),
        weatherTemp: farm1.graph.weatherContext.tempCelsius ? `${farm1.graph.weatherContext.tempCelsius}°C` : 'N/A',
        rainProb: farm1.graph.weatherContext.rainProbability !== null ? `${farm1.graph.weatherContext.rainProbability}%` : '0%',
        soilType: farm1.graph.farm.soilType,
        pendingTasks: farm1.graph.taskContext.pendingTasksCount
      },
      farm2: {
        id: farm2.farmId,
        name: farm2.name,
        sizeAcres: farm2.graph.farm.sizeAcres,
        activeCrops: farm2.graph.activeCropCycles.map(c => c.cropName),
        weatherTemp: farm2.graph.weatherContext.tempCelsius ? `${farm2.graph.weatherContext.tempCelsius}°C` : 'N/A',
        rainProb: farm2.graph.weatherContext.rainProbability !== null ? `${farm2.graph.weatherContext.rainProbability}%` : '0%',
        soilType: farm2.graph.farm.soilType,
        pendingTasks: farm2.graph.taskContext.pendingTasksCount
      }
    };
  }
}
