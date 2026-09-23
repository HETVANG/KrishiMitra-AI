import { Request, Response } from 'express';
import { ProviderRegistry } from '../services/providers/ProviderRegistry';
import { ProviderHealthService } from '../services/providers/ProviderHealthService';
import { ProviderConfigService } from '../services/providers/ProviderConfigService';
import { Provider } from '../models/Provider';

export class ProviderController {
  /**
   * List all providers with health status (Admin only)
   */
  static async getProviders(req: Request, res: Response): Promise<void> {
    try {
      const countryCode = (req.query.countryCode as string) || 'IN';
      const type = req.query.type as any;

      const providers = await ProviderRegistry.getProviders(type, countryCode);
      const healthRecords = ProviderHealthService.getAllHealthRecords();
      const healthMap = new Map(healthRecords.map(h => [h.providerId, h]));

      const enriched = providers.map(p => {
        const health = healthMap.get(p.id) || {
          status: 'HEALTHY',
          responseTimeMs: 120,
          failureCount: 0,
          circuitBreakerOpen: false,
          lastHealthCheck: new Date()
        };
        const config = ProviderConfigService.getProviderConfig(p.id);

        return {
          ...p,
          health,
          isConfigured: config.isConfigured
        };
      });

      res.status(200).json({
        success: true,
        count: enriched.length,
        countryCode,
        providers: enriched
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to list providers' });
    }
  }

  /**
   * Get single provider health and capability details
   */
  static async getProviderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const health = ProviderHealthService.getHealthRecord(id);
      const config = ProviderConfigService.getProviderConfig(id);

      let dbProvider = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        dbProvider = await Provider.findById(id).lean();
      }

      res.status(200).json({
        success: true,
        providerId: id,
        dbProvider,
        health,
        config: {
          providerId: config.providerId,
          type: config.type,
          country: config.country,
          capabilities: config.capabilities,
          priority: config.priority,
          isConfigured: config.isConfigured
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch provider details' });
    }
  }
}
