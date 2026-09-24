import mongoose from 'mongoose';
import { Organization } from '../models/Organization';
import { OrganizationMembership } from '../models/OrganizationMembership';
import { Farm } from '../models/Farm';
import { User } from '../models/User';
import { Invitation } from '../models/Invitation';
import { MultiFarmService } from './multiFarmService';
import { OrganizationAuthorizationService } from './organizationAuthorizationService';
import crypto from 'crypto';

const mockOrgsMap = new Map<string, any>();

export class OrganizationService {
  /**
   * Fetch all active organizations user belongs to
   */
  static async getUserOrganizations(userId: string) {
    if (mongoose.connection.readyState !== 1) {
      const mockList = Array.from(mockOrgsMap.values());
      if (mockList.length > 0) return mockList;

      return [
        {
          id: 'demo_org_1',
          name: 'Green Valley Farmers Producer Co.',
          type: 'FPO',
          role: 'OWNER',
          description: 'Regional FPO with 450 member farms across Maharashtra.',
          countryCode: 'IN',
          stats: { farmsCount: 5, membersCount: 12 },
          createdAt: new Date().toISOString()
        }
      ];
    }

    const memberships = await OrganizationMembership.find({ user: userId, status: 'ACTIVE' }).lean();
    const orgRoleMap = new Map<string, string>();
    memberships.forEach(m => orgRoleMap.set(m.organization.toString(), m.role));

    const ownedOrgs = await Organization.find({ owner: userId, status: { $ne: 'ARCHIVED' } }).lean();
    ownedOrgs.forEach(o => {
      if (!orgRoleMap.has(o._id.toString())) {
        orgRoleMap.set(o._id.toString(), 'OWNER');
      }
    });

    const orgIds = Array.from(orgRoleMap.keys());
    if (orgIds.length === 0) return [];

    const orgs = await Organization.find({ _id: { $in: orgIds }, status: { $ne: 'ARCHIVED' } }).lean();

    const result = await Promise.all(
      orgs.map(async o => {
        const orgId = o._id.toString();
        const farmsCount = await Farm.countDocuments({ organization: orgId, status: { $ne: 'ARCHIVED' } });
        const membersCount = await OrganizationMembership.countDocuments({ organization: orgId, status: 'ACTIVE' });

        return {
          id: orgId,
          name: o.name,
          legalName: o.legalName || o.name,
          type: o.type,
          role: orgRoleMap.get(orgId) || 'MEMBER',
          description: o.description,
          logo: o.logo || '',
          country: o.country || 'India',
          countryCode: o.countryCode || 'IN',
          region: o.region || '',
          timezone: o.timezone || 'Asia/Kolkata',
          currency: o.currency || 'INR',
          measurementSystem: o.measurementSystem || 'metric',
          status: o.status,
          stats: {
            farmsCount,
            membersCount
          },
          createdAt: o.createdAt.toISOString()
        };
      })
    );

    return result;
  }

  /**
   * Fetch single organization profile details
   */
  static async getOrganizationById(userId: string, organizationId: string) {
    if (mongoose.connection.readyState !== 1) {
      const mockOrg = mockOrgsMap.get(organizationId);
      if (mockOrg) return mockOrg;

      return {
        id: organizationId,
        name: 'Green Valley Farmers Producer Co.',
        type: 'FPO',
        role: 'OWNER',
        description: 'Regional FPO with 450 member farms.',
        stats: { farmsCount: 5, membersCount: 12 }
      };
    }

    const membership = await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.read');
    const org = await Organization.findById(organizationId).lean();
    if (!org || org.status === 'ARCHIVED') {
      throw new Error('Organization not found');
    }

    const farmsCount = await Farm.countDocuments({ organization: organizationId, status: { $ne: 'ARCHIVED' } });
    const membersCount = await OrganizationMembership.countDocuments({ organization: organizationId, status: 'ACTIVE' });

    return {
      id: org._id.toString(),
      name: org.name,
      legalName: org.legalName || org.name,
      type: org.type,
      role: membership.role,
      description: org.description,
      logo: org.logo || '',
      country: org.country || 'India',
      countryCode: org.countryCode || 'IN',
      region: org.region || '',
      timezone: org.timezone || 'Asia/Kolkata',
      currency: org.currency || 'INR',
      measurementSystem: org.measurementSystem || 'metric',
      status: org.status,
      settings: org.settings || {},
      stats: {
        farmsCount,
        membersCount
      },
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString()
    };
  }

