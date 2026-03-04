'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NotificationCenter from '@/components/NotificationCenter';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // Mock data

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">media-manager</h1>
        </div>

        <nav className="px-4 py-6 space-y-2">
          <Link
            href="/dashboard"
            className={`block px-4 py-2 rounded-lg font-medium transition ${
              pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            📊 Dashboard
          </Link>
          <Link
            href="/dashboard/analytics"
            className={`block px-4 py-2 rounded-lg font-medium transition ${
              pathname === '/dashboard/analytics'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            📈 Analytics
          </Link>
          <Link
            href="/dashboard/suggestions"
            className={`block px-4 py-2 rounded-lg font-medium transition ${
              pathname === '/dashboard/suggestions'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            💡 Suggestions
          </Link>
          <Link
            href="/dashboard/rules"
            className={`block px-4 py-2 rounded-lg font-medium transition ${
              pathname === '/dashboard/rules'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            ⚙️ Rules
          </Link>
          <Link
            href="/dashboard/notifications"
            className={`block px-4 py-2 rounded-lg font-medium transition ${
              pathname === '/dashboard/notifications'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            🔔 Notifications
          </Link>
          <Link
            href="/reports"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
          >
            📄 Reports
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
          >
            ⚡ Settings
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white w-64">
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              {pathname === '/dashboard/notifications'
                ? 'Notifications & Audit'
                : pathname === '/dashboard/analytics'
                  ? 'Analytics'
                  : pathname === '/dashboard/rules'
                    ? 'Automation Rules'
                    : pathname === '/dashboard/suggestions'
                      ? 'AI Suggestions'
                      : 'Dashboard'}
            </h2>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Notification Center Modal */}
        {showNotifications && (
          <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        )}

        {/* Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
