import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VILLAGES_DATABASE } from '../data/villages';
import { AdvisoryStatus, CropType, OfficerPanchayatRisk } from '../types';
import { generateOfficerAlertPreview } from '../services/gemini';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  Send,
  Layers,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  Edit3,
  History,
  Lock,
  LogOut,
  MapPin,
  TrendingDown,
  Sparkles,
  Phone,
  MessageSquare,
  Check,
} from 'lucide-react';

export const OfficerDashboardPage: React.FC = () => {
  const {
    t,
    language,
    customThresholdMm,
    setCustomThresholdMm,
    showToast,
    isDarkMode,
  } = useApp();

  // 1. Officer Demo Login State
  const [officerName, setOfficerName] = useState<string>(() => {
    return localStorage.getItem('varsha_officer_name') || '';
  });
  const [loginInput, setLoginInput] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput.trim()) {
      setOfficerName(loginInput.trim());
      localStorage.setItem('varsha_officer_name', loginInput.trim());
      showToast(`Welcome, Officer ${loginInput.trim()}`, 'success');
    }
  };

  const handleLogout = () => {
    setOfficerName('');
    localStorage.removeItem('varsha_officer_name');
    showToast('Logged out of Officer Session', 'info');
  };

  // 2. Synthesize at least 20 Gram Panchayat records based on VILLAGES_DATABASE
  const [panchayats, setPanchayats] = useState<OfficerPanchayatRisk[]>(() => {
    const cropsList: CropType[] = ['Cotton', 'Soybean', 'Paddy', 'Tur', 'Maize'];
    return VILLAGES_DATABASE.map((v, idx) => {
      // Deterministic risk allocation: Vidarbha/Marathwada villages have higher risk in Kharif
      const isRed = idx % 3 === 0 || v.district === 'Yavatmal' || v.district === 'Latur';
      const isGreen = idx % 4 === 0 && !isRed;
      const riskStatus: AdvisoryStatus = isRed ? 'RED' : isGreen ? 'GREEN' : 'AMBER';
      const dryBreak = isRed ? 14 : isGreen ? 4 : 8;
      const rain7d = isGreen ? 88 : isRed ? 18 : 38;

      return {
        id: v.id,
        villageName: v.name,
        block: v.block,
        district: v.district,
        state: v.state,
        lat: v.lat,
        lng: v.lng,
        riskStatus,
        riskScore: isRed ? 88 : isGreen ? 22 : 60,
        primaryCrop: v.defaultCrop || cropsList[idx % cropsList.length],
        farmersCount: v.registeredFarmers,
        acreageAtRisk: Math.round(v.cultivatedAcreage * (isRed ? 0.85 : isGreen ? 0.15 : 0.45)),
        onsetConfidence: isGreen ? 91 : isRed ? 86 : 70,
        dryBreakLength: dryBreak,
        next7DaysRainMm: rain7d,
        advisoryText: isRed
          ? `CRITICAL: False onset detected. Hold sowing drill until assured monsoon revival.`
          : isGreen
          ? `OPTIMAL: Robust monsoon depression. Safe to initiate main field sowing.`
          : `CAUTION: Rain marginal. Hold operations and monitor 3-day radar updates.`,
      };
    });
  });

  // 3. Filters
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [horizon, setHorizon] = useState<'7' | '14' | '30'>('14');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 4. Selected Panchayat for Detail Side-Panel
  const [selectedPanchayat, setSelectedPanchayat] = useState<OfficerPanchayatRisk | null>(panchayats[0]);

  // 5. Override Advisory Modal
  const [overrideTarget, setOverrideTarget] = useState<OfficerPanchayatRisk | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<AdvisoryStatus>('AMBER');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideNewText, setOverrideNewText] = useState<string>('');

  // 6. Send Alert Wizard
  const [isAlertWizardOpen, setIsAlertWizardOpen] = useState<boolean>(false);
  const [alertChannel, setAlertChannel] = useState<'SMS' | 'Voice IVR' | 'WhatsApp'>('SMS');
  const [alertTargetRisk, setAlertTargetRisk] = useState<string>('RED');
  const [alertDraftText, setAlertDraftText] = useState<string>('');
  const [isDraftingAlert, setIsDraftingAlert] = useState<boolean>(false);

  // Filtered Panchayats
  const filteredPanchayats = useMemo(() => {
    return panchayats.filter((p) => {
      if (selectedState !== 'All' && p.state !== selectedState) return false;
      if (selectedCrop !== 'All' && p.primaryCrop !== selectedCrop) return false;
      if (selectedRisk !== 'All' && p.riskStatus !== selectedRisk) return false;
      if (
        searchQuery &&
        !p.villageName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.district.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [panchayats, selectedState, selectedCrop, selectedRisk, searchQuery]);

  // KPIs
  const kpis = useMemo(() => {
    const highRiskCount = filteredPanchayats.filter((p) => p.riskStatus === 'RED').length;
    const farmersAtRisk = filteredPanchayats
      .filter((p) => p.riskStatus === 'RED' || p.riskStatus === 'AMBER')
      .reduce((acc, p) => acc + p.farmersCount, 0);
    const acreageAtRisk = filteredPanchayats.reduce((acc, p) => acc + p.acreageAtRisk, 0);
    const avgConfidence = Math.round(
      filteredPanchayats.reduce((acc, p) => acc + p.onsetConfidence, 0) / (filteredPanchayats.length || 1)
    );

    return {
      highRiskCount,
      farmersAtRisk,
      acreageAtRisk,
      avgConfidence,
    };
  }, [filteredPanchayats]);

  // Handle Advisory Override Submission
  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTarget || !overrideReason.trim()) {
      showToast('Mandatory: An override reason must be provided.', 'warning');
      return;
    }

    setPanchayats((prev) =>
      prev.map((p) => {
        if (p.id === overrideTarget.id) {
          return {
            ...p,
            riskStatus: overrideStatus,
            advisoryText: overrideNewText.trim() || p.advisoryText,
            isOverridden: true,
            overriddenBy: officerName || 'Officer Admin',
            overriddenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            overrideNote: overrideReason.trim(),
          };
        }
        return p;
      })
    );

    if (selectedPanchayat && selectedPanchayat.id === overrideTarget.id) {
      setSelectedPanchayat((prev) =>
        prev
          ? {
              ...prev,
              riskStatus: overrideStatus,
              advisoryText: overrideNewText.trim() || prev.advisoryText,
              isOverridden: true,
              overriddenBy: officerName || 'Officer Admin',
              overriddenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              overrideNote: overrideReason.trim(),
            }
          : null
      );
    }

    showToast(`Advisory overridden for ${overrideTarget.villageName}`, 'success');
    setOverrideTarget(null);
    setOverrideReason('');
    setOverrideNewText('');
  };

  // Generate Alert Draft with Gemini
  const handleOpenAlertWizard = async () => {
    setIsAlertWizardOpen(true);
    setIsDraftingAlert(true);

    const redSample = filteredPanchayats.find((p) => p.riskStatus === 'RED') || filteredPanchayats[0];

    const preview = await generateOfficerAlertPreview({
      villageName: `${redSample?.district || 'Vidarbha'} Cluster`,
      crop: redSample?.primaryCrop || 'Cotton',
      status: 'RED',
      dryBreakDays: 14,
      safeSowingDate: '18 July',
      language,
      channel: alertChannel,
    });

    setAlertDraftText(preview.text);
    setIsDraftingAlert(false);
  };

  const handleDispatchAlert = () => {
    const targetCount = filteredPanchayats.filter((p) => p.riskStatus === alertTargetRisk).length;
    showToast(
      `Dispatched ${alertChannel} alert to ${targetCount} Gram Panchayats (${kpis.farmersAtRisk} farmers)`,
      'success'
    );
    setIsAlertWizardOpen(false);
  };

  // Chart data
  const riskDonutData = useMemo(() => {
    const red = filteredPanchayats.filter((p) => p.riskStatus === 'RED').length;
    const amber = filteredPanchayats.filter((p) => p.riskStatus === 'AMBER').length;
    const green = filteredPanchayats.filter((p) => p.riskStatus === 'GREEN').length;
    return [
      { name: 'Red (Do Not Sow)', value: red, color: '#e11d48' },
      { name: 'Amber (Wait)', value: amber, color: '#f59e0b' },
      { name: 'Green (Safe)', value: green, color: '#16a34a' },
    ];
  }, [filteredPanchayats]);

  const anomalyChartData = useMemo(() => {
    return [
      { day: 'Week -1', rain: 14, normal: 35 },
      { day: 'Week 1', rain: 22, normal: 48 },
      { day: 'Week 2', rain: 5, normal: 52 },
      { day: 'Week 3', rain: 3, normal: 50 },
      { day: 'Week 4', rain: 42, normal: 45 },
    ];
  }, []);

  // Demo Login screen if not authenticated
  if (!officerName) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Agriculture Officer Login
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Access Gram Panchayat risk heatmaps, advisory overrides, and mass alert broadcasting.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter Officer Name / Cadre (Demo)
              </label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. Dr. Rajesh Deshmukh (Taluka Agri Officer)"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Enter Officer Control Room
            </button>
          </form>

          <p className="text-[11px] text-slate-400 mt-4">
            Prototype demo mode: Any officer name is accepted and stored locally.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Agriculture Officer Risk Command
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Logged in as <strong>{officerName}</strong> • {filteredPanchayats.length} Gram Panchayats Active
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAlertWizard}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Alert Broadcast</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Log Out Officer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Panchayats at High Risk
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-rose-700 dark:text-rose-300">
              {kpis.highRiskCount}
            </span>
            <span className="text-xs text-rose-600">/ {filteredPanchayats.length} Total</span>
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1">Severe dry pause (&gt;11 days)</p>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Farmers to Alert
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-700 dark:text-amber-300">
              {kpis.farmersAtRisk.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-amber-600/80 mt-1">In RED &amp; AMBER villages</p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Acreage at Risk
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-300">
              {kpis.acreageAtRisk.toLocaleString()}
            </span>
            <span className="text-xs font-bold">Acres</span>
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1">Cultivated Kharif area</p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-3xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Average Onset Confidence
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-sky-700 dark:text-sky-300">
              {kpis.avgConfidence}%
            </span>
          </div>
          <p className="text-[11px] text-sky-600/80 mt-1">Multi-model assimilation</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-70">
          {/* Search */}
          <div className="relative min-w-45 flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search panchayat or district..."
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* State */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="All">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Telangana">Telangana</option>
          </select>

          {/* Crop */}
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Crops</option>
            <option value="Cotton">Cotton</option>
            <option value="Soybean">Soybean</option>
            <option value="Paddy">Paddy</option>
            <option value="Tur">Tur</option>
            <option value="Maize">Maize</option>
          </select>

          {/* Risk Level */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Risk Levels</option>
            <option value="RED">High Risk (RED)</option>
            <option value="AMBER">Moderate (AMBER)</option>
            <option value="GREEN">Safe Onset (GREEN)</option>
          </select>
        </div>

        {/* Horizon Pill */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
          <span className="text-[10px] text-slate-400 px-1.5 uppercase">Horizon:</span>
          {(['7', '14', '30'] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizon(h)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                horizon === h
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Leaflet Map + Selected Panchayat Side-Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        </div>

        {/* SELECTED PANCHAYAT DETAIL SIDE PANEL (4 cols) */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-md border border-slate-200 dark:border-slate-700">
          {selectedPanchayat ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedPanchayat.villageName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedPanchayat.block}, {selectedPanchayat.district} ({selectedPanchayat.state})
                  </p>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                    selectedPanchayat.riskStatus === 'RED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : selectedPanchayat.riskStatus === 'GREEN'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {selectedPanchayat.riskStatus}
                </span>
              </div>

              {/* Overridden Badge if any */}
              {selectedPanchayat.isOverridden && (
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
                  <div className="font-bold flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Officer Override Active</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-tight opacity-90">
                    By {selectedPanchayat.overriddenBy} at {selectedPanchayat.overriddenAt}: "{selectedPanchayat.overrideNote}"
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">Registered Farmers</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {selectedPanchayat.farmersCount}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">Acreage at Risk</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {selectedPanchayat.acreageAtRisk} Ha
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">Rain 7-Day Exp.</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {selectedPanchayat.next7DaysRainMm} mm
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">Dry Break Days</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {selectedPanchayat.dryBreakLength} days
                  </strong>
                </div>
              </div>

              {/* Advisory Text Preview */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Active Dispatch Advisory
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-mono">
                  {selectedPanchayat.advisoryText}
                </p>
              </div>

              {/* Override Button */}
              <button
                type="button"
                onClick={() => {
                  setOverrideTarget(selectedPanchayat);
                  setOverrideStatus(selectedPanchayat.riskStatus);
                  setOverrideNewText(selectedPanchayat.advisoryText);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Override Panchayat Advisory</span>
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Select a Gram Panchayat on the map or table to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Advisory Manager Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Panchayat Advisory Manager ({filteredPanchayats.length})
            </h3>
            <p className="text-xs text-slate-500">
              Review and override model predictions before mass broadcast
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3 px-2">Gram Panchayat</th>
                <th className="pb-3 px-2">Block / District</th>
                <th className="pb-3 px-2">Crop</th>
                <th className="pb-3 px-2">Risk Status</th>
                <th className="pb-3 px-2">Dry Pause</th>
                <th className="pb-3 px-2">Farmers</th>
                <th className="pb-3 px-2">Acreage</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {filteredPanchayats.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedPanchayat(item)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer ${
                    selectedPanchayat?.id === item.id ? 'bg-slate-50 dark:bg-slate-700/50' : ''
                  }`}
                >
                  <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                    {item.villageName}
                    {item.isOverridden && (
                      <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        Overridden
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-slate-500">
                    {item.block}, {item.district}
                  </td>
                  <td className="py-3 px-2">{item.primaryCrop}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.riskStatus === 'RED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : item.riskStatus === 'GREEN'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.riskStatus}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-semibold">
                    {item.dryBreakLength} days
                  </td>
                  <td className="py-3 px-2">{item.farmersCount}</td>
                  <td className="py-3 px-2">{item.acreageAtRisk} Ha</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOverrideTarget(item);
                        setOverrideStatus(item.riskStatus);
                        setOverrideNewText(item.advisoryText);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Override
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics & Threshold Settings Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-md border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Risk Distribution
          </h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  dataKey="value"
                >
                  {riskDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-around text-xs mt-2">
            {riskDonutData.map((d) => (
              <span key={d.name} className="flex items-center gap-1 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span>{d.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Anomaly Trend Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-md border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Regional Rainfall Anomaly Trend (mm)
          </h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={anomalyChartData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="rain" stroke="#0284c7" strokeWidth={2} name="Observed/Forecast" />
                <Line type="monotone" dataKey="normal" stroke="#94a3b8" strokeDasharray="3 3" name="Long Period Average" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-1">
            Blue: Projected mm • Grey: IMD Normal Climatology
          </p>
        </div>

        {/* Dynamic Model Threshold Tuning */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Threshold Settings
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust minimum cumulative 7-day rainfall requirement across all agro-rules:
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span>7-Day Sowing Threshold:</span>
                <span className="text-emerald-600 font-mono">
                  {customThresholdMm ?? 50} mm
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="90"
                step="5"
                value={customThresholdMm ?? 50}
                onChange={(e) => setCustomThresholdMm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>25 mm (Lenient)</span>
                <span>50 mm (Default)</span>
                <span>90 mm (Strict)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCustomThresholdMm(undefined);
              showToast('Reset rules engine to default agro-thresholds', 'info');
            }}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Reset to Scientific Defaults
          </button>
        </div>
      </div>

      {/* OVERRIDE ADVISORY MODAL */}
      {overrideTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Override Advisory: {overrideTarget.villageName}
                </h3>
                <p className="text-xs text-slate-500">
                  Panchayat ID: {overrideTarget.id} • Crop: {overrideTarget.primaryCrop}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOverrideTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Adjust Risk Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['GREEN', 'AMBER', 'RED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOverrideStatus(st)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        overrideStatus === st
                          ? st === 'RED'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : st === 'GREEN'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Custom Advisory Text (Optional)
                </label>
                <textarea
                  value={overrideNewText}
                  onChange={(e) => setOverrideNewText(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Enter custom advisory message..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Audit Reason for Override *
                </label>
                <input
                  type="text"
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Canal release confirmed by Irrigation Dept on July 5"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setOverrideTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Log &amp; Commit Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND ALERT WIZARD MODAL */}
      {isAlertWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Send Advisory Alert Broadcast
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAlertWizardOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Target Risk */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Target Risk Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['RED', 'AMBER', 'GREEN'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAlertTargetRisk(r)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        alertTargetRisk === r
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {r} Panchayats
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Channel */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Broadcast Delivery Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SMS', 'Voice IVR', 'WhatsApp'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setAlertChannel(ch)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                        alertChannel === ch
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {ch === 'SMS' && <MessageSquare className="w-3.5 h-3.5" />}
                      {ch === 'Voice IVR' && <Phone className="w-3.5 h-3.5" />}
                      {ch === 'WhatsApp' && <span>💬</span>}
                      <span>{ch}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>3. Message Preview ({alertDraftText.length} Chars)</span>
                  <span className="text-emerald-600 font-normal text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Gemini 2.5 Flash Drafted
                  </span>
                </div>
                <textarea
                  value={alertDraftText}
                  onChange={(e) => setAlertDraftText(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Confirm */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500">
                Will be dispatched to {filteredPanchayats.filter((p) => p.riskStatus === alertTargetRisk).length} Gram Panchayats (~{kpis.farmersAtRisk} mobile subscribers).
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAlertWizardOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchAlert}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Confirm &amp; Broadcast Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
