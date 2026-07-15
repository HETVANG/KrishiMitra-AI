import { Request, Response, NextFunction } from 'express';
import { GovernmentScheme } from '../models/GovernmentScheme';

export class SchemeController {
  /**
   * Fetch and filter government schemes
   */
  static async listSchemes(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category } = req.query;

      // Live Mode - Seed if empty
      const count = await GovernmentScheme.countDocuments();
      if (count === 0) {
        const seedSchemes = [
          {
            title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
            description: 'An initiative by the Government of India in which all farmers get up to ₹6,000 per year in three installments as minimum income support.',
            eligibility: ['Small and marginal farmers', 'Must own agricultural land holding', 'Must have Aadhaar card linked bank account'],
            benefits: '₹6,000 per year directly transferred to bank account in 3 equal installments.',
            documentsRequired: ['Aadhaar Card', 'Land holding papers (Khasra/Khatauni)', 'Bank Passbook copy', 'Mobile Number'],
            applyLink: 'https://pmkisan.gov.in/',
            deadline: new Date('2026-12-31'),
            category: 'Income Support'
          },
          {
            title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
            description: 'A crop insurance scheme that protects farmers against yield losses due to natural calamities, pests, and diseases.',
            eligibility: ['All farmers including sharecroppers and tenant farmers growing notified crops'],
            benefits: 'Low premium (1.5% for Rabi, 2% for Kharif) with complete insurance coverage for crop losses.',
            documentsRequired: ['Land records or tenancy agreement', 'Sowing certificate', 'Bank Passbook copy', 'Aadhaar Card'],
            applyLink: 'https://pmfby.gov.in/',
            deadline: new Date('2026-08-31'),
            category: 'Insurance'
          },
          {
            title: 'Soil Health Card Scheme',
            description: 'Provides farmers with Soil Health Cards that detail soil nutrients and recommend crop-specific fertilizer dosages to restore productivity.',
            eligibility: ['All farmers holding agricultural land holding inside India'],
            benefits: 'Free soil testing and customized NPK fertilizer plan for improving soil chemical balance.',
            documentsRequired: ['Aadhaar Card', 'Land ownership details', 'Soil sample collection card'],
            applyLink: 'https://soilhealth.dac.gov.in/',
            deadline: new Date('2026-10-15'),
            category: 'Subsidies'
          }
        ];
        await GovernmentScheme.insertMany(seedSchemes);
      }

      const query: any = {};
      
      if (search) {
        query.$or = [
          { title: new RegExp(search as string, 'i') },
          { description: new RegExp(search as string, 'i') }
        ];
      }

      if (category) {
        query.category = new RegExp(category as string, 'i');
      }

      const schemes = await GovernmentScheme.find(query).sort({ deadline: 1 });

      return res.json({
        success: true,
        schemes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin-only CRUD endpoint to publish a new scheme
   */
  static async createScheme(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, eligibility, benefits, documentsRequired, applyLink, deadline, category } = req.body;

      // Live Mode
      const scheme = await GovernmentScheme.create({
        title,
        description,
        eligibility: eligibility || [],
        benefits,
        documentsRequired: documentsRequired || [],
        applyLink,
        deadline,
        category,
      });

      return res.status(201).json({
        success: true,
        scheme,
      });
    } catch (error) {
      next(error);
    }
  }
}
