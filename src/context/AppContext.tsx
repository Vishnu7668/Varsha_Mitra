import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  AdvisoryResult,
  CropType,
  DayForecast,
  LanguageCode,
  SoilType,
  VillageLocation,
} from '../types';
import { VILLAGES_DATABASE } from '../data/villages';
import { SCENARIO_PRESETS } from '../data/scenarios';
import { calculateAdvisory } from '../services/advisory';
import { getWeatherData } from '../services/weather';
import { reverseGeocodeWithBigDataCloud, toVillageLocation } from '../services/geocoding';
import { TRANSLATIONS, TranslationDictionary } from '../translations';

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Selection
  village: VillageLocation;
  setVillage: (v: VillageLocation) => void;
  crop: CropType;
  setCrop: (c: CropType) => void;
  soil: SoilType;
  setSoil: (s: SoilType) => void;
  
  // Scenario & Weather
  activeScenarioId: string;
  selectScenario: (scenarioId: string) => void;
  forecasts: DayForecast[];
  advisory: AdvisoryResult;
  useLiveData: boolean;
  setUseLiveData: (val: boolean) => void;
  dataSource: string;
  isLoadingWeather: boolean;
  isLocatingGPS: boolean;
  refreshWeather: () => Promise<void>;
  detectLiveLocation: () => Promise<void>;

  // System & AI
  aiMode: 'live' | 'fallback';
  isOffline: boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;

  // Custom advisory thresholds (from officer dashboard settings)
  customThresholdMm?: number;
  setCustomThresholdMm: (mm: number | undefined) => void;

  // Toast
  toastMessage: string | null;
  toastType: 'info' | 'success' | 'warning';
  showToast: (msg: string, type?: 'info' | 'success' | 'warning') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('varsha_lang');
    return (saved as LanguageCode) || 'en';
  });

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('varsha_lang', lang);
  }, []);

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);

  // 2. Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('varsha_dark');
    if (saved !== null) {
      return saved === 'true';
    }
    return typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('varsha_dark', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // 3. Selection state (Village, Crop, Soil)
  const [village, setVillageState] = useState<VillageLocation>(() => {
    const saved = localStorage.getItem('varsha_village_id');
    const match = VILLAGES_DATABASE.find((v) => v.id === saved);
    return match || VILLAGES_DATABASE[0];
  });

  const [crop, setCropState] = useState<CropType>(() => {
    return (localStorage.getItem('varsha_crop') as CropType) || 'Cotton';
  });

  const [soil, setSoilState] = useState<SoilType>(() => {
    return (localStorage.getItem('varsha_soil') as SoilType) || 'Black';
  });

  const setVillage = useCallback((v: VillageLocation) => {
    setVillageState(v);
    localStorage.setItem('varsha_village_id', v.id);
  }, []);

  const setCrop = useCallback((c: CropType) => {
    setCropState(c);
    localStorage.setItem('varsha_crop', c);
  }, []);

  const setSoil = useCallback((s: SoilType) => {
    setSoilState(s);
    localStorage.setItem('varsha_soil', s);
  }, []);

  // 4. Scenario & Meteorological state
  const [activeScenarioId, setActiveScenarioId] = useState<string>('normal-onset-paddy');
  const [useLiveData, setUseLiveDataState] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<string>('Live Doppler Radar & Satellite Telemetry');
  const [forecasts, setForecasts] = useState<DayForecast[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [customThresholdMm, setCustomThresholdMm] = useState<number | undefined>(undefined);

  // 5. Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'warning'>('info');

  const showToast = useCallback((msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // 6. Connectivity & AI Mode detection
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [aiMode, setAiMode] = useState<'live' | 'fallback'>('live');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Offline mode active. Showing cached radar telemetry.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Ping /api/health to check server AI mode
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.aiMode) setAiMode(data.aiMode);
      })
      .catch(() => {
        setAiMode('fallback');
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Load weather when village, scenario, or live data toggle changes
  const refreshWeather = useCallback(async () => {
    setIsLoadingWeather(true);
    try {
      const data = await getWeatherData({
        village,
        useLiveData,
        activeScenarioId,
      });
      setForecasts(data.forecasts);
      setDataSource(data.dataSource);
    } catch (err) {
      console.error('Error updating weather:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  }, [village, useLiveData, activeScenarioId]);

  useEffect(() => {
    refreshWeather();
  }, [refreshWeather]);

  const setUseLiveData = useCallback((val: boolean) => {
    setUseLiveDataState(val);
    showToast(val ? 'Syncing live 16-day high-resolution forecast...' : 'Loaded regional baseline.', 'info');
  }, [showToast]);

  // Real Live Location via Geolocation API + Google Geocoding / BigDataCloud Reverse Geocoding + Multi-tier IP fallback
  const detectLiveLocation = useCallback(async () => {
    setIsLocatingGPS(true);
    showToast('Acquiring live location coordinates...', 'info');

    // Helper to resolve coordinates through Google Geocoding / BigDataCloud and apply state
    const resolveAndApplyLocation = async (lat: number, lng: number, sourceTag: string) => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAAoNTNBsb_JVxs9YCm9STK3YkcqI4ymz4';
        let villageName = '';
        let block = '';
        let district = '';
        let state = 'Uttar Pradesh';

        // Try Google Geocoding API first for highest accuracy in India
        if (apiKey) {
          try {
            const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
            const gResp = await fetch(gUrl, { signal: AbortSignal.timeout(4000) });
            if (gResp.ok) {
              const gData = await gResp.json();
              if (gData.results && gData.results.length > 0) {
                const firstResult = gData.results[0];
                for (const comp of firstResult.address_components) {
                  const types: string[] = comp.types || [];
                  if (types.includes('sublocality_level_1') || types.includes('locality')) {
                    villageName = comp.long_name || villageName;
                  }
                  if (types.includes('administrative_area_level_3') || types.includes('sublocality')) {
                    block = comp.long_name || block;
                  }
                  if (types.includes('administrative_area_level_2')) {
                    district = comp.long_name || district;
                  }
                  if (types.includes('administrative_area_level_1')) {
                    state = comp.long_name || state;
                  }
                }
              }
            }
          } catch (gErr) {
            console.warn('Google reverse geocode fallback to BigDataCloud:', gErr);
          }
        }

        // Fallback to BigDataCloud reverse geocode if needed
        if (!villageName || !district) {
          const rev = await reverseGeocodeWithBigDataCloud(lat, lng);
          villageName = villageName || rev.name || `Point ${lat.toFixed(2)}°N`;
          block = block || rev.block || 'Local Block';
          district = district || rev.district || 'Local District';
          state = state || rev.state || 'India';
        }

        // Find closest baseline station for soil and crop defaults
        let closestVillage = VILLAGES_DATABASE[0];
        let minDist = Number.MAX_VALUE;
        for (const v of VILLAGES_DATABASE) {
          const d = Math.hypot(v.lat - lat, v.lng - lng);
          if (d < minDist) {
            minDist = d;
            closestVillage = v;
          }
        }

        const dynamicVillage: VillageLocation = {
          id: `live-loc-${Date.now()}`,
          name: villageName || `Farm (${lat.toFixed(3)}°N)`,
          nameHi: villageName || `कृषि स्थान`,
          nameMr: villageName || `कृषी स्थान`,
          block: block || closestVillage.block,
          district: district || closestVillage.district,
          state: state || closestVillage.state,
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
          defaultCrop: closestVillage.defaultCrop,
          defaultSoil: closestVillage.defaultSoil,
          registeredFarmers: 680,
          cultivatedAcreage: 1950,
        };

        setVillageState(dynamicVillage);
        setUseLiveDataState(true);
        showToast(
          `Location Detected (${sourceTag}): ${dynamicVillage.name}, ${dynamicVillage.district} (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
          'success'
        );
      } catch (err) {
        console.warn('Reverse geocode error, applying direct coords:', err);
        const fallbackVillage: VillageLocation = {
          id: `live-gps-${Date.now()}`,
          name: `Farm Point (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
          nameHi: `जीपीएस स्थान`,
          nameMr: `जीपीएस स्थान`,
          block: 'Agro Block',
          district: 'District',
          state: 'Uttar Pradesh',
          lat,
          lng,
          defaultCrop: 'Paddy',
          defaultSoil: 'Alluvial',
          registeredFarmers: 500,
          cultivatedAcreage: 1500,
        };
        setVillageState(fallbackVillage);
        setUseLiveDataState(true);
        showToast(`GPS Position Locked: ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`, 'success');
      } finally {
        setIsLocatingGPS(false);
      }
    };

    // Attempt IP-based geolocation fallback
    const tryIpGeolocation = async () => {
      // 1. Try ipwho.is (fast, no rate-limiting key needed)
      try {
        const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3500) });
        if (res.ok) {
          const data = await res.json();
          if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
            await resolveAndApplyLocation(data.latitude, data.longitude, 'IP Network');
            return true;
          }
        }
      } catch (e1) {
        console.warn('ipwho.is failed, trying ipapi.co:', e1);
      }

      // 2. Try ipapi.co
      try {
        const ipResp = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) });
        if (ipResp.ok) {
          const ipData = await ipResp.json();
          if (ipData.latitude && ipData.longitude) {
            await resolveAndApplyLocation(Number(ipData.latitude), Number(ipData.longitude), 'IP Network');
            return true;
          }
        }
      } catch (e2) {
        console.warn('ipapi.co fallback failed:', e2);
      }

      return false;
    };

    // Try browser geolocation first
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolveAndApplyLocation(pos.coords.latitude, pos.coords.longitude, 'Browser GPS');
        },
        async (err) => {
          console.warn('Browser GPS prompt denied or timed out, trying IP geolocation:', err);
          const ipSuccess = await tryIpGeolocation();
          if (!ipSuccess) {
            // Default to Shivpur, Varanasi (central Purvanchal benchmark)
            const fallbackStation = VILLAGES_DATABASE[0];
            setVillageState(fallbackStation);
            setUseLiveDataState(true);
            setIsLocatingGPS(false);
            showToast(
              `Using reference station: ${fallbackStation.name}, ${fallbackStation.district} (${fallbackStation.state}).`,
              'info'
            );
          }
        },
        { timeout: 8000, enableHighAccuracy: true, maximumAge: 300000 }
      );
    } else {
      const ipSuccess = await tryIpGeolocation();
      if (!ipSuccess) {
        setIsLocatingGPS(false);
        showToast('Using central agro-climatic station.', 'info');
      }
    }
  }, [showToast]);

  // Select Regional Profile
  const selectScenario = useCallback(
    (scenarioId: string) => {
      const preset = SCENARIO_PRESETS.find((p) => p.id === scenarioId);
      if (preset) {
        setActiveScenarioId(preset.id);
        const targetVillage =
          VILLAGES_DATABASE.find((v) => v.id === preset.villageId) || VILLAGES_DATABASE[0];
        setVillage(targetVillage);
        setCrop(preset.crop);
        setSoil(preset.soil);
        setUseLiveDataState(true);
        showToast(`Loaded Agro-Climatic Belt: ${preset.title}`, 'info');
      }
    },
    [setVillage, setCrop, setSoil, showToast]
  );

  // 7. Calculate advisory strictly from the rules engine
  const advisory = useMemo(() => {
    return calculateAdvisory({
      crop,
      soil,
      forecasts,
      customThresholdMm,
    });
  }, [crop, soil, forecasts, customThresholdMm]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isDarkMode,
        toggleDarkMode,
        village,
        setVillage,
        crop,
        setCrop,
        soil,
        setSoil,
        activeScenarioId,
        selectScenario,
        forecasts,
        advisory,
        useLiveData,
        setUseLiveData,
        dataSource,
        isLoadingWeather,
        isLocatingGPS,
        refreshWeather,
        detectLiveLocation,
        aiMode,
        isOffline,
        isChatOpen,
        setIsChatOpen,
        customThresholdMm,
        setCustomThresholdMm,
        toastMessage,
        toastType,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
