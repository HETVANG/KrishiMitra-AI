import mongoose from 'mongoose';
import { OrganizationMembership } from '../models/OrganizationMembership';
import { Organization } from '../models/Organization';
import { Farm } from '../models/Farm';

export type OrganizationRole =
  | 'OWNER'
  | 'ORG_ADMIN'
  | 'FARM_MANAGER'
  | 'AGRONOMIST'
  | 'ADVISOR'
  | 'FIELD_MANAGER'
  | 'FARM_WORKER'
  | 'ANALYST'
  | 'ACCOUNTANT'
  | 'VIEWER'
  | 'ADMIN'
  | 'MANAGER'
  | 'MEMBER';

export type OrganizationPermission =
  | 'organization.read'
  | 'organization.update'
  | 'organization.members.read'
  | 'organization.members.manage'
  | 'organization.farms.read'
  | 'organization.farms.manage'
  | 'organization.crops.read'
  | 'organization.crops.manage'
  | 'organization.tasks.read'
  | 'organization.tasks.manage'
  | 'organization.reports.read'
  | 'organization.reports.create'
  | 'organization.copilot.use'
  | 'organization.agents.read'
  | 'organization.agents.manage'
  | 'organization.market.read'
  | 'organization.marketplace.read'
  | 'organization.billing.read'
  | 'organization.billing.manage'
  | 'organization.settings.manage';

const ROLE_PERMISSIONS: Record<string, OrganizationPermission[]> = {
  OWNER: [
    'organization.read',
    'organization.update',
    'organization.members.read',
    'organization.members.manage',
    'organization.farms.read',
    'organization.farms.manage',
    'organization.crops.read',
    'organization.crops.manage',
    'organization.tasks.read',
    'organization.tasks.manage',
    'organization.reports.read',
    'organization.reports.create',
    'organization.copilot.use',
    'organization.agents.read',
    'organization.agents.manage',
    'organization.market.read',
    'organization.marketplace.read',
    'organization.billing.read',
    'organization.billing.manage',
    'organization.settings.manage'
  ],
  ORG_ADMIN: [
    'organization.read',
    'organization.update',
    'organization.members.read',
    'organization.members.manage',
    'organization.farms.read',
    'organization.farms.manage',
    'organization.crops.read',
    'organization.crops.manage',
    'organization.tasks.read',
    'organization.tasks.manage',
    'organization.reports.read',
    'organization.reports.create',
    'organization.copilot.use',
    'organization.agents.read',
    'organization.agents.manage',
    'organization.market.read',
    'organization.marketplace.read',
    'organization.billing.read',
    'organization.settings.manage'
  ],
  ADMIN: [
    'organization.read',
    'organization.update',
    'organization.members.read',
    'organization.members.manage',
    'organization.farms.read',
    'organization.farms.manage',
    'organization.crops.read',
    'organization.crops.manage',
    'organization.tasks.read',
    'organization.tasks.manage',
    'organization.reports.read',
    'organization.reports.create',
    'organization.copilot.use',
    'organization.agents.read',
    'organization.market.read'
  ],
  FARM_MANAGER: [
    'organization.read',
    'organization.farms.read',
    'organization.farms.manage',
    'organization.crops.read',
    'organization.crops.manage',
    'organization.tasks.read',
    'organization.tasks.manage',
    'organization.reports.read',
    'organization.reports.create',
    'organization.copilot.use',
    'organization.agents.read',
    'organization.market.read'
  ],
  MANAGER: [
    'organization.read',
    'organization.farms.read',
    'organization.crops.read',
    'organization.crops.manage',
    'organization.tasks.read',
    'organization.tasks.manage',
    'organization.reports.read',
    'organization.copilot.use'
  ],
  AGRONOMIST: [
    'organization.read',
    'organization.farms.read',
    'organization.crops.read',
    'organization.crops.manage',
    'organization.tasks.read',
    'organization.tasks.manage',
    'organization.reports.read',
    'organization.copilot.use'
  ],
  ADVISOR: [
    'organization.read',
    'organization.farms.read',
    'organization.crops.read',
    'organization.tasks.read',
    'organization.tasks.manage',
    'organization.reports.read',
    'organization.copilot.use'
  ],
  FIELD_MANAGER: [
    'organization.read',
    'organization.farms.read',
    'organization.crops.read',
    'organization.tasks.read',
    'organization.tasks.manage'
  ],
  FARM_WORKER: [
    'organization.read',
    'organization.farms.read',
    'organization.tasks.read',
    'organization.tasks.manage'
  ],
  ANALYST: [
    'organization.read',
    'organization.farms.read',
    'organization.crops.read',
    'organization.reports.read',
    'organization.reports.create',
    'organization.copilot.use',
    'organization.market.read'
  ],
  ACCOUNTANT: [
    'organization.read',
    'organization.billing.read',
    'organization.reports.read'
  ],
  VIEWER: [
    'organization.read',
    'organization.farms.read',
    'organization.crops.read',
    'organization.reports.read'
  ],
  MEMBER: [
    'organization.read',
    'organization.farms.read',
    'organization.crops.read'
  ]
};

