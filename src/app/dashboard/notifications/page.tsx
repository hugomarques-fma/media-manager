'use client';

import { useState } from 'react';
import NotificationCenter from '@/components/NotificationCenter';
import AuditLog from '@/components/AuditLog';

type ViewType = 'notifications' | 'audit';

export default function NotificationsPage() {
  const [view, setView] = useState<ViewType>('notifications');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications & Audit</h1>
        <p className="text-gray-600 mt-1">
          Manage your notifications and review the complete audit trail.
        </p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('notifications')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'notifications'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔔 Notifications
        </button>
        <button
          onClick={() => setView('audit')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'audit'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📋 Audit Log
        </button>
      </div>

      {/* Content */}
      <div>
        {view === 'notifications' ? (
          <div className="space-y-6">
            <NotificationCenter isOpen={true} onClose={() => {}} />

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  🔔 Notification Types
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  Receive alerts for important events in your media management platform.
                </p>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Campaign performance changes</li>
                  <li>• Rule executions and suggestions</li>
                  <li>• Sync failures and warnings</li>
                  <li>• Token expiration alerts</li>
                  <li>• Budget threshold notifications</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  ✓ Notification Management
                </h3>
                <p className="text-green-800 text-sm mb-4">
                  Organize and manage your notifications efficiently.
                </p>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Read/unread status tracking</li>
                  <li>• Archive notifications</li>
                  <li>• Filter by priority</li>
                  <li>• Quick dismiss options</li>
                  <li>• Notification history</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  ⚙️ Preferences
                </h3>
                <p className="text-purple-800 text-sm mb-4">
                  Customize your notification settings.
                </p>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li>• Email notifications</li>
                  <li>• SMS alerts (critical only)</li>
                  <li>• In-app notifications</li>
                  <li>• Daily digest emails</li>
                  <li>• Quiet hours</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AuditLog accountId="demo" />

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  📋 What is Audit Log?
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  The audit log tracks all changes and actions in your account for compliance
                  and debugging purposes.
                </p>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Created items and configurations</li>
                  <li>• Updated settings and rules</li>
                  <li>• Deleted campaigns and items</li>
                  <li>• Status changes and updates</li>
                  <li>• User and system actions</li>
                  <li>• Executed rules and automations</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  🔍 Filtering & Analysis
                </h3>
                <p className="text-green-800 text-sm mb-4">
                  Search and filter the audit log to find specific events and changes.
                </p>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Filter by event type</li>
                  <li>• Filter by entity (campaign, rule, etc.)</li>
                  <li>• View change details (before/after)</li>
                  <li>• Track user actions</li>
                  <li>• Identify system changes</li>
                  <li>• Export audit trail</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
