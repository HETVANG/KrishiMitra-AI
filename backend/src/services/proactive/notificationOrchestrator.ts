import { Notification } from '../../models/Notification';
import { ProactiveEventLog } from '../../models/ProactiveEventLog';
import { DecisionEngine } from '../decisionEngine/decisionEngine';
import { farmEventBus } from '../agents/agentEvents';
import { ProactiveEvent } from './proactiveEventTypes';
import { EventPrioritizer } from './eventPrioritizer';
import { NotificationPolicyEngine } from './notificationPolicy';

export class NotificationOrchestrator {
  /**
   * Process a proactive event through Decision Engine, policy engine, and notification delivery pipeline
   */
  static async processEvent(event: ProactiveEvent): Promise<{
    processed: boolean;
    notificationId?: string;
    decisionId?: string;
    status: string;
    reason: string;
  }> {
    // 1. Calculate Priority
    const priority = EventPrioritizer.prioritize(event);
    event.priority = priority;

    // 2. Evaluate Decision Engine (Step 26 Integration) for consequential events
    let decisionId: string | undefined = undefined;
    let actionPlan: any[] = [];
    try {
      if (['HEAVY_RAIN_DETECTED', 'HEAT_RISK_DETECTED', 'WATER_STRESS_DETECTED', 'DISEASE_RISK_INCREASED', 'HARVEST_WINDOW_APPROACHING'].includes(event.eventType)) {
        const decision = await DecisionEngine.evaluateDecision(event.userId, event.farmId, event.category);
        decisionId = decision.decisionId;
        actionPlan = decision.actionPlan || [];
      }
    } catch (err: any) {
      console.warn('[NotificationOrchestrator] Non-fatal Decision Engine evaluation warning:', err.message);
    }

    // 3. Evaluate User Preferences & Quiet Hours Policy
    const policy = await NotificationPolicyEngine.evaluatePolicy(event);

    if (!policy.shouldNotify) {
      // Log event without sending notification
      await ProactiveEventLog.create({
        eventId: event.eventId,
        user: event.userId,
        farm: event.farmId,
        field: event.fieldId,
        cropCycle: event.cropCycleId,
        eventType: event.eventType,
        source: event.source,
        severity: event.severity,
        priority: event.priority,
        evidence: event.evidence,
        context: event.context,
        detectedAt: event.detectedAt,
        observedAt: event.observedAt,
        freshness: event.freshness,
        confidence: event.confidence,
        expiresAt: event.expiresAt,
        status: 'DISMISSED',
        fingerprint: event.fingerprint,
        decisionId
      });

      return {
        processed: true,
        status: 'HELD_BY_POLICY',
        reason: policy.reason,
        decisionId
      };
    }

    // 4. Create Notification Document
    const notifTypeMap: Record<string, string> = {
      IRRIGATION_DECISION: 'irrigation',
      WEATHER_RESPONSE_DECISION: 'weather',
      DISEASE_RESPONSE_DECISION: 'disease',
      MARKET_INFORMATION_DECISION: 'market',
      HARVEST_DECISION: 'crop_lifecycle',
      FARM_TASK_DECISION: 'task',
      NUTRIENT_DECISION: 'proactive'
    };
    const notifType = notifTypeMap[event.category] || 'proactive';

    const notificationDoc = await Notification.create({
      user: event.userId,
      farm: event.farmId,
      field: event.fieldId,
      cropCycle: event.cropCycleId,
      title: event.title,
      message: event.summary,
      type: notifType,
      eventType: event.eventType,
      priority: event.priority,
      status: 'UNREAD',
      isRead: false,
      source: event.source,
      evidence: event.evidence,
      decisionId,
      actionPlan,
      actionUrl: event.actionUrl || '/dashboard',
      fingerprint: event.fingerprint,
      expiresAt: event.expiresAt ? new Date(event.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // 5. Audit Log Event
    await ProactiveEventLog.create({
      eventId: event.eventId,
      user: event.userId,
      farm: event.farmId,
      field: event.fieldId,
      cropCycle: event.cropCycleId,
      eventType: event.eventType,
      source: event.source,
      severity: event.severity,
      priority: event.priority,
      evidence: event.evidence,
      context: event.context,
      detectedAt: event.detectedAt,
      observedAt: event.observedAt,
      freshness: event.freshness,
      confidence: event.confidence,
      expiresAt: event.expiresAt,
      status: 'NOTIFIED',
      fingerprint: event.fingerprint,
      decisionId,
      notificationId: notificationDoc._id
    });

    // 6. Emit event to Agent Event Bus (Step 22 Integration)
    farmEventBus.emitFarmEvent({
      type: event.eventType as any,
      userId: event.userId,
      farmId: event.farmId,
      timestamp: new Date().toISOString(),
      metadata: {
        notificationId: notificationDoc._id.toString(),
        decisionId,
        priority: event.priority,
        summary: event.summary
      }
    });

    return {
      processed: true,
      notificationId: notificationDoc._id.toString(),
      decisionId,
      status: 'NOTIFIED',
      reason: 'Notification created and dispatched successfully.'
    };
  }
}
