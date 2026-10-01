import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Pause,
  Play,
  RotateCcw,
  Radio,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
} from 'lucide-react';
import { LanguageCode } from '../../types';

interface VoiceAdvisorySummaryButtonProps {
  variant?: 'hero' | 'compact' | 'header';
  className?: string;
}

export const VoiceAdvisorySummaryButton: React.FC<VoiceAdvisorySummaryButtonProps> = ({
  variant = 'hero',
  className = '',
}) => {
  const {
    village,
    crop,
    soil,
    advisory,
    language,
    setLanguage,
    showToast,
  } = useApp();

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.92); // Farmer friendly rate
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [speechSentences, setSpeechSentences] = useState<string[]>([]);
  const [activeSentence, setActiveSentence] = useState<string>('');

  const recognitionRef = useRef<any>(null);

  // Compile comprehensive regional advisory bulletin text
  const compileBulletin = useCallback(() => {
    const locName = `${village.name}, ${village.district} District, ${village.state}`;

    if (language === 'hi') {
      return [
        `वर्षा मित्र कृषि बुलेटिन: ${village.name}, ${village.district} जिला।`,
        `फसल: ${crop}, मिट्टी का प्रकार: ${soil}।`,
        `वर्तमान बुवाई स्थिति: ${advisory.headlineHi || advisory.headline}।`,
        advisory.status === 'RED'
          ? `चेतावनी: आगामी दिनों में लगभग ${advisory.dryBreakDays} दिनों का लंबा सूखा अंतराल संभावित है। अभी बुवाई न करें, अन्यथा बीज खराब हो सकते हैं।`
          : advisory.status === 'GREEN'
          ? `खुशखबरी: पर्याप्त वर्षा का अनुमान है। आगामी 7 दिनों में लगभग ${advisory.expectedRainNext7Days} मिमी बारिश होगी। अगले 48 घंटों में बुवाई करें।`
          : `सावधानी: वर्षा की स्थिति अनिश्चित है। अगले 3 दिनों में फिर से मौसम की जांच करें।`,
        `सुरक्षित बुवाई खिड़की: ${advisory.safeSowingDate}।`,
        `मुख्य सलाह: ${advisory.recommendedActions[0]?.title || 'खेत तैयार रखें'}। ${advisory.recommendedActions[0]?.description || ''}`,
      ];
    }

    if (language === 'mr') {
      return [
        `वर्षा मित्र कृषी बुलेटिन: ${village.name}, ${village.district} जिल्हा.`,
        `पीक: ${crop}, जमिनीचा प्रकार: ${soil}.`,
        `पेरणी स्थिती: ${advisory.headlineMr || advisory.headline}.`,
        advisory.status === 'RED'
          ? `धोका सूचना: पुढील काळात सुमारे ${advisory.dryBreakDays} दिवसांचा पावसाचा मोठा खंड अपेक्षित आहे. आत्ता पेरणी करू नका, बियाणे वाया जाईल.`
          : advisory.status === 'GREEN'
          ? `उत्तम संधी: पुरेसा पाऊस अपेक्षित आहे. पुढील ७ दिवसांत सुमारे ${advisory.expectedRainNext7Days} मिमी पाऊस पडेल. पुढील ४८ तासांत पेरणी सुरू करा.`
          : `सावधगिरी: पाऊस अनिश्चित आहे. पुढील ३ दिवस वाट पहा.`,
        `सुरक्षित पेरणी तारीख: ${advisory.safeSowingDate}.`,
        `प्रमुख सल्ला: ${advisory.recommendedActions[0]?.title || 'शेती कामे थांबवा'}. ${advisory.recommendedActions[0]?.description || ''}`,
      ];
    }

    // Default English
    return [
      `Varsha Mitra Regional Sowing Bulletin for ${locName}.`,
      `Target Crop: ${crop} in ${soil} soil.`,
      `Status Notification: ${advisory.headline}.`,
      advisory.status === 'RED'
        ? `Alert: A severe dry pause of approximately ${advisory.dryBreakDays} days is anticipated. Sowing into temporary moisture risks seed rot.`
        : advisory.status === 'GREEN'
        ? `Favorable forecast: Consistent rainfall of ${advisory.expectedRainNext7Days} millimeters is expected in the next 7 days. Commence sowing within 48 hours.`
        : `Marginal moisture: Recheck forecasts in 3 days before drilling seeds.`,
      `Projected safe sowing revival date: ${advisory.safeSowingDate}.`,
      `Action: ${advisory.recommendedActions[0]?.title || 'Monitor weather'}. ${advisory.recommendedActions[0]?.description || ''}`,
    ];
  }, [village, crop, soil, advisory, language]);

  // Clean stop
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveSentence('');
    setCurrentSentenceIndex(0);
  }, []);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  // Read Aloud sequential speech synthesis
  const startSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported on this browser', 'warning');
      return;
    }

    window.speechSynthesis.cancel();

    const sentences = compileBulletin();
    setSpeechSentences(sentences);
    setIsSpeaking(true);
    setIsPaused(false);
    setCurrentSentenceIndex(0);

    const langMap: Record<LanguageCode, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ta: 'ta-IN',
    };

    const targetLang = langMap[language] || 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      (v) => v.lang.startsWith(targetLang.split('-')[0]) || v.lang === targetLang
    );

    // Speak sentence by sentence with visual transcript update
    const speakSentenceAt = (index: number) => {
      if (index >= sentences.length) {
        setIsSpeaking(false);
        setActiveSentence('');
        return;
      }

      setCurrentSentenceIndex(index);
      setActiveSentence(sentences[index]);

      const utterance = new SpeechSynthesisUtterance(sentences[index]);
      utterance.lang = targetLang;
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        speakSentenceAt(index + 1);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakSentenceAt(0);
  }, [compileBulletin, language, speechRate, showToast]);

  // Pause / Resume
  const togglePauseResume = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Voice-to-Text Input handler (Microphone command)
  const toggleVoiceToText = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Voice speech recognition not supported on this browser', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        ta: 'ta-IN',
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak "Read advisory" or "सलाह सुनाएं"', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        showToast(`Recognized voice: "${transcript}"`, 'info');
        // Automatically start read out
        startSpeech();
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsListening(false);
    }
  };

  // Header Variant (Compact button for Navbar)
  if (variant === 'header') {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={isSpeaking ? stopSpeech : startSpeech}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-rose-600 text-white border-rose-600 shadow-md animate-pulse'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
          }`}
          title={isSpeaking ? 'Stop Voice Broadcast' : 'Read Aloud Regional Sowing Advisory'}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Voice Summary</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Hero / Banner Variant
  return (
    <div className={`w-full ${className}`}>
      {/* Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-linear-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <Radio className={`w-5 h-5 text-emerald-300 ${isSpeaking ? 'animate-ping' : ''}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold tracking-tight">
                Voice Advisory Broadcast ({village.district} Region)
              </h4>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-700 text-emerald-100 uppercase font-semibold">
                Web Speech API
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-0.5 line-clamp-1">
              Listen to the latest sowing decision, rainfall forecast &amp; safe window in {language.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Buttons cluster */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Voice to text Mic trigger */}
          <button
            type="button"
            onClick={toggleVoiceToText}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
            title={isListening ? 'Listening to voice...' : 'Speak voice command to hear advisory'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-300" />}
          </button>

          {/* Speed selector */}
          <select
            value={speechRate}
            onChange={(e) => setSpeechRate(Number(e.target.value))}
            className="h-9 px-2 rounded-xl bg-white/10 border border-white/20 text-[11px] font-bold text-white focus:outline-none cursor-pointer"
            title="Voice Speed"
          >
            <option value="0.8" className="text-slate-900">0.8x (Slow)</option>
            <option value="0.92" className="text-slate-900">0.9x (Normal)</option>
            <option value="1.1" className="text-slate-900">1.1x (Fast)</option>
          </select>

          {/* Main Play / Stop Button */}
          {isSpeaking ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={togglePauseResume}
                className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                type="button"
                onClick={stopSpeech}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startSpeech}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-emerald-950" />
              <span>Listen Advisory</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Speaking Transcript Strip */}
      {isSpeaking && activeSentence && (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-start gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-1 mt-1 shrink-0">
            <span className="w-1.5 h-3 bg-emerald-600 rounded-full animate-bounce" />
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full animate-bounce delay-75" />
            <span className="w-1.5 h-2.5 bg-emerald-600 rounded-full animate-bounce delay-150" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-0.5">
              <span>Voice Playback ({currentSentenceIndex + 1}/{speechSentences.length})</span>
              <span>{isPaused ? 'Paused' : 'Playing'}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              "{activeSentence}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