  /**
   * Create a new organization
   */
  static async createOrganization(userId: string, orgData: any) {
    if (mongoose.connection.readyState !== 1) {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockObj = {
        id: mockId,
        name: orgData.name,
        legalName: orgData.legalName || orgData.name,
        type: orgData.type || 'FPO',
        role: 'OWNER',
        description: orgData.description || '',
        country: orgData.country || 'India',
        countryCode: orgData.countryCode || 'IN',
        region: orgData.region || '',
        timezone: orgData.timezone || 'Asia/Kolkata',
        currency: orgData.currency || 'INR',
        measurementSystem: orgData.measurementSystem || 'metric',
        status: 'ACTIVE',
        stats: { farmsCount: 1, membersCount: 1 },
        createdAt: new Date().toISOString()
      };
      mockOrgsMap.set(mockId, mockObj);
      OrganizationAuthorizationService.registerMockMembership(userId, mockId, 'OWNER');
      return mockObj;
    }

    const orgDoc = await Organization.create({
      name: orgData.name,
      legalName: orgData.legalName || orgData.name,
      type: orgData.type || 'FPO',
      owner: userId,
      description: orgData.description || '',
      logo: orgData.logo || '',
      country: orgData.country || 'India',
      countryCode: orgData.countryCode || 'IN',
      region: orgData.region || '',
      timezone: orgData.timezone || 'Asia/Kolkata',
      currency: orgData.currency || 'INR',
      measurementSystem: orgData.measurementSystem || 'metric',
      status: 'ACTIVE'
    });

    await OrganizationMembership.create({
      user: userId,
      organization: orgDoc._id,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date()
    });

    OrganizationAuthorizationService.registerMockMembership(userId, orgDoc._id.toString(), 'OWNER');

    return {
      id: orgDoc._id.toString(),
      name: orgDoc.name,
      legalName: orgDoc.legalName,
      type: orgDoc.type,
      owner: userId
    };
  }

  /**
   * Update organization details & settings
   */
  static async updateOrganization(userId: string, organizationId: string, updateData: any) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.update');

    if (mongoose.connection.readyState !== 1) {
      const mock = mockOrgsMap.get(organizationId) || {};
      const updated = { ...mock, ...updateData };
      mockOrgsMap.set(organizationId, updated);
      return updated;
    }

    const org = await Organization.findById(organizationId);
    if (!org) throw new Error('Organization not found');

    if (updateData.name) org.name = updateData.name;
    if (updateData.legalName !== undefined) org.legalName = updateData.legalName;
    if (updateData.type) org.type = updateData.type;
    if (updateData.description !== undefined) org.description = updateData.description;
    if (updateData.logo !== undefined) org.logo = updateData.logo;
    if (updateData.country) org.country = updateData.country;
    if (updateData.countryCode) org.countryCode = updateData.countryCode;
    if (updateData.region !== undefined) org.region = updateData.region;
    if (updateData.timezone) org.timezone = updateData.timezone;
    if (updateData.currency) org.currency = updateData.currency;
    if (updateData.measurementSystem) org.measurementSystem = updateData.measurementSystem;
    if (updateData.settings) org.settings = { ...org.settings, ...updateData.settings };

