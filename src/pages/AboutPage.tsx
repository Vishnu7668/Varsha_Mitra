import React from 'react';
import { Logo } from '../components/common/Logo';
import {
  Layers,
  Cpu,
  Database,
  Radio,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Server,
  CloudLightning,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <Cpu className="w-3.5 h-3.5" />
          <span>System Architecture &amp; Prototype Specifications</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-heading">
          Engineered for Hyperlocal Monsoon Resilience
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          How VARSHA MITRA bridges the 5-to-30 day forecasting gap with probabilistic multi-model ensemble downscaling, deterministic agronomic rules, and 2G telecom delivery.
        </p>
      </div>

      {/* 1. Animated Architecture Flow Diagram */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <span>End-to-End Architectural Pipeline</span>
        </h3>

        {/* 5-Stage Diagram Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Stage 1: Ingestion */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center font-bold text-xs mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2">
                Data Sources
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>• ERA5-Land Reanalysis</li>
                <li>• IMD Gridded Rainfall</li>
                <li>• MJO / IOD / ENSO Indices</li>
                <li>• Open-Meteo Live API</li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
              Raw telemetry &amp; indices
            </div>
          </div>

          {/* Stage 2: Downscaling */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-bold text-xs mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2">
                Village Downscaling
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>• Spatial bilinear interpolation</li>
                <li>• Gram Panchayat centroid binding</li>
                <li>• Topographical lapse adjustment</li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
              0.05° Resolution
            </div>
          </div>

          {/* Stage 3: ML Engine */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold text-xs mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2">
                ML Probabilistic Engine
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>• 7 to 30 day ensemble</li>
                <li>• Break duration estimator</li>
                <li>• False-onset anomaly classifier</li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
              Probabilistic outlook
            </div>
          </div>

          {/* Stage 4: Agronomic Rules */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs mb-3">
                4
              </div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs mb-2">
                Crop Rules Engine
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                <li>• Cotton &amp; Soybean sensitivity</li>
                <li>• Soil moisture holding capacity</li>
                <li>• Deterministic Traffic Light (R/A/G)</li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-600 font-bold">
              Pure Functional Core
            </div>
          </div>

          {/* Stage 5: Omnichannel Delivery */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold text-xs mb-3">
                5
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2">
                Omnichannel Reach
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>• 2G SMS &lt;160 chars</li>
                <li>• Automated Voice IVR</li>
                <li>• Officer Dashboard Override</li>
                <li>• Krishi Mitra AI Chatbot</li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
              Farmers &amp; Officials
            </div>
          </div>
        </div>
      </div>

      {/* 2. Feasibility & Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Scalable Microservice Architecture
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The data ingestion layer runs stateless containerized cron workers pulling grid forecasts every 6 hours. Calculations take &lt;15ms per village due to pure functional separation in the advisory rules engine, enabling effortless scaling to all 660,000 villages across India.
          </p>
          <div className="pt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            • Sub-cent operating cost per village advisory per season
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Human-in-the-Loop Officer Override
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            AI and statistical predictions never issue unmonitored mass farm advisories. Taluka Agriculture Officers hold full authority to review, tune thresholds, or override advisories with mandatory audit logging, accounting for hyper-local micro-events like canal water releases.
          </p>
          <div className="pt-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
            • Strict tamper-evident audit trails with cryptographic hashes
          </div>
        </div>
      </div>

      {/* 3. Prototype Transparency Notice */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/80 space-y-4">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-base sm:text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Prototype Notice: What is Live vs. What is Simulated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm leading-relaxed text-amber-950 dark:text-amber-200">
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Currently Live in This Application:</span>
            </h4>
            <ul className="space-y-1 list-disc list-inside text-xs opacity-90">
              <li>Open-Meteo 7-day live weather API assimilation (via Live toggle)</li>
              <li>Server-side Gemini 2.5 Flash chatbot &amp; plain-language explainer</li>
              <li>Deterministic pure agronomic rules engine for 6 Kharif crops &amp; 4 soils</li>
              <li>Speech synthesis (TTS) &amp; Speech Recognition (STT) via Web Speech API</li>
              <li>Interactive Leaflet map with OpenStreetMap CartoDB tiles</li>
              <li>Client-side PDF claim dossier generation with jsPDF</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Simulated for Demonstration Testing:</span>
            </h4>
            <ul className="space-y-1 list-disc list-inside text-xs opacity-90">
              <li>Days 8 to 30 extended-range probabilistic outlook (simulated ensemble)</li>
              <li>Past 10 days observed rainfall accumulation logs (seeded realistic data)</li>
              <li>Telecom carrier SMS and IVR telecom dispatch (local web simulation)</li>
              <li>Gram Panchayat farmer registry counts and cadastral acreage metrics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Swapping Mock Layer for Production Backend */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Code2 className="w-4 h-4" />
          <span>Production Migration: Swap Mock Layer for FastAPI / Celery</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          The TypeScript service layer in <code>/src/services/weather.ts</code> and <code>/src/services/advisory.ts</code> strictly mirrors the planned Python FastAPI endpoints: <code>GET /api/v1/weather/{'{'}village_id{'}'}</code> and <code>POST /api/v1/advisory/evaluate</code>. To go to production, replace the local mock generator with a Celery task pipeline ingesting ECMWF IFS / NCMRWF numerical weather predictions.
        </p>
      </div>
    </div>
  );
};
