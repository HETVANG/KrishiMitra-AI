import { MarketplaceListing } from '../../models/MarketplaceListing';
import { MarketplaceProvider } from '../../models/MarketplaceProvider';
import { MarketplaceInquiry } from '../../models/MarketplaceInquiry';
import { MarketplaceFavorite } from '../../models/MarketplaceFavorite';
import { MarketplaceReview } from '../../models/MarketplaceReview';
import { FarmKnowledgeGraphService } from '../knowledgeGraph/farmKnowledgeGraphService';

export class MarketplaceService {
  /**
   * Fetch listing details by ID
   */
  static async getListingById(listingId: string) {
    const listing = await MarketplaceListing.findById(listingId)
      .populate('provider')
      .lean();

    if (!listing) throw new Error('Marketplace listing not found');

    const reviews = await MarketplaceReview.find({ listing: listingId, verificationStatus: 'PUBLISHED' })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      listing,
      reviews,
      reviewsCount: reviews.length
    };
  }

  /**
   * Create a farmer inquiry for a marketplace listing
   */
  static async createInquiry(userId: string, farmId: string | undefined, listingId: string, message: string, subject?: string) {
    const listing = await MarketplaceListing.findById(listingId).lean();
    if (!listing) throw new Error('Target listing not found');

    // Retrieve farm context to share minimum required context
    let farmContext: any = {};
    if (farmId) {
      try {
        const graph = await FarmKnowledgeGraphService.getFarmGraph(userId, farmId);
        const primaryCrop = graph.activeCropCycles[0];
        farmContext = {
          cropName: primaryCrop ? primaryCrop.cropName : '',
          growthStage: primaryCrop ? primaryCrop.currentStage : '',
          district: graph.farm.location.district || '',
          state: graph.farm.location.state || ''
        };
      } catch {}
    }

    const inquiry = await MarketplaceInquiry.create({
      farmer: userId,
      farm: farmId,
      listing: listingId,
      provider: listing.provider,
      subject: subject || `Inquiry regarding ${listing.title}`,
      message,
      farmContext,
      status: 'PENDING'
    });

    return inquiry;
  }

  /**
   * Fetch inquiries sent by farmer
   */
  static async getUserInquiries(userId: string) {
    const inquiries = await MarketplaceInquiry.find({ farmer: userId })
      .populate('listing', 'title category pricing images')
      .populate('provider', 'name type contactInformation location verificationStatus')
      .sort({ createdAt: -1 })
      .lean();

    return inquiries;
  }

  /**
   * Toggle favorite / saved listing status
   */
  static async toggleFavorite(userId: string, farmId: string | undefined, listingId: string) {
    const existing = await MarketplaceFavorite.findOne({ user: userId, listing: listingId });

    if (existing) {
      await MarketplaceFavorite.deleteOne({ _id: existing._id });
      return { isFavorite: false, message: 'Removed from saved listings' };
    } else {
      await MarketplaceFavorite.create({
        user: userId,
        farm: farmId,
        listing: listingId
      });
      return { isFavorite: true, message: 'Saved to marketplace favorites' };
    }
  }

  /**
   * Get user's saved favorite listings
   */
  static async getUserFavorites(userId: string) {
    const favorites = await MarketplaceFavorite.find({ user: userId })
      .populate({
        path: 'listing',
        populate: { path: 'provider', select: 'name type verificationStatus contactInformation location rating profileImage' }
      })
      .sort({ createdAt: -1 })
      .lean();

    return favorites;
  }

  /**
   * Submit an authentic review for a provider/listing
   */
  static async createReview(userId: string, providerId: string, listingId: string | undefined, rating: number, comment: string) {
    const review = await MarketplaceReview.create({
      user: userId,
      provider: providerId,
      listing: listingId,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      verificationStatus: 'PUBLISHED'
    });

    // Update Provider Average Rating
    const reviews = await MarketplaceReview.find({ provider: providerId, verificationStatus: 'PUBLISHED' }).lean();
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = Number((totalRating / reviews.length).toFixed(1));

    await MarketplaceProvider.findByIdAndUpdate(providerId, {
      'rating.average': avg,
      'rating.count': reviews.length
    });

    return review;
  }
}
