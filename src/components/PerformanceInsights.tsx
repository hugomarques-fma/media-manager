'use client';

import { useState } from 'react';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'optimization' | 'benchmark';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric: string;
  currentValue: number;
  recommendedValue?: number;
  action?: string;
}

interface PerformanceInsightsProps {
  accountId: string;
}

const INSIGHT_COLORS = {
  opportunity: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  optimization: 'bg-blue-50 border-blue-200',
  benchmark: 'bg-purple-50 border-purple-200',
};

const INSIGHT_BADGES = {
  opportunity: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  optimization: 'bg-blue-100 text-blue-800',
  benchmark: 'bg-purple-100 text-purple-800',
};

const INSIGHT_ICONS = {
  opportunity: '🎯',
  warning: '⚠️',
  optimization: '⚡',
  benchmark: '📊',
};

export default function PerformanceInsights({ accountId }: PerformanceInsightsProps) {
  const [insights] = useState<Insight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'High ROAS Campaign',
      description: 'Summer Sale 2024 is performing exceptionally well with 2.8x ROAS. Consider increasing budget to capitalize on this performance.',
      impact: 'high',
      metric: 'ROAS',
      currentValue: 2.8,
      recommendedValue: 3.2,
      action: 'Increase budget by 20-30%',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Declining Performance',
      description: 'Holiday Campaign CTR has dropped 35% over the last 7 days. This may indicate ad fatigue or audience saturation.',
      impact: 'high',
      metric: 'CTR',
      currentValue: 0.8,
      recommendedValue: 1.2,
      action: 'Test new creatives',
    },
    {
      id: '3',
      type: 'optimization',
      title: 'Budget Allocation',
      description: 'Brand Awareness campaign is spending 30% of budget but generating only 15% of conversions. Reallocation recommended.',
      impact: 'medium',
      metric: 'Spend vs Conversions',
      currentValue: 30,
      recommendedValue: 15,
      action: 'Reallocate budget to high performers',
    },
    {
      id: '4',
      type: 'benchmark',
      title: 'Industry Benchmark',
      description: 'Your average CPA of $12.50 is 15% better than the industry average of $14.75 for your vertical.',
      impact: 'low',
      metric: 'CPA',
      currentValue: 12.5,
      recommendedValue: 14.75,
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold mb-6">Performance Insights</h3>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${INSIGHT_COLORS[insight.type]}`}
            onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{INSIGHT_ICONS[insight.type]}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.metric}</p>
                  </div>
                </div>

                {expandedId === insight.id && (
                  <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                    <p className="text-sm text-gray-700 mb-4">{insight.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Current</p>
                        <p className="text-lg font-bold text-gray-900">
                          {typeof insight.currentValue === 'number'
                            ? insight.currentValue % 1 === 0
                              ? insight.currentValue
                              : insight.currentValue.toFixed(2)
                            : insight.currentValue}
                        </p>
                      </div>
                      {insight.recommendedValue && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Recommended</p>
                          <p className="text-lg font-bold text-blue-600">
                            {typeof insight.recommendedValue === 'number'
                              ? insight.recommendedValue % 1 === 0
                                ? insight.recommendedValue
                                : insight.recommendedValue.toFixed(2)
                              : insight.recommendedValue}
                          </p>
                        </div>
                      )}
                    </div>

                    {insight.action && (
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                          {insight.action}
                        </button>
                        <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="ml-4 flex-shrink-0">
                <span className={`px-2 py-1 rounded text-xs font-medium ${INSIGHT_BADGES[insight.type]}`}>
                  {insight.impact}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">1</p>
            <p className="text-xs text-gray-600">Opportunities</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">1</p>
            <p className="text-xs text-gray-600">Warnings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">1</p>
            <p className="text-xs text-gray-600">Optimizations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">1</p>
            <p className="text-xs text-gray-600">Benchmarks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
