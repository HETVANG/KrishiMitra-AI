export type HealthState = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';

export interface ProviderHealthRecord {
  providerId: string;
  providerName: string;
  providerType: string;
  status: HealthState;
  lastSuccessfulRequest?: Date;
  lastFailure?: Date;
  failureCount: number;
  responseTimeMs: number;
  circuitBreakerOpen: boolean;
  errorCategory?: string;
  lastHealthCheck: Date;
}

const healthRegistry: Map<string, ProviderHealthRecord> = new Map();

export class ProviderHealthService {
  /**
   * Get health record for a provider
   */
  static getHealthRecord(providerId: string, providerName: string = 'Provider', providerType: string = 'SERVICE'): ProviderHealthRecord {
    if (!healthRegistry.has(providerId)) {
      healthRegistry.set(providerId, {
        providerId,
        providerName,
        providerType,
        status: 'HEALTHY',
        failureCount: 0,
        responseTimeMs: 120,
        circuitBreakerOpen: false,
        lastHealthCheck: new Date()
      });
    }
    return healthRegistry.get(providerId)!;
  }

  /**
   * Record a successful provider request
   */
  static recordSuccess(providerId: string, providerName?: string, providerType?: string, responseTimeMs: number = 100) {
    const record = this.getHealthRecord(providerId, providerName, providerType);
    record.lastSuccessfulRequest = new Date();
    record.failureCount = 0;
    record.responseTimeMs = Math.round(responseTimeMs);
    record.status = responseTimeMs > 2500 ? 'DEGRADED' : 'HEALTHY';
    record.circuitBreakerOpen = false;
    record.errorCategory = undefined;
    record.lastHealthCheck = new Date();
  }

  /**
   * Record a failed provider request
   */
  static recordFailure(providerId: string, providerName?: string, providerType?: string, errorMsg?: string) {
    const record = this.getHealthRecord(providerId, providerName, providerType);
    record.lastFailure = new Date();
    record.failureCount += 1;
    record.errorCategory = errorMsg ? errorMsg.substring(0, 100) : 'Provider Request Failure';
    record.lastHealthCheck = new Date();

    if (record.failureCount >= 3) {
      record.status = 'UNAVAILABLE';
      record.circuitBreakerOpen = true;
    } else {
      record.status = 'DEGRADED';
    }
  }

  /**
   * Get health report of all registered platform providers
   */
  static getAllHealthRecords(): ProviderHealthRecord[] {
    return Array.from(healthRegistry.values());
  }

  /**
   * Check if circuit breaker is open
   */
  static isCircuitBreakerOpen(providerId: string): boolean {
    const record = healthRegistry.get(providerId);
    return record ? record.circuitBreakerOpen : false;
  }
}
