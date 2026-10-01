import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/common/Logo';
import { StatusPill } from '../components/common/StatusPill';
import {
  CloudRain,
  Sprout,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  TrendingDown,
  Layers,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, advisory, village, crop } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section with animated rain & cloud effect */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-linear-to-b from-emerald-950 via-[#0f3d24] to-[#14532d] text-white">
        {/* Animated decorative raindrops in background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute top-10 left-[15%] w-0.5 h-10 bg-sky-300 rounded-full animate-rain-drop" />
          <div className="absolute top-4 left-[28%] w-0.5 h-12 bg-sky-300 rounded-full animate-rain-drop delay-150" />
          <div className="absolute top-20 left-[45%] w-0.5 h-8 bg-sky-300 rounded-full animate-rain-drop delay-300" />
          <div className="absolute top-8 left-[65%] w-0.5 h-14 bg-sky-300 rounded-full animate-rain-drop delay-75" />
          <div className="absolute top-16 left-[82%] w-0.5 h-11 bg-sky-300 rounded-full animate-rain-drop delay-200" />
        </div>

        {/* Floating animated clouds */}
        <div className="absolute top-8 right-[10%] opacity-15 pointer-events-none animate-cloud-drift hidden md:block">
          <CloudRain className="w-48 h-48 text-sky-200" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Village-Level 7 to 30 Day Monsoon Risk Outlook</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-heading">
                Know the right time to sow,{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 via-emerald-200 to-amber-300">
                  before the rain decides for you.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Standard 5-day weather forecasts leave Indian farmers blind during critical Kharif sowing. 
                <strong> VARSHA MITRA</strong> delivers hyperlocal probabilistic dry-break outlooks that turn rainfall models into simple, life-saving advice: <em>sow now, wait, or do not sow.</em>
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/farmer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-base shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                >
                  <Sprout className="w-5 h-5 text-emerald-950" />
                  <span>Check My Village</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/officer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                >
                  <Layers className="w-5 h-5" />
                  <span>Officer Dashboard</span>
                </Link>
              </div>

              {/* Trust Tagline */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-emerald-200/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free &amp; Open Access
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-language (7 Indian Languages)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2G SMS / IVR Ready
                </span>
              </div>
            </div>

            {/* Right Column: Floating Live Advisory Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white p-6 shadow-2xl border border-white/20 backdrop-blur-md transform hover:-translate-y-1 transition-transform">
                {/* Floating pill */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Live Agrometeorological Advisory
                    </span>
                  </div>
                  <StatusPill status={advisory.status} size="sm" />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>{village.name}, {village.district}</span>
                    <span>Target: <strong>{crop}</strong></span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {advisory.headline}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {advisory.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                      Next 7d Rain
                    </span>
                    <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                      {advisory.expectedRainNext7Days} mm
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                      Dry Break Risk
                    </span>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                      {advisory.dryBreakDays} Days
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 text-center">
                  <Link
                    to="/farmer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    <span>View Complete 16-Day Forecast &amp; Google Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Pillars Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Built for Ground Realities
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading">
              Why Indian Farmers Need Varsha Mitra
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              The Southwest Monsoon is increasingly characterized by erratic onset bursts followed by prolonged dry breaks that decimate newly sown seeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Prevent ₹8,000/Acre Resowing Loss
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Premature sowing triggered by a single early pre-monsoon shower causes catastrophic seed scorch if followed by a 10-day dry break.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Google Satellite &amp; Places Grounding
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Pin your exact farm plot on Google Maps with satellite imagery, 5km microclimate Doppler radar radius, and search any village across India.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                75 Uttar Pradesh Districts Covered
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Full block and gram panchayat database for Purvanchal, Awadh, Rohilkhand, Doab, and Bundelkhand with tailored soil and crop guidance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
