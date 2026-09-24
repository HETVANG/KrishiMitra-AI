import mongoose from 'mongoose';
import { Campaign, CampaignStatus } from '../../models/Campaign';
import { ProductEventService } from '../productIntelligence/productEventService';

export class CampaignService {
  /**
   * Get active campaign by campaignId or fallback to default
   */
  static async getCampaign(campaignId: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return { campaignId, name: 'Default Campaign', status: 'ACTIVE' };
    }

    return await Campaign.findOne({ campaignId }).lean();
  }

  /**
   * Create or update a campaign definition
   */
  static async createCampaign(input: {
    campaignId: string;
    name: string;
    source: string;
    medium: string;
    region?: string;
    language?: string;
    audience?: string;
    landingPage?: string;
    status?: CampaignStatus;
  }): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return { success: true, campaignId: input.campaignId };
    }

    const campaign = await Campaign.findOneAndUpdate(
      { campaignId: input.campaignId },
      {
        name: input.name,
        source: input.source,
        medium: input.medium,
        region: input.region || 'IN',
        language: input.language || 'en',
        audience: input.audience,
        landingPage: input.landingPage,
        status: input.status || 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    return { success: true, campaign };
  }

  /**
   * Track campaign landing page visit
   */
  static async trackCampaignVisit(input: {
    campaignId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    userId?: string;
  }): Promise<void> {
    ProductEventService.logEvent({
      eventType: 'NOTIFICATION_OPENED',
      userId: input.userId,
      feature: 'Campaign Landing',
      metadata: {
        campaignId: input.campaignId || input.utmCampaign,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmContent: input.utmContent
      }
    });
  }

  /**
   * List all campaigns for admin analytics
   */
  static async listCampaigns(): Promise<any[]> {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }
    return await Campaign.find().sort({ createdAt: -1 }).lean();
  }
}
