import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    setIsChatOpen,
  } = useApp();

  const location = useLocation();
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const navLinks = [
    { path: '/farmer', label: t.navFarmer, icon: Sprout },
    { path: '/officer', label: t.navOfficer, icon: Layers },
    { path: '/sms', label: t.navSms, icon: PhoneCall },
    { path: '/insurance', label: t.navInsurance, icon: ShieldCheck },
    { path: '/about', label: t.navAbout, icon: Info },
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
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 dark:border-emerald-500/20 bg-[#fafaf5]/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Brand Logo */}
          <Link to="/" className="shrink-0 flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav Links */}
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

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live GPS Location Detector Button */}
            <button
              type="button"
              onClick={detectLiveLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              title="Detect My Live GPS Location & Fetch Live Weather"
            >
              <MapPin className="w-3.5 h-3.5 text-white animate-bounce" />
              <span className="hidden sm:inline">Live GPS Location</span>
              <span className="sm:hidden">GPS</span>
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
                <span className="hidden md:inline text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Zone:
                </span>
                <span className="max-w-[110px] sm:max-w-[150px] truncate">
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
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
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
              <span>{aiMode === 'live' && !isOffline ? 'AI Live' : 'AI Offline'}</span>
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
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
