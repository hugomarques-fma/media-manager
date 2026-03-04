'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: number;
  created_at: string;
  spend_total?: number;
  conversions_total?: number;
  roas?: number;
}

interface CampaignsTableProps {
  accountId: string;
  onSelectCampaign?: (campaignId: string) => void;
}

type SortField = 'name' | 'status' | 'daily_budget' | 'spend_total' | 'roas';
type SortDirection = 'asc' | 'desc';

export default function CampaignsTable({ accountId, onSelectCampaign }: CampaignsTableProps) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!user || !accountId) return;

    const fetchCampaigns = async () => {
      try {
        setLoading(true);

        // Fetch campaigns for the account
        const response = await fetch(
          `/api/campaigns?accountId=${accountId}&limit=100`
        );

        if (!response.ok) {
          // For now, use mock data
          const mockCampaigns: Campaign[] = [
            {
              id: '1',
              name: 'Summer Sale 2024',
              status: 'active',
              objective: 'CONVERSIONS',
              daily_budget: 1000,
              created_at: '2024-01-15',
              spend_total: 15000,
              conversions_total: 450,
              roas: 2.5,
            },
            {
              id: '2',
              name: 'Brand Awareness',
              status: 'active',
              objective: 'REACH',
              daily_budget: 500,
              created_at: '2024-01-20',
              spend_total: 8000,
              conversions_total: 120,
              roas: 1.8,
            },
            {
              id: '3',
              name: 'Holiday Campaign',
              status: 'paused',
              objective: 'CONVERSIONS',
              daily_budget: 2000,
              created_at: '2024-01-01',
              spend_total: 45000,
              conversions_total: 1200,
              roas: 3.2,
            },
            {
              id: '4',
              name: 'Traffic Drive',
              status: 'active',
              objective: 'TRAFFIC',
              daily_budget: 750,
              created_at: '2024-02-01',
              spend_total: 5000,
              conversions_total: 80,
              roas: 1.2,
            },
          ];
          setCampaigns(mockCampaigns);
          setError(null);
        } else {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaigns');
        // Still set mock data on error for demo
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [user, accountId]);

  // Filter and sort campaigns
  let filtered = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.objective.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  filtered.sort((a, b) => {
    let aVal: any = a[sortField] || '';
    let bVal: any = b[sortField] || '';

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const paginatedCampaigns = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500">Loading campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Campaigns</h3>
        <span className="text-sm text-gray-500">{filtered.length} total</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Note: Using sample data for demo
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search by name or objective..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {paginatedCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No campaigns found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Campaign {getSortIcon('name')}
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIcon('status')}
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Objective
                </th>
                <th
                  className="px-6 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('daily_budget')}
                >
                  Budget {getSortIcon('daily_budget')}
                </th>
                <th
                  className="px-6 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('spend_total')}
                >
                  Spend {getSortIcon('spend_total')}
                </th>
                <th
                  className="px-6 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('roas')}
                >
                  ROAS {getSortIcon('roas')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectCampaign?.(campaign.id)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{campaign.objective}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    ${campaign.daily_budget?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    ${campaign.spend_total?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium">
                    <span className={campaign.roas && campaign.roas > 2 ? 'text-green-600' : 'text-gray-900'}>
                      {campaign.roas?.toFixed(2) || '—'}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
