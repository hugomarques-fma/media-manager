'use client';

import RulesManager from '@/components/RulesManager';

export default function RulesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Automation Rules</h1>
        <p className="text-gray-600 mt-1">
          Create custom rules to automate campaign management and optimization.
        </p>
      </div>

      {/* Rules Manager */}
      <RulesManager accountId="demo" />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📋 How Rules Work
          </h3>
          <p className="text-blue-800 text-sm mb-4">
            Rules automatically evaluate your campaign metrics and trigger actions when
            conditions are met.
          </p>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Set conditions based on any metric (ROAS, CTR, CPA, etc.)</li>
            <li>• Choose AND/OR logic for multiple conditions</li>
            <li>• Define actions (pause, resume, budget, notify)</li>
            <li>• Use suggestion mode for approval before execution</li>
            <li>• Use automatic mode for instant execution</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            ⚡ Rule Modes
          </h3>
          <p className="text-purple-800 text-sm mb-4">
            Choose between two execution modes for your rules:
          </p>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-purple-900">👤 Suggestion Mode</p>
              <p className="text-xs text-purple-800">
                Rule generates a suggestion for approval before execution. Safe for
                important operations.
              </p>
            </div>
            <div>
              <p className="font-medium text-purple-900">⚡ Automatic Mode</p>
              <p className="text-xs text-purple-800">
                Rule executes immediately when conditions are met. Use only for
                trusted operations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Example Rules */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">
          💡 Common Use Cases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-green-900 mb-2">Budget Optimization</p>
            <p className="text-sm text-green-800">
              Automatically increase budget for high-performing campaigns (ROAS &gt;
              3.0) or pause underperforming ones (ROAS &lt; 1.0).
            </p>
          </div>
          <div>
            <p className="font-medium text-green-900 mb-2">Performance Alerts</p>
            <p className="text-sm text-green-800">
              Get notified when metrics change significantly or when CPA exceeds your
              target threshold.
            </p>
          </div>
          <div>
            <p className="font-medium text-green-900 mb-2">Creative Testing</p>
            <p className="text-sm text-green-800">
              Generate suggestions to test new creatives when CTR drops below expected
              levels.
            </p>
          </div>
          <div>
            <p className="font-medium text-green-900 mb-2">Campaign Recovery</p>
            <p className="text-sm text-green-800">
              Automatically resume paused campaigns if historical performance was
              strong.
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          ⚠️ Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>
            ✓ Start with suggestion mode to understand rule behavior before using
            automatic mode
          </li>
          <li>✓ Set appropriate cooldown periods to avoid repeated executions</li>
          <li>✓ Test rules on a few campaigns before applying account-wide</li>
          <li>✓ Monitor rule executions and adjust thresholds based on results</li>
          <li>✓ Combine with AI suggestions for more intelligent automation</li>
        </ul>
      </div>
    </div>
  );
}
