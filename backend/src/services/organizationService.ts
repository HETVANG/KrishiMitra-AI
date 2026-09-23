import { Organization } from '../models/Organization';
import { OrganizationMembership } from '../models/OrganizationMembership';
import { Farm } from '../models/Farm';
import { MultiFarmService } from './multiFarmService';

export class OrganizationService {
  /**
   * Fetch all organizations user belongs to
   */
  static async getUserOrganizations(userId: string) {
    const memberships = await OrganizationMembership.find({ user: userId, status: 'ACTIVE' }).select('organization role').lean();
    const orgIds = memberships.map(m => m.organization.toString());

    const ownedOrgs = await Organization.find({ owner: userId, status: 'ACTIVE' }).lean();
    const allOrgIds = Array.from(new Set([...orgIds, ...ownedOrgs.map(o => o._id.toString())]));

    const orgs = await Organization.find({ _id: { $in: allOrgIds }, status: 'ACTIVE' }).lean();

    const result = await Promise.all(
      orgs.map(async o => {
        const orgId = o._id.toString();
        const farmsCount = await Farm.countDocuments({ organization: orgId, status: { $ne: 'ARCHIVED' } });
        const membersCount = await OrganizationMembership.countDocuments({ organization: orgId, status: 'ACTIVE' });

        return {
          id: orgId,
          name: o.name,
          type: o.type,
          description: o.description,
          countryCode: o.countryCode,
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
   * Create a new organization (cooperative, agri-enterprise)
   */
  static async createOrganization(userId: string, orgData: any) {
    const orgDoc = await Organization.create({
      name: orgData.name,
      type: orgData.type || 'AGRI_ENTERPRISE',
      owner: userId,
      description: orgData.description || '',
      countryCode: orgData.countryCode || 'IN'
    });

    await OrganizationMembership.create({
      user: userId,
      organization: orgDoc._id,
      role: 'OWNER',
      status: 'ACTIVE'
    });

    return orgDoc;
  }

  /**
   * Fetch farms belonging to an organization
   */
  static async getOrganizationFarms(userId: string, organizationId: string) {
    const orgFarms = await Farm.find({ organization: organizationId, status: { $ne: 'ARCHIVED' } }).lean();
    const userFarms = await MultiFarmService.getUserFarms(userId);
    const userFarmIdSet = new Set(userFarms.map(f => f.id));

    return orgFarms.filter(f => userFarmIdSet.has(f._id.toString()));
  }

  /**
   * Assign a farm to an organization
   */
  static async addFarmToOrganization(userId: string, organizationId: string, farmId: string) {
    const farm = await Farm.findOne({ _id: farmId, user: userId });
    if (!farm) throw new Error('Access denied: You must be the owner of the farm to assign it to an organization.');

    farm.organization = organizationId as any;
    await farm.save();
    return farm;
  }
}
