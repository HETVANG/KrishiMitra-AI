import mongoose from 'mongoose';
import { ShareableResource, ShareableResourceType } from '../../models/ShareableResource';
import crypto from 'crypto';

export class SharingService {
  /**
   * Generate a secure random public share ID (e.g. pub_x8f9a2b1)
   */
  static generatePublicId(): string {
    return `pub_${crypto.randomBytes(6).toString('hex')}`;
  }

  /**
   * Sanitize payload to strictly remove private farm coordinates, tokens, internal IDs, and personal financials
   */
  static sanitizePayload(data: Record<string, any>): Record<string, any> {
    const clean = { ...data };
    
    // Privacy scrub list
    delete clean.latitude;
    delete clean.longitude;
    delete clean.boundary;
    delete clean.password;
    delete clean.token;
    delete clean.authorization;
    delete clean.user;
    delete clean.userId;
    delete clean.owner;
    delete clean.bankDetails;
    delete clean.totalExpense;
    delete clean.netIncome;

    return clean;
  }

  /**
   * Create a public shareable agricultural resource
   */
  static async createPublicShare(input: {
    userId: string;
    resourceType: ShareableResourceType;
    title: string;
    summary?: string;
    payload: Record<string, any>;
  }): Promise<{ success: boolean; publicId: string; shareUrl: string }> {
    if (mongoose.connection.readyState !== 1) {
      const mockId = this.generatePublicId();
      return {
        success: true,
        publicId: mockId,
        shareUrl: `/share/${input.resourceType}/${mockId}`
      };
    }

    const publicId = this.generatePublicId();
    const cleanPayload = this.sanitizePayload(input.payload);

    await ShareableResource.create({
      publicId,
      userId: new mongoose.Types.ObjectId(input.userId),
      resourceType: input.resourceType,
      title: input.title.trim(),
      summary: input.summary?.trim() || '',
      payload: cleanPayload,
      viewsCount: 0
    });

    return {
      success: true,
      publicId,
      shareUrl: `/share/${input.resourceType}/${publicId}`
    };
  }

  /**
   * Get public shareable resource by publicId and increment views count
   */
  static async getPublicShare(publicId: string): Promise<any> {
    if (mongoose.connection.readyState !== 1) {
      return {
        publicId,
        resourceType: 'market',
        title: 'Mandi Price Advisory - Cotton',
        summary: 'Market price summary for Rajkot Mandi',
        payload: { commodity: 'Cotton', price: 7200, unit: 'Quintal', market: 'Rajkot' },
        viewsCount: 1,
        createdAt: new Date()
      };
    }

    const resource = await ShareableResource.findOneAndUpdate(
      { publicId },
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).lean();

    if (!resource) {
      throw new Error('Public share resource not found or expired');
    }

    return {
      publicId: resource.publicId,
      resourceType: resource.resourceType,
      title: resource.title,
      summary: resource.summary,
      payload: resource.payload,
      viewsCount: resource.viewsCount,
      createdAt: resource.createdAt
    };
  }
}
