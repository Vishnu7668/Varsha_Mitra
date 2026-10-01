import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from 'recharts';
import { BarChart3, Info, Eye, Layers } from 'lucide-react';

export const RainfallChart: React.FC = () => {
  const { t, forecasts, isDarkMode, advisory } = useApp();
  const [showPastDays, setShowPastDays] = useState<boolean>(true);

  // Filter dataset based on showPastDays
  const chartData = useMemo(() => {
    if (!forecasts || forecasts.length === 0) return [];
    if (showPastDays) {
      return forecasts.map((d) => ({
        ...d,
        label: d.isPast ? `D${d.dayNumber}` : `+${d.dayNumber}d`,
        displayDate: d.dateStr,
        breakShade: d.isBreakDay && !d.isPast ? 100 : 0,
      }));
    }
    return forecasts
      .filter((d) => !d.isPast)
      .map((d) => ({
        ...d,
        label: `+${d.dayNumber}d`,
        displayDate: d.dateStr,
        breakShade: d.isBreakDay ? 100 : 0,
      }));
  }, [forecasts, showPastDays]);

  // Find start and end indices of consecutive dry breaks for shading
  const breakRanges = useMemo(() => {
    const ranges: { start: string; end: string }[] = [];
    let currentStart: string | null = null;
    let prevLabel: string | null = null;

    chartData.forEach((item) => {
      if (!item.isPast && item.isBreakDay) {
        if (!currentStart) currentStart = item.label;
        prevLabel = item.label;
      } else {
        if (currentStart && prevLabel) {
          ranges.push({ start: currentStart, end: prevLabel });
          currentStart = null;
        }
      }
    });

    if (currentStart && prevLabel) {
      ranges.push({ start: currentStart, end: prevLabel });
    }

    return ranges;
  }, [chartData]);

  // Tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs backdrop-blur-md min-w-[200px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/80 mb-2">
            <span className="font-bold text-slate-200">
              {data.displayDate} ({data.label})
            </span>
            <span
              className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                data.isPast
                  ? 'bg-slate-800 text-slate-300'
                  : data.dayNumber <= 7
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : data.dayNumber <= 14
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-sky-950 text-sky-300 border border-sky-700'
              }`}
            >
              {data.confidenceZone?.toUpperCase()}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Precipitation:</span>
              <span className="font-bold text-sky-400">{data.rainMm} mm</span>
            </div>
            {!data.isPast && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rain Probability:</span>
                <span className="font-bold text-indigo-400">{data.rainProb}%</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Soil Moisture:</span>
              <span className="font-bold text-emerald-400">{data.soilMoisturePercent}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Temperature:</span>
              <span className="font-bold text-amber-400">{data.tempMax}°C / {data.tempMin}°C</span>
            </div>
            {data.isBreakDay && !data.isPast && (
              <div className="mt-1 pt-1 border-t border-slate-800 text-rose-400 font-semibold text-[11px] flex items-center gap-1">
                <span>⚠️ Dry Break Day (&lt; 2.5 mm)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 shadow-md border border-slate-200 dark:border-slate-700">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <span>{t.rainfallOutlookTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Probability bars &amp; expected rainfall curve across Kharif sowing horizons
          </p>
        </div>

        {/* Toggle Past 10 Days vs 30 Days Forecast */}
        <button
          type="button"
          onClick={() => setShowPastDays(!showPastDays)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showPastDays ? t.viewForecast30Days : t.viewAll40Days}</span>
        </button>
      </div>

      {/* Confidence Zone Banner Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-xs font-semibold">
        {showPastDays && (
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <div className="truncate">
              <span className="block text-[10px] text-slate-500 uppercase">Observed</span>
              <span className="truncate text-slate-700 dark:text-slate-200">Past 10 Days</span>
            </div>
          </div>
        )}
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div className="truncate">
            <span className="block text-[10px] text-emerald-600 uppercase">High Confidence</span>
            <span className="truncate text-emerald-900 dark:text-emerald-200">Days 1 - 7</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="truncate">
            <span className="block text-[10px] text-amber-600 uppercase">Medium</span>
            <span className="truncate text-amber-900 dark:text-amber-200">Days 8 - 14</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <div className="truncate">
            <span className="block text-[10px] text-sky-600 uppercase">Indicative</span>
            <span className="truncate text-sky-900 dark:text-sky-200">Days 15 - 30</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-72 sm:h-80 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? '#334155' : '#e2e8f0'}
              vertical={false}
            />

            <XAxis
              dataKey="label"
              stroke={isDarkMode ? '#94a3b8' : '#64748b'}
              fontSize={10}
              tickLine={false}
              interval={showPastDays ? 2 : 1}
            />

            <YAxis
              yAxisId="rain"
              orientation="left"
              stroke="#0284c7"
              fontSize={10}
              tickLine={false}
              unit="mm"
            />

            <YAxis
              yAxisId="prob"
              orientation="right"
              stroke="#6366f1"
              fontSize={10}
              tickLine={false}
              unit="%"
              domain={[0, 100]}
              hide={true}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Shaded Dry Break Windows */}
            {breakRanges.map((range, idx) => (
              <ReferenceArea
                key={idx}
                yAxisId="rain"
                x1={range.start}
                x2={range.end}
                fill="#f43f5e"
                fillOpacity={0.12}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                label={{
                  value: 'DRY BREAK',
                  position: 'insideTop',
                  fill: '#e11d48',
                  fontSize: 9,
                  fontWeight: 700,
                }}
              />
            ))}

            {/* Bars for Rain Probability */}
            <Bar
              yAxisId="prob"
              dataKey="rainProb"
              name="Rain Probability (%)"
              fill="#818cf8"
              opacity={0.35}
              radius={[4, 4, 0, 0]}
            />

            {/* Line for Expected Rainfall (mm) */}
            <Line
              yAxisId="rain"
              type="monotone"
              dataKey="rainMm"
              name="Precipitation (mm)"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#0284c7' }}
              activeDot={{ r: 6, fill: '#0ea5e9' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Explanatory Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-sky-600 rounded-full" />
            <span>Expected Rain (mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-indigo-300 rounded-xs" />
            <span>Daily Rain Probability (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-rose-200 border border-rose-400 rounded-xs" />
            <span>Dry Spell Break Window (&lt;2.5 mm)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
          <Info className="w-3 h-3" />
          <span>Days 8-30: Simulated extended-range outlook</span>
        </div>
      </div>
    </div>
  );
};
