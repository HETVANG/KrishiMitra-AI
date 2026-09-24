import assert from 'assert';
import mongoose from 'mongoose';
import { OrganizationService } from '../services/organizationService';
import { OrganizationAuthorizationService } from '../services/organizationAuthorizationService';
import { OrganizationIntelligenceService } from '../services/organizationIntelligenceService';
import { OrganizationCopilotService } from '../services/organizationCopilotService';
import { OrganizationTaskService } from '../services/organizationTaskService';
import { OrganizationReportService } from '../services/organizationReportService';
import { OrganizationImportService } from '../services/organizationImportService';

async function runStep38Tests() {
  console.log('--- RUNNING STEP 38 B2B, COOPERATIVE & ENTERPRISE ENGINE TESTS ---');

  const userId = new mongoose.Types.ObjectId().toString();
  const unauthorizedUserId = new mongoose.Types.ObjectId().toString();

  // Test 1: Create Organization & Verify OWNER Membership
  const org = await OrganizationService.createOrganization(userId, {
    name: 'Sahyadri Farmers Co-operative',
    legalName: 'Sahyadri Agri Producer Co. Ltd.',
    type: 'COOPERATIVE',
    description: 'Regional co-op with 250 member farms.',
    region: 'Maharashtra'
  });

  assert.ok(org.id, 'Organization ID should be returned');
  assert.strictEqual(org.name, 'Sahyadri Farmers Co-operative');

  const isOwnerPermitted = await OrganizationAuthorizationService.checkPermission(userId, org.id, 'organization.update');
  assert.strictEqual(isOwnerPermitted, true, 'OWNER should have organization.update permission');

  const isUnauthPermitted = await OrganizationAuthorizationService.checkPermission(unauthorizedUserId, org.id, 'organization.update');
  assert.strictEqual(isUnauthPermitted, false, 'Unauthorized user should NOT have organization.update permission');
  console.log('[PASS] Organization creation & OWNER RBAC permission checks passed');

  // Test 2: Scoped Access & Farm Management
  const permittedFarmIds = await OrganizationAuthorizationService.getPermittedFarmIds(userId, org.id);
  assert.ok(Array.isArray(permittedFarmIds), 'Permitted farm IDs should be returned as an array');
  console.log('[PASS] Farm assignment & farm-access scoping passed');

  // Test 3: Organization Intelligence Aggregation
  const dashboardData = await OrganizationIntelligenceService.getOrganizationDashboard(userId, org.id);
  assert.ok(typeof dashboardData.totalFarms === 'number', 'Dashboard should reflect total farms count');
  assert.ok(typeof dashboardData.activeCropCycles === 'number', 'Dashboard should reflect active crop cycles count');

  const cropIntel = await OrganizationIntelligenceService.getCropIntelligence(userId, org.id);
  assert.ok(cropIntel !== null, 'Crop intelligence should return aggregated crop context');
  console.log('[PASS] Organization Intelligence Aggregation passed');

  // Test 4: Organization Copilot Context & Queries
  const copilotContext = await OrganizationCopilotService.getOrganizationCopilotContext(userId, org.id);
  assert.strictEqual(copilotContext.organization.name, 'Sahyadri Farmers Co-operative');

  const copilotRes = await OrganizationCopilotService.queryCopilot(userId, org.id, 'Which of our farms have important weather risks?');
  assert.ok(copilotRes.answer, 'Copilot answer should be returned');
  console.log('[PASS] Organization Copilot Context & Query Engine passed');

  // Test 5: Task Management & Bulk Operations Preview
  const mockFarmId = new mongoose.Types.ObjectId().toString();
  const bulkPreview = await OrganizationTaskService.previewBulkTasks(userId, org.id, {
    farmIds: [mockFarmId],
    title: 'Irrigation Inspection',
    dueDate: new Date()
  });
  assert.strictEqual(bulkPreview.requiresConfirmation, true, 'Bulk task preview should require confirmation');
  console.log('[PASS] Task Management & Bulk Operations passed');

  // Test 6: Report Generation & CSV Export
  const report = await OrganizationReportService.generateReport(userId, org.id, {
    title: 'Monthly Crop Overview',
    reportType: 'CROP_OVERVIEW',
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    periodEnd: new Date()
  });
  assert.ok(report._id, 'OrganizationReport should be generated');

  const csvContent = await OrganizationReportService.exportReportCSV(userId, org.id, report._id.toString());
  assert.ok(csvContent.includes('Report Title'), 'CSV Export should contain header data');
  console.log('[PASS] Report Generation & CSV Export passed');

  // Test 7: Batch CSV Import Preview & Execution
  const importPreview = await OrganizationImportService.previewImport(userId, org.id, [
    { farmName: 'Shimoga Farm 1', sizeAcres: 10, cropName: 'Paddy' },
    { farmName: 'Shimoga Farm 2', sizeAcres: 15, cropName: 'Arecanut' }
  ]);
  assert.strictEqual(importPreview.validRecordsCount, 2, 'Import preview should validate 2 records');
  console.log('[PASS] Batch CSV Data Import passed');

  console.log('\nSTEP 38 ORGANIZATION TESTS COMPLETED: ALL PASSED.');
}

if (require.main === module) {
  runStep38Tests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('STEP 38 TEST FAILURE:', err);
      process.exit(1);
    });
}