const mockMemberships = new Map<string, any>();

export class OrganizationAuthorizationService {
  /**
   * Helper to register mock membership during offline execution
   */
  static registerMockMembership(userId: string, organizationId: string, role: string) {
    mockMemberships.set(`${userId}_${organizationId}`, {
      user: userId,
      organization: organizationId,
      role,
      status: 'ACTIVE',
      assignedFarms: []
    });
  }

  /**
   * Fetch active membership document for user in an organization
   */
  static async getMembership(userId: string, organizationId: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      const mockMem = mockMemberships.get(`${userId}_${organizationId}`);
      if (mockMem) return mockMem;

      // Throw access denied if user is not in mock map
      throw new Error('Access denied: You are not an active member of this organization.');
    }

    const membership = await OrganizationMembership.findOne({
      user: userId,
      organization: organizationId,
      status: 'ACTIVE'
    }).lean();

    if (!membership) {
      throw new Error('Access denied: You are not an active member of this organization.');
    }

    return membership;
  }

  /**
   * Check if user has specific permission in organization
   */
  static async checkPermission(
    userId: string,
    organizationId: string,
    permission: OrganizationPermission
  ): Promise<boolean> {
    try {
      const membership = await this.getMembership(userId, organizationId);
      const rolePermissions = ROLE_PERMISSIONS[membership.role] || [];
      return rolePermissions.includes(permission);
    } catch {
      return false;
    }
  }

  /**
   * Require permission or throw 403 Forbidden
   */
  static async requirePermission(
    userId: string,
    organizationId: string,
    permission: OrganizationPermission
  ): Promise<any> {
    const membership = await this.getMembership(userId, organizationId);
    const rolePermissions = ROLE_PERMISSIONS[membership.role] || [];
    if (!rolePermissions.includes(permission)) {
      throw new Error(`Forbidden: Insufficient permissions (${permission}) for role ${membership.role}`);
    }
    return membership;
  }

  /**
   * Get farm IDs that the user is permitted to view/manage in the organization
   */
  static async getPermittedFarmIds(userId: string, organizationId: string): Promise<string[]> {
    if (mongoose.connection.readyState !== 1) {
      return [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];
    }

    const membership = await this.getMembership(userId, organizationId);
    const orgFarms = await Farm.find({ organization: organizationId, status: { $ne: 'ARCHIVED' } }).select('_id').lean();
    const allOrgFarmIds = orgFarms.map(f => f._id.toString());

    // OWNER, ORG_ADMIN, ADMIN have full access to all org farms
    if (['OWNER', 'ORG_ADMIN', 'ADMIN'].includes(membership.role)) {
      return allOrgFarmIds;
    }

    // Explicitly assigned farms if specified
    if (membership.assignedFarms && membership.assignedFarms.length > 0) {
      const assignedSet = new Set(membership.assignedFarms.map((f: any) => f.toString()));
      return allOrgFarmIds.filter(id => assignedSet.has(id));
    }

    // Default to all org farms if no explicit scoping is set
    return allOrgFarmIds;
  }
}
