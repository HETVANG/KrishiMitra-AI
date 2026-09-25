import { Request, Response } from 'express';
import { ProviderRegistry, DEFAULT_PLATFORM_PROVIDERS } from '../services/providers/ProviderRegistry';
import { ProviderHealthService } from '../services/providers/ProviderHealthService';
import { ProviderConfigService } from '../services/providers/ProviderConfigService';
import { Provider } from '../models/Provider';
import { ProviderLog } from '../models/ProviderLog';

export class ProviderController {
  /**
   * List all providers with health status and summary stats (Admin only)
   */
  static async getProviders(req: Request, res: Response): Promise<void> {
    try {
      const countryCode = (req.query.countryCode as string) || 'IN';
      const type = req.query.type as any;

      const providers = await ProviderRegistry.getProviders(type, countryCode, true);
      const healthRecords = ProviderHealthService.getAllHealthRecords();
      const healthMap = new Map(healthRecords.map(h => [h.providerId, h]));

      let dbDocs: any[] = [];
      try {
        dbDocs = await Provider.find({}).lean();
      } catch (e) {
        console.warn('[ProviderController] DB query warning:', e);
      }
      const dbMap = new Map(dbDocs.map(d => [d._id.toString(), d]));
      const slugMap = new Map(dbDocs.map(d => [d.slug, d]));

      const enriched = providers.map(p => {
        const health: any = healthMap.get(p.id) || healthMap.get(p.slug) || {
          status: 'HEALTHY',
          responseTimeMs: 120,
          failureCount: 0,
          circuitBreakerOpen: false,
          lastHealthCheck: new Date(),
          lastSuccessfulRequest: new Date()
        };
        const config = ProviderConfigService.getProviderConfig(p.id);
        const dbDoc = dbMap.get(p.id) || slugMap.get(p.slug) || dbDocs.find(d => d.slug === p.slug || d.slug === p.id || d.name === p.name);
        const isEnabled = dbDoc ? (dbDoc.enabled !== false && dbDoc.status !== 'INACTIVE') : true;

        return {
          ...p,
          id: dbDoc ? dbDoc._id.toString() : p.id,
          enabled: isEnabled,
          status: isEnabled ? (dbDoc?.status || p.status || 'ACTIVE') : 'INACTIVE',
          priority: dbDoc?.priority || 1,
          timeoutMs: dbDoc?.timeoutMs || 5000,
          cacheTTL: dbDoc?.cacheTTL || 3600,
          baseUrl: dbDoc?.baseUrl || '',
          lastCheckedAt: dbDoc?.lastCheckedAt || health.lastHealthCheck,
          lastSuccessfulAt: dbDoc?.lastSuccessfulAt || health.lastSuccessfulRequest,
          lastSyncAt: dbDoc?.lastSyncAt,
          lastError: dbDoc?.lastError || '',
          health,
          isConfigured: config.isConfigured
        };
      });

      // Calculate aggregate stats
      const stats = {
        total: enriched.length,
        healthy: enriched.filter(p => p.enabled && (p.health?.status === 'HEALTHY' || p.health?.status === 'AVAILABLE')).length,
        degraded: enriched.filter(p => p.enabled && p.health?.status === 'DEGRADED').length,
        offline: enriched.filter(p => p.enabled && (p.health?.status === 'UNREACHABLE' || p.health?.status === 'UNAVAILABLE' || (p.health?.status as string) === 'FAILED')).length,
        disabled: enriched.filter(p => !p.enabled).length
      };

      res.status(200).json({
        success: true,
        count: enriched.length,
        countryCode,
        stats,
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
      } else {
        dbProvider = await Provider.findOne({ slug: id }).lean();
      }

      res.status(200).json({
        success: true,
        providerId: id,
        provider: dbProvider,
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

  /**
   * Execute real connection test for provider (Admin only)
   */
  static async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminName = (req as any).user?.name || (req as any).user?.email || 'Admin';

      const result = await ProviderHealthService.testProviderConnection(id, adminName);
      res.status(200).json({
        success: result.success,
        providerId: id,
        result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Test connection failed' });
    }
  }

  /**
   * Trigger data synchronization for supported provider (Admin only)
   */
  static async syncProvider(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminName = (req as any).user?.name || (req as any).user?.email || 'Admin';

      const result = await ProviderHealthService.syncProviderData(id, adminName);
      res.status(200).json({
        success: result.success,
        supported: result.supported,
        message: result.message,
        lastSyncAt: result.lastSyncAt
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Synchronization failed' });
    }
  }

  /**
   * Helper to find a provider document by ID, slug, or name, seeding if missing
   */
  private static async findProviderDoc(id: string) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const p = await Provider.findById(id);
      if (p) return p;
    }
    const slugNormalized = id.replace(/_/g, '-');
    let p = await Provider.findOne({
      $or: [{ slug: id }, { slug: slugNormalized }, { name: id }]
    });
    if (p) return p;

    const defaultDef = DEFAULT_PLATFORM_PROVIDERS.find(def => def.id === id || def.slug === id || def.slug === slugNormalized);
    if (defaultDef) {
      p = await Provider.create({
        name: defaultDef.name,
        slug: defaultDef.slug,
        providerType: defaultDef.providerType,
        description: defaultDef.description,
        organizationType: defaultDef.organizationType,
        country: defaultDef.country,
        supportedCountries: defaultDef.supportedCountries,
        capabilities: defaultDef.capabilities,
        status: defaultDef.status || 'ACTIVE',
        verificationStatus: defaultDef.verificationStatus,
        documentationUrl: defaultDef.documentationUrl,
        dataFreshness: defaultDef.dataFreshness,
        enabled: true
      });
      return p;
    }
    return null;
  }

  /**
   * Update provider configuration (Admin only)
   */
  static async updateProvider(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, region, capabilities, priority, timeoutMs, cacheTTL, baseUrl, enabled } = req.body;
      const adminName = (req as any).user?.name || (req as any).user?.email || 'Admin';

      const provider = await ProviderController.findProviderDoc(id);

      if (!provider) {
        res.status(404).json({ success: false, message: 'Provider not found' });
        return;
      }

      if (name !== undefined) provider.name = name;
      if (description !== undefined) provider.description = description;
      if (region !== undefined) provider.country = region;
      if (capabilities !== undefined) provider.capabilities = capabilities;
      if (priority !== undefined) provider.priority = priority;
      if (timeoutMs !== undefined) provider.timeoutMs = timeoutMs;
      if (cacheTTL !== undefined) provider.cacheTTL = cacheTTL;
      if (baseUrl !== undefined) provider.baseUrl = baseUrl;
      if (enabled !== undefined) {
        provider.enabled = Boolean(enabled);
        provider.status = provider.enabled ? 'ACTIVE' : 'INACTIVE';
      }

      await provider.save();

      await ProviderLog.create({
        providerId: provider._id.toString(),
        providerName: provider.name,
        action: 'CONFIG_UPDATE',
        status: 'SUCCESS',
        httpStatus: 200,
        message: 'Provider configuration updated by administrator',
        adminUser: adminName,
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Provider settings updated successfully',
        provider
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update provider' });
    }
  }

  /**
   * Toggle provider enabled/disabled status (Admin only)
   */
  static async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { enabled } = req.body;
      const adminName = (req as any).user?.name || (req as any).user?.email || 'Admin';

      const provider = await ProviderController.findProviderDoc(id);

      if (!provider) {
        res.status(404).json({ success: false, message: 'Provider not found' });
        return;
      }

      provider.enabled = Boolean(enabled);
      provider.status = provider.enabled ? 'ACTIVE' : 'INACTIVE';
      await provider.save();

      await ProviderLog.create({
        providerId: provider._id.toString(),
        providerName: provider.name,
        action: 'STATUS_CHANGE',
        status: provider.enabled ? 'SUCCESS' : 'DISABLED',
        httpStatus: 200,
        message: `Provider status set to ${provider.enabled ? 'ENABLED' : 'DISABLED'}`,
        adminUser: adminName,
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: `Provider ${provider.name} is now ${provider.enabled ? 'ENABLED' : 'DISABLED'}`,
        enabled: provider.enabled,
        provider: {
          id: provider._id.toString(),
          name: provider.name,
          enabled: provider.enabled,
          status: provider.status
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to toggle status' });
    }
  }

  /**
   * Get operational logs for a provider (Admin only)
   */
  static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const logs = await ProviderLog.find({
        $or: [{ providerId: id }, { providerName: new RegExp(id, 'i') }]
      }).sort({ timestamp: -1 }).limit(50).lean();

      res.status(200).json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch logs' });
    }
  }

  /**
   * Get health check history timeline for a provider (Admin only)
   */
  static async getHealthHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = await ProviderLog.find({
        $or: [{ providerId: id }, { providerName: new RegExp(id, 'i') }],
        action: 'TEST_CONNECTION'
      }).sort({ timestamp: -1 }).limit(30).lean();

      res.status(200).json({
        success: true,
        count: history.length,
        history
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch health history' });
    }
  }

  /**
   * Create a new custom provider in registry (Admin only)
   */
  static async createProvider(req: Request, res: Response): Promise<void> {
    try {
      const { name, providerType, description, country, capabilities, baseUrl, timeoutMs } = req.body;
      const adminName = (req as any).user?.name || (req as any).user?.email || 'Admin';

      if (!name || !providerType) {
        res.status(400).json({ success: false, message: 'Provider name and providerType are required' });
        return;
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const existing = await Provider.findOne({ slug });
      if (existing) {
        res.status(400).json({ success: false, message: 'Provider with this name/slug already exists' });
        return;
      }

      const provider = await Provider.create({
        name,
        slug,
        providerType,
        description: description || '',
        country: country || 'IN',
        capabilities: capabilities || {},
        baseUrl: baseUrl || '',
        timeoutMs: timeoutMs || 5000,
        enabled: true,
        status: 'ACTIVE',
        verificationStatus: 'UNVERIFIED'
      });

      await ProviderLog.create({
        providerId: provider._id.toString(),
        providerName: provider.name,
        action: 'CREATE',
        status: 'SUCCESS',
        httpStatus: 201,
        message: 'New provider created in registry',
        adminUser: adminName,
        timestamp: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Provider created successfully',
        provider
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create provider' });
    }
  }
}
