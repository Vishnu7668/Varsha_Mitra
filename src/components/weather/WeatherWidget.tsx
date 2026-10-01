import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { RealtimeDistrictWeatherData, VillageLocation } from '../../types';
import { getRealtimeDistrictWeather } from '../../services/weather';
import {
  Thermometer,
  Droplets,
  Wind,
  RotateCw,
  Sun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Cloud,
  Compass,
  ArrowUp,
  MapPin,
  Sparkles,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Loader2,
} from 'lucide-react';

export interface WeatherWidgetProps {
  /** Optional target village location. Defaults to context village if omitted. */
  village?: VillageLocation;
  /** Optional pre-fetched weather data. If omitted, fetched automatically. */
  weather?: RealtimeDistrictWeatherData | null;
  /** Display style variant */
  variant?: 'card' | 'compact' | 'banner';
  /** Show manual refresh trigger button */
  showRefreshButton?: boolean;
  /** Additional container styling classes */
  className?: string;
  /** Callback fired when weather data is manually or automatically refreshed */
  onRefresh?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  village: propVillage,
  weather: propWeather,
  variant = 'card',
  showRefreshButton = true,
  className = '',
  onRefresh,
}) => {
  const { village: contextVillage, showToast, detectLiveLocation, isLocatingGPS } = useApp();
  const activeVillage = propVillage || contextVillage;

  const [weatherData, setWeatherData] = useState<RealtimeDistrictWeatherData | null>(
    propWeather || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!propWeather);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Sync prop changes
  useEffect(() => {
    if (propWeather) {
      setWeatherData(propWeather);
      setIsLoading(false);
    }
  }, [propWeather]);

  // Fetch weather data if not provided via props
  const fetchWeather = useCallback(
    async (isManual = false) => {
      if (propWeather && !isManual) return;
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const data = await getRealtimeDistrictWeather(activeVillage);
        setWeatherData(data);
        if (isManual) {
          showToast(
            `Live conditions refreshed for ${activeVillage.name} (${activeVillage.district})`,
            'success'
          );
          if (onRefresh) onRefresh();
        }
      } catch (err) {
        console.error('WeatherWidget: Error fetching current conditions:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeVillage, propWeather, showToast, onRefresh]
  );

  useEffect(() => {
    if (!propWeather) {
      fetchWeather();
    }
  }, [activeVillage.id, propWeather, fetchWeather]);

  // Weather condition icon resolver
  const getWeatherIcon = (code: number, rain: number, size = 'w-9 h-9') => {
    if (code >= 95) {
      return <CloudLightning className={`${size} text-amber-500 animate-pulse`} />;
    }
    if (rain >= 2.5) {
      return <CloudRain className={`${size} text-sky-500 animate-bounce`} />;
    }
    if (rain > 0) {
      return <CloudDrizzle className={`${size} text-cyan-500`} />;
    }
    if (code === 0) {
      return (
        <Sun
          className={`${size} text-amber-400 animate-spin`}
          style={{ animationDuration: '30s' }}
        />
      );
    }
    return <Cloud className={`${size} text-slate-400`} />;
  };

  // Convert degree to cardinal wind direction
  const getWindCardinal = (deg?: number) => {
    if (deg === undefined) return 'SW';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Ag spray safety indicator based on wind speed
  const getSprayingStatus = (speed: number) => {
    if (speed < 5) return { text: 'Optimal Spray Window (Calm)', color: 'text-emerald-600 dark:text-emerald-400' };
    if (speed <= 15) return { text: 'Safe for Spraying', color: 'text-emerald-600 dark:text-emerald-400' };
    if (speed <= 25) return { text: 'Moderate Drift Risk', color: 'text-amber-600 dark:text-amber-400' };
    return { text: 'High Wind: Avoid Spraying', color: 'text-rose-600 dark:text-rose-400' };
  };

  // Loading skeleton
  if (isLoading && !weatherData) {
    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md animate-pulse space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-100 dark:bg-slate-700/60 rounded-2xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-700/60 rounded-2xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-700/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  const windDir = weatherData.windDirection ?? 240;
  const sprayInfo = getSprayingStatus(weatherData.windSpeed);

  // 1. Compact Variant (For top bars, headers, or floating panels)
  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex flex-wrap items-center gap-3 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs ${className}`}
      >
        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
          {getWeatherIcon(weatherData.weatherCode, weatherData.currentRainMm, 'w-4 h-4')}
          <span className="font-mono tabular-nums">{weatherData.temperature}°C</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <Droplets className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-mono tabular-nums">{weatherData.relativeHumidity}% RH</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <Wind className="w-3.5 h-3.5 text-teal-500" />
          <span className="font-mono tabular-nums">
            {weatherData.windSpeed} km/h {getWindCardinal(windDir)}
          </span>
        </div>
        {showRefreshButton && (
          <button
            type="button"
            onClick={() => fetchWeather(true)}
            disabled={isRefreshing}
            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Refresh weather"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  // 2. Banner Variant (Horizontal full-width banner)
  if (variant === 'banner') {
    return (
      <div
        className={`rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-white to-sky-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-850 border border-slate-200 dark:border-slate-700 shadow-md ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600">
              {getWeatherIcon(weatherData.weatherCode, weatherData.currentRainMm, 'w-8 h-8')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                  {weatherData.temperature}°C
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {weatherData.conditionText}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeVillage.name}, {activeVillage.district} • Feels like {weatherData.apparentTemperature}°C
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Humidity</span>
              <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-400 font-mono tabular-nums">
                {weatherData.relativeHumidity}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Wind</span>
              <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400 font-mono tabular-nums">
                {weatherData.windSpeed} km/h {getWindCardinal(windDir)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600 col-span-2 sm:col-span-1">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Rain Rate</span>
              <span className="text-sm font-extrabold text-sky-700 dark:text-sky-400 font-mono tabular-nums">
                {weatherData.currentRainMm} mm/h
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Default "Card" Variant: High-Impact, Structured Real-Time Telemetry Card
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-slate-700 transition-all ${className}`}
    >
      {/* Header Row: Location, Realtime Pulse, & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Current Weather Conditions
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {activeVillage.name}, {activeVillage.block} • {activeVillage.district} ({activeVillage.state})
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Updated: {weatherData.updatedAt}
          </span>

          {/* Quick Show My Current Location Button */}
          <button
            type="button"
            onClick={async () => {
              await detectLiveLocation();
              const mapEl = document.getElementById('farmer-google-map-section');
              if (mapEl) {
                mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            disabled={isLocatingGPS}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer shadow-xs"
            title="Detect and Show My Current Location on Google Maps"
          >
            {isLocatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            )}
            <span>{isLocatingGPS ? 'Locating...' : 'Show My Location'}</span>
          </button>

          {showRefreshButton && (
            <button
              type="button"
              onClick={() => fetchWeather(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer shadow-xs"
              title="Refresh Real-time Weather Telemetry"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isRefreshing ? 'Updating...' : 'Sync'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tri-Metric Cluster: Temperature, Humidity, Wind */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Metric 1: Temperature & Condition */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 dark:from-slate-800/90 dark:via-slate-800 dark:to-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <span>Ambient Air Temperature</span>
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">2m Sensor</span>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-700 shadow-sm border border-amber-100 dark:border-slate-600">
                {getWeatherIcon(weatherData.weatherCode, weatherData.currentRainMm, 'w-8 h-8')}
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
                  {weatherData.temperature}°C
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {weatherData.conditionText}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-200/70 dark:border-slate-700 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Feels Like: <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{weatherData.apparentTemperature}°C</strong></span>
            <span>Dew Point: <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{weatherData.dewPoint}°C</strong></span>
          </div>
        </div>

        {/* Metric 2: Relative Humidity */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 dark:from-slate-800/90 dark:via-slate-800 dark:to-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Droplets className="w-4 h-4 text-indigo-600" />
                <span>Relative Humidity</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                {weatherData.humidityStatus}
              </span>
            </div>

            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
                {weatherData.relativeHumidity}%
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Vapor pressure: {weatherData.surfacePressure} hPa
              </p>
            </div>
          </div>

          {/* Moisture Bar */}
          <div className="mt-3 pt-3 border-t border-indigo-200/70 dark:border-slate-700">
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, weatherData.relativeHumidity))}%` }}
              />
            </div>
            <div className="text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Transpiration: {weatherData.et0Mm ? `${weatherData.et0Mm} mm/d` : 'Moderate'}</span>
              <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                {weatherData.relativeHumidity >= 65 ? 'High Vapor' : 'Dry Ambient'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Wind Velocity & Direction */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 dark:from-slate-800/90 dark:via-slate-800 dark:to-teal-950/20 border border-teal-200/80 dark:border-teal-800/40 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-teal-900 dark:text-teal-300 mb-2">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Wind className="w-4 h-4 text-teal-600" />
                <span>Wind Velocity &amp; Vector</span>
              </span>
              <span className="text-teal-700 dark:text-teal-400 font-medium">10m Height</span>
            </div>

            <div className="flex items-center gap-3 my-2">
              {/* Rotating Compass Indicator */}
              <div className="relative w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 border border-teal-200 dark:border-slate-600 flex items-center justify-center shadow-sm shrink-0">
                <ArrowUp
                  className="w-5 h-5 text-teal-600 dark:text-teal-400 transition-transform duration-700"
                  style={{ transform: `rotate(${windDir}deg)` }}
                />
                <span className="absolute bottom-0.5 text-[8px] font-bold text-slate-400 font-mono">
                  {getWindCardinal(windDir)}
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
                  {weatherData.windSpeed}{' '}
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">km/h</span>
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Heading {getWindCardinal(windDir)} ({windDir}°)
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-teal-200/70 dark:border-slate-700 text-xs flex items-center justify-between">
            <span className={`font-semibold ${sprayInfo.color}`}>
              {sprayInfo.text}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Footnote Bar: Real-time Precipitation Rate & Topsoil Moisture */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-medium">
            <CloudRain className="w-3.5 h-3.5 text-sky-500" />
            <span>Rainfall Rate:</span>
            <strong className="text-slate-900 dark:text-white font-mono tabular-nums">
              {weatherData.currentRainMm} mm/h
            </strong>
          </span>
          <span>•</span>
          <span>
            Past 24h Rain:{' '}
            <strong className="text-slate-900 dark:text-white font-mono tabular-nums">
              {weatherData.past24hRainMm} mm
            </strong>
          </span>
          {weatherData.volumetricSoilMoisture0to3cm !== undefined && (
            <>
              <span>•</span>
              <span>
                Seedbed Moisture (0–3cm):{' '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                  {weatherData.volumetricSoilMoisture0to3cm} m³/m³
                </strong>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Open-Meteo High-Resolution Numerical Model</span>
        </div>
      </div>
    </div>
  );
};
