import { FarmKnowledgeGraphService } from '../knowledgeGraph/farmKnowledgeGraphService';
import { AgentPolicyEngine } from '../agents/agentPolicyEngine';
import { DecisionRecord } from '../../models/DecisionRecord';
import { DecisionEvidenceEngine } from './decisionEvidenceEngine';
import { DecisionRuleEngine } from './decisionRuleEngine';
import { DecisionRiskEngine } from './decisionRiskEngine';
import { DecisionConfidenceEngine } from './decisionConfidenceEngine';
import { DecisionOptionsEngine } from './decisionOptionsEngine';
import { StructuredDecision, DecisionCategory, ActionStepItem } from './decisionTypes';

export class DecisionEngine {
  /**
   * Main Decision Evaluation Pipeline
   */
  static async evaluateDecision(
    userId: string,
    targetFarmId?: string,
    requestedCategory?: DecisionCategory
  ): Promise<StructuredDecision> {
    // 1. Retrieve Farm Knowledge Graph Context (Step 25)
    const graph = await FarmKnowledgeGraphService.getFarmGraph(userId, targetFarmId);
    const farmId = graph.farm.id;
    const primaryCrop = graph.activeCropCycles[0];

    // 2. Extract & Tag Evidence (Step 26 Evidence Engine)
    const evidence = DecisionEvidenceEngine.extractEvidence(graph);

    // 3. Compute Confidence & Check Missing Data (Step 26 Confidence Engine)
    const confidenceEval = DecisionConfidenceEngine.evaluateConfidence(graph, evidence);

    // Handle Insufficient Data Gracefully
    if (confidenceEval.isInsufficient) {
      const decisionDoc = await DecisionRecord.create({
        user: userId,
        farm: farmId,
        decisionType: requestedCategory || 'FARM_TASK_DECISION',
        objective: 'Evaluate Farm Action Rationale',
        status: 'INSUFFICIENT_DATA',
        priority: 'MEDIUM',
        timeframe: 'TODAY',
        evidence,
        confidence: 'INSUFFICIENT_DATA',
        confidenceScore: confidenceEval.confidenceScore,
        uncertainty: {
          identifiedUncertainties: confidenceEval.uncertainties,
          missingData: confidenceEval.missingData
        },
        recommendation: {
          action: 'Provide missing farm information',
          summary: 'Insufficient farm data to generate a verified recommendation.',
          rationale: `Missing critical data parameters: ${confidenceEval.missingData.join(', ')}.`,
          expectedOutcome: 'Complete farm setup to unlock personalized recommendations.'
        },
        requiredApproval: false
      });

      return {
        decisionId: decisionDoc._id.toString(),
        userId,
        farmId,
        decisionType: requestedCategory || 'FARM_TASK_DECISION',
        objective: 'Evaluate Farm Action Rationale',
        status: 'INSUFFICIENT_DATA',
        priority: 'MEDIUM',
        timeframe: 'TODAY',
        evidence,
        observations: ['Insufficient farm telematics recorded.'],
        risks: [],
        options: [],
        recommendation: {
          action: 'Provide missing farm information',
          summary: 'Insufficient farm data to generate a verified recommendation.',
          rationale: `Missing critical data parameters: ${confidenceEval.missingData.join(', ')}.`,
          expectedOutcome: 'Complete farm setup to unlock personalized recommendations.'
        },
        confidence: 'INSUFFICIENT_DATA',
        confidenceScore: confidenceEval.confidenceScore,
        uncertainty: {
          identifiedUncertainties: confidenceEval.uncertainties,
          missingData: confidenceEval.missingData
        },
        assumptions: [],
        requiredApproval: false,
        policyReason: 'Evaluation halted due to missing critical farm parameters.',
        requiredTools: [],
        actionPlan: [],
        createdAt: decisionDoc.createdAt.toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    }

    // 4. Evaluate Deterministic Agronomic Rules (Step 26 Rule Engine)
    const ruleMatches = DecisionRuleEngine.evaluateRules(graph);

    // 5. Evaluate Multi-factor Risks (Step 26 Risk Engine)
    const risks = DecisionRiskEngine.evaluateRisks(graph, evidence);

    // 6. Generate Options A/B/C (Step 26 Options Engine)
    const options = DecisionOptionsEngine.generateOptions(graph, ruleMatches);

    // 7. Determine Primary Recommendation & Decision Category
    const topRule = ruleMatches[0];
    const decisionType: DecisionCategory = requestedCategory || (topRule ? topRule.category : 'FARM_TASK_DECISION');
    const priority = topRule ? topRule.priority : (risks.some(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL') ? 'HIGH' : 'MEDIUM');

    const recommendationAction = topRule ? topRule.recommendedAction : 'Continue routine field monitoring and soil moisture checks.';
    const recommendationSummary = topRule ? topRule.explanation : 'All field conditions, weather telemetry, and pathology scans are within normal baseline ranges.';
    const rationale = `Evaluated against verified ${graph.regionalContext?.countryName || 'India'} regional context, ICAR agronomic guidelines, and live weather telemetry.`;
    const expectedOutcome = topRule ? 'Prevent crop loss and optimize farm input efficiency.' : 'Maintain optimal crop growth trajectory.';

    // 8. Agent Policy Engine Check (Step 22 Policy Engine)
    const policyResult = await AgentPolicyEngine.evaluateAction(
      userId,
      topRule?.requiresApproval ? 'createFarmTask' : 'createNotification',
      topRule?.requiresApproval ? 'REQUIRES_APPROVAL' : 'READ_ONLY'
    );

    // 9. Assemble Action Plan
    const actionPlan: ActionStepItem[] = [];
    if (topRule) {
      actionPlan.push({
        stepNumber: 1,
        action: topRule.recommendedAction,
        reason: topRule.explanation,
        priority: topRule.priority,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        approvalRequired: policyResult.requiresApproval,
        status: 'PENDING'
      });
    } else {
      actionPlan.push({
        stepNumber: 1,
        action: 'Conduct routine morning field walk.',
        reason: 'Verify foliage health and crop progress.',
        priority: 'LOW',
        deadline: new Date().toISOString().split('T')[0],
        approvalRequired: false,
        status: 'PENDING'
      });
    }

    // 10. Persist Decision Record in MongoDB Audit Log
    const decisionDoc = await DecisionRecord.create({
      user: userId,
      farm: farmId,
      field: primaryCrop ? primaryCrop.fieldId : undefined,
      cropCycle: primaryCrop ? primaryCrop.id : undefined,
      decisionType,
      objective: topRule ? topRule.title : 'Routine Farm Health Evaluation',
      status: policyResult.requiresApproval ? 'WAITING_APPROVAL' : 'EVALUATED',
      priority,
      timeframe: 'TODAY',
      evidence,
      observations: ruleMatches.map(r => r.explanation),
      risks,
      options,
      recommendation: {
        action: recommendationAction,
        summary: recommendationSummary,
        rationale,
        expectedOutcome
      },
      confidence: confidenceEval.confidence,
      confidenceScore: confidenceEval.confidenceScore,
      uncertainty: {
        identifiedUncertainties: confidenceEval.uncertainties,
        missingData: confidenceEval.missingData
      },
      assumptions: ['Weather telemetry remains stable over next 24 hours.'],
      requiredApproval: policyResult.requiresApproval,
      policyReason: policyResult.reason,
      requiredTools: [topRule?.requiresApproval ? 'createFarmTask' : 'createNotification'],
      actionPlan,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    return {
      decisionId: decisionDoc._id.toString(),
      userId,
      farmId,
      fieldId: primaryCrop ? primaryCrop.fieldId : undefined,
      cropCycleId: primaryCrop ? primaryCrop.id : undefined,
      decisionType,
      objective: topRule ? topRule.title : 'Routine Farm Health Evaluation',
      status: policyResult.requiresApproval ? 'WAITING_APPROVAL' : 'EVALUATED',
      priority,
      timeframe: 'TODAY',
      evidence,
      observations: ruleMatches.map(r => r.explanation),
      risks,
      options,
      recommendation: {
        action: recommendationAction,
        summary: recommendationSummary,
        rationale,
        expectedOutcome
      },
      confidence: confidenceEval.confidence,
      confidenceScore: confidenceEval.confidenceScore,
      uncertainty: {
        identifiedUncertainties: confidenceEval.uncertainties,
        missingData: confidenceEval.missingData
      },
      assumptions: ['Weather telemetry remains stable over next 24 hours.'],
      requiredApproval: policyResult.requiresApproval,
      policyReason: policyResult.reason,
      requiredTools: [topRule?.requiresApproval ? 'createFarmTask' : 'createNotification'],
      actionPlan,
      createdAt: decisionDoc.createdAt.toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Retrieve historical decisions for a farm
   */
  static async getDecisionHistory(userId: string, farmId?: string, limit: number = 10) {
    const filter: any = { user: userId };
    if (farmId) filter.farm = farmId;
    const history = await DecisionRecord.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return history;
  }

  /**
   * Approve a pending decision
   */
  static async approveDecision(userId: string, decisionId: string) {
    const record = await DecisionRecord.findOne({ _id: decisionId, user: userId });
    if (!record) throw new Error('Decision record not found or access denied');
    record.status = 'APPROVED';
    record.approvedBy = userId as any;
    record.approvedAt = new Date();
    await record.save();
    return record;
  }

  /**
   * Reject a pending decision
   */
  static async rejectDecision(userId: string, decisionId: string) {
    const record = await DecisionRecord.findOne({ _id: decisionId, user: userId });
    if (!record) throw new Error('Decision record not found or access denied');
    record.status = 'REJECTED';
    await record.save();
    return record;
  }
}
