import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReferralService } from '../services/growth/referralService';
import { InviteService } from '../services/growth/inviteService';
import { SharingService } from '../services/growth/sharingService';
import { CampaignService } from '../services/growth/campaignService';
import { GrowthAnalyticsService } from '../services/growth/growthAnalyticsService';

export class GrowthController {
  /**
   * Get current user's referral code and referral stats
   */
  static async getMyReferralStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const stats = await ReferralService.getUserReferralStats(userId);
      res.status(200).json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch referral stats' });
    }
  }

  /**
   * Generate or retrieve user referral code
   */
  static async getReferralCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const code = await ReferralService.getOrCreateReferralCode(userId);
      res.status(200).json({ success: true, referralCode: code });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to generate referral code' });
    }
  }

  /**
   * Process signup referral attribution (Public)
   */
  static async attributeSignup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, referralCode, source, medium, campaignId } = req.body;
      if (!userId || !referralCode) {
        res.status(400).json({ success: false, message: 'userId and referralCode are required' });
        return;
      }

      const result = await ReferralService.attributeSignup({
        newUserId: userId,
        referralCode,
        source,
        medium,
        campaignId
      });

      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to attribute referral' });
    }
  }

  /**
   * Create invitation for team members/farmers
   */
  static async createInvite(req: AuthRequest, res: Response): Promise<void> {
    try {
      const inviterId = req.user?._id?.toString();
      if (!inviterId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const result = await InviteService.createInvitation({
        inviterId,
        inviteeEmail: req.body.inviteeEmail,
        inviteePhone: req.body.inviteePhone,
        role: req.body.role,
        farmId: req.body.farmId,
        organizationId: req.body.organizationId
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create invitation' });
    }
  }

  /**
   * Verify invitation token (Public)
   */
  static async verifyInviteToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      if (!token) {
        res.status(400).json({ success: false, message: 'Token is required' });
        return;
      }

      const result = await InviteService.verifyInvitationToken(token);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to verify invitation' });
    }
  }

  /**
   * Accept invitation
   */
  static async acceptInvite(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { token } = req.body;
      if (!token) {
        res.status(400).json({ success: false, message: 'Invitation token is required' });
        return;
      }

      const result = await InviteService.acceptInvitation(userId, token);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to accept invitation' });
    }
  }

  /**
   * Create safe public shareable agricultural resource
   */
  static async createShare(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { resourceType, title, summary, payload } = req.body;
      if (!resourceType || !title || !payload) {
        res.status(400).json({ success: false, message: 'resourceType, title, and payload are required' });
        return;
      }

      const result = await SharingService.createPublicShare({
        userId,
        resourceType,
        title,
        summary,
        payload
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create shareable link' });
    }
  }

  /**
   * Access public shareable resource (Public)
   */
  static async getPublicShare(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;
      if (!publicId) {
        res.status(400).json({ success: false, message: 'publicId is required' });
        return;
      }

      const share = await SharingService.getPublicShare(publicId);
      res.status(200).json({ success: true, share });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message || 'Public share resource not found' });
    }
  }

  /**
   * Track campaign landing visit (Public)
   */
  static async trackCampaign(req: AuthRequest, res: Response): Promise<void> {
    try {
      await CampaignService.trackCampaignVisit({
        campaignId: req.body.campaignId,
        utmSource: req.body.utm_source,
        utmMedium: req.body.utm_medium,
        utmCampaign: req.body.utm_campaign,
        utmContent: req.body.utm_content,
        userId: req.user?._id?.toString()
      });
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to track campaign visit' });
    }
  }

  /**
   * Admin Growth Analytics (Admin only)
   */
  static async getAdminGrowthAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const metrics = await GrowthAnalyticsService.getGrowthMetrics();
      res.status(200).json({ success: true, metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch growth analytics' });
    }
  }
}
