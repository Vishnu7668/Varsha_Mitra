import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusPill } from '../common/StatusPill';
import { SpeechButton } from '../common/SpeechButton';
import { VoiceAdvisorySummaryButton } from '../common/VoiceAdvisorySummaryButton';
import { explainAdvisoryWithAI } from '../../services/gemini';
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  Flame,
  Droplets,
  HelpCircle,
} from 'lucide-react';

export const AdvisoryHeroCard: React.FC = () => {
  const {
    t,
    language,
    village,
    crop,
    soil,
    advisory,
    showToast,
  } = useApp();

  const [isWhyOpen, setIsWhyOpen] = useState<boolean>(true);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiModeUsed, setAiModeUsed] = useState<'live' | 'fallback'>('fallback');

  // Trigger Gemini / Fallback explanation on advisory change
  useEffect(() => {
    let isSubscribed = true;
    setIsLoadingAi(true);

    explainAdvisoryWithAI(village, advisory, crop, soil, language)
      .then((res) => {
        if (isSubscribed) {
          setAiExplanation(res.text);
          setAiModeUsed(res.aiMode);
        }
      })
      .catch(() => {
        if (isSubscribed) {
          setAiExplanation(advisory.reasonsFired.join(' '));
          setAiModeUsed('fallback');
        }
      })
      .finally(() => {
        if (isSubscribed) setIsLoadingAi(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [village, advisory, crop, soil, language]);

  // Copy or Web Share
  const handleShare = async () => {
    const shareText = `VARSHA MITRA Advisory for ${village.name} (${crop}):
Status: ${advisory.status}
${advisory.headline}
Safe Date: ${advisory.safeSowingDate}
Dry break: ${advisory.dryBreakDays} days
Check full details on Varsha Mitra!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Varsha Mitra Sowing Advisory',
          text: shareText,
        });
        showToast('Shared successfully!', 'success');
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    navigator.clipboard.writeText(shareText);
    showToast(t.advisoryCopied, 'success');
  };

  const getHeadline = () => {
    if (language === 'hi' && advisory.headlineHi) return advisory.headlineHi;
    if (language === 'mr' && advisory.headlineMr) return advisory.headlineMr;
    return advisory.headline;
  };

  // Border & background themes based on status
  const cardThemes = {
    GREEN: {
      wrapper: 'border-emerald-500/40 bg-linear-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20',
      badgeBg: 'bg-emerald-600 text-white',
      borderAccent: 'border-emerald-500',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    AMBER: {
      wrapper: 'border-amber-500/40 bg-linear-to-br from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20',
      badgeBg: 'bg-amber-600 text-white',
      borderAccent: 'border-amber-500',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    RED: {
      wrapper: 'border-rose-500/40 bg-linear-to-br from-rose-50/70 via-white to-rose-50/30 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20',
      badgeBg: 'bg-rose-600 text-white',
      borderAccent: 'border-rose-500',
      icon: AlertOctagon,
      iconColor: 'text-rose-600',
    },
  };

  const theme = cardThemes[advisory.status];
  const MainIcon = theme.icon;

  // TTS text compilation
  const speechText = `${getHeadline()}. ${aiExplanation || advisory.summary}. Safe sowing date: ${advisory.safeSowingDate}.`;

  return (
    <div className={`rounded-3xl border-2 p-5 sm:p-7 shadow-lg transition-all ${theme.wrapper}`}>
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <StatusPill status={advisory.status} size="lg" />
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {advisory.confidencePercent}% {t.confidenceScore}
          </span>
        </div>

        {/* Action buttons (Listen & Share) */}
        <div className="flex items-center gap-2">
          <SpeechButton textToSpeak={speechText} language={language} size="md" />

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Share Advisory"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t.shareAdvisory}</span>
          </button>
        </div>
      </div>

      {/* Voice-to-Text & Audio Advisory Notification Player */}
      <VoiceAdvisorySummaryButton variant="hero" className="mt-5" />

      {/* Main Headline & Context */}
      <div className="mt-5 flex items-start gap-4">
        <div className={`p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-md border ${theme.borderAccent} shrink-0 hidden sm:block`}>
          <MainIcon className={`w-8 h-8 ${theme.iconColor}`} />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {getHeadline()}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {advisory.summary}
          </p>

          {/* Key Metric Highlights */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold shadow-xs">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>
                {t.safeSowingDate}: <strong className="text-slate-900 dark:text-white">{advisory.safeSowingDate}</strong>
              </span>
            </div>

            {advisory.status === 'RED' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 font-bold shadow-xs">
                <Clock className="w-4 h-4 text-rose-600 animate-spin" style={{ animationDuration: '10s' }} />
                <span>
                  {t.countdownDays}: ~{advisory.dryBreakDays} {t.days}
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold shadow-xs">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>
                {t.expectedRain7Days}: <strong>{advisory.expectedRainNext7Days} mm</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* "Why this advice?" Expandable Accordion */}
      <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-700/80">
        <button
          type="button"
          onClick={() => setIsWhyOpen(!isWhyOpen)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>{t.whyThisAdvice}</span>
            <span className="text-[11px] font-semibold text-slate-400">
              ({advisory.reasonsFired.length} rules evaluated)
            </span>
          </div>
          {isWhyOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {isWhyOpen && (
          <div className="mt-3 space-y-3 text-xs sm:text-sm">
            {/* AI Generated / Template Plain-Language Reason */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Plain Language Summary ({aiModeUsed === 'live' ? 'Gemini AI' : 'Agro-Meteorology Rules'})</span>
              </div>
              <p className="leading-relaxed">
                {isLoadingAi ? (
                  <span className="italic text-slate-500">Generating plain-language explanation...</span>
                ) : (
                  aiExplanation || advisory.reasonsFired.join(' ')
                )}
              </p>
            </div>

            {/* List of rules fired */}
            <div className="space-y-1.5 pl-1">
              {advisory.reasonsFired.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* For RED & AMBER: "What can I do now?" Option A & Option B */}
      {(advisory.status === 'RED' || advisory.status === 'AMBER') && (
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-2 mb-3.5">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.whatCanIDo}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A: Wait / Delay */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-amber-300 dark:border-amber-700/70 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                  <span>{t.optionA}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px]">
                    Recommended
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Hold Seed Drill until {advisory.safeSowingDate}
                </h4>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Keep prepared ridges and furrows ready. Sowing into temporary moisture risks rotting. The assured monsoon revival arrives around {advisory.safeSowingDate}.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span>Avoids seed loss of ₹12,000 to ₹15,000 per acre</span>
              </div>
            </div>

            {/* Option B: Variety Switch */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-sky-300 dark:border-sky-700/70 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400 mb-1">
                  <span>{t.optionB}</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px]">
                    Adaptive
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Switch to Short-Duration / Drought-Tolerant Seeds
                </h4>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  If planting gets delayed past mid-season, transition to early-maturing varieties with deep root systems that tolerate break intervals.
                </p>
              </div>

              {/* Crop Specific Alternative Varieties */}
              {advisory.alternateVarieties.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Recommended Seeds:
                  </p>
                  {advisory.alternateVarieties.map((v, i) => (
                    <div key={i} className="text-xs flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {v.variety} ({v.durationDays}d)
                      </span>
                      <span className="text-[11px] text-slate-500">{v.benefits}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
