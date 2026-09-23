import { OptionItem } from './decisionTypes';
import { RuleMatch } from './decisionRuleEngine';
import { NormalizedFarmGraphContext } from '../knowledgeGraph/graphTypes';

export class DecisionOptionsEngine {
  /**
   * Generate structured decision options A/B/C based on rules & farm graph context
   */
  static generateOptions(graph: NormalizedFarmGraphContext, rules: RuleMatch[]): OptionItem[] {
    const options: OptionItem[] = [];

    // Default Option A: Routine Monitoring
    options.push({
      id: 'opt_a_monitor',
      title: 'Option A: Routine Field Monitoring',
      action: 'Maintain current field schedule and observe telemetry for changes.',
      benefits: ['Zero additional input costs', 'Prevents over-intervention'],
      risks: ['Potential delay if sudden weather or pest shift occurs'],
      requirements: ['Visual inspection during daily field walk'],
      urgency: 'LOW',
      approvalRequired: false
    });

    // Option B / C derived from matching deterministic rules
    rules.forEach((rule, idx) => {
      const optionLetter = String.fromCharCode(66 + idx); // B, C, D...
      options.push({
        id: `opt_${optionLetter.toLowerCase()}_${rule.ruleId}`,
        title: `Option ${optionLetter}: ${rule.title}`,
        action: rule.recommendedAction,
        benefits: [rule.explanation],
        risks: ['Requires farmer execution or physical verification'],
        requirements: ['Farmer review and confirmation'],
        urgency: rule.priority === 'CRITICAL' ? 'HIGH' : rule.priority,
        approvalRequired: rule.requiresApproval
      });
    });

    return options;
  }
}
