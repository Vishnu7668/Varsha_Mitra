import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { RealtimeDistrictWeatherData } from '../../types';
import { getRealtimeDistrictWeather } from '../../services/weather';
import {
  CloudRain,
  Droplets,
  Wind,
  Gauge,
  Thermometer,
  RotateCw,
  MapPin,
  Sun,
  CloudDrizzle,
  CloudLightning,
  Cloud,
  CheckCircle2,
  Info,
  Sparkles,
  Compass,
  Layers,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const DistrictWeatherWidget: React.FC = () => {
  const { village, isDarkMode, showToast, language, detectLiveLocation } = useApp();

  const [weatherData, setWeatherData] = useState<RealtimeDistrictWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadWeather = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await getRealtimeDistrictWeather(village);
      setWeatherData(data);
      if (isManualRefresh) {
        showToast(
          `Real-time telemetry synced for ${village.district} Region from National Agrometeorological Radar`,
          'success'
        );
      }
    } catch (err) {
      console.error('Failed to load district real-time weather:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [village, showToast]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  if (isLoading && !weatherData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border-2 border-emerald-500/20 animate-pulse space-y-4">
        <div className="h-7 w-60 bg-emerald-100 dark:bg-slate-700 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-36 bg-slate-100 dark:bg-slate-700/60 rounded-2xl" />
          <div className="h-36 bg-slate-100 dark:bg-slate-700/60 rounded-2xl" />
          <div className="h-36 bg-slate-100 dark:bg-slate-700/60 rounded-2xl" />
          <div className="h-36 bg-slate-100 dark:bg-slate-700/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  // Weather Icon selection
  const getWeatherIcon = (code: number, rain: number) => {
    if (code >= 95) return <CloudLightning className="w-10 h-10 text-amber-500 animate-pulse" />;
    if (rain >= 2.5) return <CloudRain className="w-10 h-10 text-sky-500 animate-bounce" />;
    if (rain > 0) return <CloudDrizzle className="w-10 h-10 text-cyan-500" />;
    if (code === 0) return <Sun className="w-10 h-10 text-amber-500 animate-spin" style={{ animationDuration: '24s' }} />;
    return <Cloud className="w-10 h-10 text-slate-400" />;
  };

  // Convert degree to cardinal direction
  const getWindCardinal = (deg?: number) => {
    if (deg === undefined) return 'SW';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Humidity Pill Styling
  const getHumidityTheme = (humidity: number) => {
    if (humidity >= 85) {
      return {
        bg: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-700',
        label: 'Very High (Saturated)',
        barColor: 'bg-indigo-600',
      };
    }
    if (humidity >= 65) {
      return {
        bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700',
        label: 'Optimal (Humid)',
        barColor: 'bg-emerald-500',
      };
    }
    if (humidity >= 40) {
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700',
        label: 'Moderate',
        barColor: 'bg-amber-500',
      };
    }
    return {
      bg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-700',
      label: 'Low (Dry Air)',
      barColor: 'bg-rose-500',
    };
  };

  const humidityTheme = getHumidityTheme(weatherData.relativeHumidity);

  // Rainfall Pill Styling
  const getRainTheme = (rain: number) => {
    if (rain >= 7.5) {
      return {
        bg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200',
        label: 'Heavy Downpour',
      };
    }
    if (rain >= 2.5) {
      return {
        bg: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200',
        label: 'Moderate Rain',
      };
    }
    if (rain > 0) {
      return {
        bg: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-200',
        label: 'Light Showers',
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-200',
      label: 'Dry (No Rain)',
    };
  };

  const rainTheme = getRainTheme(weatherData.currentRainMm);

  // Tooltip for Hourly Trend Chart
  const CustomHourlyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 text-xs backdrop-blur-md">
          <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-3">
            <span>Hour: {data.time}</span>
            <span className="text-amber-400 font-mono">{data.temp}°C</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Precipitation:</span>
              <span className="font-bold text-cyan-400 font-mono">{data.rainMm} mm</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Humidity:</span>
              <span className="font-bold text-indigo-400 font-mono">{data.humidity}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-linear-to-b from-white via-slate-50/50 to-white dark:from-slate-800 dark:via-slate-800 dark:to-slate-850 rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-emerald-500/30 dark:border-emerald-500/40 transition-all">
      {/* 1. Header Bar: Location, Live GPS button, and Telemetry Source */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE DOPPLER RADAR</span>
            </span>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              National Agrometeorological Observatory • Open-Meteo High-Resolution Feed
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <MapPin className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>
              {weatherData.districtName}, {village.state}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              ({weatherData.lat.toFixed(4)}°N, {weatherData.lng.toFixed(4)}°E)
            </span>
          </h2>
        </div>

        {/* Live Controls: Auto-GPS detection & Live Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          <button
            type="button"
            onClick={detectLiveLocation}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            title="Auto-detect my device GPS location"
          >
            <MapPin className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>Use Live GPS</span>
          </button>

          <button
            type="button"
            onClick={() => loadWeather(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 dark:bg-slate-700 dark:text-emerald-300 dark:border-slate-600 shadow-xs transition-all cursor-pointer"
            title="Refresh Real-time Radar Telemetry"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            {weatherData.updatedAt}
          </span>
        </div>
      </div>

      {/* 2. Primary Telemetry Quad-Grid: Bright, Rich Weather Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* CARD 1: Real-Time Precipitation Rate */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-cyan-50 via-white to-sky-100/60 dark:from-slate-800 dark:via-slate-800 dark:to-cyan-950/40 border-2 border-cyan-400/40 dark:border-cyan-700/50 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-cyan-600" />
                <span>Precipitation Rate</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${rainTheme.bg}`}>
                {rainTheme.label}
              </span>
            </div>

            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {weatherData.currentRainMm}
              </span>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                mm/hr
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Instantaneous rainfall rate at district radar.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Past 24h Rain:</span>
            <span className="font-extrabold text-cyan-700 dark:text-cyan-400 font-mono text-sm">
              {weatherData.past24hRainMm} mm
            </span>
          </div>
        </div>

        {/* CARD 2: Relative Humidity Level */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-indigo-50 via-white to-indigo-100/60 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/40 border-2 border-indigo-400/40 dark:border-indigo-700/50 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-indigo-600" />
                <span>Relative Humidity</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${humidityTheme.bg}`}>
                {humidityTheme.label}
              </span>
            </div>

            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {weatherData.relativeHumidity}%
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                RH (2m)
              </span>
            </div>

            {/* Visual gradient meter */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden my-2 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${humidityTheme.barColor}`}
                style={{ width: `${Math.min(100, Math.max(10, weatherData.relativeHumidity))}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Dew Point:</span>
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300 font-mono">
              {weatherData.dewPoint}°C (Vapor Saturation)
            </span>
          </div>
        </div>

        {/* CARD 3: Temperature & Apparent Heat */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-amber-50 via-white to-amber-100/60 dark:from-slate-800 dark:via-slate-800 dark:to-amber-950/40 border-2 border-amber-400/40 dark:border-amber-700/50 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <span>Ambient Temperature</span>
              </span>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                {weatherData.conditionText}
              </span>
            </div>

            <div className="my-2 flex items-center justify-between">
              <div>
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {weatherData.temperature}°C
                </span>
                <span className="block text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                  Feels like {weatherData.apparentTemperature}°C
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                {getWeatherIcon(weatherData.weatherCode, weatherData.currentRainMm)}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Barometer:</span>
            <span className="font-extrabold text-amber-800 dark:text-amber-300 font-mono">
              {weatherData.surfacePressure} hPa
            </span>
          </div>
        </div>

        {/* CARD 4: Wind & Multi-Depth Soil Telemetry */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-emerald-50 via-white to-teal-100/60 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/40 border-2 border-emerald-400/40 dark:border-emerald-700/50 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-emerald-600" />
                <span>Wind &amp; Soil Physics</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                {getWindCardinal(weatherData.windDirection)} {weatherData.windDirection}°
              </span>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {weatherData.windSpeed}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  km/h Monsoon Surge
                </span>
              </div>
            </div>

            {/* Multi-depth Soil Temperature Strip */}
            <div className="mt-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-slate-700 space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Seedbed (6cm):</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  {weatherData.soilTemp6cm !== undefined ? `${weatherData.soilTemp6cm}°C` : 'Optimal'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Root-Zone (18cm):</span>
                <span className="font-bold text-teal-700 dark:text-teal-400 font-mono">
                  {weatherData.soilTemp18cm !== undefined ? `${weatherData.soilTemp18cm}°C` : 'Optimal'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Soil Surface (0cm):</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
              {weatherData.soilTemp0cm !== undefined ? `${weatherData.soilTemp0cm}°C` : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. 12-Hour Hourly Trend Progression Chart */}
      {weatherData.hourlyForecast.length > 0 && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>Next 12 Hours Radar Outlook ({weatherData.districtName})</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Precipitation depth (mm) vs. Relative Humidity (%)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400 font-bold">
                <span className="w-2.5 h-2.5 bg-cyan-500 rounded-xs" /> Rain (mm)
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold">
                <span className="w-3 h-1 bg-indigo-500 rounded-full" /> Humidity (%)
              </span>
            </div>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weatherData.hourlyForecast} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                  vertical={false}
                />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="rain" orientation="left" stroke="#0891b2" fontSize={10} tickLine={false} unit="mm" />
                <YAxis yAxisId="hum" orientation="right" stroke="#6366f1" fontSize={10} tickLine={false} unit="%" domain={[20, 100]} hide={true} />
                <Tooltip content={<CustomHourlyTooltip />} />
                <Bar yAxisId="rain" dataKey="rainMm" fill="#06b6d4" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Line yAxisId="hum" type="monotone" dataKey="humidity" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Real Agronomic Decision Grounding Banner */}
      <div className="mt-4 p-4 rounded-2xl bg-linear-to-r from-emerald-500/15 via-teal-500/10 to-sky-500/15 border-2 border-emerald-500/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
          <strong className="text-emerald-950 dark:text-emerald-300 font-extrabold mr-1">
            Real-Time Sowing Physics:
          </strong>
          {weatherData.relativeHumidity >= 65 && weatherData.past24hRainMm >= 5 ? (
            <span>
              Atmospheric vapor saturation ({weatherData.relativeHumidity}%) and recent accumulation ({weatherData.past24hRainMm} mm) ensure healthy seedbed moisture at 6 cm. Field conditions are primed for uniform root emergence.
            </span>
          ) : weatherData.relativeHumidity < 50 ? (
            <span>
              Dry ambient air ({weatherData.relativeHumidity}% RH) causes rapid desiccation of topsoil. Maintain seed drilling depth at 5–6 cm to avoid false germination until the next rain surge.
            </span>
          ) : (
            <span>
              Current humidity is {weatherData.relativeHumidity}% with {weatherData.windSpeed} km/h {getWindCardinal(weatherData.windDirection)} winds. Soil temperature at seedbed is {weatherData.soilTemp6cm !== undefined ? `${weatherData.soilTemp6cm}°C` : 'steady'}. Suitable for timely Kharif sowing.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
