/**
 * Rules Engine for Campaign Automation
 * Allows users to define conditions and actions that execute automatically
 */

export type ConditionOperator = '>' | '<' | '=' | 'between' | 'contains' | 'changed';
export type ActionType = 'pause_campaign' | 'resume_campaign' | 'update_budget' | 'notify' | 'create_suggestion';
export type RuleMode = 'suggestion' | 'automatic';

export interface Condition {
  id: string;
  metric: string; // e.g., 'roas', 'ctr', 'spend', 'conversions'
  operator: ConditionOperator;
  value: number | string;
  value2?: number; // For 'between' operator
  duration?: number; // Number of days for 'changed' operator
}

export interface RuleAction {
  id: string;
  type: ActionType;
  params: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

export interface Rule {
  id: string;
  account_id: string;
  name: string;
  description: string;
  enabled: boolean;
  mode: RuleMode; // 'suggestion' = require approval, 'automatic' = execute immediately
  scope: 'campaign' | 'account'; // Apply to single campaign or entire account
  conditions: Condition[];
  combinator: 'AND' | 'OR'; // How to combine multiple conditions
  actions: RuleAction[];
  execution_limit?: number; // Max executions per day
  cooldown_minutes?: number; // Wait time between executions
  created_at: string;
  updated_at: string;
  last_executed?: string;
  execution_count?: number;
}

export interface RuleExecution {
  id: string;
  rule_id: string;
  campaign_id: string;
  account_id: string;
  action_type: ActionType;
  status: 'pending' | 'executing' | 'success' | 'failed';
  result: Record<string, any>;
  error_message?: string;
  executed_at: string;
}

/**
 * Evaluate a single condition against metric value
 */
export function evaluateCondition(condition: Condition, metricValue: number): boolean {
  switch (condition.operator) {
    case '>':
      return metricValue > Number(condition.value);
    case '<':
      return metricValue < Number(condition.value);
    case '=':
      return metricValue === Number(condition.value);
    case 'between':
      return (
        metricValue >= Number(condition.value) &&
        metricValue <= Number(condition.value2)
      );
    case 'contains':
      return String(metricValue).includes(String(condition.value));
    case 'changed':
      return false; // Requires historical data
    default:
      return false;
  }
}

/**
 * Evaluate all conditions for a rule
 */
export function evaluateRule(
  rule: Rule,
  metrics: Record<string, number>
): boolean {
  const conditionResults = rule.conditions.map((condition) => {
    const metricValue = metrics[condition.metric];
    if (metricValue === undefined) {
      return false;
    }
    return evaluateCondition(condition, metricValue);
  });

  // Combine results based on combinator
  if (rule.combinator === 'AND') {
    return conditionResults.every((result) => result);
  } else {
    return conditionResults.some((result) => result);
  }
}

/**
 * Check if rule should execute based on cooldown/limit
 */
export function shouldExecuteRule(rule: Rule, lastExecution?: string): boolean {
  if (!rule.enabled) return false;

  if (!lastExecution) return true;

  const lastExecutedTime = new Date(lastExecution).getTime();
  const cooldownMs = (rule.cooldown_minutes || 60) * 60 * 1000;
  const now = new Date().getTime();

  return now - lastExecutedTime >= cooldownMs;
}

/**
 * Generate impact estimate for a rule execution
 */
export function estimateRuleImpact(
  rule: Rule,
  currentMetrics: Record<string, number>
): {
  metric: string;
  current: number;
  estimated: number;
  change_percentage: number;
} | null {
  const action = rule.actions[0]; // Analyze first action

  if (action.type === 'update_budget') {
    const budgetChange = action.params.increase_percentage || 0;
    return {
      metric: 'conversions',
      current: currentMetrics.conversions || 0,
      estimated: (currentMetrics.conversions || 0) * (1 + budgetChange / 100 * 0.8),
      change_percentage: budgetChange * 0.8,
    };
  }

  if (action.type === 'pause_campaign') {
    return {
      metric: 'spend',
      current: currentMetrics.spend || 0,
      estimated: 0,
      change_percentage: -100,
    };
  }

  if (action.type === 'resume_campaign') {
    return {
      metric: 'conversions',
      current: 0,
      estimated: currentMetrics.historical_conversions || 0,
      change_percentage: 100,
    };
  }

  return null;
}

/**
 * Validate rule structure
 */
export function validateRule(rule: Partial<Rule>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!rule.name || rule.name.trim() === '') {
    errors.push('Rule name is required');
  }

