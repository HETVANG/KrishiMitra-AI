import { NotificationPreference } from '../../models/NotificationPreference';
import { ProactiveEvent } from './proactiveEventTypes';

export class NotificationPolicyEngine {
  /**
   * Evaluate whether a proactive event should produce a user-facing notification according to user preferences and quiet hours
   */
  static async evaluatePolicy(event: ProactiveEvent): Promise<{
    shouldNotify: boolean;
    reason: string;
    inQuietHours: boolean;
  }> {
    const userId = event.userId;
    let pref: any = null;
    try {
      pref = await NotificationPreference.findOne({ user: userId }).lean();
    } catch {
      pref = null;
    }

    // Default policy if user has no preferences recorded yet (all enabled, no quiet hours)
    if (!pref) {
      return { shouldNotify: true, reason: 'Default notification policy applied.', inQuietHours: false };
    }

    // 1. Check Category Preference
    const categoryAllowed = this.checkCategoryPreference(pref, event.category, event.eventType);
    if (!categoryAllowed) {
      return {
        shouldNotify: false,
        reason: `Notification category disabled by user preferences for ${event.category}.`,
        inQuietHours: false
      };
    }

    // 2. Check Quiet Hours
    const inQuietHours = this.isQuietHours(pref.quietHours);
    if (inQuietHours) {
      if (event.priority === 'CRITICAL' && pref.quietHours?.bypassForCritical) {
        return {
          shouldNotify: true,
          reason: 'CRITICAL safety alert bypassed quiet hours policy.',
          inQuietHours: true
        };
      } else {
        return {
          shouldNotify: false,
          reason: `Event held due to active quiet hours (${pref.quietHours?.start} - ${pref.quietHours?.end}).`,
          inQuietHours: true
        };
      }
    }

    return { shouldNotify: true, reason: 'Notification permitted by user policy.', inQuietHours: false };
  }

  private static checkCategoryPreference(pref: any, category: string, eventType: string): boolean {
    const cats = pref.categories || {};
    if (category === 'IRRIGATION_DECISION' && cats.irrigationAlerts === false) return false;
    if ((category === 'WEATHER_RESPONSE_DECISION' || eventType.includes('RAIN') || eventType.includes('HEAT')) && cats.weatherAlerts === false) return false;
    if ((category === 'DISEASE_RESPONSE_DECISION' || eventType.includes('DISEASE')) && cats.cropHealthAlerts === false) return false;
    if ((category === 'MARKET_INFORMATION_DECISION' || eventType.includes('MARKET')) && cats.marketAlerts === false) return false;
    if ((category === 'HARVEST_DECISION' || eventType.includes('CROP_STAGE')) && cats.cropLifecycleAlerts === false) return false;
    if ((category === 'FARM_TASK_DECISION' || eventType.includes('TASK')) && cats.taskAlerts === false) return false;
    return true;
  }

  private static isQuietHours(quietConfig: any): boolean {
    if (!quietConfig || !quietConfig.enabled) return false;
    try {
      const timezone = quietConfig.timezone || 'Asia/Kolkata';
      const nowStr = new Date().toLocaleString('en-US', { timeZone: timezone, hour12: false });
      const timePart = nowStr.split(', ')[1] || nowStr;
      const [h, m] = timePart.split(':').map(Number);
      const currentMinutes = h * 60 + (m || 0);

      const [sh, sm] = (quietConfig.start || '22:00').split(':').map(Number);
      const startMinutes = sh * 60 + (sm || 0);

      const [eh, em] = (quietConfig.end || '06:00').split(':').map(Number);
      const endMinutes = eh * 60 + (em || 0);

      if (startMinutes > endMinutes) {
        // Overnight quiet hours e.g. 22:00 to 06:00
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      } else {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
    } catch {
      return false;
    }
  }
}
