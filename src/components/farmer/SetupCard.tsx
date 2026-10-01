import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VILLAGES_DATABASE } from '../../data/villages';
import { CropType, SoilType } from '../../types';
import { MapPin, Navigation, Radio, Sprout, Layers, CloudRain } from 'lucide-react';

export const SetupCard: React.FC = () => {
  const {
    t,
    language,
    village,
    setVillage,
    crop,
    setCrop,
    soil,
    setSoil,
    useLiveData,
    setUseLiveData,
    isLoadingWeather,
    showToast,
    detectLiveLocation,
  } = useApp();

  // Unique list of States
  const states = useMemo(() => {
    return Array.from(new Set(VILLAGES_DATABASE.map((v) => v.state)));
  }, []);

  // Filter districts by selected state
  const districts = useMemo(() => {
    return Array.from(
      new Set(
        VILLAGES_DATABASE.filter((v) => v.state === village.state).map((v) => v.district)
      )
    );
  }, [village.state]);

  // Filter blocks by selected district
  const blocks = useMemo(() => {
    return Array.from(
      new Set(
        VILLAGES_DATABASE.filter(
          (v) => v.state === village.state && v.district === village.district
        ).map((v) => v.block)
      )
    );
  }, [village.state, village.district]);

  // Filter villages by block
  const villagesInBlock = useMemo(() => {
    return VILLAGES_DATABASE.filter(
      (v) =>
        v.state === village.state &&
        v.district === village.district &&
        v.block === village.block
    );
  }, [village.state, village.district, village.block]);

  // Handlers for cascading state changes
  const handleStateChange = (newState: string) => {
    const firstMatch = VILLAGES_DATABASE.find((v) => v.state === newState);
    if (firstMatch) setVillage(firstMatch);
  };

  const handleDistrictChange = (newDistrict: string) => {
    const firstMatch = VILLAGES_DATABASE.find(
      (v) => v.state === village.state && v.district === newDistrict
    );
    if (firstMatch) setVillage(firstMatch);
  };

  const handleBlockChange = (newBlock: string) => {
    const firstMatch = VILLAGES_DATABASE.find(
      (v) =>
        v.state === village.state &&
        v.district === village.district &&
        v.block === newBlock
    );
    if (firstMatch) setVillage(firstMatch);
  };

  const handleVillageChange = (villageId: string) => {
    const match = VILLAGES_DATABASE.find((v) => v.id === villageId);
    if (match) setVillage(match);
  };

  // Find nearest village using Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'warning');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Find closest village by Haversine / Euclidean distance
        let closest = VILLAGES_DATABASE[0];
        let minDist = Infinity;

        VILLAGES_DATABASE.forEach((v) => {
          const dist = Math.hypot(v.lat - userLat, v.lng - userLng);
          if (dist < minDist) {
            minDist = dist;
            closest = v;
          }
        });

        setVillage(closest);
        showToast(`Located closest agro-station: ${closest.name}, ${closest.district}`, 'success');
      },
      () => {
        // Fallback default
        showToast('Location permission denied. Selected default village.', 'info');
      }
    );
  };

  const crops: CropType[] = ['Paddy', 'Cotton', 'Soybean', 'Tur', 'Urad', 'Maize'];
  const soils: SoilType[] = ['Black', 'Alluvial', 'Red', 'Laterite'];

  const getVillageName = (v: typeof village) => {
    if (language === 'hi' && v.nameHi) return v.nameHi;
    if (language === 'mr' && v.nameMr) return v.nameMr;
    return v.name;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>{t.farmerPortalTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.farmerPortalSubtitle}
          </p>
        </div>

        {/* Location & Live toggle actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={detectLiveLocation}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>{t.useMyLocation} (GPS)</span>
          </button>

          {/* Live Open-Meteo Toggle */}
          <button
            type="button"
            onClick={() => setUseLiveData(!useLiveData)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
              useLiveData
                ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-600/20'
                : 'bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600'
            }`}
            title="Real-time High-Resolution Satellite & Radar Weather"
          >
            <CloudRain className={`w-3.5 h-3.5 ${useLiveData ? 'animate-bounce' : ''}`} />
            <span>Live Radar &amp; NWP Feed</span>
            {useLiveData && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
          </button>
        </div>
      </div>

      {/* Cascading Location Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t.selectState}
          </label>
          <select
            value={village.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t.selectDistrict}
          </label>
          <select
            value={village.district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {districts.map((dst) => (
              <option key={dst} value={dst}>
                {dst}
              </option>
            ))}
          </select>
        </div>

        {/* Block */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t.selectBlock}
          </label>
          <select
            value={village.block}
            onChange={(e) => handleBlockChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {blocks.map((blk) => (
              <option key={blk} value={blk}>
                {blk}
              </option>
            ))}
          </select>
        </div>

        {/* Village */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t.selectVillage}
          </label>
          <select
            value={village.id}
            onChange={(e) => handleVillageChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-50/40 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {villagesInBlock.map((v) => (
              <option key={v.id} value={v.id}>
                {getVillageName(v)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Crop & Soil Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        {/* Crop Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.selectCrop}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {crops.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCrop(c)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  crop === c
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                }`}
              >
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Soil Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.selectSoil}</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {soils.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSoil(s)}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  soil === s
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Location Info & Data Source Bar */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {getVillageName(village)}, {village.block}, {village.district} ({village.state})
          </span>
          <span>•</span>
          <span>{village.registeredFarmers} Registered Farmers</span>
          <span>•</span>
          <span>{village.cultivatedAcreage} Ha</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {useLiveData
              ? 'National Agrometeorological Radar & Real-Time Open-Meteo Feed Synced'
              : 'National Agrometeorological Baseline (Cached)'}
          </span>
        </div>
      </div>
    </div>
  );
};
