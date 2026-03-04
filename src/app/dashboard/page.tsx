'use client';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Spend</div>
          <div className="text-3xl font-bold text-gray-900">R$ 0,00</div>
          <div className="text-sm text-gray-500 mt-2">+0% vs last period</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Conversions</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-500 mt-2">+0% vs last period</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Avg CPA</div>
          <div className="text-3xl font-bold text-gray-900">R$ 0,00</div>
          <div className="text-sm text-gray-500 mt-2">+0% vs last period</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Avg ROAS</div>
          <div className="text-3xl font-bold text-gray-900">0.0x</div>
          <div className="text-sm text-gray-500 mt-2">+0% vs last period</div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Welcome to media-manager! 🎉
        </h3>
        <p className="text-blue-800 mb-4">
          To get started, you need to connect your Meta Ads account. This will allow us to
          sync your campaigns and help you optimize them.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
          Connect Meta Ads Account
        </button>
      </div>

      {/* Features Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What can you do?</h3>
        <ul className="space-y-2 text-gray-700">
          <li>✅ Connect and sync your Meta Ads campaigns</li>
          <li>✅ View real-time performance metrics</li>
          <li>✅ Get AI-powered optimization suggestions</li>
          <li>✅ Create custom automation rules</li>
          <li>✅ Receive alerts and notifications</li>
          <li>✅ Export reports and analytics</li>
        </ul>
      </div>
    </div>
  );
}
