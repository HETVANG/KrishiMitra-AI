import { Request, Response } from 'express';
import { OrganizationService } from '../services/organizationService';
import { OrganizationIntelligenceService } from '../services/organizationIntelligenceService';
import { OrganizationCopilotService } from '../services/organizationCopilotService';
import { OrganizationTaskService } from '../services/organizationTaskService';
import { OrganizationReportService } from '../services/organizationReportService';
import { OrganizationImportService } from '../services/organizationImportService';

export class OrganizationController {
  /**
   * GET /api/organizations
   */
  static async getUserOrganizations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const orgs = await OrganizationService.getUserOrganizations(userId);
      res.json({ success: true, data: orgs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id
   */
  static async getOrganizationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const org = await OrganizationService.getOrganizationById(userId, req.params.id);
      res.json({ success: true, data: org });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations
   */
  static async createOrganization(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const org = await OrganizationService.createOrganization(userId, req.body);
      res.status(201).json({ success: true, data: org });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * PATCH /api/organizations/:id
   */
  static async updateOrganization(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const org = await OrganizationService.updateOrganization(userId, req.params.id, req.body);
      res.json({ success: true, data: org });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * DELETE /api/organizations/:id (Archive)
   */
  static async archiveOrganization(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const result = await OrganizationService.archiveOrganization(userId, req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/members
   */
  static async getMembers(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const members = await OrganizationService.getOrganizationMembers(userId, req.params.id, req.query as any);
      res.json({ success: true, data: members });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/invitations
   */
  static async inviteMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const invite = await OrganizationService.inviteMember(userId, req.params.id, req.body);
      res.status(201).json({ success: true, data: invite });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * PATCH /api/organizations/:id/members/:targetUserId
   */
  static async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { role, assignedFarms } = req.body;
      const updated = await OrganizationService.updateMemberRole(userId, req.params.id, req.params.targetUserId, role, assignedFarms);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * DELETE /api/organizations/:id/members/:targetUserId
   */
  static async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const result = await OrganizationService.removeMember(userId, req.params.id, req.params.targetUserId);
      res.json(result);
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/farms
   */
  static async getOrganizationFarms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farms = await OrganizationService.getOrganizationFarms(userId, req.params.id);
      res.json({ success: true, data: farms });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/farms
   */
  static async addFarmToOrganization(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { farmId } = req.body;
      const farm = await OrganizationService.addFarmToOrganization(userId, req.params.id, farmId);
      res.json({ success: true, data: farm });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/dashboard
   */
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dashboard = await OrganizationIntelligenceService.getOrganizationDashboard(userId, req.params.id);
      res.json({ success: true, data: dashboard });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/crops
   */
  static async getCropIntelligence(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const intel = await OrganizationIntelligenceService.getCropIntelligence(userId, req.params.id);
      res.json({ success: true, data: intel });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/disease
   */
  static async getDiseaseIntelligence(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const intel = await OrganizationIntelligenceService.getDiseaseIntelligence(userId, req.params.id);
      res.json({ success: true, data: intel });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/irrigation
   */
  static async getIrrigationIntelligence(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const intel = await OrganizationIntelligenceService.getIrrigationIntelligence(userId, req.params.id);
      res.json({ success: true, data: intel });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/market
   */
  static async getMarketIntelligence(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const intel = await OrganizationIntelligenceService.getMarketIntelligence(userId, req.params.id);
      res.json({ success: true, data: intel });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/copilot/context
   */
  static async getCopilotContext(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const context = await OrganizationCopilotService.getOrganizationCopilotContext(userId, req.params.id);
      res.json({ success: true, data: context });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/copilot/query
   */
  static async queryCopilot(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { question } = req.body;
      const result = await OrganizationCopilotService.queryCopilot(userId, req.params.id, question);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/tasks
   */
  static async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const tasks = await OrganizationTaskService.getOrganizationTasks(userId, req.params.id, req.query.status as string);
      res.json({ success: true, data: tasks });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/tasks
   */
  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const task = await OrganizationTaskService.createTask(userId, req.params.id, req.body);
      res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/tasks/bulk/preview
   */
  static async previewBulkTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const preview = await OrganizationTaskService.previewBulkTasks(userId, req.params.id, req.body);
      res.json({ success: true, data: preview });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/tasks/bulk/execute
   */
  static async executeBulkTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const result = await OrganizationTaskService.executeBulkTasks(userId, req.params.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/reports
   */
  static async getReports(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const reports = await OrganizationReportService.getOrganizationReports(userId, req.params.id);
      res.json({ success: true, data: reports });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/reports/generate
   */
  static async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const report = await OrganizationReportService.generateReport(userId, req.params.id, req.body);
      res.status(201).json({ success: true, data: report });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/organizations/:id/reports/:reportId/export
   */
  static async exportReportCSV(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const csv = await OrganizationReportService.exportReportCSV(userId, req.params.id, req.params.reportId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="org_report_${req.params.reportId}.csv"`);
      res.send(csv);
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/import/preview
   */
  static async previewImport(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const preview = await OrganizationImportService.previewImport(userId, req.params.id, req.body.records || []);
      res.json({ success: true, data: preview });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/organizations/:id/import/execute
   */
  static async executeImport(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const result = await OrganizationImportService.executeImport(userId, req.params.id, req.body.records || []);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }
}
