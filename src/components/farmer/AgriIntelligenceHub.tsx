import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  searchWithGoogleGrounding,
  findNearbyAgriCentersWithMaps,
} from '../../services/gemini';
import {
  MapPin,
  Search,
  ExternalLink,
  Sparkles,
  Building2,
  TrendingUp,
  CloudRain,
  ShieldCheck,
  RotateCw,
  Compass,
  FileText,
  Navigation2,
  CheckCircle,
  Quote,
  Map as MapIcon,
  Globe,
} from 'lucide-react';
import { LeafletMap } from '../map/LeafletMap';

export const AgriIntelligenceHub: React.FC = () => {
  const { village, crop, language, isDarkMode, advisory } = useApp();

  const [activeTab, setActiveTab] = useState<'maps' | 'search'>('maps');
  const [showInteractiveMap, setShowInteractiveMap] = useState<boolean>(true);

  // Maps Grounding state
  const [mapsQuery, setMapsQuery] = useState<string>('Krishi Vigyan Kendra and APMC Mandi');
  const [mapsLoading, setMapsLoading] = useState<boolean>(false);
  const [mapsResult, setMapsResult] = useState<{
    text: string;
    places: { title: string; uri: string; address?: string; reviewSnippets?: string[] }[];
  } | null>(null);

  // Search Grounding state
  const [searchQuery, setSearchQuery] = useState<string>(
    `IMD monsoon alert and APMC ${crop} market prices`
  );
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{
    text: string;
    sources: { title: string; uri: string }[];
  } | null>(null);

  // Handle Maps Grounding search (gemini-3.5-flash with googleMaps)
  const handleMapsSearch = async (customQuery?: string) => {
    const q = customQuery || mapsQuery;
    if (!q.trim()) return;

    setMapsLoading(true);
    try {
      const res = await findNearbyAgriCentersWithMaps({
        query: q,
        latitude: village.lat,
        longitude: village.lng,
        district: village.district,
        state: village.state,
        language,
      });
      setMapsResult(res);
    } catch (err) {
      console.error('Maps grounding error:', err);
    } finally {
      setMapsLoading(false);
    }
  };

  // Handle Search Grounding (gemini-3.5-flash with googleSearch)
  const handleGoogleSearch = async (customQuery?: string) => {
    const q = customQuery || searchQuery;
    if (!q.trim()) return;

    setSearchLoading(true);
    try {
      const res = await searchWithGoogleGrounding({
        query: q,
        district: village.district,
        state: village.state,
        crop,
        language,
      });
      setSearchResult(res);
    } catch (err) {
      console.error('Search grounding error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Initial fetch when village changes
  useEffect(() => {
    handleMapsSearch('Krishi Vigyan Kendra and APMC Mandi');
    handleGoogleSearch(`IMD monsoon alert and APMC ${crop} market prices ${village.district}`);
  }, [village.id, crop]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 shadow-md border border-slate-200 dark:border-slate-700 space-y-5">
      {/* Header and Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span>Real-Time Google Agricultural Intelligence</span>
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Gemini 3.5 Flash Grounded
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified local facilities via Google Maps Grounding &amp; live agrometeorology via Google Search Grounding
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-700 text-xs font-bold self-start lg:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('maps');
              if (!mapsResult) handleMapsSearch();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'maps'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nearby Centers (Google Maps)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('search');
              if (!searchResult) handleGoogleSearch();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-sky-600" />
            <span>Monsoon &amp; Mandi (Google Search)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GOOGLE MAPS GROUNDING */}
      {activeTab === 'maps' && (
        <div className="space-y-4">
          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Quick Find:
            </span>
            {[
              { label: 'Krishi Vigyan Kendra (KVK)', q: 'Krishi Vigyan Kendra KVK' },
              { label: 'APMC Grain Mandi', q: 'APMC Market Yard agricultural mandi' },
              { label: 'Soil Testing Lab', q: 'Government Soil Testing Laboratory' },
              { label: 'Taluka Agriculture Office', q: 'Taluka Krishi Adhikari office' },
              { label: 'Certified Seed Depot', q: 'Government certified seed and fertilizer center' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setMapsQuery(chip.q);
                  handleMapsSearch(chip.q);
                }}
                className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-700/60 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMapsSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              <input
                type="text"
                value={mapsQuery}
                onChange={(e) => setMapsQuery(e.target.value)}
                placeholder="Search agricultural centers near this village..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={mapsLoading}
              className="h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {mapsLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Find on Maps</span>
            </button>
            <button
              type="button"
              onClick={() => setShowInteractiveMap(!showInteractiveMap)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
              title="Toggle interactive map preview"
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{showInteractiveMap ? 'Hide Map' : 'Map View'}</span>
            </button>
          </form>


          {/* Maps Results Display */}
          {mapsLoading ? (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-center animate-pulse">
              <MapPin className="w-8 h-8 text-emerald-600 animate-bounce mx-auto mb-2" />
              <p className="text-xs text-slate-500">Querying Google Maps Grounding with Gemini 3.5 Flash...</p>
            </div>
          ) : mapsResult ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <p className="whitespace-pre-line font-medium">{mapsResult.text}</p>
              </div>

              {/* Clickable Grounded Places List */}
              {mapsResult.places.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Verified Google Maps Locations &amp; Grounding Chunks:
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${mapsQuery} near ${village.district}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-600 font-bold hover:underline"
                    >
                      Search All on Google Maps →
                    </a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {mapsResult.places.map((place, idx) => {
                      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${place.title}, ${place.address || village.district}`
                      )}`;

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1 mb-1.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 line-clamp-1">
                                {place.title}
                              </span>
                              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            </div>
                            {place.address && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {place.address}
                              </p>
                            )}

                            {/* Extracted review snippets */}
                            {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                              <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 italic flex items-start gap-1">
                                <Quote className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{place.reviewSnippets[0]}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px]">
                            <a
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-0.5"
                            >
                              <Navigation2 className="w-3 h-3" />
                              <span>Directions</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center text-xs text-slate-500">
              Click "Find on Maps" to retrieve verified agricultural support centers around {village.district}.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GOOGLE SEARCH GROUNDING */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          {/* Quick Search Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Suggested:
            </span>
            {[
              { label: 'IMD Monsoon Trough Alert', q: `IMD monsoon trough depression update ${village.state}` },
              { label: `${crop} Mandi MSP Rates`, q: `Current APMC mandi rates ${crop} ${village.district}` },
              { label: 'State Seed Subsidies', q: `Kharif seed subsidy notification ${village.state} 2026` },
              { label: 'PMFBY Claim Filing Date', q: `PMFBY crop insurance prevented sowing deadline ${village.state}` },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setSearchQuery(chip.q);
                  handleGoogleSearch(chip.q);
                }}
                className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-700/60 hover:bg-sky-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-sky-500 whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGoogleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask about live monsoon alerts, mandi rates, or government schemes..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {searchLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search Grounded</span>
            </button>
          </form>

          {/* Search Results Display */}
          {searchLoading ? (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-center animate-pulse">
              <Search className="w-8 h-8 text-sky-600 animate-bounce mx-auto mb-2" />
              <p className="text-xs text-slate-500">Retrieving real-time search grounded intelligence via Gemini 3.5 Flash...</p>
            </div>
          ) : searchResult ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <p className="whitespace-pre-line font-medium">{searchResult.text}</p>
              </div>

              {/* Clickable Citations */}
              {searchResult.sources.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Verified Web Sources &amp; Citations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-600 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-sky-600" />
                        <span className="max-w-[200px] truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center text-xs text-slate-500">
              Click "Search Grounded" to pull verified real-time weather and commodity reports for {village.district}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
