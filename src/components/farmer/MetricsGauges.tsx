import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  CalendarDays,
  Gauge,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Flame,
} from 'lucide-react';

export const MetricsGauges: React.FC = () => {
  const { t, advisory, crop, soil } = useApp();

  // Color for Onset Confidence
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-emerald-600 dark:text-emerald-400 stroke-emerald-500';
    if (conf >= 60) return 'text-amber-600 dark:text-amber-400 stroke-amber-500';
    return 'text-rose-600 dark:text-rose-400 stroke-rose-500';
  };

  // Color for Dry Spell Length
  const getDryBreakTheme = (days: number) => {
    if (days >= 11) {
      return {
        bg: 'bg-gradient-to-br from-rose-50/80 via-white to-rose-100/40 dark:from-slate-900 dark:via-slate-800 dark:to-rose-950/40 border-rose-200 dark:border-rose-800 text-slate-900 dark:text-white',
        badge: 'Critical Pause',
        iconColor: 'text-rose-600 dark:text-rose-400',
      };
    }
    if (days >= 7) {
      return {
        bg: 'bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/40 border-amber-200 dark:border-amber-800 text-slate-900 dark:text-white',
        badge: 'Moderate Gap',
        iconColor: 'text-amber-600 dark:text-amber-400',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/40 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white',
      badge: 'Continuous Rains',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    };
  };

  // Soil moisture stress level
  const soilScore = advisory.soilMoistureScore;
  const dryBreak = getDryBreakTheme(advisory.dryBreakDays);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Onset Confidence Radial Gauge */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.onsetConfidenceGauge}
          </span>
          <Compass className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="my-4 flex items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG circular gauge */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-slate-100 dark:text-slate-700"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={getConfidenceColor(advisory.confidencePercent)}
                strokeWidth="10"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * advisory.confidencePercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {advisory.confidencePercent}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Reliability
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 dark:text-slate-300 font-medium">
          Based on multimodel ensemble (Days 1 to 14)
        </div>
      </div>

      {/* 2. Continuous Dry Days Counter */}
      <div
        className={`rounded-3xl p-5 shadow-md border flex flex-col justify-between transition-colors ${dryBreak.bg}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">
            {t.consecutiveDryDays}
          </span>
          <CalendarDays className={`w-4 h-4 ${dryBreak.iconColor}`} />
        </div>

        <div className="my-3 text-center">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-5xl font-black">{advisory.dryBreakDays}</span>
            <span className="text-lg font-bold">days</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/70 dark:bg-slate-900/60 shadow-xs">
            {advisory.dryBreakDays >= 10 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{dryBreak.badge}</span>
          </div>
        </div>

        <div className="text-center text-xs font-medium opacity-90">
          Break probability in root zone: <strong>{advisory.breakProbabilityPercent}%</strong>
        </div>
      </div>

      {/* 3. Soil Moisture Stress Meter */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.soilMoistureScore}
          </span>
          <Gauge className="w-4 h-4 text-sky-600" />
        </div>

        <div className="my-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {soilScore}%
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                soilScore >= 60
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : soilScore >= 40
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {soilScore >= 60 ? 'Optimal Field Capacity' : soilScore >= 40 ? 'Moderate Stress' : 'Severe Deficit'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                soilScore >= 60
                  ? 'bg-emerald-500'
                  : soilScore >= 40
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${soilScore}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>0% (Wilting point)</span>
            <span>100% (Saturation)</span>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 dark:text-slate-300 font-medium">
          Calibrated for <strong>{soil} soil</strong> in {crop} root zone (0-15 cm)
        </div>
      </div>
    </div>
  );
};
