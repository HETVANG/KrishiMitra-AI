import { ProviderDefinition, ProviderRegistry } from './ProviderRegistry';
import { ProviderType } from '../../models/Provider';

export class ProviderCapabilityService {
  /**
   * Find all active providers supporting a specific capability for a given region
   */
  static async findProvidersWithCapability(
    capability: string,
    providerType?: ProviderType,
    countryCode: string = 'IN'
  ): Promise<ProviderDefinition[]> {
    const providers = await ProviderRegistry.getProviders(providerType, countryCode);
    return providers.filter(p => p.capabilities && p.capabilities[capability] === true);
  }

  /**
   * Check if a specific provider supports a capability
   */
  static hasCapability(provider: ProviderDefinition, capability: string): boolean {
    return Boolean(provider.capabilities && provider.capabilities[capability] === true);
  }
}
