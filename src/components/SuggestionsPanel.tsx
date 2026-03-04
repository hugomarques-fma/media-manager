'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Suggestion {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  type: 'budget_increase' | 'budget_decrease' | 'pause' | 'resume' | 'creative' | 'audience' | 'bid_strategy' | 'general';
  title: string;
  description: string;
  recommendation: string;
  estimated_impact: {
    metric: string;
    change_percentage: number;
  };
  confidence_score: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  action_type?: string;
  action_params?: Record<string, any>;
}

interface SuggestionsPanelProps {
  accountId: string;
  limit?: number;
}

const PRIORITY_COLORS = {
  high: 'bg-red-50 border-red-200',
  medium: 'bg-yellow-50 border-yellow-200',
  low: 'bg-blue-50 border-blue-200',
};

const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
};

const TYPE_ICONS = {
  budget_increase: '📈',
  budget_decrease: '📉',
  pause: '⏸️',
  resume: '▶️',
  creative: '🎨',
  audience: '👥',
  bid_strategy: '🎯',
  general: '💡',
};

export default function SuggestionsPanel({
  accountId,
  limit = 5,
}: SuggestionsPanelProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('pending');

  useEffect(() => {
    if (!user || !accountId) return;

    const fetchSuggestions = async () => {
      try {
        setLoading(true);

        // Mock data for demonstration
        const mockSuggestions: Suggestion[] = [
          {
            id: '1',
            campaign_id: '1',
            campaign_name: 'Summer Sale 2024',
            type: 'budget_increase',
            title: 'Increase Daily Budget - High Performer',
            description:
              'Summer Sale 2024 has a strong ROAS of 2.8x. Increasing budget could scale this success.',
            recommendation: 'Increase daily budget by 20-30% to capitalize on good performance.',
            estimated_impact: { metric: 'conversions', change_percentage: 25 },
            confidence_score: 0.85,
            priority: 'high',
            status: 'pending',
            action_type: 'update_budget',
            action_params: { increase_percentage: 25 },
          },
          {
            id: '2',
            campaign_id: '3',
            campaign_name: 'Holiday Campaign',
            type: 'pause',
            title: 'Pause Low-ROAS Campaign',
            description:
              'Holiday Campaign has poor ROAS of 0.8x despite spending $45,000.',
            recommendation:
              'Consider pausing this campaign and reallocating budget to better performers.',
            estimated_impact: { metric: 'spend_efficiency', change_percentage: -100 },
            confidence_score: 0.75,
            priority: 'high',
            status: 'pending',
            action_type: 'pause_campaign',
          },
          {
            id: '3',
            campaign_id: '2',
            campaign_name: 'Brand Awareness',
            type: 'creative',
            title: 'Test New Creatives - Low CTR',
            description:
              'Brand Awareness has low CTR of 1.2%. Testing new creative variations could improve performance.',
            recommendation:
              'Launch A/B test with new creative variations. Focus on headlines and visuals.',
            estimated_impact: { metric: 'ctr', change_percentage: 30 },
            confidence_score: 0.7,
            priority: 'medium',
            status: 'pending',
          },
          {
            id: '4',
            campaign_id: '4',
            campaign_name: 'Traffic Drive',
            type: 'audience',
            title: 'Expand Audience Targeting',
            description:
              'Traffic Drive is performing well with high impressions (500k) and good CTR (2.8%).',
            recommendation:
              'Test audience expansion or lookalike audiences to reach more potential customers.',
            estimated_impact: { metric: 'impressions', change_percentage: 40 },
            confidence_score: 0.72,
            priority: 'low',
            status: 'pending',
          },
        ];

        setSuggestions(mockSuggestions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user, accountId]);

  const filtered = suggestions.filter((s) => filterStatus === 'all' || s.status === filterStatus);
  const displayed = filtered.slice(0, limit);

  const handleApproveSuggestion = async (suggestionId: string) => {
    try {
      // Update suggestion status
      setSuggestions(
        suggestions.map((s) =>
          s.id === suggestionId ? { ...s, status: 'approved' } : s
        )
      );
    } catch (err) {
      console.error('Failed to approve suggestion:', err);
    }
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    try {
      setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
    } catch (err) {
      console.error('Failed to reject suggestion:', err);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500">Loading suggestions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">AI Suggestions</h3>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-xs font-medium rounded-lg ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {filterStatus === 'pending'
              ? 'No pending suggestions'
              : 'No suggestions available'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`rounded-lg border p-4 ${PRIORITY_COLORS[suggestion.priority]}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl mt-1">
                    {TYPE_ICONS[suggestion.type]}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {suggestion.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {suggestion.campaign_name}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                      {suggestion.description}
                    </p>

                    {/* Recommendation */}
                    <div className="bg-white bg-opacity-60 rounded p-3 mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Recommendation:
                      </p>
                      <p className="text-sm text-gray-700">
                        {suggestion.recommendation}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-gray-600">Impact:</span>
                        <span
                          className={`ml-1 font-medium ${
                            suggestion.estimated_impact.change_percentage > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {suggestion.estimated_impact.change_percentage > 0 ? '+' : ''}
                          {suggestion.estimated_impact.change_percentage}%{' '}
                          {suggestion.estimated_impact.metric}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confidence:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {(suggestion.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_BADGE[suggestion.priority]}`}
                  >
                    {suggestion.priority}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {suggestion.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t border-current border-opacity-20">
                  <button
                    onClick={() => handleApproveSuggestion(suggestion.id)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    ✓ Approve & Execute
                  </button>
                  <button
                    onClick={() => handleRejectSuggestion(suggestion.id)}
                    className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-400 transition-colors"
                  >
                    ✕ Dismiss
                  </button>
                </div>
              )}

              {suggestion.status === 'approved' && (
                <div className="pt-3 border-t border-current border-opacity-20">
                  <p className="text-xs text-gray-600 text-center">
                    ✓ Approved and executed
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Suggestions are generated daily based on campaign performance analysis
        </p>
      </div>
    </div>
  );
}
