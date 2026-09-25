import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CropLifecycleService } from '../services/lifecycle/cropLifecycleService';
import { Farm } from '../models/Farm';

export class CropCycleController {
  /**
   * Create new Crop Cycle
   */
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const { farmId, field, fieldName, cropName, variety, plantingDate, expectedHarvestDate, area, areaAcres, areaUnit, seedSource, notes } = req.body;
      if (!cropName || !plantingDate) {
        return res.status(400).json({ success: false, message: 'Crop name and planting date are required.' });
      }

      let targetFarmId = farmId;
      if (!targetFarmId) {
        let existingFarm = await Farm.findOne({ user: req.user._id });
        if (!existingFarm) {
          existingFarm = await Farm.create({
            user: req.user._id,
            name: 'Main Farm',
            size: Number(areaAcres || area) || 2.5,
            soilType: 'Alluvial',
            waterSource: 'Borewell'
          });
        }
        targetFarmId = existingFarm._id.toString();
      }

      const cycle = await CropLifecycleService.createCropCycle(req.user._id.toString(), {
        farmId: targetFarmId,
        field: field || fieldName || 'Main Field',
        cropName,
        variety,
        plantingDate,
        expectedHarvestDate,
        area: Number(area || areaAcres) || 1,
        areaUnit,
        seedSource,
        notes
      });

      return res.status(201).json({ success: true, cycle, data: cycle });
    } catch (error: any) {
      console.error('[CropCycleController.create] Error:', error);
      return res.status(400).json({ success: false, message: error.message || 'Failed to create crop cycle' });
    }
  }

  /**
   * Get user's Crop Cycles list
   */
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const farmId = req.query.farmId as string | undefined;
      const status = req.query.status as string | undefined;

      const cycles = await CropLifecycleService.getUserCropCycles(req.user._id.toString(), farmId, status);
      return res.json({ success: true, cycles, data: cycles });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complete Crop Cycle Intelligence (weather, risk, irrigation, disease, market, timeline)
   */
  static async getIntelligence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const cycleId = req.params.id;
      const intelligence = await CropLifecycleService.getCropCycleIntelligence(req.user._id.toString(), cycleId);
      return res.json({ success: true, ...intelligence });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  /**
   * Update Crop Cycle / Growth Stage
   */
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const cycleId = req.params.id;
      const updated = await CropLifecycleService.updateCropCycle(req.user._id.toString(), cycleId, req.body);
      return res.json({ success: true, cycle: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Log Farm Activity on a Crop Cycle
   */
  static async logActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const cycleId = req.params.id;
      const { type, title, description, date, metadata } = req.body;
      if (!type || !title) {
        return res.status(400).json({ success: false, message: 'Activity type and title are required.' });
      }

      const activity = await CropLifecycleService.logActivity(req.user._id.toString(), cycleId, {
        type,
        title,
        description,
        date,
        metadata
      });

      return res.status(201).json({ success: true, activity });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Record Harvest event
   */
  static async recordHarvest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const cycleId = req.params.id;
      const { quantity, unit, grade, sellingMarket, notes, completeCycle, harvestDate } = req.body;
      if (typeof quantity !== 'number') {
        return res.status(400).json({ success: false, message: 'Harvest quantity is required.' });
      }

      const updated = await CropLifecycleService.recordHarvest(req.user._id.toString(), cycleId, {
        harvestDate,
        quantity,
        unit,
        grade,
        sellingMarket,
        notes,
        completeCycle: Boolean(completeCycle)
      });

      return res.json({ success: true, cycle: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Complete Crop Cycle
   */
  static async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

      const cycleId = req.params.id;
      const updated = await CropLifecycleService.completeCropCycle(req.user._id.toString(), cycleId);
      return res.json({ success: true, cycle: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
