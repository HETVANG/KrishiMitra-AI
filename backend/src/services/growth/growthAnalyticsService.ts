import mongoose from 'mongoose';
import { User } from '../../models/User';
import { Referral } from '../../models/Referral';
import { Invitation } from '../../models/Invitation';
import { ShareableResource } from '../../models/ShareableResource';
import { Campaign } from '../../models/Campaign';
import { ProductEvent } from '../../models/ProductEvent';

export class GrowthAnalyticsService {
  /**
   * Get real production growth analytics and conversion funnel statistics
   */
  static async getGrowthMetrics(): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        totalUsers: 0,
        totalReferrals: 0,
        activatedReferrals: 0,
        convertedReferrals: 0,
        totalShares: 0,
        shareViews: 0,
        activeCampaigns: 0,
        activationFunnel: {
          signups: 0,
          onboarded: 0,
          activated: 0,
          subscribed: 0
        },
        topReferrers: [],
        sharesByType: []
      };
    }

    const [
      totalUsers,
      totalReferrals,
      activatedReferrals,
      convertedReferrals,
      totalShares,
      shareViewsAggregation,
      activeCampaigns,
      onboardedUsers,
      subscribedUsers,
      sharesByType,
      topReferrers
    ] = await Promise.all([
      User.countDocuments(),
      Referral.countDocuments(),
      Referral.countDocuments({ status: { $in: ['ACTIVATED', 'CONVERTED'] } }),
      Referral.countDocuments({ status: 'CONVERTED' }),
      ShareableResource.countDocuments(),
      ShareableResource.aggregate([{ $group: { _id: null, totalViews: { $sum: '$viewsCount' } } }]),
      Campaign.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ onboardingStatus: 'COMPLETED' }),
      User.countDocuments({ plan: { $ne: 'free' } }),
      ShareableResource.aggregate([
        { $group: { _id: '$resourceType', count: { $sum: 1 }, views: { $sum: '$viewsCount' } } }
      ]),
      User.find({ referralCount: { $gt: 0 } })
        .sort({ referralCount: -1 })
        .limit(10)
        .select('name email referralCode referralCount createdAt')
        .lean()
    ]);

    const totalViews = shareViewsAggregation[0]?.totalViews || 0;

    return {
      totalUsers,
      totalReferrals,
      activatedReferrals,
      convertedReferrals,
      totalShares,
      shareViews: totalViews,
      activeCampaigns,
      activationFunnel: {
        signups: totalUsers,
        onboarded: onboardedUsers,
        activated: activatedReferrals,
        subscribed: subscribedUsers
      },
      sharesByType: sharesByType.map(s => ({
        type: s._id,
        shares: s.count,
        views: s.views
      })),
      topReferrers: topReferrers.map(r => ({
        id: r._id,
        name: r.name,
        code: r.referralCode,
        referrals: r.referralCount
      }))
    };
  }
}
