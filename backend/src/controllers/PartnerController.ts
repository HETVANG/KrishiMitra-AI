import { Request, Response } from 'express';
import { Partner } from '../models/Partner';

export class PartnerController {
  /**
   * List all verified partners (Admin view)
   */
  static async getPartners(req: Request, res: Response): Promise<void> {
    try {
      const country = (req.query.country as string) || 'IN';
      const status = req.query.status as string;

      const filter: any = {};
      if (status) filter.status = status;
      if (country) filter.countries = country.toUpperCase();

      let partners: any[] = [];
      try {
        partners = await Partner.find(filter).sort({ createdAt: -1 }).lean();
      } catch (err: any) {
        console.warn('[PartnerController] DB lookup notice:', err.message);
      }

      res.status(200).json({
        success: true,
        count: partners.length,
        country,
        partners
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to list partners' });
    }
  }

  /**
   * Create a new verified partner application (Admin only)
   */
  static async createPartner(req: Request, res: Response): Promise<void> {
    try {
      const { organizationName, partnerType, description, countries, website, contactInformation } = req.body;

      if (!organizationName || !partnerType) {
        res.status(400).json({ success: false, message: 'organizationName and partnerType are required' });
        return;
      }

      const partner = await Partner.create({
        organizationName,
        partnerType,
        description: description || '',
        countries: countries || ['IN'],
        website: website || '',
        contactInformation: contactInformation || {},
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'UNVERIFIED'
      });

      res.status(201).json({
        success: true,
        message: 'Partner record created and pending administrative verification.',
        partner
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create partner record' });
    }
  }
}
