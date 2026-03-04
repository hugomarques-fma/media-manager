'use client';

import { useState } from 'react';
import {
  exportToCSV,
  exportToExcel,
  exportCampaignReport,
  exportPerformanceAnalytics,
} from '@/lib/export-utils';

interface ExportControlsProps {
  campaignsData?: any[];
  metricsData?: any[];
  analyticsData?: any[];
  disabled?: boolean;
}

export default function ExportControls({
  campaignsData,
  metricsData,
  analyticsData,
  disabled = false,
}: ExportControlsProps) {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'campaigns' | 'analytics' | 'all'>('campaigns');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');

  const handleExport = async () => {
    if (exporting) return;

    setExporting(true);
    try {
      if (exportType === 'campaigns' && campaignsData && metricsData) {
        exportCampaignReport(campaignsData, metricsData, exportFormat);
      } else if (exportType === 'analytics' && analyticsData) {
        exportPerformanceAnalytics(analyticsData, exportFormat);
      } else if (exportType === 'all') {
        // Export both reports
        if (campaignsData && metricsData) {
          exportCampaignReport(campaignsData, metricsData, exportFormat);
        }
        if (analyticsData) {
          setTimeout(() => {
            exportPerformanceAnalytics(analyticsData, exportFormat);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-900 mb-2">Export Data</p>
        <div className="flex items-center gap-3">
          {/* Export Type */}
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as any)}
            disabled={disabled || exporting}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="campaigns">Campaigns Report</option>
            <option value="analytics">Performance Analytics</option>
            <option value="all">All Reports</option>
          </select>

          {/* Export Format */}
          <div className="inline-flex rounded-lg border border-gray-300">
            <button
              onClick={() => setExportFormat('csv')}
              disabled={disabled || exporting}
              className={`px-3 py-2 text-sm font-medium ${
                exportFormat === 'csv'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              CSV
            </button>
            <button
              onClick={() => setExportFormat('excel')}
              disabled={disabled || exporting}
              className={`px-3 py-2 text-sm font-medium border-l border-gray-300 ${
                exportFormat === 'excel'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              Excel
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={disabled || exporting}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {exporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="ml-4 text-xs text-gray-600">
        <p>📊 {campaignsData?.length || 0} campaigns</p>
        <p>📈 {metricsData?.length || 0} metric points</p>
      </div>
    </div>
  );
}
