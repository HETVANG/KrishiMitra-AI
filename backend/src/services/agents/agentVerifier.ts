import { FarmTask } from '../../models/FarmTask';
import { Notification } from '../../models/Notification';

export class AgentVerifier {
  /**
   * Verify that an executed action actually produced expected database outcome
   */
  static async verifyResult(toolName: string, result: any): Promise<boolean> {
    if (!result) return false;

    try {
      if (toolName === 'createFarmTask' || toolName === 'requestExpertConsultation') {
        const taskId = result._id || result.id;
        if (!taskId) return false;
        const exists = await FarmTask.exists({ _id: taskId });
        return !!exists;
      }

      if (toolName === 'createNotification') {
        const notifId = result._id || result.id;
        if (!notifId) return false;
        const exists = await Notification.exists({ _id: notifId });
        return !!exists;
      }

      // Read-only or standard tools verify automatically if result is present
      return true;
    } catch {
      return false;
    }
  }
}
