import { ProactiveEventLog } from '../../models/ProactiveEventLog';
import { Notification } from '../../models/Notification';
import { ProactiveEvent } from './proactiveEventTypes';

export class EventDeduplicator {
  /**
   * Filter out duplicate or redundant events based on fingerprint and active notifications
   */
  static async filterDuplicates(events: ProactiveEvent[]): Promise<ProactiveEvent[]> {
    if (!events || events.length === 0) return [];

    const uniqueEvents: ProactiveEvent[] = [];

    for (const evt of events) {
      // 1. Check ProactiveEventLog for recent event with same fingerprint
      const existingLog = await ProactiveEventLog.findOne({
        user: evt.userId,
        fingerprint: evt.fingerprint,
        status: { $in: ['NOTIFIED', 'ACTION_REQUIRED', 'EVALUATING', 'ACKNOWLEDGED'] },
        expiresAt: { $gt: new Date() }
      }).lean();

      if (existingLog) {
        // Suppress redundant notification unless severity upgraded to CRITICAL
        if (evt.severity === 'CRITICAL' && existingLog.severity !== 'CRITICAL') {
          uniqueEvents.push(evt);
        } else {
          console.log(`[EventDeduplicator] Suppressed duplicate event fingerprint: ${evt.fingerprint}`);
        }
        continue;
      }

      // 2. Check active Notification table for unexpired duplicate
      const existingNotif = await Notification.findOne({
        user: evt.userId,
        fingerprint: evt.fingerprint,
        status: { $ne: 'DISMISSED' },
        createdAt: { $gt: new Date(Date.now() - 6 * 60 * 60 * 1000) } // 6 hour window
      }).lean();

      if (existingNotif) {
        console.log(`[EventDeduplicator] Suppressed duplicate notification fingerprint: ${evt.fingerprint}`);
        continue;
      }

      uniqueEvents.push(evt);
    }

    return uniqueEvents;
  }
}
