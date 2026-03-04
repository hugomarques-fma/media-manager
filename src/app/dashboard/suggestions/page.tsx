'use client';

import { useState } from 'react';
import SuggestionsPanel from '@/components/SuggestionsPanel';

export default function SuggestionsPage() {
  const [view, setView] = useState<'active' | 'history'>('active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Suggestions</h1>
        <p className="text-gray-600 mt-1">
          Get AI-powered recommendations to optimize your campaigns.
        </p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active Suggestions
        </button>
        <button
          onClick={() => setView('history')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          History
        </button>
      </div>

      {/* Active View */}
      {view === 'active' && (
        <div className="space-y-6">
          <SuggestionsPanel accountId="demo" limit={100} />

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 How It Works</h3>
              <p className="text-blue-800 text-sm mb-4">
                Our AI system analyzes your campaign performance metrics and generates
                personalized recommendations to improve ROI.
              </p>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Real-time performance analysis</li>
                <li>• Anomaly detection</li>
                <li>• Benchmarking against historical data</li>
                <li>• Actionable recommendations</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">✓ Approval Flow</h3>
              <p className="text-green-800 text-sm mb-4">
                Review and approve suggestions before they're executed automatically.
              </p>
              <ol className="space-y-2 text-sm text-green-700">
                <li>1. Review suggestion details</li>
                <li>2. Check estimated impact</li>
                <li>3. Approve to execute</li>
                <li>4. Track in execution history</li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">🎯 Suggestion Types</h3>
              <p className="text-amber-800 text-sm mb-4">
                Different types of suggestions based on campaign performance:
              </p>
              <ul className="space-y-2 text-sm text-amber-700">
                <li>📈 Budget optimization</li>
                <li>🎨 Creative testing</li>
                <li>👥 Audience expansion</li>
                <li>🎯 Bid strategy adjustments</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* History View */}
      {view === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-6">Suggestion Execution History</h2>

          {/* Sample History */}
          <div className="space-y-4">
            {[
              {
                date: '2024-03-04',
                suggestion: 'Increase Daily Budget - Summer Sale',
                status: 'executed',
                impact: '+28%',
                metric: 'conversions',
              },
              {
                date: '2024-03-02',
                suggestion: 'Pause Low-ROAS Campaign - Brand Awareness',
                status: 'executed',
                impact: '-$2,300',
                metric: 'daily spend',
              },
              {
                date: '2024-03-01',
                suggestion: 'Test New Creatives - Traffic Drive',
                status: 'approved',
                impact: '+15%',
                metric: 'ctr (estimated)',
              },
              {
                date: '2024-02-28',
                suggestion: 'Expand Audience - Holiday Campaign',
                status: 'rejected',
                impact: '—',
                metric: '—',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.suggestion}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.date}</p>
                </div>
                <div className="flex items-center gap-6 mr-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {item.impact !== '—' && '+'}
                      {item.impact}
                    </p>
                    <p className="text-xs text-gray-600">{item.metric}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'executed'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing 4 of 47 total executions</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
