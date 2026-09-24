import mongoose from 'mongoose';
import { FeatureRequest } from '../../models/FeatureRequest';

export interface CreateFeatureRequestInput {
  userId: string;
  title: string;
  description: string;
  category?: string;
  region?: string;
  language?: string;
  relatedFeature?: string;
}

export class FeatureRequestService {
  /**
   * Submit feature request idea with basic duplicate detection check
   */
  static async createRequest(input: CreateFeatureRequestInput): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        request: {
          _id: `offline_req_${Date.now()}`,
          userId: input.userId,
          title: input.title,
          description: input.description,
          category: input.category || 'GENERAL',
          region: input.region || 'IN',
          language: input.language || 'en',
          status: 'SUBMITTED',
          upvotes: 1,
          upvotedBy: [input.userId],
          createdAt: new Date()
        },
        potentialDuplicateNotice: null
      };
    }

    const existing = await FeatureRequest.find({
      title: new RegExp(input.title.split(' ')[0], 'i')
    }).limit(1).lean();

    const isPotentialDuplicate = existing && existing.length > 0;
    const status = isPotentialDuplicate ? 'UNDER_REVIEW' : 'SUBMITTED';

    const reqDoc = await FeatureRequest.create({
      userId: input.userId,
      title: input.title,
      description: input.description,
      category: input.category || 'GENERAL',
      region: input.region || 'IN',
      language: input.language || 'en',
      status,
      upvotes: 1,
      upvotedBy: [input.userId]
    });

    return {
      request: reqDoc,
      potentialDuplicateNotice: isPotentialDuplicate ? `Grouped under review alongside existing request: "${existing[0].title}"` : null
    };
  }

  /**
   * Upvote a feature request
   */
  static async upvoteRequest(requestId: string, userId: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        _id: requestId,
        upvotes: 2,
        upvotedBy: [userId]
      };
    }

    const reqDoc = await FeatureRequest.findById(requestId);
    if (!reqDoc) return null;

    const alreadyUpvoted = (reqDoc as any).upvotedBy?.includes(userId);
    if (!alreadyUpvoted) {
      (reqDoc as any).upvotedBy = (reqDoc as any).upvotedBy || [];
      (reqDoc as any).upvotedBy.push(userId);
      (reqDoc as any).upvotes = ((reqDoc as any).upvotes || 0) + 1;
      await reqDoc.save();
    }

    return reqDoc;
  }

  /**
   * Get all feature requests for community board
   */
  static async getAllRequests(category?: string, region?: string): Promise<any[]> {
    if (mongoose.connection.readyState !== 1) return [];
    const query: any = {};
    if (category) query.category = category;
    if (region) query.region = region;

    return await FeatureRequest.find(query).sort({ upvotes: -1, createdAt: -1 }).limit(100).lean();
  }
}

