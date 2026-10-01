import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useApp } from '../../context/AppContext';
import { VillageLocation } from '../../types';
import { VILLAGES_DATABASE } from '../../data/villages';
import {
  Search,
  MapPin,
  Loader2,
  X,
  Compass,
  Sparkles,
  CheckCircle,
  Building,
  Navigation,
  Mic,
} from 'lucide-react';

interface GooglePlaceSearchProps {
  onLocationResolved?: (loc: VillageLocation) => void;
  className?: string;
}

export const GooglePlaceSearch: React.FC<GooglePlaceSearchProps> = ({
  onLocationResolved,
  className = '',
}) => {
  const { setVillage, showToast, isLocatingGPS, detectLiveLocation } = useApp();
  const placesLib = useMapsLibrary('places');

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Fetch suggestions with debouncing and session token
  useEffect(() => {
    if (!placesLib) return;
    if (!input.trim() || input.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }

        const request: google.maps.places.AutocompleteRequest = {
          input,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['in'], // Restrict strictly to India for Indian farmers
        };

        const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        setSuggestions(res.suggestions || []);
        setIsOpen(true);
      } catch (err) {
        console.warn('Google Places autocomplete fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [placesLib, input]);

  // Handle Place Selection
  const handleSelectSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    setIsLoading(true);
    setIsOpen(false);

    try {
      const place = suggestion.placePrediction?.toPlace();
      if (!place) {
        throw new Error('Place prediction could not be converted to Place');
      }

      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'],
      });

      // Reset session token immediately after fetchFields
      sessionTokenRef.current = null;

      const lat = place.location?.lat?.() ?? (place.location as unknown as { lat: number })?.lat;
      const lng = place.location?.lng?.() ?? (place.location as unknown as { lng: number })?.lng;

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new Error('Could not resolve coordinate geometry for selected place');
      }

      // Parse Address Components for Village, Block, District, State
      let villageName = place.displayName || suggestion.placePrediction?.text?.toString() || 'Selected Farm';
      let block = 'Tehsil';
      let district = 'Agri District';
      let state = 'Uttar Pradesh';

      if (place.addressComponents) {
        for (const comp of place.addressComponents) {
          const types = comp.types || [];
          if (types.includes('sublocality_level_1') || types.includes('locality')) {
            villageName = comp.longText || villageName;
          }
          if (types.includes('administrative_area_level_3') || types.includes('sublocality')) {
            block = comp.longText || block;
          }
          if (types.includes('administrative_area_level_2')) {
            district = comp.longText || district;
          }
          if (types.includes('administrative_area_level_1')) {
            state = comp.longText || state;
          }
        }
      }

      // Match closest village baseline for agro-climatic parameters
      let closestVillage = VILLAGES_DATABASE[0];
      let minDist = Infinity;
      for (const v of VILLAGES_DATABASE) {
        const d = Math.hypot(v.lat - lat, v.lng - lng);
        if (d < minDist) {
          minDist = d;
          closestVillage = v;
        }
      }

      const resolvedVillage: VillageLocation = {
        id: `gmp-${Date.now()}`,
        name: villageName,
        nameHi: villageName,
        nameMr: villageName,
        block: block !== 'Tehsil' ? block : closestVillage.block,
        district: district !== 'Agri District' ? district : closestVillage.district,
        state,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        defaultCrop: closestVillage.defaultCrop,
        defaultSoil: closestVillage.defaultSoil,
        registeredFarmers: 650,
        cultivatedAcreage: 1800,
      };

      setVillage(resolvedVillage);
      if (onLocationResolved) {
        onLocationResolved(resolvedVillage);
      }

      setInput(place.displayName ? `${place.displayName}, ${district}` : villageName);
      showToast(
        `Selected via Google Places: ${resolvedVillage.name}, ${resolvedVillage.district} (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
        'success'
      );
    } catch (err) {
      console.error('Error resolving place details:', err);
      showToast('Could not resolve full place details. Trying standard lookup.', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Search Handler
  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Default to Hindi, also recognizes Indian English
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      showToast('Listening... Speak your village or district name (e.g., "वाराणसी शिवपुर")', 'info');

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      console.warn('Voice recognition error:', err);
    }
  }, [showToast]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-emerald-600 dark:text-emerald-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Search any village, block, district in Uttar Pradesh & India with Google..."
          className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput('');
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`p-1.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
            title="Search by Voice (Hindi / English)"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* GPS Quick Button */}
          <button
            type="button"
            onClick={detectLiveLocation}
            disabled={isLocatingGPS}
            className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-all flex items-center gap-1"
            title="Auto-Detect My GPS Location"
          >
            {isLocatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
          <div className="p-2 bg-emerald-50 dark:bg-slate-800/80 border-b border-emerald-100 dark:border-slate-700 flex items-center justify-between text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Google Places Live Results</span>
            </span>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />}
          </div>

          {suggestions.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {suggestions.map((sug, idx) => {
                const text = sug.placePrediction?.text?.toString() || 'Location';
                const mainText = sug.placePrediction?.mainText?.toString() || text;
                const secondaryText = sug.placePrediction?.secondaryText?.toString() || '';

                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-2.5"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {mainText}
                        </div>
                        {secondaryText && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {secondaryText}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              {isLoading ? 'Searching Google Places across India...' : 'Type to search any Indian village, block, mandi or district'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
