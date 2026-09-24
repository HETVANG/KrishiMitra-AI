import mongoose from 'mongoose';
import { OrganizationAuthorizationService } from './organizationAuthorizationService';
import { Farm } from '../models/Farm';
import { CropCycle } from '../models/CropCycle';

export interface ImportFarmRecord {
  farmName: string;
  sizeAcres: number;
  soilType?: string;
  state?: string;
  district?: string;
  cropName?: string;
}

export class OrganizationImportService {
  /**
   * Preview farm/crop import records from CSV/JSON
   */
  static async previewImport(
    userId: string,
    organizationId: string,
    records: ImportFarmRecord[]
  ) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.farms.manage');

    const validRecords: ImportFarmRecord[] = [];
    const errors: Array<{ line: number; message: string }> = [];

    records.forEach((rec, idx) => {
      if (!rec.farmName || rec.farmName.trim().length === 0) {
        errors.push({ line: idx + 1, message: 'Farm name is required.' });
        return;
      }
      if (!rec.sizeAcres || rec.sizeAcres <= 0) {
        errors.push({ line: idx + 1, message: 'Valid farm size in acres is required.' });
        return;
      }
      validRecords.push({
        farmName: rec.farmName.trim(),
        sizeAcres: Number(rec.sizeAcres),
        soilType: rec.soilType || 'Black Soil',
        state: rec.state || 'Maharashtra',
        district: rec.district || 'Pune',
        cropName: rec.cropName || ''
      });
    });

    return {
      totalRecords: records.length,
      validRecordsCount: validRecords.length,
      errorsCount: errors.length,
      validRecordsPreview: validRecords.slice(0, 5),
      errors
    };
  }

  /**
   * Execute validated farm/crop import records
   */
  static async executeImport(
    userId: string,
    organizationId: string,
    records: ImportFarmRecord[]
  ) {
    await OrganizationAuthorizationService.requirePermission(userId, organizationId, 'organization.farms.manage');

    const createdFarms: any[] = [];
    const createdCrops: any[] = [];

    for (const rec of records) {
      if (!rec.farmName || !rec.sizeAcres) continue;

      const farm = await Farm.create({
        user: userId,
        name: rec.farmName,
        size: rec.sizeAcres,
        soilType: rec.soilType || 'Black Soil',
        waterSource: 'Canal',
        state: rec.state || 'Maharashtra',
        district: rec.district || 'Pune',
        countryCode: 'IN',
        countryName: 'India',
        organization: organizationId,
        status: 'ACTIVE'
      });
      createdFarms.push(farm);

      if (rec.cropName && rec.cropName.trim().length > 0) {
        const crop = await CropCycle.create({
          user: userId,
          farm: farm._id,
          cropName: rec.cropName.trim(),
          plantingDate: new Date(),
          currentGrowthStage: 'VEGETATIVE',
          status: 'ACTIVE'
        });
        createdCrops.push(crop);
      }
    }

    return {
      success: true,
      importedFarmsCount: createdFarms.length,
      importedCropCyclesCount: createdCrops.length
    };
  }
}
