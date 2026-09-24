import mongoose from 'mongoose';
import { Partner } from '../models/Partner';

export interface PartnerDiscoveryQuery {
  capability?: string;
  region?: string;
  crop?: string;
  language?: string;
  partnerType?: string;
  search?: string;
}

export interface PartnerMatchResult {
  id: string;
  organizationName: string;
  legalName?: string;
  partnerType: string;
  description: string;
  logo?: string;
  website?: string;
  verificationStatus: string;
  isVerified: boolean;
  regions: string[];
  capabilities: string[];
  languages: string[];
  contactInformation?: any;
  matchReasons: string[];
}

export class PartnerDiscoveryService {
  /**
   * Location-aware and capability-based Partner Discovery
   */
  static async discoverPartners(query: PartnerDiscoveryQuery): Promise<PartnerMatchResult[]> {
    if (mongoose.connection.readyState !== 1) {
      const mockResult: PartnerMatchResult[] = [
        {
          id: 'mock_partner_1',
          organizationName: 'Sahyadri Agri Farmers Producer Co.',
          legalName: 'Sahyadri Agri Co. Ltd.',
          partnerType: 'FPO',
          description: 'Regional FPO providing direct farm advisory, seed distribution, and soil testing.',
          logo: '',
          website: 'https://sahyadri-agri.example.org',
          verificationStatus: 'VERIFIED',
          isVerified: true,
          regions: ['Maharashtra', 'Karnataka'],
          capabilities: ['FARMER_DISTRIBUTION', 'AGRICULTURAL_ADVISORY', 'SOIL_SERVICES'],
          languages: ['en', 'hi', 'mr'],
          matchReasons: ['Verified partner badge', 'Available in Maharashtra region', 'Offers Hindi & Marathi support']
        }
      ];

      if (query.region && !['Maharashtra', 'Karnataka'].includes(query.region)) {
        return [];
      }
      return mockResult;
    }

    const filter: any = {
      status: 'ACTIVE'
    };

    if (query.partnerType) filter.partnerType = query.partnerType;
    if (query.capability) filter.capabilities = query.capability;
    if (query.region) filter.regions = { $in: [query.region, new RegExp(query.region, 'i')] };
    if (query.language) filter.languages = query.language;
    if (query.search) {
      filter.$or = [
        { organizationName: new RegExp(query.search, 'i') },
        { description: new RegExp(query.search, 'i') }
      ];
    }

    const partners = await Partner.find(filter).lean();

    const results: PartnerMatchResult[] = partners.map((p: any) => {
      const matchReasons: string[] = [];

      const isVerified = p.verificationStatus === 'VERIFIED' || p.verificationStatus === 'PARTNER_VERIFIED';
      if (isVerified) {
        matchReasons.push('Verified partner badge');
      }

      if (query.region && p.regions && p.regions.includes(query.region)) {
        matchReasons.push(`Available in ${query.region} region`);
      } else if (p.regions && p.regions.length > 0) {
        matchReasons.push(`Operates in ${p.regions.join(', ')}`);
      }

      if (query.crop && p.supportedCrops && p.supportedCrops.includes(query.crop)) {
        matchReasons.push(`Supports ${query.crop} crop advisory`);
      }

      if (query.language && p.languages && p.languages.includes(query.language)) {
        matchReasons.push(`Offers ${query.language.toUpperCase()} language support`);
      }

      if (query.capability && p.capabilities && p.capabilities.includes(query.capability)) {
        matchReasons.push(`Provides ${query.capability.replace('_', ' ')} capabilities`);
      }

      return {
        id: p._id.toString(),
        organizationName: p.organizationName,
        legalName: p.legalName,
        partnerType: p.partnerType,
        description: p.description || '',
        logo: p.logo || '',
        website: p.website || '',
        verificationStatus: p.verificationStatus,
        isVerified,
        regions: p.regions || [],
        capabilities: p.capabilities || [],
        languages: p.languages || [],
        contactInformation: p.contactInformation || {},
        matchReasons
      };
    });

    return results;
  }
}
