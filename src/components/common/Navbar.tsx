import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import { SCENARIO_PRESETS } from '../../data/scenarios';
import { LanguageCode } from '../../types';
import { VoiceAdvisorySummaryButton } from './VoiceAdvisorySummaryButton';
import {
  Sun,
  Moon,
  Sparkles,
  Bot,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  PhoneCall,
  ShieldCheck,
  Info,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  MapPin,
  Loader2,
  Menu,
  X,
  Home,
  Volume2,
  Navigation,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    isDarkMode,
    toggleDarkMode,
    activeScenarioId,
    selectScenario,
    aiMode,
    isOffline,
    detectLiveLocation,
    isLocatingGPS,
    setIsChatOpen,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigate to farmer page, detect location, and scroll to Google Map
  const handleNavbarShowLocation = async () => {
    if (location.pathname !== '/farmer') {
      navigate('/farmer');
    }
    await detectLiveLocation();
    setTimeout(() => {
      const mapEl = document.getElementById('farmer-google-map-section');
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  };

  // Close mobile menu and dropdowns upon route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsScenarioDropdownOpen(false);
    setIsLangDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/farmer', label: t.navFarmer || 'Farmer Advisory', icon: Sprout },
    { path: '/officer', label: t.navOfficer || 'Officer Dashboard', icon: Layers },
    { path: '/insurance', label: t.navInsurance || 'Claim Helper', icon: ShieldCheck },
    { path: '/sms', label: t.navSms || 'SMS / IVR', icon: PhoneCall },
    { path: '/about', label: t.navAbout || 'About Model', icon: Info },
  ];

  const currentScenario = SCENARIO_PRESETS.find((s) => s.id === activeScenarioId);

  const languages: { code: LanguageCode; label: string; nativeName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 dark:border-emerald-500/20 bg-[#fafaf5]/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Brand Logo */}
          <Link to="/" className="shrink-0 flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav Links (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Cluster (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3">
            {/* Show My Current Location Button */}
            <button
              type="button"
              onClick={handleNavbarShowLocation}
              disabled={isLocatingGPS}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md ${
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
              <span>{isLocatingGPS ? 'Locating...' : 'Show My Location'}</span>
            </button>

            {/* Regional Agrometeorological Profile Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsScenarioDropdownOpen(!isScenarioDropdownOpen);
                  setIsLangDropdownOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  currentScenario?.status === 'RED'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300'
                    : currentScenario?.status === 'GREEN'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300'
                }`}
                title="Select Agro-Climatic Belt"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Zone:
                </span>
                <span className="max-w-[120px] truncate">
                  {currentScenario?.title || 'Zone'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isScenarioDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Regional Agrometeorological Profiles
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Select an agricultural zone to inspect live radar telemetry
                    </p>
                  </div>
                  <div className="space-y-1 mt-1">
                    {SCENARIO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          selectScenario(preset.id);
                          setIsScenarioDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                          activeScenarioId === preset.id
                            ? 'bg-emerald-50 dark:bg-slate-700/80 font-semibold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        {preset.status === 'RED' && (
                          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        {preset.status === 'GREEN' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {preset.status === 'AMBER' && (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 dark:text-white font-medium truncate">
                            {preset.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {preset.crop} • {preset.state}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsScenarioDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors cursor-pointer"
                title="Switch Language"
              >
                <span>
                  {languages.find((l) => l.code === language)?.nativeName || 'English'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        language === l.code
                          ? 'bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      <span className="text-[10px] text-slate-400 font-normal uppercase">
                        {l.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Advisory Summary Broadcast Button */}
            <VoiceAdvisorySummaryButton variant="header" />

            {/* AI Status Badge */}
            <div
              className={`hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                aiMode === 'live' && !isOffline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
              }`}
              title={
                aiMode === 'live' && !isOffline
                  ? 'Gemini 2.5 Flash API Connected'
                  : 'Operating via Rule-based Offline Fallback'
              }
            >
              <Sparkles
                className={`w-3 h-3 ${
                  aiMode === 'live' && !isOffline ? 'text-emerald-500 animate-spin' : 'text-amber-500'
                }`}
                style={{ animationDuration: '6s' }}
              />
              <span>AI Mode</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Krishi Mitra Chat Floating Trigger Button */}
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              title="Open Krishi Mitra AI Chatbot"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Mobile Right Cluster (Compact, Clean, Organized) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            {/* Quick Dark Mode Toggle (Direct 1-tap toggle on mobile) */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Mobile Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsScenarioDropdownOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1 shadow-xs cursor-pointer"
                title="Switch Language"
              >
                <span>{language.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        language === l.code
                          ? 'bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{l.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Hamburger / Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all cursor-pointer"
              title={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-label="Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Navigation & Quick Actions Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-[#fafaf5] dark:bg-slate-900 shadow-2xl animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          <div className="p-4 space-y-4 max-w-md mx-auto">
            {/* Primary Action Buttons: Show My Location & Ask AI */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  await handleNavbarShowLocation();
                  setIsMobileMenuOpen(false);
                }}
                disabled={isLocatingGPS}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-linear-to-r from-blue-600 via-emerald-600 to-teal-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-75"
                title="Show My Current Location on Google Maps"
              >
                {isLocatingGPS ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Navigation className="w-4 h-4 animate-bounce text-white" />
                )}
                <span>{isLocatingGPS ? 'Locating...' : 'Show My Location'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsChatOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Krishi AI</span>
              </button>
            </div>

            {/* Quick Voice Advisory Broadcast */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Voice Advisory Summary
                </span>
              </div>
              <VoiceAdvisorySummaryButton variant="header" />
            </div>

            {/* Page Navigation Links */}
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 pb-1">
                Pages &amp; Tools
              </p>
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-sm transition-all ${
                  location.pathname === '/'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Home &amp; Overview</span>
              </Link>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Agro-Climatic Belt Presets */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Agro-Climatic Belt:</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentScenario?.title}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {SCENARIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      selectScenario(preset.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeScenarioId === preset.id
                        ? 'bg-emerald-50 dark:bg-slate-700 border border-emerald-400 dark:border-emerald-600 font-bold text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{preset.title} ({preset.state})</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ml-2 ${
                        preset.status === 'RED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : preset.status === 'GREEN'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {preset.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Engine Status Footer */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>AI Connection:</span>
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {aiMode === 'live' && !isOffline ? 'Gemini 2.5 Flash Online' : 'Rule-Based Fallback'}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
