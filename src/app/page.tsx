'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-blue-600">media-manager</h1>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Intelligent Meta Ads Management
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered platform for optimizing your Meta Ads campaigns with
            intelligent suggestions and automated rules.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition inline-block"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition inline-block"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-3xl mb-4">🤖</div>
              <h4 className="text-xl font-semibold mb-2">AI Agent</h4>
              <p className="text-gray-600">
                Intelligent analysis of your campaigns with actionable suggestions
                for optimization.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-3xl mb-4">📊</div>
              <h4 className="text-xl font-semibold mb-2">Dashboard</h4>
              <p className="text-gray-600">
                Real-time KPIs, charts, and visualizations for complete campaign
                visibility.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-3xl mb-4">⚙️</div>
              <h4 className="text-xl font-semibold mb-2">Rules Engine</h4>
              <p className="text-gray-600">
                Create custom automation rules without coding. Suggestions or
                automatic execution.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-3xl mb-4">🔒</div>
              <h4 className="text-xl font-semibold mb-2">Secure</h4>
              <p className="text-gray-600">
                Enterprise-grade security with encrypted tokens and row-level data
                isolation.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-3xl mb-4">📈</div>
              <h4 className="text-xl font-semibold mb-2">Analytics</h4>
              <p className="text-gray-600">
                Track performance metrics, feedback, and insights from your
                automations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-3xl mb-4">🔔</div>
              <h4 className="text-xl font-semibold mb-2">Notifications</h4>
              <p className="text-gray-600">
                Stay updated with in-app alerts and daily email digests of your
                campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to optimize your ads?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join media-manager and let AI help you manage your campaigns more
            efficiently.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold transition"
          >
            Start Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 media-manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
