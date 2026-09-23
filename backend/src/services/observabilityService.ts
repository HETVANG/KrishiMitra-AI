import mongoose from 'mongoose';
import { ProviderHealthService } from './providers/ProviderHealthService';

export interface ApplicationTelemetry {
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  database: {
    connected: boolean;
    readyState: number;
    readyStateText: string;
  };
  providers: {
    totalMonitored: number;
    healthyCount: number;
    degradedCount: number;
    unavailableCount: number;
  };
  timestamp: Date;
}

const readyStateTextMap: Record<number, string> = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Connecting',
  3: 'Disconnecting'
};

export class ObservabilityService {
  /**
   * Get real production readiness and telemetry snapshot
   */
  static getTelemetry(): ApplicationTelemetry {
    const memory = process.memoryUsage();
    const readyState = mongoose.connection.readyState;
    const dbConnected = readyState === 1;

    const providerRecords = ProviderHealthService.getAllHealthRecords();
    const healthyCount = providerRecords.filter(p => p.status === 'HEALTHY').length;
    const degradedCount = providerRecords.filter(p => p.status === 'DEGRADED').length;
    const unavailableCount = providerRecords.filter(p => p.status === 'UNAVAILABLE').length;

    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' = 'HEALTHY';
    if (!dbConnected) {
      overallStatus = 'UNAVAILABLE';
    } else if (unavailableCount > 0 || degradedCount > 0) {
      overallStatus = 'DEGRADED';
    }

    return {
      status: overallStatus,
      uptimeSeconds: Math.round(process.uptime()),
      memoryUsageMb: {
        rss: Math.round(memory.rss / (1024 * 1024)),
        heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
        heapUsed: Math.round(memory.heapUsed / (1024 * 1024))
      },
      database: {
        connected: dbConnected,
        readyState,
        readyStateText: readyStateTextMap[readyState] || 'Unknown'
      },
      providers: {
        totalMonitored: providerRecords.length,
        healthyCount,
        degradedCount,
        unavailableCount
      },
      timestamp: new Date()
    };
  }
}
