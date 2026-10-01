import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { VILLAGES_DATABASE } from '../../data/villages';
import { INDIAN_STATES_AND_DISTRICTS } from '../../data/indianAdminDirectory';
import { UP_DISTRICTS_AND_BLOCKS, getUPBlocksForDistrict } from '../../data/upVillagesAndBlocks';
import { CropType, SoilType, VillageLocation } from '../../types';
import {
  MapPin,
  Navigation,
  Radio,
  Sprout,
  Layers,
  CloudRain,
  Search,
  Loader2,
  X,
  Map as MapIcon,
  ChevronDown,
  Globe,
  Sparkles,
  CheckCircle,
  Building,
  Compass,
} from 'lucide-react';
import {
  searchLocationsWithOpenMeteo,
  GeocodedLocation,
  toVillageLocation,
} from '../../services/geocoding';
import { LeafletMap } from '../map/LeafletMap';
import { GoogleAgriMap } from '../map/GoogleAgriMap';
import { GooglePlaceSearch } from '../search/GooglePlaceSearch';

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
    isLocatingGPS,
    showToast,
    detectLiveLocation,
    isDarkMode,
    advisory,
  } = useApp();

  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const [showMap, setShowMap] = useState(false);
  const [customVillageInput, setCustomVillageInput] = useState('');

  // Handle Show My Current Location on Google Maps
  const handleShowCurrentLocationOnGoogleMaps = async () => {
    setShowMap(true);
    setMapEngine('google');
    await detectLiveLocation();
    setTimeout(() => {
      const mapContainer = document.getElementById('farm-satellite-map-container');
      if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  };

  // Complete List of Indian States (Uttar Pradesh first)
  const states = useMemo(() => {
    const all = INDIAN_STATES_AND_DISTRICTS.map((s) => s.state);
    VILLAGES_DATABASE.forEach((v) => {
      if (!all.includes(v.state)) all.push(v.state);
    });
    return all;
  }, []);

  // Filter districts by selected state
  const districts = useMemo(() => {
    const stateEntry = INDIAN_STATES_AND_DISTRICTS.find((s) => s.state === village.state);
    if (stateEntry && stateEntry.districts.length > 0) {
      return stateEntry.districts;
    }
    return Array.from(
      new Set(
        VILLAGES_DATABASE.filter((v) => v.state === village.state).map((v) => v.district)
      )
    );
  }, [village.state]);

  // Comprehensive Blocks for selected district (with authentic UP blocks)
  const upBlocks = useMemo(() => {
    if (village.state === 'Uttar Pradesh') {
      return getUPBlocksForDistrict(village.district);
    }
    return [];
  }, [village.state, village.district]);

  const blocks = useMemo(() => {
    if (village.state === 'Uttar Pradesh' && upBlocks.length > 0) {
      return upBlocks.map((b) => b.block);
    }

    const fromDB = Array.from(
      new Set(
        VILLAGES_DATABASE.filter(
          (v) => v.state === village.state && v.district === village.district
        ).map((v) => v.block)
      )
    );
    if (fromDB.length > 0) return fromDB;
    return [`${village.district} Sadar`, `${village.district} Rural`, `${village.district} North`, `${village.district} South`];
  }, [village.state, village.district, upBlocks]);

  // Villages for the selected block
  const villagesInBlock = useMemo(() => {
    if (village.state === 'Uttar Pradesh') {
      const matchedBlock = upBlocks.find((b) => b.block === village.block);
      if (matchedBlock && matchedBlock.keyVillages.length > 0) {
        return matchedBlock.keyVillages.map((kv) => ({
          id: `up-${village.district.toLowerCase()}-${matchedBlock.block.toLowerCase().replace(/\s+/g, '-')}-${kv.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: kv.name,
          nameHi: kv.nameHi,
          nameMr: kv.nameHi,
          block: matchedBlock.block,
          district: village.district,
          state: 'Uttar Pradesh',
          lat: kv.lat,
          lng: kv.lng,
          defaultCrop: matchedBlock.primaryCrop,
          defaultSoil: matchedBlock.soilType,
          registeredFarmers: 640,
          cultivatedAcreage: 1850,
        }));
      }
    }

    const list = VILLAGES_DATABASE.filter(
      (v) =>
        v.state === village.state &&
        v.district === village.district &&
        v.block === village.block
    );
    if (list.length > 0) return list;
    return [village];
  }, [village.state, village.district, village.block, village, upBlocks]);

  // Handlers for cascading state changes
  const handleStateChange = (newState: string) => {
    if (newState === 'Uttar Pradesh') {
      const upDefault = VILLAGES_DATABASE[0];
      setVillage(upDefault);
      setCrop('Paddy');
      setSoil('Alluvial');
      return;
    }

    const dirMatch = INDIAN_STATES_AND_DISTRICTS.find((s) => s.state === newState);
    const firstDistrict = dirMatch?.districts[0] || 'Central';
    const stateMatch = VILLAGES_DATABASE.find((v) => v.state === newState);

    if (stateMatch) {
      setVillage(stateMatch);
    } else {
      setVillage({
        id: `st-${newState.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${firstDistrict} Main`,
        nameHi: `${firstDistrict} केंद्र`,
        nameMr: `${firstDistrict} केंद्र`,
        block: `${firstDistrict} Sadar`,
        district: firstDistrict,
        state: newState,
        lat: 23.5,
        lng: 78.5,
        defaultCrop: 'Paddy',
        defaultSoil: 'Alluvial',
        registeredFarmers: 750,
        cultivatedAcreage: 2200,
      });
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    if (village.state === 'Uttar Pradesh') {
      const blocksForDist = getUPBlocksForDistrict(newDistrict);
      const firstBlock = blocksForDist[0];
      const firstVill = firstBlock.keyVillages[0];

      const newVill: VillageLocation = {
        id: `up-${newDistrict.toLowerCase()}-${firstBlock.block.toLowerCase().replace(/\s+/g, '-')}-${firstVill.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: firstVill.name,
        nameHi: firstVill.nameHi,
        nameMr: firstVill.nameHi,
        block: firstBlock.block,
        district: newDistrict,
        state: 'Uttar Pradesh',
        lat: firstVill.lat,
        lng: firstVill.lng,
        defaultCrop: firstBlock.primaryCrop,
        defaultSoil: firstBlock.soilType,
        registeredFarmers: 720,
        cultivatedAcreage: 2100,
      };

      setVillage(newVill);
      setCrop(firstBlock.primaryCrop);
      setSoil(firstBlock.soilType);
      showToast(`Selected Uttar Pradesh District: ${newDistrict}`, 'success');
      return;
    }

    const match = VILLAGES_DATABASE.find(
      (v) => v.state === village.state && v.district === newDistrict
    );
    if (match) {
      setVillage(match);
      setCrop(match.defaultCrop);
      setSoil(match.defaultSoil);
      return;
    }

    setVillage({
      id: `dist-${newDistrict.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${newDistrict} Central`,
      nameHi: `${newDistrict} केंद्र`,
      nameMr: `${newDistrict} केंद्र`,
      block: `${newDistrict} Sadar`,
      district: newDistrict,
      state: village.state,
      lat: village.lat + 0.05,
      lng: village.lng + 0.05,
      defaultCrop: 'Paddy',
      defaultSoil: 'Alluvial',
      registeredFarmers: 720,
      cultivatedAcreage: 2100,
    });
  };

  const handleBlockChange = (newBlock: string) => {
    if (village.state === 'Uttar Pradesh') {
      const matchedBlock = upBlocks.find((b) => b.block === newBlock);
      if (matchedBlock) {
        const firstVill = matchedBlock.keyVillages[0] || {
          name: `${newBlock} Dehat`,
          nameHi: `${newBlock} देहात`,
          lat: matchedBlock.lat,
          lng: matchedBlock.lng,
        };

        setVillage({
          id: `up-${village.district.toLowerCase()}-${newBlock.toLowerCase().replace(/\s+/g, '-')}-${firstVill.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: firstVill.name,
          nameHi: firstVill.nameHi,
          nameMr: firstVill.nameHi,
          block: newBlock,
          district: village.district,
          state: 'Uttar Pradesh',
          lat: firstVill.lat,
          lng: firstVill.lng,
          defaultCrop: matchedBlock.primaryCrop,
          defaultSoil: matchedBlock.soilType,
          registeredFarmers: 680,
          cultivatedAcreage: 1950,
        });
        setCrop(matchedBlock.primaryCrop);
        setSoil(matchedBlock.soilType);
        return;
      }
    }

    const match = VILLAGES_DATABASE.find(
      (v) =>
        v.state === village.state &&
        v.district === village.district &&
        v.block === newBlock
    );
    if (match) {
      setVillage(match);
    } else {
      setVillage({
        ...village,
        id: `blk-${newBlock.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${newBlock} Village`,
        block: newBlock,
      });
    }
  };

  const handleVillageSelect = (vill: VillageLocation) => {
    setVillage(vill);
    setCrop(vill.defaultCrop);
    setSoil(vill.defaultSoil);
  };

  // Add custom village inside the active block
  const handleAddCustomVillage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVillageInput.trim()) return;

    const customName = customVillageInput.trim();
    // Offset slightly from block/district center for unique coordinate
    const latOffset = (Math.random() - 0.5) * 0.04;
    const lngOffset = (Math.random() - 0.5) * 0.04;

    const newCustomVillage: VillageLocation = {
      id: `custom-vill-${Date.now()}`,
      name: customName,
      nameHi: customName,
      nameMr: customName,
      block: village.block,
      district: village.district,
      state: village.state,
      lat: Number((village.lat + latOffset).toFixed(4)),
      lng: Number((village.lng + lngOffset).toFixed(4)),
      defaultCrop: crop,
      defaultSoil: soil,
      registeredFarmers: 550,
      cultivatedAcreage: 1600,
    };

    setVillage(newCustomVillage);
    setCustomVillageInput('');
    showToast(
      `Custom Gram Panchayat Added: ${customName}, Block ${village.block} (${newCustomVillage.lat}°N, ${newCustomVillage.lng}°E)`,
      'success'
    );
  };

  const popularUPDistricts = [
    'Varanasi',
    'Barabanki',
    'Gorakhpur',
    'Lucknow',
    'Prayagraj',
    'Ayodhya',
    'Meerut',
    'Agra',
    'Bareilly',
    'Jhansi',
    'Sitapur',
    'Banda',
    'Mirzapur',
    'Aligarh',
    'Kanpur Nagar',
    'Muzaffarnagar',
    'Basti',
    'Azamgarh',
    'Jaunpur',
    'Ghazipur',
    'Ballia',
    'Deoria',
  ];

  const crops: CropType[] = ['Paddy', 'Cotton', 'Soybean', 'Tur', 'Urad', 'Maize'];
  const soils: SoilType[] = ['Black', 'Alluvial', 'Red', 'Laterite'];

  const getVillageName = (v: typeof village) => {
    if (language === 'hi' && v.nameHi) return v.nameHi;
    if (language === 'mr' && v.nameMr) return v.nameMr;
    return v.name;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Farm Location &amp; Agro-Climatic Setup</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time Google Places Search across all 36 Indian States &amp; 75 Uttar Pradesh Districts
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Show My Current Location on Google Maps button */}
          <button
            type="button"
            onClick={handleShowCurrentLocationOnGoogleMaps}
            disabled={isLocatingGPS}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md ${
              isLocatingGPS
                ? 'bg-blue-800 text-blue-100 opacity-90 cursor-wait'
                : 'bg-linear-to-r from-blue-600 via-emerald-600 to-teal-700 hover:from-blue-500 hover:via-emerald-500 hover:to-teal-600 text-white shadow-emerald-600/30'
            }`}
            title="Show My Current Location on Google Maps"
          >
            {isLocatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-white animate-bounce" />
            )}
            <span>{isLocatingGPS ? 'Detecting GPS...' : 'Show My Current Location'}</span>
          </button>

          {/* Interactive Map Toggle */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
              showMap
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-600 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
            title="Toggle Farm Satellite Map"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{showMap ? 'Hide Map' : 'Farm Map View'}</span>
          </button>

          {/* Live Feed Toggle */}
          <button
            type="button"
            onClick={() => setUseLiveData(!useLiveData)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
              useLiveData
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-600'
            }`}
            title={useLiveData ? 'Using Live Open-Meteo Telemetry' : 'Using Local Indian Agro Grid'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                useLiveData ? 'bg-white animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{useLiveData ? 'Live Feed' : 'Local Grid'}</span>
          </button>
        </div>
      </div>

      {/* 1. Google Places Real-time Autocomplete Search */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Google Data Search (Find Any Indian Village, Tehsil, Mandi or PIN Code):</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            Voice &amp; Multi-lingual Supported
          </span>
        </label>
        <GooglePlaceSearch onLocationResolved={(loc) => setVillage(loc)} />
      </div>

      {/* 2. Uttar Pradesh 75-District Quick Filter Chips */}
      <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-slate-900/60 border border-emerald-200/60 dark:border-emerald-500/20">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Uttar Pradesh 75 Districts Quick Selection:</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Click to load blocks &amp; high-res forecast
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {popularUPDistricts.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                if (village.state !== 'Uttar Pradesh') {
                  handleStateChange('Uttar Pradesh');
                }
                handleDistrictChange(d);
              }}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                village.state === 'Uttar Pradesh' && village.district === d
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interactive Farm Map Component (Google Maps / OpenStreetMap Switcher) */}
      {showMap && (
        <div id="farm-satellite-map-container" className="space-y-2 p-3 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 scroll-mt-20">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Live Farm Microclimate Map
              </span>
            </div>

            {/* Map Engine Toggle */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] shadow-xs">
              <button
                type="button"
                onClick={() => setMapEngine('google')}
                className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                  mapEngine === 'google'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Google Maps (Satellite)
              </button>
              <button
                type="button"
                onClick={() => setMapEngine('leaflet')}
                className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                  mapEngine === 'leaflet'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                OpenStreetMap
              </button>
            </div>
          </div>

          {mapEngine === 'google' ? (
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
                showToast(`Farm pin updated: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`, 'success');
              }}
              className="h-80 sm:h-96 w-full"
            />
          ) : (
            <LeafletMap
              lat={village.lat}
              lng={village.lng}
              villageName={village.name}
              district={village.district}
              state={village.state}
              status={advisory?.status}
              isDarkMode={isDarkMode}
              className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden"
            />
          )}
        </div>
      )}

      {/* 4. Cascading Selectors: State -> District -> Block -> Village */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            State ({states.length} Indian States &amp; UTs)
          </label>
          <select
            value={village.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {states.map((st) => (
              <option key={st} value={st}>
                {st} {st === 'Uttar Pradesh' ? '★ (75 Districts Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            District ({districts.length} in {village.state})
          </label>
          <select
            value={village.district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {districts.map((dst) => (
              <option key={dst} value={dst}>
                {dst}
              </option>
            ))}
          </select>
        </div>

        {/* Block / Tehsil */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Block / Tehsil ({blocks.length} available)
          </label>
          <select
            value={village.block}
            onChange={(e) => handleBlockChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {blocks.map((blk) => (
              <option key={blk} value={blk}>
                {blk}
              </option>
            ))}
          </select>
        </div>

        {/* Key Village / Gram Panchayat */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Key Village / Gram Panchayat
          </label>
          <select
            value={village.id}
            onChange={(e) => {
              const matched = villagesInBlock.find((v) => v.id === e.target.value);
              if (matched) handleVillageSelect(matched);
            }}
            className="w-full h-11 px-3 rounded-xl border border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {villagesInBlock.map((v) => (
              <option key={v.id} value={v.id}>
                {getVillageName(v)}
              </option>
            ))}
            {!villagesInBlock.some((v) => v.id === village.id) && (
              <option value={village.id}>{getVillageName(village)} (Custom / Google Search)</option>
            )}
          </select>
        </div>
      </div>

      {/* 5. Custom Village / Gram Panchayat Quick Entry */}
      <form
        onSubmit={handleAddCustomVillage}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
      >
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
          Enter Your Specific Village / Tola:
        </div>
        <input
          type="text"
          value={customVillageInput}
          onChange={(e) => setCustomVillageInput(e.target.value)}
          placeholder={`e.g. Rampur, Pipra, Kalyanpur in ${village.block}...`}
          className="flex-1 h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
        >
          Set Village
        </button>
      </form>

      {/* 6. Crop & Soil Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Sowing Crop:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {crops.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCrop(c)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  crop === c
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-emerald-300'
                }`}
              >
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Select Field Soil Type:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {soils.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSoil(s)}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  soil === s
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-amber-300'
                }`}
              >
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Active Coordinates and Data Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {getVillageName(village)}, Block {village.block}, {village.district} ({village.state})
          </span>
          <span>•</span>
          <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {village.lat.toFixed(4)}°N, {village.lng.toFixed(4)}°E
          </span>
          <span>•</span>
          <span>{crop} in {soil} Soil</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            Google Maps &amp; High-Resolution Weather Model Connected
          </span>
        </div>
      </div>
    </div>
  );
};
