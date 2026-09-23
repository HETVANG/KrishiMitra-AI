import { MarketplaceListing } from '../../models/MarketplaceListing';

export interface MarketplaceSearchFilters {
  category?: string;
  listingType?: string;
  district?: string;
  state?: string;
  countryCode?: string;
  crop?: string;
  stage?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export class MarketplaceSearchService {
  /**
   * Search marketplace listings with server-side filtering and pagination
   */
  static async searchListings(filters: MarketplaceSearchFilters) {
    const {
      category,
      listingType,
      district,
      state,
      countryCode = 'IN',
      crop,
      query,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = filters;

    const dbQuery: any = { status: 'ACTIVE' };

    if (category) dbQuery.category = category.toUpperCase();
    if (listingType) dbQuery.listingType = listingType.toUpperCase();
    if (countryCode) dbQuery['location.countryCode'] = countryCode;
    if (state) dbQuery['location.state'] = new RegExp(state, 'i');
    if (district) dbQuery['location.district'] = new RegExp(district, 'i');
    if (crop) dbQuery.cropsSupported = { $in: [new RegExp(crop, 'i')] };

    if (query) {
      dbQuery.$or = [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { brand: new RegExp(query, 'i') }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      dbQuery['pricing.amount'] = {};
      if (minPrice !== undefined) dbQuery['pricing.amount'].$gte = minPrice;
      if (maxPrice !== undefined) dbQuery['pricing.amount'].$lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    const listings = await MarketplaceListing.find(dbQuery)
      .populate('provider', 'name type verificationStatus contactInformation location rating profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await MarketplaceListing.countDocuments(dbQuery);

    return {
      listings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      hasResults: listings.length > 0,
      emptyStateMessage: listings.length === 0 ? 'No agricultural listings or services match your criteria yet.' : null
    };
  }
}