    await org.save();
    return org;
  }

  /**
   * Archive organization
   */
  static async archiveOrganization(userId: string, organizationId: string) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.settings.manage');
    if (mongoose.connection.readyState !== 1) {
      mockOrgsMap.delete(organizationId);
      return { success: true, message: 'Organization archived successfully' };
    }
    const org = await Organization.findById(organizationId);
    if (!org) throw new Error('Organization not found');
    org.status = 'ARCHIVED';
    await org.save();
    return { success: true, message: 'Organization archived successfully' };
  }

  /**
   * Fetch members directory for organization
   */
  static async getOrganizationMembers(userId: string, organizationId: string, query?: { search?: string; role?: string }) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.members.read');

    if (mongoose.connection.readyState !== 1) {
      return [
        {
          membershipId: 'mem_1',
          userId,
          name: 'Primary Owner',
          role: 'OWNER',
          status: 'ACTIVE',
          assignedFarmsCount: 2,
          joinedAt: new Date()
        }
      ];
    }

    const filter: any = { organization: organizationId, status: { $ne: 'REMOVED' } };
    if (query?.role) filter.role = query.role;

    const memberships = await OrganizationMembership.find(filter)
      .populate('user', 'name email phone avatar role')
      .lean();

    return memberships.map((m: any) => ({
      membershipId: m._id.toString(),
      userId: m.user?._id?.toString() || m.user?.toString(),
      name: m.user?.name || 'Organization Member',
      email: m.user?.email || '',
      phone: m.user?.phone || '',
      role: m.role,
      status: m.status,
      assignedFarmsCount: (m.assignedFarms || []).length,
      joinedAt: m.joinedAt || m.createdAt
    }));
  }

  /**
   * Invite member to organization
   */
  static async inviteMember(userId: string, organizationId: string, inviteData: { email?: string; phone?: string; role: string; assignedFarms?: string[] }) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.members.manage');

    const token = crypto.randomBytes(24).toString('hex');
    if (mongoose.connection.readyState !== 1) {
      return { invitationId: `inv_${Date.now()}`, token, role: inviteData.role || 'FARM_WORKER', expiresAt: new Date() };
    }

    const invitation = await Invitation.create({
      inviterId: userId,
      inviteeEmail: inviteData.email,
      inviteePhone: inviteData.phone,
      role: inviteData.role || 'FARM_WORKER',
      organizationId,
      inviteToken: token,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    return {
      invitationId: invitation._id.toString(),
      token,
      role: invitation.role,
      expiresAt: invitation.expiresAt
    };
  }

  /**
   * Update member role and farm assignments
   */
  static async updateMemberRole(userId: string, organizationId: string, targetUserId: string, role: string, assignedFarms?: string[]) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.members.manage');

    if (mongoose.connection.readyState !== 1) {
      return { user: targetUserId, organization: organizationId, role, status: 'ACTIVE' };
    }

    const membership = await OrganizationMembership.findOne({ user: targetUserId, organization: organizationId });
    if (!membership) throw new Error('Member not found in organization');

    membership.role = role as any;
    if (assignedFarms) {
      membership.assignedFarms = assignedFarms as any;
    }
    await membership.save();
    return membership;
  }

  /**
   * Remove member from organization
   */
  static async removeMember(userId: string, organizationId: string, targetUserId: string) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.members.manage');

    if (mongoose.connection.readyState !== 1) {
      return { success: true };
    }

    const membership = await OrganizationMembership.findOne({ user: targetUserId, organization: organizationId });
    if (!membership) throw new Error('Member not found');
    if (membership.role === 'OWNER') throw new Error('Cannot remove organization OWNER');

    membership.status = 'REMOVED';
    await membership.save();
    return { success: true };
  }

  /**
   * Fetch farms belonging to organization (scoped by user's permitted farms)
   */
  static async getOrganizationFarms(userId: string, organizationId: string) {
    const permittedFarmIds = await OrganizationAuthorizationService.getPermittedFarmIds(userId, organizationId);
    if (permittedFarmIds.length === 0) return [];

    if (mongoose.connection.readyState !== 1) {
      return [
        {
          id: permittedFarmIds[0],
          name: 'Koppal Organic Block A',
          description: 'Primary block',
          size: 25,
          soilType: 'Red Soil',
          state: 'Karnataka',
          district: 'Koppal',
          currentCrops: ['Maize'],
          status: 'ACTIVE'
        }
      ];
    }

    const farms = await Farm.find({ _id: { $in: permittedFarmIds }, status: { $ne: 'ARCHIVED' } }).lean();
    return farms.map(f => ({
      id: f._id.toString(),
      name: f.name,
      description: f.description || '',
      size: f.size,
      soilType: f.soilType,
      state: f.state,
      district: f.district,
      currentCrops: f.currentCrops || [],
      status: f.status
    }));
  }

  /**
   * Assign an existing farm to an organization
   */
  static async addFarmToOrganization(userId: string, organizationId: string, farmId: string) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.farms.manage');

    if (mongoose.connection.readyState !== 1) {
      return { id: farmId, organization: organizationId, status: 'ACTIVE' };
    }

    const farm = await Farm.findOne({ _id: farmId, user: userId });
    if (!farm) throw new Error('Access denied: You must be the owner of the farm to assign it to an organization.');

    farm.organization = organizationId as any;
    await farm.save();
    return farm;
  }
}
