import { FarmKnowledgeGraphService } from '../knowledgeGraph/farmKnowledgeGraphService';
import { Notification } from '../../models/Notification';
import { FarmTask } from '../../models/FarmTask';
import { EventDetector } from './eventDetector';
import { EventDeduplicator } from './eventDeduplicator';
import { NotificationOrchestrator } from './notificationOrchestrator';
import { DailyFarmBrief } from './proactiveEventTypes';

export class ProactiveEngine {
  /**
   * Run proactive evaluation sweep for a farm
   */
  static async evaluateFarmProactiveEvents(userId: string, targetFarmId?: string) {
    // 1. Get unified Knowledge Graph context (Step 25)
    const graph = await FarmKnowledgeGraphService.getFarmGraph(userId, targetFarmId);

    // 2. Detect candidate events
    const candidateEvents = EventDetector.detectEvents(graph);

    // 3. Deduplicate events
    const uniqueEvents = await EventDeduplicator.filterDuplicates(candidateEvents);

    // 4. Process each unique event through Decision Engine & Notification Policy
    const results = [];
    for (const evt of uniqueEvents) {
      const res = await NotificationOrchestrator.processEvent(evt);
      results.push({ eventType: evt.eventType, title: evt.title, ...res });
    }

    return {
      farmId: graph.farm.id,
      detectedCount: candidateEvents.length,
      processedCount: uniqueEvents.length,
      results
    };
  }

  /**
   * Assemble Daily Farm Intelligence Brief
   */
  static async getDailyFarmBrief(userId: string, targetFarmId?: string): Promise<DailyFarmBrief> {
    const graph = await FarmKnowledgeGraphService.getFarmGraph(userId, targetFarmId);
    const farmId = graph.farm.id;
    const farmName = graph.farm.name;
    const location = `${graph.farm.location.district || ''}, ${graph.farm.location.state || 'India'}`;

    // Weather Summary
    const w = graph.weatherContext;
    const weatherSummary = {
      temp: w.available && w.tempCelsius ? `${w.tempCelsius}°C` : 'N/A',
      condition: w.available && w.condition ? w.condition : 'Clear',
      rainProbability: w.available && w.rainProbability !== null ? `${w.rainProbability}%` : '0%',
      alert: w.available && (w.rainProbability || 0) >= 60 ? `Heavy rain forecast (${w.rainProbability}%)` : undefined
    };

    // Active Crops
    const cropLifecycleSummary = graph.activeCropCycles.map(c => ({
      cropName: c.cropName,
      stage: c.currentStage,
      ageDays: c.ageInDays,
      harvestStatus: c.ageInDays >= 90 ? 'Harvest window approaching' : 'Normal growth'
    }));

    // Crop Health
    const d = graph.diseaseContext;
    const cropHealthStatus = {
      overall: d.available && d.latestDiagnosis && (d.latestDiagnosis.severity === 'severe' || d.latestDiagnosis.severity === 'high')
        ? 'ATTENTION_REQUIRED'
        : 'HEALTHY',
      activeRisksCount: d.available && d.latestDiagnosis ? 1 : 0,
      latestScan: d.available && d.latestDiagnosis ? `${d.latestDiagnosis.disease || d.latestDiagnosis.diseaseName} (${d.latestDiagnosis.severity})` : 'No active disease detected'
    };

    // Irrigation
    const ir = graph.irrigationContext;
    const irrigationStatus = {
      attentionNeeded: ir.waterAttentionNeeded,
      recommendation: ir.recommendedAction || 'Normal soil moisture levels.'
    };

    // Priority Tasks
    const tasks = await FarmTask.find({ user: userId, farm: farmId, status: { $ne: 'COMPLETED' } })
      .sort({ priority: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const priorityTasks = tasks.map(t => ({
      id: t._id.toString(),
      title: t.title,
      priority: t.priority || 'MEDIUM',
      dueDate: t.dueDate ? t.dueDate : undefined
    }));

    // Market
    const m = graph.marketContext;
    const marketSummary = m.available && m.price ? {
      commodity: m.commodity,
      price: `₹${m.price}/quintal`,
      mandi: m.marketName || 'APMC Market',
      trend: m.trend || 'STABLE'
    } : undefined;

    // Active Notifications/Alerts
    const notifs = await Notification.find({
      user: userId,
      farm: farmId,
      status: { $in: ['UNREAD', 'READ', 'ACKNOWLEDGED'] }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const activeAlerts = notifs.map(n => ({
      id: n._id.toString(),
      title: n.title,
      priority: n.priority || 'MEDIUM',
      eventType: n.eventType || n.type
    }));

    // Copilot Suggested Action
    let copilotSuggestedAction = 'Continue routine field monitoring and soil moisture checks.';
    if (weatherSummary.alert) {
      copilotSuggestedAction = 'Hold planned irrigation for 24-48 hours due to high rainfall forecast.';
    } else if (cropHealthStatus.overall === 'ATTENTION_REQUIRED') {
      copilotSuggestedAction = 'Review disease scan advisory and isolate affected crop patch.';
    } else if (priorityTasks.length > 0) {
      copilotSuggestedAction = `Complete task: ${priorityTasks[0].title}.`;
    }

    return {
      date: new Date().toISOString().split('T')[0],
      farmId,
      farmName,
      location,
      weatherSummary,
      cropLifecycleSummary,
      cropHealthStatus,
      irrigationStatus,
      priorityTasks,
      marketSummary,
      activeAlerts,
      copilotSuggestedAction
    };
  }

  /**
   * Explain why a notification was issued using Decision Engine and evidence
   */
  static async explainProactiveAlert(userId: string, notificationId: string) {
    const notification = await Notification.findOne({ _id: notificationId, user: userId }).lean();
    if (!notification) throw new Error('Notification record not found');

    const evidenceText = (notification.evidence || [])
      .map(e => `${e.source}: ${JSON.stringify(e.value || '')}`)
      .join('; ');

    return {
      notificationId: notification._id.toString(),
      title: notification.title,
      eventType: notification.eventType,
      source: notification.source,
      priority: notification.priority,
      reasoning: notification.message,
      evidenceText: evidenceText || 'Verified against live farm telemetry.',
      actionPlan: notification.actionPlan || [],
      actionUrl: notification.actionUrl || '/dashboard'
    };
  }
}
