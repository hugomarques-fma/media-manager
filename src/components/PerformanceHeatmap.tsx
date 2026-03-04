'use client';

import { useEffect, useState } from 'react';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
  intensity: number; // 0-1
}

interface PerformanceHeatmapProps {
  metric?: 'spend' | 'conversions' | 'ctr' | 'roas';
  campaignId?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function PerformanceHeatmap({
  metric = 'spend',
  campaignId,
}: PerformanceHeatmapProps) {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate mock heatmap data
    const mockData: HeatmapData[] = [];
    const maxValue = 10000;

    DAYS.forEach((day, dayIndex) => {
      HOURS.forEach((hour) => {
        // Simulate higher activity during business hours and weekdays
        const baseValue = dayIndex < 5 ? 5000 : 3000; // Higher on weekdays
        const hourMultiplier =
          hour >= 9 && hour <= 18 ? 1.5 : hour >= 18 && hour <= 21 ? 1.2 : 0.5;
        const randomVariation = 0.7 + Math.random() * 0.6;

        const value = baseValue * hourMultiplier * randomVariation;
        const intensity = Math.min(value / maxValue, 1);

        mockData.push({
          day,
          hour,
          value: Math.round(value),
          intensity,
        });
      });
    });

    setData(mockData);
    setLoading(false);
  }, [metric, campaignId]);

  const getColor = (intensity: number) => {
    if (intensity < 0.2) return 'bg-gray-100';
    if (intensity < 0.4) return 'bg-blue-100';
    if (intensity < 0.6) return 'bg-blue-300';
    if (intensity < 0.8) return 'bg-blue-500';
    return 'bg-blue-700';
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'conversions':
        return 'Conversions by Hour';
      case 'ctr':
        return 'CTR (%) by Hour';
      case 'roas':
        return 'ROAS (x) by Hour';
      default:
        return 'Spend ($) by Hour';
    }
  };

  const getCellValue = (value: number) => {
    switch (metric) {
      case 'conversions':
        return value;
      case 'ctr':
        return (value / 100).toFixed(1);
      case 'roas':
        return (value / 5000).toFixed(2);
      default:
        return `$${(value / 1000).toFixed(1)}k`;
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading heatmap...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold mb-4">{getMetricLabel()}</h3>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header with hours */}
          <div className="flex">
            <div className="w-12" /> {/* Empty corner */}
            {HOURS.map((hour) => (
              <div
                key={`hour-${hour}`}
                className="w-8 h-8 text-xs text-center text-gray-600 font-medium flex items-center justify-center"
              >
                {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
              </div>
            ))}
          </div>

          {/* Rows for each day */}
          {DAYS.map((day, dayIndex) => (
            <div key={`row-${day}`} className="flex items-start">
              {/* Day label */}
              <div className="w-12 h-8 text-xs font-medium text-gray-700 flex items-center justify-center bg-gray-50">
                {day}
              </div>

              {/* Heatmap cells */}
              {HOURS.map((hour) => {
                const cell = data.find((d) => d.day === day && d.hour === hour);
                if (!cell) return null;

                return (
                  <div
                    key={`cell-${day}-${hour}`}
                    className={`w-8 h-8 ${getColor(cell.intensity)} border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 transition-all group relative`}
                    title={`${day} ${hour}:00 - ${getCellValue(cell.value)}`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      {day} {hour}:00
                      <br />
                      {getCellValue(cell.value)}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 border border-gray-300" />
          <span className="text-xs text-gray-600">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-300" />
          <span className="text-xs text-gray-600">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-700" />
          <span className="text-xs text-gray-600">High</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
        <p>
          💡 This heatmap shows when your campaigns perform best by hour of day and day of
          week. Darker colors indicate higher {metric}.
        </p>
      </div>
    </div>
  );
}
