import { Request, Response } from 'express';
import { RegionRegistry } from '../config/regions/regionRegistry';
import { RegionalContextService } from '../services/regionalContextService';
import { User } from '../models/User';

export class RegionController {
  /**
   * GET /api/regions/countries
   */
  static async getCountries(_req: Request, res: Response): Promise<void> {
    try {
      const countries = RegionRegistry.getAllCountries();
      res.json({
        success: true,
        count: countries.length,
        data: countries
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/regions/readiness
   */
  static async getReadiness(_req: Request, res: Response): Promise<void> {
    try {
      const countries = RegionRegistry.getAllCountries();
      const evaluations = countries.map(c => RegionRegistry.evaluateCountryReadiness(c.countryCode));
      res.json({
        success: true,
        count: evaluations.length,
        data: evaluations
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/regions/readiness/:countryCode
   */
  static async getReadinessByCountry(req: Request, res: Response): Promise<void> {
    try {
      const code = req.params.countryCode;
      const readiness = RegionRegistry.evaluateCountryReadiness(code);
      res.json({
        success: true,
        data: readiness
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/regions/:countryCode
   */
  static async getCountryByCode(req: Request, res: Response): Promise<void> {
    try {
      const code = req.params.countryCode;
      const config = RegionRegistry.getRegionConfig(code);
      res.json({
        success: true,
        data: config
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/regions/context
   */
  static async getContext(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.query.farmId as string;
      const context = await RegionalContextService.getRegionalContext(userId, farmId);
      res.json({
        success: true,
        data: context
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * PUT /api/regions/context
   */
  static async updateContext(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const {
        countryCode,
        stateName,
        currency,
        temperatureUnit,
        landAreaUnit,
        measurementSystem,
        timezone
      } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // Input Validation & Security
      if (temperatureUnit && !['C', 'F'].includes(temperatureUnit)) {
        res.status(400).json({ success: false, error: 'Invalid temperature unit. Must be C or F.' });
        return;
      }
      if (landAreaUnit && !['acre', 'hectare', 'bigha', 'sq_meter'].includes(landAreaUnit)) {
        res.status(400).json({ success: false, error: 'Invalid land area unit.' });
        return;
      }
      if (measurementSystem && !['metric', 'imperial'].includes(measurementSystem)) {
        res.status(400).json({ success: false, error: 'Invalid measurement system.' });
        return;
      }

      const regConfig = RegionRegistry.getRegionConfig(countryCode || 'IN');

      const existingSettings = user.settings || {};
      const existingReg = (user as any).settings?.regionalPreferences || {};

      const updatedReg = {
        ...existingReg,
        countryCode: regConfig.countryCode,
        countryName: regConfig.countryName,
        ...(stateName && { stateName }),
        currency: currency || regConfig.currency,
        currencySymbol: regConfig.currencySymbol,
        ...(temperatureUnit && { temperatureUnit }),
        ...(landAreaUnit && { landAreaUnit }),
        ...(measurementSystem && { measurementSystem }),
        ...(timezone && { timezone })
      };

      (user as any).settings = {
        ...existingSettings,
        regionalPreferences: updatedReg
      };

      await user.save();

      const context = await RegionalContextService.getRegionalContext(userId);

      res.json({
        success: true,
        message: 'Regional preferences updated successfully.',
        data: context
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

