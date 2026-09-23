import { Request, Response } from 'express';
import { OrganizationService } from '../services/organizationService';

export class OrganizationController {
  /**
   * GET /api/organizations
   * Fetch user organizations
   */
  static async getUserOrganizations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const orgs = await OrganizationService.getUserOrganizations(userId);
      res.json({
        success: true,
        data: orgs
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations
   * Create a new organization
   */
  static async createOrganization(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const org = await OrganizationService.createOrganization(userId, req.body);
      res.status(201).json({
        success: true,
        data: org
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/farms
   * Fetch farms belonging to organization
   */
  static async getOrganizationFarms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const orgId = req.params.id;
      const farms = await OrganizationService.getOrganizationFarms(userId, orgId);
      res.json({
        success: true,
        data: farms
      });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/farms
   * Assign farm to organization
   */
  static async addFarmToOrganization(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const orgId = req.params.id;
      const { farmId } = req.body;
      const farm = await OrganizationService.addFarmToOrganization(userId, orgId, farmId);
      res.json({
        success: true,
        data: farm
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
