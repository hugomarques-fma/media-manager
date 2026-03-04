'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Ad {
  id: string;
  name: string;
  status: string;
  creative_url?: string;
  creative_type?: string;
  adset_id: string;
  created_at: string;
  performance?: {
    spend: number;
    clicks: number;
    conversions: number;
    ctr: number;
    roas: number;
  };
}

interface AdPanelProps {
  adSetId?: string;
  campaignId?: string;
  view?: 'grid' | 'list';
}

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

export default function AdPanel({
  adSetId,
  campaignId,
  view = 'grid',
}: AdPanelProps) {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAds = async () => {
      try {
        setLoading(true);

        // Mock data for demonstration
        const mockAds: Ad[] = [
          {
            id: '1',
            name: 'Summer Sale - Image Ad',
            status: 'active',
            creative_type: 'image',
            adset_id: adSetId || 'all',
            created_at: '2024-01-15',
            performance: {
              spend: 2500,
              clicks: 450,
              conversions: 45,
              ctr: 3.2,
              roas: 2.8,
            },
          },
          {
            id: '2',
            name: 'Video Creative - 15s',
            status: 'active',
            creative_type: 'video',
            adset_id: adSetId || 'all',
            created_at: '2024-01-20',
            performance: {
              spend: 1800,
              clicks: 320,
              conversions: 52,
              ctr: 2.8,
              roas: 3.2,
            },
          },
          {
            id: '3',
            name: 'Carousel Ad - 3 images',
            status: 'paused',
            creative_type: 'carousel',
            adset_id: adSetId || 'all',
            created_at: '2024-01-25',
            performance: {
              spend: 1200,
              clicks: 180,
              conversions: 20,
              ctr: 2.1,
              roas: 1.8,
            },
          },
          {
            id: '4',
            name: 'Collection Ad',
            status: 'active',
            creative_type: 'collection',
            adset_id: adSetId || 'all',
            created_at: '2024-02-01',
            performance: {
              spend: 950,
              clicks: 140,
              conversions: 28,
              ctr: 2.4,
              roas: 2.4,
            },
          },
        ];

        setAds(mockAds);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ads');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [user, adSetId, campaignId]);

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

  const getCreativeIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return '🎬';
      case 'carousel':
        return '🎠';
      case 'collection':
        return '📦';
      case 'image':
      default:
        return '🖼️';
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500">Loading ads...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Ads & Creatives</h3>
        <span className="text-sm text-gray-500">{ads.length} ads</span>
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No ads found</p>
        </div>
      ) : view === 'grid' ? (
        <>
          {/* Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {ads.map((ad) => (
              <div
                key={ad.id}
                onClick={() => setSelectedAd(ad)}
                className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Creative Thumbnail */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={ad.creative_url || PLACEHOLDER_IMAGE}
                    alt={ad.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="text-2xl">{getCreativeIcon(ad.creative_type)}</span>
                  </div>
                </div>

                {/* Ad Info */}
                <div className="p-4">
                  <h4 className="font-medium text-sm text-gray-900 mb-2 truncate">
                    {ad.name}
                  </h4>
                  <div className="mb-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(ad.status)}`}>
                      {ad.status}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Spend:</span>
                      <span className="font-medium">${ad.performance?.spend.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CTR:</span>
                      <span className="font-medium">{ad.performance?.ctr.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROAS:</span>
                      <span className="font-medium text-green-600">
                        {ad.performance?.roas.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Ad Details Modal */}
          {selectedAd && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedAd.name}</h3>
                  <button
                    onClick={() => setSelectedAd(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Creative Preview */}
                  <div>
                    <img
                      src={selectedAd.creative_url || PLACEHOLDER_IMAGE}
                      alt={selectedAd.name}
                      className="w-full rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(selectedAd.status)}`}>
                        {selectedAd.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="text-sm font-medium">
                        {getCreativeIcon(selectedAd.creative_type)}{' '}
                        {selectedAd.creative_type || 'image'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-sm font-medium">
                        {new Date(selectedAd.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {selectedAd.performance && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Performance</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Spend</p>
                            <p className="text-lg font-bold">
                              ${selectedAd.performance.spend}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Clicks</p>
                            <p className="text-lg font-bold">
                              {selectedAd.performance.clicks}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600">CTR</p>
                            <p className="text-lg font-bold">
                              {selectedAd.performance.ctr.toFixed(2)}%
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600">ROAS</p>
                            <p className="text-lg font-bold text-green-600">
                              {selectedAd.performance.roas.toFixed(2)}x
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* List View */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Spend
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  CTR
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr
                  key={ad.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedAd(ad)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {ad.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getCreativeIcon(ad.creative_type)} {ad.creative_type || 'image'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(ad.status)}`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    ${ad.performance?.spend}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    {ad.performance?.ctr.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                    {ad.performance?.roas.toFixed(2)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
