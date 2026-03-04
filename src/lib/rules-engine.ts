// Epic 5: Rules Engine

export interface Condition {
  metric: string;
  operator: '>' | '<' | '=' | 'between' | 'changed';
  value: number | number[];
  period: string;
}

export interface Rule {
  id: string;
  conditions: Condition[];
  combinator: 'AND' | 'OR';
  actions: Action[];
}

export interface Action {
  type: 'pause' | 'resume' | 'update_budget' | 'notify';
  target?: string;
  value?: number | string;
}

export function evaluateCondition(
  condition: Condition,
  metricValue: number,
  previousValue?: number
): boolean {
  switch (condition.operator) {
    case '>':
      return metricValue > (condition.value as number);
    case '<':
      return metricValue < (condition.value as number);
    case '=':
      return metricValue === (condition.value as number);
    case 'between':
      const [min, max] = condition.value as number[];
      return metricValue >= min && metricValue <= max;
    case 'changed':
      if (!previousValue) return false;
      const change = ((metricValue - previousValue) / previousValue) * 100;
      return Math.abs(change) > (condition.value as number);
    default:
      return false;
  }
}

export function evaluateRule(rule: Rule, metrics: Record<string, number>): boolean {
  const results = rule.conditions.map((condition) => {
    const metricValue = metrics[condition.metric];
    if (metricValue === undefined) return false;
    return evaluateCondition(condition, metricValue);
  });

  if (rule.combinator === 'AND') {
    return results.every((r) => r);
  } else {
    return results.some((r) => r);
  }
}
