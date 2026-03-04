'use client';

import { useState } from 'react';

export interface FilterState {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  accountId?: string;
  campaignId?: string;
  status?: 'all' | 'active' | 'paused' | 'archived';
  objective?: string;
  compareWith?: 'previous' | 'last_year' | 'none';
}

interface GlobalFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  accountId?: string;
  showComparison?: boolean;
}

export default function GlobalFilters({
  onFilterChange,
  accountId,
  showComparison = true,
}: GlobalFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'month',
    accountId,
    status: 'all',
    compareWith: 'none',
  });

  const [showCustomDates, setShowCustomDates] = useState(false);

  const handleDateRangeChange = (range: FilterState['dateRange']) => {
    const newFilters = { ...filters, dateRange: range };
    if (range !== 'custom') {
      newFilters.startDate = undefined;
      newFilters.endDate = undefined;
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
    setShowCustomDates(range === 'custom');
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (status: FilterState['status']) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleComparisonChange = (comparison: FilterState['compareWith']) => {
    const newFilters = { ...filters, compareWith: comparison };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      dateRange: 'month',
      accountId,
      status: 'all',
      compareWith: 'none',
    };
    setFilters(defaultFilters);
    setShowCustomDates(false);
    onFilterChange(defaultFilters);
  };

  const getDateRangeLabel = () => {
    const now = new Date();
    const getDaysAgo = (days: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() - days);
      return date.toLocaleDateString();
    };

    switch (filters.dateRange) {
      case 'week':
        return `Last 7 days (${getDaysAgo(7)} - Today)`;
      case 'month':
        return `Last 30 days (${getDaysAgo(30)} - Today)`;
      case 'quarter':
        return `Last 90 days (${getDaysAgo(90)} - Today)`;
      case 'year':
        return `Last 365 days (${getDaysAgo(365)} - Today)`;
      case 'custom':
        return `${filters.startDate || 'Start'} - ${filters.endDate || 'End'}`;
      default:
        return 'Select date range';
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <div className="inline-flex rounded-lg border border-gray-300">
              {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-3 py-2 text-xs font-medium capitalize ${
                    filters.dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range === 'quarter' ? '90d' : range === 'year' ? '1y' : range}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleDateRangeChange('custom')}
              className={`block w-full px-3 py-2 text-xs text-left border rounded ${
                filters.dateRange === 'custom'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Dates */}
        {showCustomDates && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value as FilterState['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Comparison Filter */}
        {showComparison && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compare With
            </label>
            <select
              value={filters.compareWith || 'none'}
              onChange={(e) => handleComparisonChange(e.target.value as FilterState['compareWith'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No Comparison</option>
              <option value="previous">Previous Period</option>
              <option value="last_year">Last Year</option>
            </select>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Active filters:</span> {getDateRangeLabel()}
          {filters.status && filters.status !== 'all' && `, Status: ${filters.status}`}
          {filters.compareWith && filters.compareWith !== 'none' && `, Comparing with ${filters.compareWith}`}
        </p>
      </div>
    </div>
  );
}
