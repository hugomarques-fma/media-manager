interface KPICardProps {
  title: string;
  value: string | number;
  delta?: {
    percentage: number;
    direction: 'up' | 'down';
  };
  icon?: string;
}

export function KPICard({ title, value, delta, icon }: KPICardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-600 mb-2">{title}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>

      {delta && (
        <div
          className={`text-sm mt-2 ${
            delta.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {delta.direction === 'up' ? '↑' : '↓'} {Math.abs(delta.percentage)}% vs last period
        </div>
      )}
    </div>
  );
}
