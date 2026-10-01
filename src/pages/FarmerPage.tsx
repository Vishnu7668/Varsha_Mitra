import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SetupCard } from '../components/farmer/SetupCard';
import { WeatherWidget } from '../components/weather/WeatherWidget';
import { DistrictWeatherWidget } from '../components/farmer/DistrictWeatherWidget';
import { AdvisoryHeroCard } from '../components/farmer/AdvisoryHeroCard';
import { RainfallChart } from '../components/farmer/RainfallChart';
import { AgriIntelligenceHub } from '../components/farmer/AgriIntelligenceHub';
import { MetricsGauges } from '../components/farmer/MetricsGauges';
import { FarmingTips } from '../components/farmer/FarmingTips';
import { PolicyHub } from '../components/farmer/PolicyHub';
import { AlertHistory } from '../components/farmer/AlertHistory';
import { GoogleAgriMap } from '../components/map/GoogleAgriMap';
import {
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Radio,
  MapPin,
  Sparkles,
  Compass,
  Layers,
  Thermometer,
  ShieldCheck,
  Search,
  Eye,
  Activity,
  BarChart3,
  Map as MapIcon,
  Navigation,
  Loader2,
} from 'lucide-react';

export const FarmerPage: React.FC = () => {
  const { village, crop, soil, advisory, setVillage, showToast, detectLiveLocation, isLocatingGPS } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'advisory' | 'map' | 'forecast' | 'intel'>('all');

  const handleShowCurrentLocationOnMap = async () => {
    setActiveTab('map');
    await detectLiveLocation();
    setTimeout(() => {
      const mapSection = document.getElementById('farmer-google-map-section');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Meteorological Station Top Atmospheric Banner */}
      <div className="rounded-3xl p-5 sm:p-7 bg-linear-to-r from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl border border-emerald-500/30 relative overflow-hidden">
        {/* Animated weather lighting gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Hyperlocal Doppler Weather</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30">
                <Sparkles className="w-3 h-3 text-sky-300" />
                <span>Google Maps Grounded</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                <Eye className="w-3 h-3 text-amber-300" />
                <span>IMD Radar</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-2 font-heading">
              <span>{village.name} Agro-Meteorological Observatory</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
              Block: <strong className="text-white">{village.block}</strong> • District:{' '}
              <strong className="text-white">{village.district}</strong> ({village.state}) • Calibrated for{' '}
              <strong className="text-emerald-400">{crop}</strong> in{' '}
              <strong className="text-amber-300">{soil} Soil</strong>.
            </p>
          </div>

          {/* Quick Atmospheric Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 shrink-0">
            <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Coordinates
              </span>
              <span className="text-xs sm:text-sm font-black text-white font-mono">
                {village.lat.toFixed(3)}°, {village.lng.toFixed(3)}°
              </span>
            </div>

            <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                7-Day Rainfall
              </span>
              <span className="text-xs sm:text-sm font-black text-sky-300 font-mono">
                {advisory.expectedRainNext7Days} mm
              </span>
            </div>

            <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Dry Spell Risk
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                {advisory.dryBreakDays} Days
              </span>
            </div>

            <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Sowing Status
              </span>
              <span
                className={`text-xs sm:text-sm font-black uppercase ${
                  advisory.status === 'RED'
                    ? 'text-rose-400'
                    : advisory.status === 'GREEN'
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {advisory.status}
              </span>
            </div>
          </div>
        </div>

        {/* View Navigation Tab Pills */}
        <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-4 sm:pt-6 mt-4 border-t border-white/10 text-xs font-bold scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Complete Weather Deck</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-emerald-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Google Farm Satellite Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('forecast')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'forecast'
                ? 'bg-emerald-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>16-Day Forecast &amp; Rainfall</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('intel')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'intel'
                ? 'bg-emerald-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grounded Agri Intelligence</span>
          </button>

          {/* Direct Action: Show My Current Location on Google Maps */}
          <button
            type="button"
            onClick={handleShowCurrentLocationOnMap}
            disabled={isLocatingGPS}
            className={`ml-auto px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-lg shrink-0 ${
              isLocatingGPS
                ? 'bg-blue-800 text-blue-100 cursor-wait'
                : 'bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-700 hover:from-blue-500 hover:via-emerald-500 hover:to-teal-600 text-white font-bold ring-1 ring-white/30'
            }`}
            title="Detect & Show My Current Location on Google Maps"
          >
            {isLocatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Navigation className="w-3.5 h-3.5 animate-bounce text-white" />
            )}
            <span>{isLocatingGPS ? 'Finding Location...' : 'Show My Current Location'}</span>
          </button>
        </div>
      </div>

      {/* 2. Setup Form with Cascading Selectors & Google Places Search */}
      <SetupCard />

      {/* 3. Reusable Real-Time WeatherWidget (Current Conditions: Temp, Humidity, Wind) */}
      <WeatherWidget village={village} />

      {/* Conditional or Comprehensive View */}
      {(activeTab === 'all' || activeTab === 'map') && (
        <div id="farmer-google-map-section" className="space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>Interactive Google Satellite Farm Map</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              High-resolution imagery • 5km Agro-Climatic Radar
            </span>
          </div>

          <GoogleAgriMap
            village={village}
            advisory={advisory}
            onSelectCoords={(lat, lng, name) => {
              setVillage({
                ...village,
                name: name || `Farm Point (${lat.toFixed(3)}°N)`,
                lat,
                lng,
              });
              showToast(`Farm location pinned: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`, 'success');
            }}
            className="h-96 sm:h-[420px] w-full"
          />
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'advisory') && (
        <>
          {/* Real-Time District Weather Widget */}
          <DistrictWeatherWidget />

          {/* Traffic-Light Sowing Advisory Hero Card with Voice Advisory */}
          <AdvisoryHeroCard />

          {/* Metrics Gauges */}
          <MetricsGauges />
        </>
      )}

      {(activeTab === 'all' || activeTab === 'forecast') && (
        <RainfallChart />
      )}

      {(activeTab === 'all' || activeTab === 'intel') && (
        <>
          {/* Grounded Agri Intelligence Hub */}
          <AgriIntelligenceHub />

          {/* Farming Tips */}
          <FarmingTips />

          {/* PMFBY Crop Insurance & Policy Hub */}
          <PolicyHub />

          {/* Alert History Timeline */}
          <AlertHistory />
        </>
      )}
    </div>
  );
};
