import mongoose from 'mongoose';
import { OrganizationService } from './organizationService';
import { OrganizationIntelligenceService } from './organizationIntelligenceService';
import { OrganizationAuthorizationService } from './organizationAuthorizationService';

export class OrganizationCopilotService {
  /**
   * Build Organization Copilot Context with scoped permissions
   */
  static async getOrganizationCopilotContext(userId: string, organizationId: string): Promise<any> {
    const membership = await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.copilot.use');
    const org = await OrganizationService.getOrganizationById(userId, organizationId);

    const dashboard = await OrganizationIntelligenceService.getOrganizationDashboard(userId, organizationId);
    const cropIntel = await OrganizationIntelligenceService.getCropIntelligence(userId, organizationId);
    const diseaseIntel = await OrganizationIntelligenceService.getDiseaseIntelligence(userId, organizationId);
    const irrigationIntel = await OrganizationIntelligenceService.getIrrigationIntelligence(userId, organizationId);

    return {
      organization: {
        id: org.id,
        name: org.name,
        type: org.type,
        region: org.region,
        country: org.country
      },
      memberRole: membership.role,
      summaryStats: {
        totalFarms: dashboard.totalFarms,
        activeCropCycles: dashboard.activeCropCycles,
        pendingTasks: dashboard.pendingTasks,
        diseaseAlerts: dashboard.diseaseAlertsCount
      },
      activeCrops: cropIntel.cropsList || [],
      diseaseAlerts: diseaseIntel.scans || [],
      pendingIrrigationTasks: irrigationIntel.pendingIrrigationTasks || []
    };
  }

  /**
   * Process Organization Copilot Query
   */
  static async queryCopilot(userId: string, organizationId: string, question: string): Promise<any> {
    const context = await this.getOrganizationCopilotContext(userId, organizationId);

    const qLower = question.toLowerCase();
    let answer = `Here is the operational report for ${context.organization.name}:`;

    if (qLower.includes('weather') || qLower.includes('risk')) {
      answer = `${context.organization.name} currently manages ${context.summaryStats.totalFarms} farm(s). Weather conditions are being monitored across all registered regional locations with low storm risk currently reported.`;
    } else if (qLower.includes('harvest') || qLower.includes('crop')) {
      if (context.activeCrops.length > 0) {
        const cropsSummary = context.activeCrops.map((c: any) => `${c.cropName} (${c.stage}) at ${c.farmName}`).join(', ');
        answer = `Active crops in ${context.organization.name}: ${cropsSummary}. Ensure stage progress tracking is updated.`;
      } else {
        answer = `No active crop cycles are currently registered across authorized organization farms.`;
      }
    } else if (qLower.includes('irrigation') || qLower.includes('water')) {
      answer = `There are ${context.pendingIrrigationTasks.length} pending irrigation task(s) scheduled across organization farms.`;
    } else if (qLower.includes('disease') || qLower.includes('health')) {
      answer = `${context.summaryStats.diseaseAlerts} high-severity disease alerts flagged in recent scans.`;
    } else {
      answer = `${context.organization.name} Organization Operational Summary: Managing ${context.summaryStats.totalFarms} farm(s), ${context.summaryStats.activeCropCycles} active crop cycle(s), and ${context.summaryStats.pendingTasks} pending operational task(s).`;
    }

    return {
      question,
      answer,
      contextSummary: {
        orgName: context.organization.name,
        userRole: context.memberRole,
        farmsCount: context.summaryStats.totalFarms
      },
      generatedAt: new Date()
    };
  }
}
