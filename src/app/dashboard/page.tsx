'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import GlobalFilters, { FilterState } from '@/components/GlobalFilters';
import TimelineChart from '@/components/TimelineChart';
import CampaignsTable from '@/components/CampaignsTable';
import SpendDistribution from '@/components/SpendDistribution';
import SyncStatus from '@/components/SyncStatus';
import ExportControls from '@/components/ExportControls';
import KPICard from '@/components/KPICard';

interface AccountData {
  id: string;
  name: string;
  status: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'month',
    status: 'all',
    compareWith: 'none',
  });
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // For now using demo account
  const demoAccount: AccountData = {
    id: '1',
    name: 'Demo Meta Ads Account',
    status: 'connected',
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your campaign performance.</p>
      </div>

      {/* Global Filters */}
      <GlobalFilters
        onFilterChange={handleFilterChange}
        accountId={selectedAccount?.id || demoAccount.id}
        showComparison={true}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Spend"
          value="$48,500"
          delta="+12%"
          trend="up"
          icon="💰"
        />
        <KPICard
          title="Conversions"
          value="2,847"
          delta="+28%"
          trend="up"
          icon="✓"
        />
        <KPICard
          title="Avg CPA"
          value="$17.05"
          delta="-5%"
          trend="down"
          icon="💵"
        />
        <KPICard
          title="Avg ROAS"
          value="2.4x"
          delta="+18%"
          trend="up"
          icon="📈"
        />
      </div>

      {/* Sync Status */}
      <SyncStatus accountId={selectedAccount?.id || demoAccount.id} />

      {/* Export Controls */}
      <ExportControls
        campaignsData={[]} // Would be populated from API
        metricsData={[]}
        analyticsData={[]}
      />

      {/* Performance Timeline */}
      <TimelineChart
        accountId={selectedAccount?.id || demoAccount.id}
        campaignId={selectedCampaignId || undefined}
        metric="all"
        days={30}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Spend Distribution */}
        <div className="lg:col-span-1">
          <SpendDistribution
            accountId={selectedAccount?.id || demoAccount.id}
            view="pie"
          />
        </div>

        {/* Right Column - Campaigns Table */}
        <div className="lg:col-span-2">
          <CampaignsTable
            accountId={selectedAccount?.id || demoAccount.id}
            onSelectCampaign={setSelectedCampaignId}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Getting Started */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📊 Campaign Management
          </h3>
          <p className="text-blue-800 mb-4">
            Select a campaign from the table above to view detailed performance metrics
            and make real-time adjustments.
          </p>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ View campaign performance metrics</li>
            <li>✓ Pause or resume campaigns</li>
            <li>✓ Update daily budgets</li>
            <li>✓ Compare performance periods</li>
          </ul>
        </div>

        {/* Features Overview */}
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🚀 Available Features
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>✅ Real-time campaign synchronization</li>
            <li>✅ Performance analytics & insights</li>
            <li>✅ AI-powered optimization suggestions</li>
            <li>✅ Custom automation rules</li>
            <li>✅ Alerts & notifications</li>
            <li>✅ CSV/Excel data export</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
