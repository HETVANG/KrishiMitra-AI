import mongoose from 'mongoose';
import { PartnerDiscoveryService } from './partnerDiscoveryService';

export class PartnerCopilotService {
  /**
   * Answer partner-related queries for AI Farm Copilot
   */
  static async queryPartnerCopilot(userId: string, question: string, region?: string): Promise<any> {
    const qLower = question.toLowerCase();
    let capability = '';

    if (qLower.includes('advisor') || qLower.includes('expert') || qLower.includes('agronomist')) {
      capability = 'AGRICULTURAL_ADVISORY';
    } else if (qLower.includes('storage') || qLower.includes('warehouse')) {
      capability = 'STORAGE';
    } else if (qLower.includes('equipment') || qLower.includes('machinery') || qLower.includes('tractor')) {
      capability = 'EQUIPMENT_SERVICES';
    } else if (qLower.includes('soil') || qLower.includes('testing')) {
      capability = 'SOIL_SERVICES';
    }

    const matchedPartners = await PartnerDiscoveryService.discoverPartners({
      capability: capability || undefined,
      region: region || undefined
    });

    let answer = '';
    if (matchedPartners.length === 0) {
      answer = `No verified agricultural partners are currently registered for ${region || 'your region'}. Check back soon as new FPOs and partner organizations are onboarded.`;
    } else {
      const names = matchedPartners.map(p => `${p.organizationName} (${p.partnerType})`).join(', ');
      answer = `Verified KrishiMitra partners in your region: ${names}. All listed partners hold verified status.`;
    }

    return {
      question,
      answer,
      matchedCount: matchedPartners.length,
      partners: matchedPartners,
      generatedAt: new Date()
    };
  }
}
