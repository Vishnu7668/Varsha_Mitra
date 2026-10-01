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

                  <h3 className="text-xl font-black leading-snug">
                    {advisory.headline}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {advisory.summary}
                  </p>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>Safe Date: <strong>{advisory.safeSowingDate}</strong></span>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {advisory.confidencePercent}% Confidence
                    </div>
                  </div>

                  <Link
                    to="/farmer"
                    className="mt-4 w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs text-center block transition-colors"
                  >
                    View Interactive 30-Day Outlook →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Section: 3 Animated Cards */}
      <section className="py-16 sm:py-24 bg-[#fafaf5] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              The Critical Blindspot
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading">
              Why Indian Kharif farmers lose ₹15,000 per acre
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Standard IMD weather forecasts work well for days 1 to 5, but decisions to sow seeds require a 21-day continuous moisture runway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {/* Card 1: 5-Day Forecast Limit */}
            <div className="rounded-3xl p-6 bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                1. The 5-Day Forecast Horizon Limit
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Atmospheric turbulence degrades standard numerical weather models after 5 days. Farmers receive zero probabilistic guidance for Weeks 2 through 4, exactly when germination decisions are irreversible.
              </p>
            </div>

            {/* Card 2: False Onset */}
            <div className="rounded-3xl p-6 bg-white dark:bg-slate-800 shadow-md border border-rose-200 dark:border-rose-900/50 hover:border-rose-400 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center mb-5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                2. False Monsoon Onset Traps
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Isolated pre-monsoon convective thunderstorms drop 25-30 mm rain. Farmers rush to sow costly hybrid cotton or soybean seeds. But the true monsoon hasn’t arrived; seeds burn or rot underground.
              </p>
            </div>

            {/* Card 3: Prolonged Dry Breaks */}
            <div className="rounded-3xl p-6 bg-white dark:bg-slate-800 shadow-md border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-5">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Prolonged 10 to 20 Day Dry Breaks
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Even with genuine onset, the monsoon trough often shifts north into the Himalayan foothills, inducing a 12-18 day rain pause. Tender 10-day-old seedlings wither without root moisture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Consequences Strip */}
      <section className="py-8 bg-linear-to-r from-rose-900 via-rose-950 to-slate-900 text-rose-100 text-xs sm:text-sm font-semibold">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-around gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Severe Crop Failure in 1st Sowing</span>
          </div>
          <div className="hidden sm:block">•</div>
          <div className="flex items-center gap-2">
            <span>Spiral of Informal Moneylender Debt (Resowing costs ₹15k/acre)</span>
          </div>
          <div className="hidden sm:block">•</div>
          <div className="flex items-center gap-2">
            <span>Delayed Government Disaster Response</span>
          </div>
        </div>
      </section>

      {/* 4. "How It Works" 4-Step Animated Flow */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Algorithmic Decision Pipeline
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading">
              How Varsha Mitra Protects Sowing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Village &amp; Crop Match</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                GPS or cascading selection locates the Gram Panchayat, root-zone soil texture, and targeted Kharif crop.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Extended Rain Prediction</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ensemble downscaling combines ERA5-Land, Open-Meteo, and MJO indices to project daily rain mm and probability across 30 days.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Dry-Break Risk Decision</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Rules engine evaluates crop water needs, break duration probability (&gt;50%), and flags false-onset anomalies.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Actionable Farmer Advisory</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Farmer receives clear traffic-light signal: Sow within 48h, hold until safe revival date, or switch to drought seeds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Projected Impact Counters */}
      <section className="py-16 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold font-heading">
              Projected System Outcomes
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1">
              *All counter values represent projected engineering targets, not measured field totals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-emerald-300">7 to 30</div>
              <div className="text-xs font-semibold text-emerald-100 mt-1">Day Decision Window</div>
              <div className="text-[10px] text-emerald-300/70 mt-1">Projected model horizon</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-emerald-300">₹12k - 15k</div>
              <div className="text-xs font-semibold text-emerald-100 mt-1">Per Acre Potential Saving</div>
              <div className="text-[10px] text-emerald-300/70 mt-1">Avoiding resowing failure</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-emerald-300">7+</div>
              <div className="text-xs font-semibold text-emerald-100 mt-1">Indian Languages</div>
              <div className="text-[10px] text-emerald-300/70 mt-1">English, Hindi, Marathi + 4</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="text-3xl sm:text-4xl font-black text-emerald-300">2G SMS</div>
              <div className="text-xs font-semibold text-emerald-100 mt-1">Inclusive Delivery</div>
              <div className="text-[10px] text-emerald-300/70 mt-1">Zero internet required</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Link to="/farmer" className="hover:text-emerald-600 transition-colors">Farmer Advisory</Link>
            <Link to="/officer" className="hover:text-emerald-600 transition-colors">Officer Dashboard</Link>
            <Link to="/sms" className="hover:text-emerald-600 transition-colors">SMS/IVR Simulator</Link>
            <Link to="/insurance" className="hover:text-emerald-600 transition-colors">PMFBY Evidence</Link>
            <Link to="/about" className="hover:text-emerald-600 transition-colors">Architecture</Link>
          </div>

          <p className="text-[11px] text-slate-400">
            VARSHA MITRA • Hyperlocal Agrometeorological Advisory Prototype
          </p>
        </div>
      </footer>
    </div>
  );
};
