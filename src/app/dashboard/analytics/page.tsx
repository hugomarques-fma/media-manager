'use client';

import { useState } from 'react';
import PerformanceHeatmap from '@/components/PerformanceHeatmap';
import AdPanel from '@/components/AdPanel';
import TimelineChart from '@/components/TimelineChart';

export default function AnalyticsPage() {
  const [selectedMetric, setSelectedMetric] = useState<'spend' | 'conversions' | 'ctr' | 'roas'>('spend');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Deep dive into your campaign performance patterns.</p>
      </div>

      {/* Metric Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Select Metric for Heatmap</p>
        <div className="flex flex-wrap gap-2">
          {(['spend', 'conversions', 'ctr', 'roas'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === metric
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric === 'ctr' ? 'CTR (%)' : metric === 'roas' ? 'ROAS (x)' : metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Chart */}
      <TimelineChart
        accountId="demo"
        metric="all"
        days={30}
      />

      {/* Performance Heatmap */}
      <PerformanceHeatmap metric={selectedMetric} campaignId={selectedCampaignId || undefined} />

      {/* Ad Panel */}
      <AdPanel campaignId={selectedCampaignId || undefined} view="grid" />

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Peak Hours</h3>
          <p className="text-blue-800 text-sm mb-4">
            Your campaigns perform best between 2 PM and 6 PM on weekdays.
          </p>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Tuesday: Highest performance day</li>
            <li>• 3 PM - 4 PM: Best conversion window</li>
            <li>• Weekends: 40% lower engagement</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">🎯 Top Performers</h3>
          <p className="text-green-800 text-sm mb-4">
            Your best performing ads based on ROAS.
          </p>
          <ul className="space-y-1 text-sm text-green-700">
            <li>• Video Creative: 3.2x ROAS</li>
            <li>• Summer Sale Image: 2.8x ROAS</li>
            <li>• Collection Ad: 2.4x ROAS</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">⚠️ Opportunities</h3>
          <p className="text-amber-800 text-sm mb-4">
            Areas for optimization.
          </p>
          <ul className="space-y-1 text-sm text-amber-700">
            <li>• Pause low-ROAS carousel ad</li>
            <li>• Increase budget on top 2 ads</li>
            <li>• Test new creative formats</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
