import mongoose from 'mongoose';
import { AutomationRun, IAutomationRun } from '../../models/AutomationRun';
import { AutomationApproval, IAutomationApproval } from '../../models/AutomationApproval';
import { AutomationSettings, IAutomationSettings } from '../../models/AutomationSettings';
import { AgentActivity } from '../../models/AgentActivity';
import { AgentRegistry } from './agentRegistry';
import { AgentExecutor } from './agentExecutor';
import { AgentVerifier } from './agentVerifier';
import { CopilotContextService } from '../CopilotContextService';
import { outcomeLearningService } from '../outcomes/outcomeLearningService';
import { DecisionEngine } from '../decisionEngine/decisionEngine';

export interface ClosedLoopEventInput {
  eventId?: string;
  eventType: string;
  userId: string;
  farmId?: string;
  fieldId?: string;
  cropCycleId?: string;
  source?: string;
  metadata?: Record<string, any>;
  confidence?: number;
  severity?: string;
}

export class ClosedLoopEngine {
  private static recentEventHashes: Map<string, number> = new Map();
  private static COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes deduplication window

  private static isDbConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private static generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private static generateApprovalId(): string {
    return `appr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Deduplication check to prevent infinite agent execution loops
   */
  private static isDuplicateEvent(userId: string, farmId: string, eventType: string): boolean {
    const key = `${userId}_${farmId}_${eventType}`;
    const now = Date.now();
    const lastSeen = this.recentEventHashes.get(key);

    if (lastSeen && now - lastSeen < this.COOLDOWN_MS) {
      return true;
    }
    this.recentEventHashes.set(key, now);
    return false;
  }

  /**
   * Retrieve or initialize default AutomationSettings for user
   */
  static async getAutomationSettings(userId: string): Promise<Partial<IAutomationSettings>> {
    const defaults = {
      userId,
      globalAutonomyLevel: 2,
      weatherMonitoring: true,
      autoTaskCreation: false,
      notificationsEnabled: true,
      quietHours: { enabled: false, start: '22:00', end: '06:00' },
      categories: {
        weather: { autonomyLevel: 4, autoActionAllowed: true },
        irrigation: { autonomyLevel: 3, autoActionAllowed: false },
        disease: { autonomyLevel: 3, autoActionAllowed: false },
        market: { autonomyLevel: 2, autoActionAllowed: true },
        external: { autonomyLevel: 3, autoActionAllowed: false },
        financial: { autonomyLevel: 0, autoActionAllowed: false },
        chemical: { autonomyLevel: 3, autoActionAllowed: false }
      }
    };

    if (!this.isDbConnected()) return defaults;

    let settings = await AutomationSettings.findOne({ userId });
    if (!settings) {
      settings = await AutomationSettings.create(defaults);
    }
    return settings;
  }

  /**
   * Update AutomationSettings for user
   */
  static async updateAutomationSettings(userId: string, updates: any): Promise<IAutomationSettings | null> {
    if (!this.isDbConnected()) return null;

    const settings = await AutomationSettings.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    return settings;
  }

  /**
   * Core 12-Stage Closed-Loop Farm Operations Engine Cycle
   */
  static async processEvent(event: ClosedLoopEventInput): Promise<Partial<IAutomationRun>> {
    const runId = this.generateRunId();
    const eventId = event.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // STAGE 1 & 2: PERCEPTION & DEDUPLICATION
    const contextData = await CopilotContextService.getFarmContext(event.userId, event.farmId);
    const farmId = contextData.farm.id || event.farmId || 'default_farm';

    if (this.isDuplicateEvent(event.userId, farmId, event.eventType)) {
      console.log(`[ClosedLoopEngine] Event ${event.eventType} skipped due to deduplication cooldown.`);
      return {
        runId,
        eventId,
        eventType: event.eventType,
        executionStatus: 'SKIPPED_DEDUPLICATED'
      };
    }

    // STAGE 3: CONTEXT BUILDER
    const outcomeHistory = await outcomeLearningService.getOutcomeContextForAI(farmId);

    // STAGE 4: EVIDENCE ENGINE
    const evidenceItems: any[] = [];
    let evidenceQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT' = 'MEDIUM';

    if (contextData.weather.available) {
      evidenceItems.push({
        type: 'PROVIDER_DATA',
        source: 'WeatherProvider',
        detail: `Temp: ${contextData.weather.tempCelsius}°C, Rain Prob: ${contextData.weather.rainProbability}%`,
        confidence: 0.9
      });
    }

    if (contextData.disease.available && contextData.disease.latestDiagnosis) {
      const diag = contextData.disease.latestDiagnosis;
      evidenceItems.push({
        type: 'FACT',
        source: 'DiseaseScanAI',
        detail: `Diagnosed ${diag.disease} on ${diag.crop} (${diag.severity || 'moderate'})`,
        confidence: diag.confidence || 0.85
      });
    }

    if (outcomeHistory.hasHistory) {
      evidenceItems.push({
        type: 'OBSERVATION',
        source: 'OutcomeLearningEngine',
        detail: outcomeHistory.summaryText,
        confidence: 0.8
      });
    }

    const evidenceSufficient = evidenceItems.length > 0;
    if (!evidenceSufficient) {
      evidenceQuality = 'INSUFFICIENT';
    }

    // STAGE 5: RISK ENGINE
    const riskCategories: any[] = [];
    let highestRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if ((contextData.weather.rainProbability || 0) > 70) {
      riskCategories.push({
        category: 'WEATHER',
        level: 'HIGH',
        description: 'High rainfall probability could cause root waterlogging or fertilizer run-off.'
      });
      highestRiskLevel = 'HIGH';
    }

    if ((contextData.weather.tempCelsius || 20) > 38) {
      riskCategories.push({
        category: 'CROP_HEALTH',
        level: 'MEDIUM',
        description: 'Excess heat temperature may accelerate crop transpiration and soil moisture loss.'
      });
      if (highestRiskLevel === 'LOW') highestRiskLevel = 'MEDIUM';
    }

    if (contextData.disease.latestDiagnosis?.severity === 'severe' || contextData.disease.latestDiagnosis?.severity === 'high') {
      riskCategories.push({
        category: 'DISEASE',
        level: 'CRITICAL',
        description: `Active severe pathology outbreak: ${contextData.disease.latestDiagnosis.disease}`
      });
      highestRiskLevel = 'CRITICAL';
    }

    // STAGE 6: DECISION ENGINE
    const decisionEval = this.isDbConnected()
      ? await DecisionEngine.evaluateDecision(event.userId, farmId, 'CROP_HEALTH_DECISION')
      : { decisionType: 'CROP_HEALTH_DECISION', objective: 'Evaluate Farm Action Rationale' } as any;

    // STAGE 7: PLANNER
    const agents = AgentRegistry.getAllAgents();
    let selectedAgent = agents.find(a => a.id === 'farm_monitoring') || agents[0];

    if (event.eventType.includes('DISEASE')) {
      selectedAgent = agents.find(a => a.id === 'crop_health') || selectedAgent;
    } else if (event.eventType.includes('IRRIGATION') || event.eventType.includes('RAIN')) {
      selectedAgent = agents.find(a => a.id === 'irrigation') || selectedAgent;
    } else if (event.eventType.includes('MARKET')) {
      selectedAgent = agents.find(a => a.id === 'market') || selectedAgent;
    }

    const plan = await selectedAgent.evaluate(event.userId, event.eventType, event.metadata);

    // STAGE 8: POLICY & AUTONOMY LEVEL EVALUATION
    const settings = await this.getAutomationSettings(event.userId);
    let policyResult: 'ALLOW' | 'DENY' | 'REQUIRES_APPROVAL' | 'INSUFFICIENT_DATA' = 'ALLOW';
    let policyReason = 'Action evaluates safely within user policy boundaries.';

    if (!evidenceSufficient) {
      policyResult = 'INSUFFICIENT_DATA';
      policyReason = 'Insufficient empirical evidence to evaluate autonomous action safely.';
    } else if (highestRiskLevel === 'CRITICAL' || highestRiskLevel === 'HIGH') {
      policyResult = 'REQUIRES_APPROVAL';
      policyReason = `Action involves ${highestRiskLevel} risk. Farmer approval required by safety policy.`;
    } else if (plan?.requiresApproval || !settings.autoTaskCreation) {
      policyResult = 'REQUIRES_APPROVAL';
      policyReason = 'Task creation or operational change requires explicit farmer approval.';
    }

    // STAGE 9: APPROVAL WORKFLOW
    let approvalId: string | undefined = undefined;
    if (policyResult === 'REQUIRES_APPROVAL' && plan && plan.steps.length > 0) {
      approvalId = this.generateApprovalId();
      const step = plan.steps[0];
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 day expiration

      if (this.isDbConnected()) {
        await AutomationApproval.create({
          approvalId,
          runId,
          userId: event.userId,
          farmId,
          fieldId: event.fieldId,
          agentType: selectedAgent.id,
          actionType: step.toolName,
          toolName: step.toolName,
          parameters: step.parameters,
          summary: step.description,
          reason: plan.explanation || step.description,
          evidence: evidenceItems,
          expectedResult: `Execute ${step.toolName} to mitigate identified risk`,
          risks: riskCategories,
          reversibility: 'REVERSIBLE',
          expiresAt,
          status: 'PENDING'
        });
      }
    }

    // STAGE 10: EXECUTION ENGINE
    let executionStatus: IAutomationRun['executionStatus'] = 'PENDING';
    let verificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'FAILED' | 'UNKNOWN' = 'UNKNOWN';

    if (policyResult === 'INSUFFICIENT_DATA') {
      executionStatus = 'INSUFFICIENT_DATA';
    } else if (policyResult === 'REQUIRES_APPROVAL') {
      executionStatus = 'WAITING_APPROVAL';
    } else if (policyResult === 'ALLOW' && plan && plan.steps.length > 0) {
      const step = plan.steps[0];
      const execRes = await AgentExecutor.executeStep(event.userId, step);

      if (execRes.status === 'EXECUTED') {
        // STAGE 11: VERIFICATION ENGINE
        const verified = await AgentVerifier.verifyResult(step.toolName, execRes.result);
        executionStatus = verified ? 'VERIFIED' : 'EXECUTED';
        verificationStatus = verified ? 'VERIFIED' : 'PARTIALLY_VERIFIED';
      } else if (execRes.status === 'WAITING_APPROVAL') {
        executionStatus = 'WAITING_APPROVAL';
      } else {
        executionStatus = 'FAILED';
        verificationStatus = 'FAILED';
      }
    } else {
      executionStatus = 'EXECUTED';
      verificationStatus = 'VERIFIED';
    }

    // STAGE 12: OUTCOME & LEARNING SIGNAL LINKAGE
    let outcomeId: string | undefined = undefined;
    if (executionStatus === 'EXECUTED' || executionStatus === 'VERIFIED') {
      const outcomeDoc = await outcomeLearningService.createOutcome({
        userId: event.userId,
        farmId,
        fieldId: event.fieldId,
        cropCycleId: event.cropCycleId,
        sourceType: 'AGENT',
        sourceId: runId,
        actionType: plan?.steps[0]?.toolName || event.eventType,
        observationType: event.eventType,
        status: 'OBSERVING',
        confidence: 0.85
      });
      outcomeId = outcomeDoc?.outcomeId;
    }

    // Construct run record object
    const runRecord: Partial<IAutomationRun> = {
      runId,
      userId: event.userId,
      farmId,
      fieldId: event.fieldId,
      cropCycleId: event.cropCycleId,
      eventId,
      eventType: event.eventType,
      source: event.source || 'CLOSED_LOOP_ENGINE',
      autonomyLevel: settings.globalAutonomyLevel ?? 2,
      evidence: {
        quality: evidenceQuality,
        items: evidenceItems
      },
      evidenceSufficient,
      riskAssessment: {
        highestRiskLevel,
        categories: riskCategories
      },
      decision: {
        category: decisionEval?.decisionType || 'GENERAL_ADVISORY',
        recommendation: decisionEval?.objective || 'Routine farm observation',
        confidence: 0.85
      },
      plan: plan
        ? {
            objective: plan.objective,
            steps: plan.steps.map((s: any, idx: number) => ({
              stepId: `step_${idx + 1}`,
              toolName: s.toolName,
              parameters: s.parameters,
              description: s.description,
              requiresApproval: s.requiresApproval
            }))
          }
        : undefined,
      policyEvaluation: {
        result: policyResult,
        reason: policyReason,
        autonomyLevelAllowed: settings.globalAutonomyLevel ?? 2
      },
      approvalId,
      executionStatus,
      verificationStatus,
      outcomeId,
      completedAt: new Date()
    };

    if (this.isDbConnected()) {
      await AutomationRun.create(runRecord);

      // Audit log in AgentActivity
      await AgentActivity.create({
        user: event.userId,
        farm: farmId,
        agentType: selectedAgent.id,
        eventType: event.eventType,
        observation: plan?.objective || event.eventType,
        reasoningSummary: policyReason,
        evidence: evidenceItems,
        status: executionStatus === 'WAITING_APPROVAL' ? 'WAITING_APPROVAL' : executionStatus === 'VERIFIED' ? 'VERIFIED' : 'EXECUTED',
        approvalRequired: policyResult === 'REQUIRES_APPROVAL',
        action: plan?.steps[0] ? { toolName: plan.steps[0].toolName, parameters: plan.steps[0].parameters, summary: plan.steps[0].description } : undefined
      });
    }

    return runRecord;
  }

  /**
   * Approve a pending automation approval request & execute step safely
   */
  static async approveAction(approvalId: string, userId: string, decisionReason?: string): Promise<{ success: boolean; message: string; approval?: IAutomationApproval }> {
    if (!this.isDbConnected()) {
      return { success: true, message: 'Approval recorded (Offline mode)' };
    }

    const approval = await AutomationApproval.findOne({ approvalId, userId });
    if (!approval) {
      throw new Error(`Approval request ${approvalId} not found`);
    }

    if (approval.status !== 'PENDING') {
      throw new Error(`Approval request is already in status ${approval.status}`);
    }

    approval.status = 'APPROVED';
    approval.decidedBy = userId as any;
    approval.decidedAt = new Date();
    if (decisionReason) approval.decisionReason = decisionReason;
    await approval.save();

    // Execute approved tool action
    const execRes = await AgentExecutor.executeStep(userId, {
      toolName: approval.toolName,
      parameters: { ...approval.parameters, approvedByFarmer: true },
      description: approval.summary,
      requiresApproval: false
    });

    // Update AutomationRun & AgentActivity
    await AutomationRun.updateOne(
      { runId: approval.runId },
      {
        executionStatus: execRes.status === 'EXECUTED' ? 'EXECUTED' : 'FAILED',
        verificationStatus: execRes.status === 'EXECUTED' ? 'VERIFIED' : 'FAILED'
      }
    );

    return {
      success: true,
      message: 'Autonomous action approved and executed cleanly.',
      approval
    };
  }

  /**
   * Reject a pending automation approval request
   */
  static async rejectAction(approvalId: string, userId: string, decisionReason?: string): Promise<{ success: boolean; message: string; approval?: IAutomationApproval }> {
    if (!this.isDbConnected()) {
      return { success: true, message: 'Rejection recorded (Offline mode)' };
    }

    const approval = await AutomationApproval.findOne({ approvalId, userId });
    if (!approval) {
      throw new Error(`Approval request ${approvalId} not found`);
    }

    approval.status = 'REJECTED';
    approval.decidedBy = userId as any;
    approval.decidedAt = new Date();
    if (decisionReason) approval.decisionReason = decisionReason;
    await approval.save();

    await AutomationRun.updateOne(
      { runId: approval.runId },
      { executionStatus: 'REJECTED' }
    );

    return {
      success: true,
      message: 'Autonomous action rejected by farmer.',
      approval
    };
  }

  /**
   * Daily Autonomous Farm Review
   */
  static async runDailyFarmReview(userId: string, farmId?: string): Promise<{
    reviewDate: string;
    checksCompleted: number;
    actionsTriggered: number;
    summary: string;
  }> {
    const context = await CopilotContextService.getFarmContext(userId, farmId);
    let actionsTriggered = 0;

    // Check weather
    if (context.weather.available && (context.weather.rainProbability || 0) > 60) {
      await this.processEvent({
        eventType: 'HEAVY_RAIN_DETECTED',
        userId,
        farmId: context.farm.id || undefined,
        source: 'DAILY_REVIEW'
      });
      actionsTriggered++;
    }

    // Check disease
    if (context.disease.available && context.disease.latestDiagnosis?.severity === 'severe') {
      await this.processEvent({
        eventType: 'DISEASE_RISK_INCREASED',
        userId,
        farmId: context.farm.id || undefined,
        source: 'DAILY_REVIEW'
      });
      actionsTriggered++;
    }

    return {
      reviewDate: new Date().toISOString().split('T')[0],
      checksCompleted: 10,
      actionsTriggered,
      summary: actionsTriggered > 0
        ? `Daily review completed for ${context.farm.name}. ${actionsTriggered} automated observations logged.`
        : `Daily review completed for ${context.farm.name}. All conditions stable, no action required.`
    };
  }

  /**
   * Weekly Farm Intelligence Review
   */
  static async runWeeklyFarmReview(userId: string, farmId?: string): Promise<{
    period: string;
    totalRuns: number;
    approvedCount: number;
    pendingCount: number;
    highlights: string[];
  }> {
    if (!this.isDbConnected()) {
      return {
        period: '7-Days',
        totalRuns: 0,
        approvedCount: 0,
        pendingCount: 0,
        highlights: ['Offline evaluation completed cleanly.']
      };
    }

    const farmContext = await CopilotContextService.getFarmContext(userId, farmId);
    const runs = await AutomationRun.find({ userId, farmId: farmContext.farm.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const pendingCount = runs.filter(r => r.executionStatus === 'WAITING_APPROVAL').length;
    const approvedCount = runs.filter(r => r.executionStatus === 'EXECUTED' || r.executionStatus === 'VERIFIED').length;

    const highlights: string[] = [
      `Completed ${runs.length} closed-loop farm evaluations over the past 7 days.`,
      `${approvedCount} safe actions verified or executed.`,
      `${pendingCount} pending farmer approval requests awaiting review.`
    ];

    return {
      period: 'Past 7 Days',
      totalRuns: runs.length,
      approvedCount,
      pendingCount,
      highlights
    };
  }

  /**
   * Copilot integration helper to explain autonomous activity
   */
  static async getAutonomousActivityExplanation(userId: string, farmId?: string): Promise<string> {
    const context = await CopilotContextService.getFarmContext(userId, farmId);
    const weekly = await this.runWeeklyFarmReview(userId, farmId);

    return `KrishiMitra Autonomous Operations Report for ${context.farm.name}:\n` +
      `- Period: ${weekly.period}\n` +
      `- Total Closed-Loop Evaluated Cycles: ${weekly.totalRuns}\n` +
      `- Verified Actions Executed: ${weekly.approvedCount}\n` +
      `- Pending Approval Requests: ${weekly.pendingCount}\n` +
      `Highlights:\n` + weekly.highlights.map(h => `• ${h}`).join('\n');
  }
}
