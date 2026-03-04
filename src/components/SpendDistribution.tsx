'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '@/lib/auth-context';

interface SpendData {
  campaign: string;
  spend: number;
  percentage: number;
}

interface SpendDistributionProps {
  accountId: string;
  view?: 'pie' | 'bar';
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

export default function SpendDistribution({ accountId, view = 'pie' }: SpendDistributionProps) {
  const { user } = useAuth();
  const [data, setData] = useState<SpendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'pie' | 'bar'>(view);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (!user || !accountId) return;

    const fetchSpendData = async () => {
      try {
        setLoading(true);

        // Mock data for demonstration
        const mockData: SpendData[] = [
          { campaign: 'Summer Sale 2024', spend: 15000, percentage: 0 },
          { campaign: 'Brand Awareness', spend: 8000, percentage: 0 },
          { campaign: 'Holiday Campaign', spend: 45000, percentage: 0 },
          { campaign: 'Traffic Drive', spend: 5000, percentage: 0 },
          { campaign: 'Retargeting', spend: 12000, percentage: 0 },
        ];

        const totalSpend = mockData.reduce((sum, item) => sum + item.spend, 0);
        const withPercentages = mockData.map((item) => ({
          ...item,
          percentage: (item.spend / totalSpend) * 100,
        }));

        setData(withPercentages);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load spend data');
      } finally {
        setLoading(false);
      }
    };

    fetchSpendData();
  }, [user, accountId, period]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 h-96">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500">Loading spend data...</p>
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

  const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-sm">{data.campaign}</p>
          <p className="text-sm text-gray-600">${data.spend.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Spend Distribution</h3>
        <div className="flex gap-2">
          <div className="inline-flex rounded-lg border border-gray-300">
            <button
              onClick={() => setChartView('pie')}
              className={`px-3 py-1 text-sm ${chartView === 'pie' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            >
              Pie
            </button>
            <button
              onClick={() => setChartView('bar')}
              className={`px-3 py-1 text-sm ${chartView === 'bar' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            >
              Bar
            </button>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'all')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {chartView === 'pie' ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ campaign, percentage }) => `${campaign} (${percentage.toFixed(1)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="spend"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="campaign"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              formatter={(value: any) => `$${Number(value).toLocaleString()}`}
            />
            <Bar dataKey="spend" fill="#3b82f6" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Total Spend</p>
          <p className="text-2xl font-bold text-gray-900">${totalSpend.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{data.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Avg Spend / Campaign</p>
          <p className="text-2xl font-bold text-gray-900">
            ${Math.round(totalSpend / data.length).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
