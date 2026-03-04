'use client';

import { useState } from 'react';
import { Rule, RULE_TEMPLATES, RuleMode } from '@/lib/rules-engine';

interface RulesManagerProps {
  accountId: string;
}

const MODE_COLORS = {
  suggestion: 'bg-blue-50 border-blue-200',
  automatic: 'bg-purple-50 border-purple-200',
};

const MODE_BADGE = {
  suggestion: 'bg-blue-100 text-blue-800',
  automatic: 'bg-purple-100 text-purple-800',
};

export default function RulesManager({ accountId }: RulesManagerProps) {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: '1',
      account_id: accountId,
      name: 'Pause Low Performers',
      description: 'Automatically pause campaigns with ROAS below 1.0',
      enabled: true,
      mode: 'suggestion' as RuleMode,
      scope: 'account',
      conditions: [
        {
          id: '1',
          metric: 'roas',
          operator: '<',
          value: 1,
        },
      ],
      combinator: 'AND',
      actions: [
        {
          id: '1',
          type: 'pause_campaign',
          params: {},
          priority: 'high',
        },
      ],
      cooldown_minutes: 1440, // Daily
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      execution_count: 3,
    },
    {
      id: '2',
      account_id: accountId,
      name: 'Increase High ROAS Budget',
      description: 'Boost daily budget by 25% for campaigns with ROAS > 3.0',
      enabled: true,
      mode: 'automatic' as RuleMode,
      scope: 'account',
      conditions: [
        {
          id: '1',
          metric: 'roas',
          operator: '>',
          value: 3,
        },
      ],
      combinator: 'AND',
      actions: [
        {
          id: '1',
          type: 'update_budget',
          params: { increase_percentage: 25 },
          priority: 'medium',
        },
      ],
      cooldown_minutes: 1440,
      created_at: '2024-01-20',
      updated_at: '2024-01-20',
      execution_count: 1,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = Object.entries(RULE_TEMPLATES).map(([key, template]) => ({
    key,
    ...template,
  }));

  const handleToggleRule = (ruleId: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter((rule) => rule.id !== ruleId));
  };

  const handleCreateFromTemplate = (templateKey: string) => {
    const template = RULE_TEMPLATES[templateKey as keyof typeof RULE_TEMPLATES];
    if (!template) return;

    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      account_id: accountId,
      name: template.name,
      description: template.description,
      enabled: true,
      mode: 'suggestion',
      scope: 'account',
      conditions: template.conditions,
      combinator: 'AND',
      actions: template.actions,
      cooldown_minutes: 1440,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
    };

    setRules([...rules, newRule]);
    setShowCreateModal(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Automation Rules</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          + Create Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No rules created yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Rule
            </button>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-lg border p-6 ${MODE_COLORS[rule.mode]}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rule.name}
                    </h3>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${MODE_BADGE[rule.mode]}`}
                      >
                        {rule.mode === 'automatic' ? '⚡ Auto' : '👤 Manual'}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          rule.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rule.enabled ? '✓ Enabled' : '○ Disabled'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      rule.enabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Rule Details */}
              <div className="bg-white bg-opacity-60 rounded p-4 mb-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Conditions ({rule.combinator}):
                  </p>
                  <ul className="space-y-1 text-sm">
                    {rule.conditions.map((cond, idx) => (
                      <li key={idx} className="text-gray-700">
                        • {cond.metric} {cond.operator} {cond.value}
                        {cond.value2 && ` - ${cond.value2}`}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Actions:
                  </p>
                  <ul className="space-y-1 text-sm">
                    {rule.actions.map((action, idx) => (
                      <li key={idx} className="text-gray-700">
                        • {action.type.replace(/_/g, ' ')}
                        {action.params.increase_percentage &&
                          ` (+${action.params.increase_percentage}%)`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Executions</p>
                  <p className="text-lg font-bold text-gray-900">
                    {rule.execution_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Cooldown</p>
                  <p className="text-lg font-bold text-gray-900">
                    {rule.cooldown_minutes ? `${rule.cooldown_minutes / 60}h` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Last Executed</p>
                  <p className="text-lg font-bold text-gray-900">
                    {rule.last_executed ? '2h ago' : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Rule from Template</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.key}
                  onClick={() => handleCreateFromTemplate(template.key)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Use Template
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
