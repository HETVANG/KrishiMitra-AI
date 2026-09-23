import { Farm } from '../models/Farm';
import { FarmMembership } from '../models/FarmMembership';

export type FarmRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'FARM_WORKER' | 'ADVISOR' | 'VIEWER';

export class FarmAuthorizationService {
  /**
   * Get all farm IDs that a user is authorized to access (as owner or active team member)
   */
  static async getAuthorizedFarmIds(userId: string): Promise<string[]> {
    const ownedFarms = await Farm.find({ user: userId, status: { $ne: 'ARCHIVED' } }).select('_id').lean();
    const ownedIds = ownedFarms.map(f => f._id.toString());

    const memberships = await FarmMembership.find({ user: userId, status: 'ACTIVE' }).select('farm').lean();
    const memberIds = memberships.map(m => m.farm.toString());

    return Array.from(new Set([...ownedIds, ...memberIds]));
  }

  /**
   * Determine exact user role in a farm
   */
  static async getUserRoleInFarm(userId: string, farmId: string): Promise<FarmRole | null> {
    const farm = await Farm.findById(farmId).lean();
    if (!farm || farm.status === 'ARCHIVED') return null;

    if (farm.user.toString() === userId.toString()) {
      return 'OWNER';
    }

    const membership = await FarmMembership.findOne({
      user: userId,
      farm: farmId,
      status: 'ACTIVE'
    }).lean();

    if (membership) {
      return membership.role as FarmRole;
    }

    return null;
  }

  /**
   * Check if user can view farm data
   */
  static async canViewFarm(userId: string, farmId: string): Promise<boolean> {
    const role = await this.getUserRoleInFarm(userId, farmId);
    return role !== null;
  }

  /**
   * Check if user can edit farm configuration
   */
  static async canEditFarm(userId: string, farmId: string): Promise<boolean> {
    const role = await this.getUserRoleInFarm(userId, farmId);
    return role === 'OWNER' || role === 'ADMIN' || role === 'MANAGER';
  }

  /**
   * Check if user can manage farm team members
   */
  static async canManageMembers(userId: string, farmId: string): Promise<boolean> {
    const role = await this.getUserRoleInFarm(userId, farmId);
    return role === 'OWNER' || role === 'ADMIN';
  }

  /**
   * Check if user can create farm tasks
   */
  static async canCreateTask(userId: string, farmId: string): Promise<boolean> {
    const role = await this.getUserRoleInFarm(userId, farmId);
    return role === 'OWNER' || role === 'ADMIN' || role === 'MANAGER' || role === 'FARM_WORKER';
  }

  /**
   * Check if user can approve farm tasks or agent decisions
   */
  static async canApproveTask(userId: string, farmId: string): Promise<boolean> {
    const role = await this.getUserRoleInFarm(userId, farmId);
    return role === 'OWNER' || role === 'ADMIN' || role === 'MANAGER';
  }

  /**
   * Check if user can configure farm agents
   */
  static async canManageAgents(userId: string, farmId: string): Promise<boolean> {
    const role = await this.getUserRoleInFarm(userId, farmId);
    return role === 'OWNER' || role === 'ADMIN';
  }
}
