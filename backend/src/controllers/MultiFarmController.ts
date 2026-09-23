import { Request, Response } from 'express';
import { MultiFarmService } from '../services/multiFarmService';

export class MultiFarmController {
  /**
   * GET /api/farms
   * Fetch all active farms accessible to user
   */
  static async getUserFarms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farms = await MultiFarmService.getUserFarms(userId);
      res.json({
        success: true,
        data: farms
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/farms/:id
   * Fetch detailed farm context by ID
   */
  static async getFarmById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.id;
      const farm = await MultiFarmService.getFarmById(userId, farmId);
      res.json({
        success: true,
        data: farm
      });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/farms
   * Create a new farm
   */
  static async createFarm(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farm = await MultiFarmService.createFarm(userId, req.body);
      res.status(201).json({
        success: true,
        data: farm
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * PUT /api/farms/:id
   * Update existing farm configuration
   */
  static async updateFarm(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.id;
      const updated = await MultiFarmService.updateFarm(userId, farmId, req.body);
      res.json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/farms/:id/archive
   * Archive a farm
   */
  static async archiveFarm(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.id;
      const archived = await MultiFarmService.archiveFarm(userId, farmId);
      res.json({
        success: true,
        data: archived
      });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/farms/:id/members
   * Fetch team members of a farm
   */
  static async getFarmMembers(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.id;
      const members = await MultiFarmService.getFarmMembers(userId, farmId);
      res.json({
        success: true,
        data: members
      });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/farms/:id/members/invite
   * Invite or add team member to a farm
   */
  static async inviteMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.id;
      const { email, role } = req.body;
      const membership = await MultiFarmService.inviteMember(userId, farmId, { email, role });
      res.status(201).json({
        success: true,
        data: membership
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * DELETE /api/farms/:id/members/:memberId
   * Remove member from farm
   */
  static async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.id;
      const memberUserId = req.params.memberId;
      const removed = await MultiFarmService.removeMember(userId, farmId, memberUserId);
      res.json({
        success: true,
        data: removed
      });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/farms/compare
   * Compare two farms side-by-side
   */
  static async compareFarms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId1 = req.query.farm1 as string;
      const farmId2 = req.query.farm2 as string;

      if (!farmId1 || !farmId2) {
        res.status(400).json({ success: false, error: 'Query parameters farm1 and farm2 are required.' });
        return;
      }

      const comparison = await MultiFarmService.compareFarms(userId, farmId1, farmId2);
      res.json({
        success: true,
        data: comparison
      });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }
}
