import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { OrganizationController } from '../controllers/OrganizationController';

const router = Router();

// Organization Endpoints
router.get('/', authenticate, OrganizationController.getUserOrganizations);
router.post('/', authenticate, OrganizationController.createOrganization);
router.get('/:id', authenticate, OrganizationController.getOrganizationById);
router.patch('/:id', authenticate, OrganizationController.updateOrganization);
router.delete('/:id', authenticate, OrganizationController.archiveOrganization);

// Members & Invitations
router.get('/:id/members', authenticate, OrganizationController.getMembers);
router.post('/:id/invitations', authenticate, OrganizationController.inviteMember);
router.patch('/:id/members/:targetUserId', authenticate, OrganizationController.updateMemberRole);
router.delete('/:id/members/:targetUserId', authenticate, OrganizationController.removeMember);

// Organization Farms
router.get('/:id/farms', authenticate, OrganizationController.getOrganizationFarms);
router.post('/:id/farms', authenticate, OrganizationController.addFarmToOrganization);

// Intelligence & Dashboard
router.get('/:id/dashboard', authenticate, OrganizationController.getDashboard);
router.get('/:id/crops', authenticate, OrganizationController.getCropIntelligence);
router.get('/:id/disease', authenticate, OrganizationController.getDiseaseIntelligence);
router.get('/:id/irrigation', authenticate, OrganizationController.getIrrigationIntelligence);
router.get('/:id/market', authenticate, OrganizationController.getMarketIntelligence);

// Organization Copilot
router.get('/:id/copilot/context', authenticate, OrganizationController.getCopilotContext);
router.post('/:id/copilot/query', authenticate, OrganizationController.queryCopilot);

// Organization Tasks & Bulk Operations
router.get('/:id/tasks', authenticate, OrganizationController.getTasks);
router.post('/:id/tasks', authenticate, OrganizationController.createTask);
router.post('/:id/tasks/bulk/preview', authenticate, OrganizationController.previewBulkTasks);
router.post('/:id/tasks/bulk/execute', authenticate, OrganizationController.executeBulkTasks);

// Reports & Exports
router.get('/:id/reports', authenticate, OrganizationController.getReports);
router.post('/:id/reports/generate', authenticate, OrganizationController.generateReport);
router.get('/:id/reports/:reportId/export', authenticate, OrganizationController.exportReportCSV);

// Data Import
router.post('/:id/import/preview', authenticate, OrganizationController.previewImport);
router.post('/:id/import/execute', authenticate, OrganizationController.executeImport);

export default router;
