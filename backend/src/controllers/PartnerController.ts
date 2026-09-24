import { Request, Response } from 'express';
import { PartnerService } from '../services/partnerService';
import { PartnerDiscoveryService } from '../services/partnerDiscoveryService';
import { PartnerCopilotService } from '../services/partnerCopilotService';

export class PartnerController {
  /**
   * POST /api/partners/apply
   * Submit new partner application
   */
  static async applyPartner(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const partner = await PartnerService.applyPartner(userId, req.body);
      res.status(201).json({ success: true, data: partner });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/partners/discover
   * Location-aware & capability-based partner discovery
   */
  static async discoverPartners(req: Request, res: Response): Promise<void> {
    try {
      const partners = await PartnerDiscoveryService.discoverPartners({
        capability: req.query.capability as string,
        region: req.query.region as string,
        crop: req.query.crop as string,
        language: req.query.language as string,
        partnerType: req.query.partnerType as string,
        search: req.query.search as string
      });

      res.status(200).json({
        success: true,
        count: partners.length,
        data: partners
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/partners
   * List all partners (admin / directory view)
   */
  static async getPartners(req: Request, res: Response): Promise<void> {
    try {
      const partners = await PartnerService.getPartners(req.query as any);
      res.status(200).json({
        success: true,
        count: partners.length,
        partners
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/partners/me
   * Fetch logged-in user's partner profile
   */
  static async getMyPartnerProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const partner = await PartnerService.getPartnerByUserId(userId);
      res.status(200).json({ success: true, data: partner });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/partners/:id
   */
  static async getPartnerById(req: Request, res: Response): Promise<void> {
    try {
      const partner = await PartnerService.getPartnerById(req.params.id);
      res.status(200).json({ success: true, data: partner });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/partners/:id/verify (Admin Only)
   */
  static async verifyPartner(req: Request, res: Response): Promise<void> {
    try {
      const reviewerUserId = (req as any).user.id;
      const { decision, notes } = req.body;
      const result = await PartnerService.verifyPartner(req.params.id, reviewerUserId, decision, notes);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/partners/:id/programs
   */
  static async getPrograms(req: Request, res: Response): Promise<void> {
    try {
      const programs = await PartnerService.getPrograms(req.params.id);
      res.status(200).json({ success: true, data: programs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/partners/:id/programs
   */
  static async createProgram(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const program = await PartnerService.createProgram(userId, req.params.id, req.body);
      res.status(201).json({ success: true, data: program });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/partners/referrals/track
   */
  static async trackReferral(req: Request, res: Response): Promise<void> {
    try {
      const { referralCode, userId, orgId, status } = req.body;
      const result = await PartnerService.trackReferral(referralCode, userId, orgId, status);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/partners/:id/analytics
   */
  static async getPartnerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await PartnerService.getPartnerAnalytics(req.params.id);
      res.status(200).json({ success: true, data: analytics });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/partners/copilot/query
   */
  static async queryCopilot(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { question, region } = req.body;
      const result = await PartnerCopilotService.queryPartnerCopilot(userId, question, region);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
