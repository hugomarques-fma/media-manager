'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';
import { useAuth } from '@/lib/auth-context';

interface ChartData {
  date: string;
  spend: number;
  conversions: number;
  impressions: number;
  roas?: number;
}

interface TimelineChartProps {
  campaignId?: string;
  accountId: string;
  metric?: 'spend' | 'conversions' | 'roas' | 'all';
  days?: number;
}

export default function TimelineChart({
  campaignId,
  accountId,
  metric = 'all',
  days = 30,
}: TimelineChartProps) {
  const { user } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !accountId) return;

    const fetchMetricsData = async () => {
      try {
        setLoading(true);

        // Determine date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let query = `
          SELECT
            cm.date,
            SUM(cm.spend)::numeric as spend,
            SUM(cm.conversions)::integer as conversions,
            SUM(cm.impressions)::integer as impressions,
            AVG(cm.roas)::numeric as roas
          FROM campaign_metrics cm
          JOIN campaigns c ON cm.campaign_id = c.id
          JOIN ad_accounts aa ON c.ad_account_id = aa.id
          WHERE aa.id = '${accountId}'
            AND cm.date >= '${startDate.toISOString().split('T')[0]}'
            AND cm.date <= '${endDate.toISOString().split('T')[0]}'
        `;

        if (campaignId) {
          query += ` AND c.id = '${campaignId}'`;
        }

        query += ` GROUP BY cm.date ORDER BY cm.date ASC`;

        // For now, we'll use a mock data structure
        // In production, this would call a Supabase RPC function
        const mockData: ChartData[] = [];
        for (let i = days; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          mockData.push({
            date: dateStr,
            spend: Math.random() * 5000 + 500,
            conversions: Math.floor(Math.random() * 200 + 10),
            impressions: Math.floor(Math.random() * 50000 + 5000),
            roas: Math.random() * 4 + 1,
          });
        }

        setData(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetricsData();
  }, [user, accountId, campaignId, days]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 h-96">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 h-96">
        <div className="flex items-center justify-center h-full">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const chartTitle =
    metric === 'all'
      ? 'Campaign Performance Timeline'
      : metric === 'spend'
        ? 'Daily Spend Trend'
        : metric === 'conversions'
          ? 'Conversions Over Time'
          : 'ROAS Trend';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold mb-4">{chartTitle}</h3>

      {metric === 'all' ? (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#999"
              style={{ marginTop: '10px' }}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#999" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#999" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  if (value > 1000) {
                    return `$${(value / 1000).toFixed(1)}k`;
                  }
                  return `$${value.toFixed(2)}`;
                }
                return value;
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="spend" fill="#3b82f6" name="Spend ($)" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversions"
              stroke="#10b981"
              name="Conversions"
              dot={false}
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : metric === 'spend' ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
            <YAxis tick={{ fontSize: 12 }} stroke="#999" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              formatter={(value: any) => `$${Number(value).toFixed(2)}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="Daily Spend"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : metric === 'conversions' ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
            <YAxis tick={{ fontSize: 12 }} stroke="#999" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="conversions"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name="Conversions"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
            <YAxis tick={{ fontSize: 12 }} stroke="#999" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              formatter={(value: any) => `${Number(value).toFixed(2)}x`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="roas"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name="ROAS"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Data is updated daily. Charts show last {days} days of performance metrics.
        </p>
      </div>
    </div>
  );
}
