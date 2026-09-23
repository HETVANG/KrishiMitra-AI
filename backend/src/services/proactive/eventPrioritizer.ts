import { ProactiveEvent, EventPriority } from './proactiveEventTypes';

export class EventPrioritizer {
  /**
   * Calculate exact priority level based on severity, confidence, and freshness
   */
  static prioritize(event: ProactiveEvent): EventPriority {
    // Critical safety events (frost, extreme heat, outbreak) remain CRITICAL if confidence >= 0.7
    if (event.severity === 'CRITICAL' && event.confidence >= 0.7) {
      return 'CRITICAL';
    }

    // High severity events with high confidence map to HIGH
    if (event.severity === 'HIGH' && event.confidence >= 0.8) {
      return 'HIGH';
    }

    // Moderate severity events map to MEDIUM
    if (event.severity === 'MODERATE' || (event.severity === 'HIGH' && event.confidence < 0.8)) {
      return 'MEDIUM';
    }

    // Stale data or low confidence downgrades priority to LOW or INFO
    if (event.freshness === 'STALE' || event.confidence < 0.6) {
      return 'LOW';
    }

    if (event.severity === 'LOW') {
      return 'INFO';
    }

    return 'MEDIUM';
  }
}
