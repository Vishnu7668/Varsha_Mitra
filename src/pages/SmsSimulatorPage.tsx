import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SpeechButton } from '../components/common/SpeechButton';
import {
  Phone,
  MessageSquare,
  Radio,
  Send,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const SmsSimulatorPage: React.FC = () => {
  const { village, crop, advisory, language, setLanguage, t } = useApp();

  // Nokia SMS Simulator State
  const [featurePhoneScreen, setFeaturePhoneScreen] = useState<'inbox' | 'message' | 'reply1' | 'reply2'>('message');
  const [featurePhoneReplyInput, setFeaturePhoneReplyInput] = useState<string>('');

  // Smartphone WhatsApp Simulator State
  const [chatMessages, setChatMessages] = useState<
    { sender: 'server' | 'user'; text: string; time: string }[]
  >([]);
  const [smartPhoneInput, setSmartPhoneInput] = useState<string>('');

  // IVR Simulator State
  const [ivrCallState, setIvrCallState] = useState<'idle' | 'calling' | 'connected' | 'speaking'>('idle');
  const [ivrCurrentSpeech, setIvrCurrentSpeech] = useState<string>('');
  const [activeIvrKey, setActiveIvrKey] = useState<string | null>(null);

  // Exact 160-char formatted SMS
  const generateSmsText = () => {
    if (advisory.status === 'RED') {
      return `VARSHA MITRA: DO NOT sow ${crop} in ${village.name}! Rain to pause ~${advisory.dryBreakDays}d. Safe date: ${advisory.safeSowingDate}. Reply 1 for details, 2 for seeds.`;
    } else if (advisory.status === 'GREEN') {
      return `VARSHA MITRA: SAFE to sow ${crop} in ${village.name}! Start within 48h. Rain ${advisory.expectedRainNext7Days}mm next 7d. Reply 1 for fertilizer, 2 for info.`;
    }
    return `VARSHA MITRA: WAIT. Rain in ${village.name} is marginal. Recheck in 3d before sowing ${crop}. Safe date: ${advisory.safeSowingDate}. Reply 1 for details.`;
  };

  const smsText = generateSmsText();

  // Reset WhatsApp thread when village/advisory changes
  useEffect(() => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages([
      {
        sender: 'server',
        text: `🌾 *VARSHA MITRA AGRICULTURAL ADVISORY*
📍 Village: ${village.name}, ${village.district}
🌱 Crop: ${crop}
🚦 Status: *${advisory.status}*
${advisory.headline}

🗓️ *Safe Sowing Date:* ${advisory.safeSowingDate}
🌧️ *Expected Rain (7d):* ${advisory.expectedRainNext7Days} mm
⚠️ *Dry Pause Duration:* ${advisory.dryBreakDays} days

Reply *1* for full agronomic guidance.
Reply *2* for resilient seed recommendations.
Reply *3* for PMFBY insurance checklist.`,
        time,
      },
    ]);
  }, [village, crop, advisory]);

  // Handle Nokia Keypad / Reply Input
  const handleFeaturePhoneReply = (key: string) => {
    if (key === '1') {
      setFeaturePhoneScreen('reply1');
    } else if (key === '2') {
      setFeaturePhoneScreen('reply2');
    } else if (key === 'back') {
      setFeaturePhoneScreen('message');
      setFeaturePhoneReplyInput('');
    }
  };

  // Handle WhatsApp User Send
  const handleSmartPhoneSend = (textToSend?: string) => {
    const text = (textToSend || smartPhoneInput).trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgs = [...chatMessages, { sender: 'user' as const, text, time }];

    let reply = '';
    if (text === '1' || text.toLowerCase().includes('detail')) {
      reply = `📋 *VARSHA MITRA AGRONOMIC GUIDANCE*:
• Status: ${advisory.status}
• Recommendation: ${
        advisory.status === 'RED'
          ? `Hold sowing seed drill until ${advisory.safeSowingDate}. Sowing now risks seed rot.`
          : `Commence field sowing immediately. Apply basal fertilizer.`
      }
• Root-Zone Moisture Stress: ${advisory.soilMoistureScore}%`;
    } else if (text === '2' || text.toLowerCase().includes('seed')) {
      reply = `🌱 *RECOMMENDED VARIETIES FOR ${crop.toUpperCase()}*:
${
  advisory.alternateVarieties.length > 0
    ? advisory.alternateVarieties.map((v) => `• *${v.variety}* (${v.durationDays}d): ${v.benefits}`).join('\n')
    : `• Use certified medium-duration drought-hardy seed varieties with Trichoderma seed coating.`
}`;
    } else if (text === '3' || text.toLowerCase().includes('insurance')) {
      reply = `🛡️ *PMFBY CROP INSURANCE*:
Prevented sowing compensation requires notification within 72 hours. Call National Toll-Free *14447* or contact your local Taluka Agriculture Officer.`;
    } else {
      reply = `🌾 *VARSHA MITRA*: For ${village.name}, current status is *${advisory.status}*. Safe sowing window starts *${advisory.safeSowingDate}*. Reply 1, 2 or 3 for instant options.`;
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'server',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);

    setChatMessages(newMsgs);
    setSmartPhoneInput('');
  };

  // IVR Voice Call Simulator
  const startIvrCall = () => {
    setIvrCallState('connected');
    const intro = `Welcome to Varsha Mitra Kisan IVR Service. You are calling for village ${village.name}. Press 1 for sowing advice. Press 2 for weather outlook. Press 3 for insurance help. Press 4 to talk to local agriculture officer.`;
    setIvrCurrentSpeech(intro);
    speakIvr(intro);
  };

  const pressIvrKey = (key: string) => {
    setActiveIvrKey(key);
    let speech = '';

    if (key === '1') {
      speech = `Sowing advice for ${crop} in ${village.name}: Status is ${advisory.status}. ${advisory.headline}. Projected safe revival date is ${advisory.safeSowingDate}.`;
    } else if (key === '2') {
      speech = `Weather Outlook: Expected rainfall over the next 7 days is ${advisory.expectedRainNext7Days} millimeters. Continuous dry break duration is forecasted at ${advisory.dryBreakDays} days.`;
    } else if (key === '3') {
      speech = `PMFBY Insurance: If sowing is prevented by rain pauses, call 1 4 4 4 7 within 72 hours to register your claims survey.`;
    } else if (key === '4') {
      speech = `Connecting your call to the Taluka Agriculture Officer for ${village.block}, ${village.district}. Please wait on the line...`;
    } else {
      speech = `Invalid selection. Press 1 for sowing advice, 2 for weather outlook, 3 for insurance help.`;
    }

    setIvrCurrentSpeech(speech);
    speakIvr(speech);

    setTimeout(() => setActiveIvrKey(null), 1000);
  };

  const endIvrCall = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIvrCallState('idle');
    setIvrCurrentSpeech('');
  };

  const speakIvr = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Universal Telecom Dispatch Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Farmer SMS, Voice IVR &amp; WhatsApp Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Carrier-grade agrometeorological advisory broadcasts for smallholders via 2G SMS, automated Voice IVR, and WhatsApp channels.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-medium max-w-xs">
          <strong>Live Broadcast:</strong> Messages are synthesized in real time from the National Agrometeorological Observatory radar.
        </div>
      </div>

      {/* Two Mockups Grid: Feature Phone vs Smartphone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT: Nokia Feature Phone Mockup */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Feature Phone (2G SMS)
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {smsText.length} / 160 Chars
            </span>
          </div>

          {/* Physical Phone Casing */}
          <div className="w-[300px] sm:w-[320px] rounded-[44px] bg-slate-800 p-4 shadow-2xl border-4 border-slate-700 text-white select-none">
            {/* Earpiece */}
            <div className="w-14 h-1.5 bg-slate-600 rounded-full mx-auto mb-4" />

            {/* LCD Screen */}
            <div className="w-full h-[220px] rounded-2xl bg-[#98b394] text-slate-900 p-3.5 font-mono text-xs shadow-inner border-2 border-slate-900/40 flex flex-col justify-between overflow-hidden">
              {/* Screen Header Bar */}
              <div className="flex items-center justify-between text-[10px] border-b border-slate-900/30 pb-1 font-bold">
                <span>📶 2G | BSNL</span>
                <span>✉️ 1 MSG</span>
                <span>🔋 100%</span>
              </div>

              {/* Message Content on Screen */}
              <div className="my-auto overflow-y-auto max-h-[140px] text-[11px] leading-tight font-semibold">
                {featurePhoneScreen === 'message' && (
                  <div>
                    <p className="mb-1 text-[10px] text-slate-700">From: VM-AGRI</p>
                    <p>{smsText}</p>
                  </div>
                )}

                {featurePhoneScreen === 'reply1' && (
                  <div>
                    <p className="font-bold mb-1">VARSHA MITRA DETAILS:</p>
                    <p>
                      Status: {advisory.status}. {advisory.summary} Safe Sowing: {advisory.safeSowingDate}.
                    </p>
                  </div>
                )}

                {featurePhoneScreen === 'reply2' && (
                  <div>
                    <p className="font-bold mb-1">SEED OPTIONS for {crop}:</p>
                    <p>
                      {advisory.alternateVarieties.length > 0
                        ? advisory.alternateVarieties.map((v) => `${v.variety} (${v.durationDays}d)`).join(', ')
                        : 'Use short-duration certified seed.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Screen Footer Softkeys */}
              <div className="flex items-center justify-between text-[10px] font-bold border-t border-slate-900/30 pt-1">
                {featurePhoneScreen === 'message' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleFeaturePhoneReply('1')}
                      className="hover:underline cursor-pointer"
                    >
                      [1] Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeaturePhoneReply('2')}
                      className="hover:underline cursor-pointer"
                    >
                      [2] Seeds
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleFeaturePhoneReply('back')}
                    className="hover:underline cursor-pointer font-bold"
                  >
                    ← Back to SMS
                  </button>
                )}
              </div>
            </div>

            {/* D-Pad & Control Buttons */}
            <div className="mt-4 flex items-center justify-between px-4">
              <button
                type="button"
                onClick={() => handleFeaturePhoneReply('1')}
                className="w-12 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
              >
                1
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-slate-700" />
              </div>
              <button
                type="button"
                onClick={() => handleFeaturePhoneReply('2')}
                className="w-12 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
              >
                2
              </button>
            </div>

            {/* Keypad Grid (T9) */}
            <div className="grid grid-cols-3 gap-2 mt-4 px-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleFeaturePhoneReply(k)}
                  className="h-9 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Smartphone WhatsApp View */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Smartphone (WhatsApp Bot)
              </h3>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              ● Official Business Account
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[320px] sm:w-[350px] h-[580px] rounded-[40px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden text-slate-900">
            {/* WhatsApp Header */}
            <div className="bg-[#075e54] text-white p-3 rounded-t-2xl flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center text-slate-900 font-bold text-sm">
                  🌱
                </div>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1">
                    <span>Varsha Mitra Bot</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                  </h4>
                  <p className="text-[10px] text-emerald-100">Agricultural Advisory Service</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSmartPhoneSend('1')}
                className="text-[11px] bg-white/20 px-2 py-1 rounded-md text-white font-semibold cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Chat Body (WhatsApp wallpaper pattern background) */}
            <div className="flex-1 p-3 overflow-y-auto bg-[#ece5dd] dark:bg-slate-950 space-y-2.5 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-2.5 shadow-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                      <span>{msg.time}</span>
                      {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-sky-600" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Quick Replies */}
            <div className="p-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => handleSmartPhoneSend('1')}
                className="px-2.5 py-1 rounded-full text-[11px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shrink-0 font-medium cursor-pointer"
              >
                1. Sowing Advice
              </button>
              <button
                type="button"
                onClick={() => handleSmartPhoneSend('2')}
                className="px-2.5 py-1 rounded-full text-[11px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shrink-0 font-medium cursor-pointer"
              >
                2. Seed Varieties
              </button>
              <button
                type="button"
                onClick={() => handleSmartPhoneSend('3')}
                className="px-2.5 py-1 rounded-full text-[11px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shrink-0 font-medium cursor-pointer"
              >
                3. PMFBY Claim
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSmartPhoneSend();
              }}
              className="p-2 bg-[#f0f0f0] dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shrink-0"
            >
              <input
                type="text"
                value={smartPhoneInput}
                onChange={(e) => setSmartPhoneInput(e.target.value)}
                placeholder="Type a message or number..."
                className="flex-1 h-9 px-3 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-[#128c7e] text-white flex items-center justify-center cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. IVR Voice Call Dial-Pad Simulator */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-xs font-bold mb-2">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Interactive Voice Response (IVR) Engine</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Toll-Free Voice Broadcast Simulator
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Simulates automated farmer phone calls with live Text-To-Speech playback in {language.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {ivrCallState === 'idle' ? (
              <button
                type="button"
                onClick={startIvrCall}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Simulate Farmer Dialing In</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={endIvrCall}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer animate-pulse"
              >
                <Phone className="w-4 h-4" />
                <span>Hang Up Call</span>
              </button>
            )}
          </div>
        </div>

        {/* IVR Active Call Display */}
        {ivrCallState !== 'idle' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
            {/* Live Audio Transcript */}
            <div className="md:col-span-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Call Active • 1800-VARSHA-MITRA
                </span>
                <span className="text-slate-400">Audio Synth: Web Speech API</span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  IVR Audio Stream:
                </p>
                <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  "{ivrCurrentSpeech}"
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Select option on dial pad below:</span>
                <button
                  type="button"
                  onClick={() => speakIvr(ivrCurrentSpeech)}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Replay Voice
                </button>
              </div>
            </div>

            {/* Dial Pad */}
            <div className="md:col-span-4 p-5 rounded-2xl bg-slate-900 text-white flex flex-col items-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Keypad (DTMF Tone)
              </p>
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-[220px]">
                {[
                  { k: '1', label: 'Sowing' },
                  { k: '2', label: 'Rain' },
                  { k: '3', label: 'PMFBY' },
                  { k: '4', label: 'Officer' },
                  { k: '5', label: 'KVK' },
                  { k: '6', label: 'Seeds' },
                  { k: '7', label: 'Fert' },
                  { k: '8', label: 'Lang' },
                  { k: '9', label: 'Help' },
                  { k: '*', label: 'Repeat' },
                  { k: '0', label: 'Agent' },
                  { k: '#', label: 'End' },
                ].map((item) => (
                  <button
                    key={item.k}
                    type="button"
                    onClick={() => pressIvrKey(item.k)}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                      activeIvrKey === item.k
                        ? 'bg-emerald-600 border-emerald-400 scale-95'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                    }`}
                  >
                    <span className="text-base font-black leading-none">{item.k}</span>
                    <span className="text-[8px] text-slate-400 uppercase mt-0.5">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <Phone className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Interactive Voice Response (IVR) Ready
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Click "Simulate Farmer Dialing In" above to test voice synthesis in Hindi, Marathi, or English.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
