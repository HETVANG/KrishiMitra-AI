import mongoose from 'mongoose';
import { ProductEvent, ProductEventType } from '../../models/ProductEvent';

export interface EventPayload {
  eventType: ProductEventType;
  userId?: string;
  farmId?: string;
  feature: string;
  region?: string;
  countryCode?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export class ProductEventService {
  /**
   * Log product telemetry event asynchronously without blocking API response
   */
  static logEvent(payload: EventPayload): void {
    setImmediate(async () => {
      try {
        if (mongoose.connection.readyState !== 1) return;

        // Privacy filter: Sanitize metadata to remove any potential secrets or sensitive text
        const cleanMetadata = { ...(payload.metadata || {}) };
        delete cleanMetadata.password;
        delete cleanMetadata.token;
        delete cleanMetadata.authorization;
        delete cleanMetadata.keySecret;

        await ProductEvent.create({
          eventType: payload.eventType,
          userId: payload.userId,
          farmId: payload.farmId,
          feature: payload.feature,
          region: payload.region || 'IN',
          countryCode: payload.countryCode || 'IN',
          sessionId: payload.sessionId,
          metadata: cleanMetadata
        });
      } catch (err: any) {
        // Silently capture telemetry warning to avoid affecting core user actions
        console.warn('[ProductEventService] Telemetry log notice:', err.message);
      }
    });
  }

  /**
   * Fetch recent product events (Admin only)
   */
  static async getRecentEvents(limit: number = 50, feature?: string): Promise<any[]> {
    if (mongoose.connection.readyState !== 1) return [];
    try {
      const query: any = {};
      if (feature) query.feature = feature;
      return await ProductEvent.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    } catch (err: any) {
      console.warn('[ProductEventService] Query notice:', err.message);
      return [];
    }
  }
}
