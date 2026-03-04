'use client';

import { useState } from 'react';
import { ScheduledReport, formatScheduleForDisplay } from '@/lib/pdf-utils';

interface ScheduledReportsProps {
  accountId: string;
}

export default function ScheduledReports({ accountId }: ScheduledReportsProps) {
  const [reports, setReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      account_id: accountId,
      name: 'Weekly Performance Summary',
      type: 'performance',
      frequency: 'weekly',
      scheduled_time: '9:00 AM',
      recipients: ['marketing@company.com', 'cfo@company.com'],
      filters: {
        dateRange: 'last_7_days',
        includeMetrics: ['spend', 'conversions', 'roas', 'cpa'],
      },
      enabled: true,
      created_at: '2024-02-15T10:30:00Z',
      last_run_at: '2024-03-03T09:00:00Z',
    },
    {
      id: '2',
      account_id: accountId,
      name: 'Monthly ROI Report',
      type: 'roi',
      frequency: 'monthly',
      scheduled_time: '8:00 AM',
      recipients: ['exec@company.com'],
      filters: {
        dateRange: 'last_30_days',
        includeMetrics: ['spend', 'revenue', 'roas', 'profit'],
      },
      enabled: true,
      created_at: '2024-01-20T08:00:00Z',
      last_run_at: '2024-03-01T08:00:00Z',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);

  const handleToggleReport = (id: string) => {
    setReports(
      reports.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Scheduled Reports</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
        >
          + Schedule Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No scheduled reports yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium mt-2"
          >
            Create your first report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`p-4 border rounded-lg transition-colors ${
                report.enabled
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{report.name}</h4>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {report.type}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        report.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {report.enabled ? '✓ Active' : '○ Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatScheduleForDisplay(report.frequency, report.scheduled_time)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleReport(report.id)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      report.enabled
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {report.enabled ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Recipients</p>
                  <div className="flex flex-wrap gap-2">
                    {report.recipients.map((email) => (
                      <span
                        key={email}
                        className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs"
                      >
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Last Run</p>
                  <p className="text-gray-900">
                    {report.last_run_at
                      ? new Date(report.last_run_at).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Report</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekly Performance Report"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Performance</option>
                  <option>ROI</option>
                  <option>Campaign</option>
                  <option>Account</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Recipients (comma-separated)
                </label>
                <textarea
                  placeholder="email1@company.com, email2@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
