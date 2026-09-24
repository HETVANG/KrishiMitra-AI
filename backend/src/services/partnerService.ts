import mongoose from 'mongoose';
import { Partner } from '../models/Partner';
import { PartnerProgram } from '../models/PartnerProgram';
import { PartnerReferral } from '../models/PartnerReferral';
import crypto from 'crypto';

export class PartnerService {
  /**
   * Submit new partner application
   */
  static async applyPartner(userId: string, data: any) {
    if (mongoose.connection.readyState !== 1) {
      const mockCode = `PARTNER_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      return {
        id: new mongoose.Types.ObjectId().toString(),
        organizationName: data.organizationName,
        partnerType: data.partnerType || 'FPO',
        status: 'APPLIED',
        verificationStatus: 'UNVERIFIED',
        referralCode: mockCode
      };
    }

    const referralCode = `PARTNER_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const referralLink = `/register?ref=${referralCode}`;

    const partner = await Partner.create({
      organizationName: data.organizationName,
      legalName: data.legalName || data.organizationName,
      partnerType: data.partnerType || 'FPO',
      description: data.description || '',
      logo: data.logo || '',
      website: data.website || '',
      countries: data.countries || ['IN'],
      regions: data.regions || [],
      languages: data.languages || ['en', 'hi'],
      capabilities: data.capabilities || ['FARMER_DISTRIBUTION'],
      supportedCrops: data.supportedCrops || [],
      contactInformation: data.contactInformation || {},
      ownerUserId: userId,
      referralCode,
      referralLink,
      status: 'APPLIED',
      verificationStatus: 'UNVERIFIED'
    });

    return partner;
  }

  /**
   * Fetch partner profile by ID
   */
  static async getPartnerById(partnerId: string) {
    if (mongoose.connection.readyState !== 1) {
      return {
        id: partnerId,
        organizationName: 'Sahyadri Farmers Co-operative',
        partnerType: 'FPO',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        regions: ['Maharashtra', 'Karnataka'],
        capabilities: ['FARMER_DISTRIBUTION', 'AGRICULTURAL_ADVISORY'],
        referralCode: 'SAHYADRI_2026'
      };
    }

    const partner = await Partner.findById(partnerId).lean();
    if (!partner) throw new Error('Partner record not found');
    return partner;
  }

  /**
   * Fetch partner profile by owner user ID
   */
  static async getPartnerByUserId(userId: string) {
    if (mongoose.connection.readyState !== 1) {
      return {
        _id: new mongoose.Types.ObjectId().toString(),
        organizationName: 'Sahyadri Farmers Co-operative',
        partnerType: 'FPO',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        referralCode: 'SAHYADRI_2026'
      };
    }

    const partner = await Partner.findOne({ ownerUserId: userId }).lean();
    return partner;
  }

  /**
   * Admin verification workflow
   */
  static async verifyPartner(
    partnerId: string,
    reviewerUserId: string,
    decision: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW',
    notes?: string
  ) {
    if (mongoose.connection.readyState !== 1) {
      return { success: true, verificationStatus: decision };
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) throw new Error('Partner record not found');

    if (decision === 'VERIFIED') {
      partner.verificationStatus = 'VERIFIED';
      partner.status = 'ACTIVE';
      partner.verificationDetails = {
        verifiedAt: new Date(),
        verifiedBy: reviewerUserId as any,
        notes: notes || 'Admin verified partnership application.'
      };
    } else if (decision === 'UNDER_REVIEW') {
      partner.verificationStatus = 'UNDER_REVIEW';
      partner.status = 'UNDER_REVIEW';
    } else {
      partner.verificationStatus = 'UNVERIFIED';
      partner.status = 'PAUSED';
    }

    await partner.save();
    return partner;
  }

  /**
   * List partners with filtering
   */
  static async getPartners(query?: { status?: string; capability?: string; region?: string }) {
    if (mongoose.connection.readyState !== 1) {
      return [
        {
          _id: 'p1',
          organizationName: 'Sahyadri Agri Farmers Producer Co.',
          partnerType: 'FPO',
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          regions: ['Maharashtra'],
          capabilities: ['FARMER_DISTRIBUTION', 'AGRICULTURAL_ADVISORY'],
          languages: ['en', 'hi', 'mr']
        }
      ];
    }

    const filter: any = {};
    if (query?.status) filter.status = query.status;
    if (query?.capability) filter.capabilities = query.capability;
    if (query?.region) filter.regions = query.region;

    const partners = await Partner.find(filter).sort({ createdAt: -1 }).lean();
    return partners;
  }

  /**
   * Create partner distribution program
   */
  static async createProgram(userId: string, partnerId: string, programData: any) {
    if (mongoose.connection.readyState !== 1) {
      return { id: 'prog_1', partner: partnerId, name: programData.name, status: 'ACTIVE' };
    }

    const program = await PartnerProgram.create({
      partner: partnerId,
      name: programData.name,
      description: programData.description || '',
      targetRegions: programData.targetRegions || [],
      targetLanguages: programData.targetLanguages || ['en'],
      targetAudience: programData.targetAudience || 'Farmers',
      startDate: programData.startDate || new Date(),
      endDate: programData.endDate,
      status: 'ACTIVE',
      createdBy: userId
    });

    return program;
  }

  /**
   * Fetch distribution programs for partner
   */
  static async getPrograms(partnerId: string) {
    if (mongoose.connection.readyState !== 1) {
      return [
        {
          id: 'prog_1',
          name: 'Regional Cotton Advisory Program',
          targetRegions: ['Maharashtra'],
          status: 'ACTIVE',
          startDate: new Date()
        }
      ];
    }

    const programs = await PartnerProgram.find({ partner: partnerId }).sort({ createdAt: -1 }).lean();
    return programs;
  }

  /**
   * Track partner referral click / signup
   */
  static async trackReferral(referralCode: string, userId?: string, orgId?: string, status: string = 'SIGNUP') {
    if (mongoose.connection.readyState !== 1) {
      return { success: true };
    }

    const partner = await Partner.findOne({ referralCode });
    if (!partner) return { success: false, message: 'Invalid partner referral code' };

    const referral = await PartnerReferral.create({
      partner: partner._id,
      referralCode,
      referredUser: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      referredOrganization: orgId ? new mongoose.Types.ObjectId(orgId) : undefined,
      status
    });

    return { success: true, referralId: referral._id.toString() };
  }

  /**
   * Fetch partner referral analytics
   */
  static async getPartnerAnalytics(partnerId: string) {
    if (mongoose.connection.readyState !== 1) {
      return {
        totalReferrals: 142,
        signupsCount: 98,
        onboardedCount: 76,
        activatedCount: 54,
        organizationsOnboardedCount: 3
      };
    }

    const [total, signups, onboarded, activated, orgs] = await Promise.all([
      PartnerReferral.countDocuments({ partner: partnerId }),
      PartnerReferral.countDocuments({ partner: partnerId, status: 'SIGNUP' }),
      PartnerReferral.countDocuments({ partner: partnerId, status: 'ONBOARDED' }),
      PartnerReferral.countDocuments({ partner: partnerId, status: 'ACTIVATED' }),
      PartnerReferral.countDocuments({ partner: partnerId, referredOrganization: { $exists: true } })
    ]);

    return {
      totalReferrals: total,
      signupsCount: signups,
      onboardedCount: onboarded,
      activatedCount: activated,
      organizationsOnboardedCount: orgs
    };
  }
}
