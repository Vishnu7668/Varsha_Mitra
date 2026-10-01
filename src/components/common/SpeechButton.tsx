import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { LanguageCode } from '../../types';

interface SpeechButtonProps {
  textToSpeak: string;
  language: LanguageCode;
  className?: string;
  size?: 'sm' | 'md';
}

export const SpeechButton: React.FC<SpeechButtonProps> = ({
  textToSpeak,
  language,
  className = '',
  size = 'md',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    // Cancel speaking on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggle = () => {
    if (!isSupported) return;

    if (isSpeaking) {
      stopAudio();
      return;
    }

    if (!textToSpeak.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Map language code to BCP 47 language tag
    const langMap: Record<LanguageCode, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ta: 'ta-IN',
    };

    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clarity in farming advisory
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(utterance.lang.split('-')[0]) || v.lang === utterance.lang
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all cursor-pointer ${
        isSpeaking
          ? 'bg-rose-600 text-white animate-pulse'
          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700'
      } ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'} ${className}`}
      title={isSpeaking ? 'Stop voice' : 'Listen to advisory'}
      aria-label={isSpeaking ? 'Stop voice' : 'Listen to advisory'}
    >
      {isSpeaking ? (
        <>
          <VolumeX className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          <span>Listen</span>
        </>
      )}
    </button>
  );
};
