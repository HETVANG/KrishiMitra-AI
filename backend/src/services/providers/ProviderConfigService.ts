export interface ProviderConfig {
  providerId: string;
  type: string;
  country: string;
  capabilities: string[];
  priority: number;
  rateLimitPerMin: number;
  timeoutMs: number;
  retryAttempts: number;
  isConfigured: boolean;
}

export class ProviderConfigService {
  /**
   * Check if a provider has active credentials in environment variables
   */
  static isProviderConfigured(providerId: string): boolean {
    switch (providerId) {
      case 'agroweather_india':
        return true; // Uses public Open-Meteo & IMD regional endpoints
      case 'agmarknet_official':
        return true; // Uses public Govt Agmarknet portal feed & local cache
      case 'icar_national':
        return true; // Uses ICAR research guidelines & local knowledge base
      case 'digital_soil_grid_in':
        return true; // Uses SoilGrids public API & ICAR soil survey
      case 'expert_consultation_network':
        return true; // Uses internal certified agronomist network
      default:
        // Check generic env key pattern PROVIDER_{ID}_KEY
        const envKey = `PROVIDER_${providerId.toUpperCase()}_API_KEY`;
        return Boolean(process.env[envKey]);
    }
  }

  /**
   * Get safe provider runtime configuration (NO SECRETS RETURNED)
   */
  static getProviderConfig(providerId: string): ProviderConfig {
    const isConfigured = this.isProviderConfigured(providerId);

    return {
      providerId,
      type: 'AGRICULTURAL_INTELLIGENCE',
      country: 'IN',
      capabilities: ['PRIMARY_FEED'],
      priority: 1,
      rateLimitPerMin: 120,
      timeoutMs: 5000,
      retryAttempts: 2,
      isConfigured
    };
  }
}
