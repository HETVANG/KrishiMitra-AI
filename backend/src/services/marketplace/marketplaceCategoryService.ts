import mongoose from 'mongoose';
import { MarketplaceCategory } from '../../models/MarketplaceCategory';

export const DEFAULT_CATEGORIES = [
  // INPUTS
  { code: 'SEEDS', name: 'Certified Seeds & Plantlets', group: 'INPUTS', description: 'High-yielding certified crop seeds, hybrids, and nurseries.', icon: 'Sprout' },
  { code: 'FERTILIZERS', name: 'Fertilizers & Soil Nutrition', group: 'INPUTS', description: 'Basal fertilizers, micro-nutrients, and organic bio-fertilizers.', icon: 'Sprout' },
  { code: 'CROP_PROTECTION', name: 'Crop Protection & Pesticides', group: 'INPUTS', description: 'Bio-pesticides, fungicides, and integrated pest management products.', icon: 'ShieldAlert' },
  { code: 'IRRIGATION_SUPPLIES', name: 'Irrigation Equipment & Drip Parts', group: 'INPUTS', description: 'Drip lines, sprinklers, filters, and solar pump components.', icon: 'Droplets' },

  // SERVICES
  { code: 'SOIL_TESTING', name: 'Digital Soil Testing Services', group: 'SERVICES', description: 'On-farm and lab soil chemistry, pH, NPK, and micro-nutrient testing.', icon: 'Sprout' },
  { code: 'DRONE_SPRAYING', name: 'Agricultural Drone Spraying', group: 'SERVICES', description: 'Precision aerial pesticide, liquid fertilizer, and crop monitoring spraying.', icon: 'Activity' },
  { code: 'MACHINERY_RENTAL', name: 'Farm Equipment Rental & Hiring', group: 'SERVICES', description: 'Tractor, harvester, rotavator, and laser land-leveler rental services.', icon: 'Layers' },
  { code: 'LOGISTICS', name: 'Agricultural Transport & Freight', group: 'SERVICES', description: 'Post-harvest mandi transport and temperature-controlled logistics.', icon: 'CloudSun' },
  { code: 'STORAGE', name: 'Cold Storage & Warehousing', group: 'SERVICES', description: 'Warehouse storage space, cold rooms, and grain silo services.', icon: 'Layers' },

  // EXPERTISE
  { code: 'AGRICULTURAL_CONSULTING', name: 'Agronomist & Specialist Advisory', group: 'EXPERTISE', description: 'One-on-one consultation with certified agronomists and crop pathologists.', icon: 'Calendar' },

  // MARKET SUPPORT
  { code: 'BUYERS', name: 'Crop Aggregators & Institutional Buyers', group: 'MARKET_SUPPORT', description: 'Verified APMC traders, FPO buyers, and corporate contract purchasers.', icon: 'Coins' }
];

export class MarketplaceCategoryService {
  /**
   * Seed default categories if DB is uninitialized
   */
  static async ensureDefaultCategories() {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    try {
      const count = await MarketplaceCategory.countDocuments();
      if (count === 0) {
        await MarketplaceCategory.insertMany(DEFAULT_CATEGORIES);
        console.log('[MarketplaceCategoryService] Default marketplace categories initialized successfully.');
      }
    } catch (err: any) {
      console.warn('[MarketplaceCategoryService] Categories seeding warning:', err.message);
    }
  }

  /**
   * Get active categories filtered by group and country
   */
  static async getCategories(group?: string, countryCode: string = 'IN') {
    if (mongoose.connection.readyState === 1) {
      try {
        await this.ensureDefaultCategories();
        const query: any = { isActive: true, supportedCountries: countryCode };
        if (group) query.group = group;

        const categories = await MarketplaceCategory.find(query).sort({ group: 1, name: 1 }).lean();
        if (categories && categories.length > 0) {
          return categories;
        }
      } catch (err: any) {
        console.warn('[MarketplaceCategoryService] DB lookup warning, returning static defaults:', err.message);
      }
    }
    
    // Fallback to static defaults if DB is offline or empty
    let filtered = DEFAULT_CATEGORIES.map(c => ({ ...c, isActive: true, supportedCountries: ['IN'] }));
    if (group) {
      filtered = filtered.filter(c => c.group === group);
    }
    return filtered as any[];
  }
}