  if (!rule.conditions || rule.conditions.length === 0) {
    errors.push('At least one condition is required');
  }

  if (!rule.actions || rule.actions.length === 0) {
    errors.push('At least one action is required');
  }

  if (rule.conditions) {
    rule.conditions.forEach((condition, idx) => {
      if (!condition.metric) {
        errors.push(`Condition ${idx + 1}: metric is required`);
      }
      if (!condition.operator) {
        errors.push(`Condition ${idx + 1}: operator is required`);
      }
      if (condition.operator === 'between' && !condition.value2) {
        errors.push(`Condition ${idx + 1}: second value required for 'between' operator`);
      }
    });
  }

  if (rule.actions) {
    rule.actions.forEach((action, idx) => {
      if (!action.type) {
        errors.push(`Action ${idx + 1}: type is required`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Template rules for common scenarios
 */
export const RULE_TEMPLATES = {
  pause_low_roas: {
    name: 'Pause campaigns with low ROAS',
    description: 'Automatically pause campaigns when ROAS drops below 1.0',
    conditions: [
      {
        id: '1',
        metric: 'roas',
        operator: '<' as ConditionOperator,
        value: 1,
      },
    ],
    actions: [
      {
        id: '1',
        type: 'pause_campaign' as ActionType,
        params: {},
        priority: 'high' as const,
      },
    ],
  },

  increase_high_roas: {
    name: 'Increase budget for high performers',
    description: 'Boost budget by 25% when ROAS exceeds 3.0',
    conditions: [
      {
        id: '1',
        metric: 'roas',
        operator: '>' as ConditionOperator,
        value: 3,
      },
    ],
    actions: [
      {
        id: '1',
        type: 'update_budget' as ActionType,
        params: { increase_percentage: 25 },
        priority: 'medium' as const,
      },
    ],
  },

  alert_high_cpa: {
    name: 'Alert on high CPA',
    description: 'Notify when CPA exceeds $50',
    conditions: [
      {
        id: '1',
        metric: 'cpa',
        operator: '>' as ConditionOperator,
        value: 50,
      },
    ],
    actions: [
      {
        id: '1',
        type: 'notify' as ActionType,
        params: { message: 'High CPA detected' },
        priority: 'high' as const,
      },
    ],
  },

  low_ctr_suggestion: {
    name: 'Suggest creative testing for low CTR',
    description: 'Suggest testing new creatives when CTR is below 1.5%',
    conditions: [
      {
        id: '1',
        metric: 'ctr',
        operator: '<' as ConditionOperator,
        value: 1.5,
      },
    ],
    actions: [
      {
        id: '1',
        type: 'create_suggestion' as ActionType,
        params: { type: 'creative' },
        priority: 'medium' as const,
      },
    ],
  },
};

/**
 * Get metric display name
 */
export function getMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    roas: 'ROAS',
    ctr: 'CTR (%)',
    cpc: 'CPC ($)',
    cpa: 'CPA ($)',
    spend: 'Spend ($)',
    conversions: 'Conversions',
    impressions: 'Impressions',
    clicks: 'Clicks',
    cpm: 'CPM ($)',
  };
  return labels[metric] || metric;
}

/**
 * Get operator display name
 */
export function getOperatorLabel(operator: ConditionOperator): string {
  const labels: Record<ConditionOperator, string> = {
    '>': 'Greater than',
    '<': 'Less than',
    '=': 'Equals',
    'between': 'Between',
    'contains': 'Contains',
    'changed': 'Changed by',
  };
  return labels[operator];
}
