'use client';

import { useState, useEffect } from 'react';
import { Notification, NotificationPriority, getPriorityBadgeColor, getNotificationIcon } from '@/lib/notifications-service';

interface NotificationCenterProps {
  accountId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({
  accountId = 'demo',
  isOpen,
  onClose,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      account_id: accountId,
      user_id: 'user-1',
      type: 'rule_executed',
      priority: 'medium',
      title: 'Rule Executed',
      message: 'Budget increase rule executed for "Summer Sale 2024"',
      read: false,
      archived: false,
      created_at: '2024-03-04T15:30:00Z',
      data: {
        campaign: 'Summer Sale 2024',
        rule: 'Increase High ROAS Budget',
      },
    },
    {
      id: '2',
      account_id: accountId,
      user_id: 'user-1',
      type: 'performance_anomaly',
      priority: 'high',
      title: 'Performance Anomaly',
      message: 'Unusual CTR change detected in "Traffic Drive"',
      read: false,
      archived: false,
      created_at: '2024-03-04T14:15:00Z',
      data: {
        campaign: 'Traffic Drive',
        metric: 'CTR',
        change: '+45%',
      },
    },
    {
      id: '3',
      account_id: accountId,
      user_id: 'user-1',
      type: 'suggestion_created',
      priority: 'medium',
      title: 'New Suggestion',
      message: 'AI suggests testing new creatives for "Brand Awareness"',
      read: true,
      archived: false,
      created_at: '2024-03-04T12:00:00Z',
      read_at: '2024-03-04T13:00:00Z',
      data: {
        campaign: 'Brand Awareness',
        type: 'creative',
      },
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const filtered = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'critical') return notif.priority === 'critical' || notif.priority === 'high';
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
      )
    );
  };

  const handleArchive = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, archived: true } : n)));
  };

  const handleClearAll = () => {
    setNotifications(notifications.map((n) => ({ ...n, archived: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-20">
      <div className="bg-white w-96 h-screen shadow-lg flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-4 py-3 flex gap-2">
          {(['all', 'unread', 'critical'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Critical'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                {filter === 'unread'
                  ? 'No unread notifications'
                  : filter === 'critical'
                    ? 'No critical notifications'
                    : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {filtered.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    notif.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <span className="text-xl">
                      {getNotificationIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 break-words">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${getPriorityBadgeColor(notif.priority)}`}
                        >
                          {notif.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(notif.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
