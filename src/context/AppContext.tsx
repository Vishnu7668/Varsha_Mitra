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
    return saved === 'true';
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
    showToast(val ? 'Syncing live 14-day high-resolution forecast...' : 'Loaded regional baseline.', 'info');
  }, [showToast]);

  // Real Live Location via Geolocation API
  const detectLiveLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      showToast('Geolocation is not supported by your browser', 'warning');
      return;
    }

    showToast('Detecting your live GPS coordinates...', 'info');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // Find closest station or create real dynamic location
        let closestVillage = VILLAGES_DATABASE[0];
        let minDist = Number.MAX_VALUE;

        for (const v of VILLAGES_DATABASE) {
          const d = Math.hypot(v.lat - latitude, v.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closestVillage = v;
          }
        }

        const dynamicVillage: VillageLocation = {
          id: `live-gps-${Date.now()}`,
          name: closestVillage.name,
          nameHi: closestVillage.nameHi,
          nameMr: closestVillage.nameMr,
          block: closestVillage.block,
          district: closestVillage.district,
          state: closestVillage.state,
          lat: latitude,
          lng: longitude,
          defaultCrop: closestVillage.defaultCrop,
          defaultSoil: closestVillage.defaultSoil,
          registeredFarmers: closestVillage.registeredFarmers,
          cultivatedAcreage: closestVillage.cultivatedAcreage,
        };

        setVillageState(dynamicVillage);
        setUseLiveDataState(true);
        showToast(
          `GPS Locked: ${closestVillage.district} Region (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E). Synced live weather telemetry.`,
          'success'
        );
      },
      (err) => {
        console.warn('Geolocation error:', err);
        showToast('GPS access denied or timed out. Using station default.', 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
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
