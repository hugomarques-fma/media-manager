'use client';

import { useState } from 'react';
import { AuditEvent, formatAuditEvent } from '@/lib/notifications-service';

interface AuditLogProps {
  accountId: string;
}

export default function AuditLog({ accountId }: AuditLogProps) {
  const [events, setEvents] = useState<AuditEvent[]>([
    {
      id: 'audit-1',
      account_id: accountId,
      entity_type: 'campaign',
      entity_id: 'camp-1',
      event_type: 'status_changed',
      changes: {
        before: { status: 'active' },
        after: { status: 'paused' },
      },
      timestamp: '2024-03-04T15:45:00Z',
      user_id: 'user-1',
    },
    {
      id: 'audit-2',
      account_id: accountId,
      entity_type: 'campaign',
      entity_id: 'camp-1',
      event_type: 'budget_updated',
      changes: {
        before: { daily_budget: 1000 },
        after: { daily_budget: 1250 },
      },
      timestamp: '2024-03-04T14:30:00Z',
      user_id: 'system',
    },
    {
      id: 'audit-3',
      account_id: accountId,
      entity_type: 'rule',
      entity_id: 'rule-2',
      event_type: 'created',
      changes: {
        after: {
          name: 'Increase High ROAS Budget',
          mode: 'automatic',
          enabled: true,
        },
      },
      timestamp: '2024-03-04T10:00:00Z',
      user_id: 'user-1',
    },
    {
      id: 'audit-4',
      account_id: accountId,
      entity_type: 'campaign',
      entity_id: 'camp-3',
      event_type: 'synced',
      changes: {
        after: {
          synced_campaigns: 15,
          synced_at: '2024-03-04T09:00:00Z',
        },
      },
      timestamp: '2024-03-04T09:05:00Z',
      user_id: 'system',
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');

  const filtered = events.filter((event) => {
    if (filterType !== 'all' && event.event_type !== filterType) return false;
    if (filterEntity !== 'all' && event.entity_type !== filterEntity) return false;
    return true;
  });

  const getActorLabel = (event: AuditEvent) => {
    if (!event.user_id) return 'System';
    if (event.user_id === 'system') return 'System';
    return `User: ${event.user_id}`;
  };

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      created: '✨',
      updated: '✏️',
      deleted: '🗑️',
      status_changed: '⚡',
      budget_updated: '💰',
      synced: '🔄',
      executed: '▶️',
    };
    return icons[type] || '📝';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold mb-6">Audit Log</h3>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="status_changed">Status Changed</option>
            <option value="budget_updated">Budget Updated</option>
            <option value="synced">Synced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entity Type
          </label>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Entities</option>
            <option value="campaign">Campaign</option>
            <option value="rule">Rule</option>
            <option value="account">Account</option>
            <option value="suggestion">Suggestion</option>
          </select>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No audit events found</p>
          </div>
        ) : (
          filtered.map((event, idx) => (
            <div key={event.id} className="flex gap-4">
              {/* Timeline */}
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                  {getEventIcon(event.event_type)}
                </div>
                {idx < filtered.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {event.entity_type.toUpperCase()}{' '}
                      <span className="text-blue-600">
                        {formatAuditEvent(event)}
                      </span>
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded mr-2">
                      {event.event_type}
                    </span>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded">
                      {getActorLabel(event)}
                    </span>
                  </div>

                  {/* Changes */}
                  {Object.keys(event.changes).length > 0 && (
                    <div className="text-xs text-gray-600 space-y-1">
                      {event.changes.before && (
                        <p>
                          <span className="font-medium">Before:</span>{' '}
                          {JSON.stringify(event.changes.before)}
                        </p>
                      )}
                      {event.changes.after && (
                        <p>
                          <span className="font-medium">After:</span>{' '}
                          {JSON.stringify(event.changes.after)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filtered.length} of {events.length} total events
        </p>
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
  );
}
