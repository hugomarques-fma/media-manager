'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface SyncLog {
  id: string;
  account_id: string;
  sync_type: string;
  status: 'success' | 'failed' | 'partial';
  error_message?: string;
  started_at: string;
  completed_at: string;
}

interface SyncStatusProps {
  accountId?: string;
}

export default function SyncStatus({ accountId }: SyncStatusProps) {
  const { user } = useAuth();
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Fetch sync status on mount
  useEffect(() => {
    if (!user || !accountId) return;

    const fetchSyncStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/sync/campaigns?accountId=${accountId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch sync status');
        }

        const data = await response.json();
        setSyncLogs(data.lastSync ? [data.lastSync] : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSyncStatus();

    // Refresh every 30 seconds
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, [user, accountId]);

  const handleManualSync = async () => {
    if (!accountId || syncing) return;

    try {
      setSyncing(true);
      setError(null);

      const response = await fetch('/api/sync/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start sync');
      }

      // Refresh status
      const statusResponse = await fetch(
        `/api/sync/campaigns?accountId=${accountId}`
      );
      const data = await statusResponse.json();
      setSyncLogs(data.lastSync ? [data.lastSync] : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'partial':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'failed':
        return '✗';
      case 'partial':
        return '⚠';
      default:
        return '⟳';
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Sync Status</h3>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  const lastSync = syncLogs[0];
  const lastSyncTime = lastSync
    ? new Date(lastSync.completed_at).toLocaleString()
    : 'Never';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sync Status</h3>
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {lastSync ? (
        <div className={`p-4 rounded-lg ${getStatusColor(lastSync.status)}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getStatusIcon(lastSync.status)}</span>
                <div>
                  <p className="font-semibold capitalize">{lastSync.status}</p>
                  <p className="text-sm opacity-75">Type: {lastSync.sync_type}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="font-medium">Last Sync:</span> {lastSyncTime}
                </p>
                {lastSync.error_message && (
                  <p>
                    <span className="font-medium">Error:</span>{' '}
                    {lastSync.error_message}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right ml-4">
              <div className="text-3xl font-bold opacity-50">
                {getStatusIcon(lastSync.status)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-gray-600 text-center">No sync history available</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Status updates automatically every 30 seconds. Campaigns, ad sets, ads, and
          metrics are synchronized from Meta Ads API.
        </p>
      </div>
    </div>
  );
}
