import { DataFreshness, FreshnessMetadata, SourceType } from './graphTypes';

export class RelationshipResolver {
  /**
   * Calculate data freshness classification based on observation timestamp
   * - FRESH: observed within last 24 hours
   * - RECENT: observed within last 7 days (168 hours)
   * - STALE: observed over 7 days ago
   * - UNKNOWN: timestamp unrecorded or null
   */
  static calculateFreshness(
    dateInput: Date | string | null | undefined,
    source: SourceType,
    freshHours: number = 24,
    recentHours: number = 168
  ): FreshnessMetadata {
    if (!dateInput) {
      return {
        observedAt: new Date(0).toISOString(),
        freshness: 'UNKNOWN',
        confidence: 0.3,
        source
      };
    }

    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    let freshness: DataFreshness = 'STALE';
    let confidence = 0.6;

    if (diffHours <= freshHours) {
      freshness = 'FRESH';
      confidence = 0.95;
    } else if (diffHours <= recentHours) {
      freshness = 'RECENT';
      confidence = 0.8;
    } else {
      freshness = 'STALE';
      confidence = 0.5;
    }

    // Expiry estimation (e.g. 24h for weather/market, 90d for soil)
    const expiresAt = new Date(date.getTime() + freshHours * 60 * 60 * 1000).toISOString();

    return {
      observedAt: date.toISOString(),
      expiresAt,
      freshness,
      confidence,
      source
    };
  }

  /**
   * Calculate crop age in days from planting date
   */
  static calculateCropAgeInDays(plantingDate: Date | string): number {
    const pDate = new Date(plantingDate);
    const now = new Date();
    const diffMs = now.getTime() - pDate.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }
}
