import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  sendChatMessage,
  transcribeAudioWithGemini,
  GeminiChatModelChoice,
} from '../../services/gemini';
import { ChatMessage } from '../../types';
import { SpeechButton } from '../common/SpeechButton';
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Trash2,
  Sparkles,
  User,
  Radio,
  Volume2,
  VolumeX,
  Play,
  Square,
  Cpu,
  Layers,
  PhoneCall,
} from 'lucide-react';

interface KrishiMitraProps {
  isFullPage?: boolean;
}

export const KrishiMitraModal: React.FC<KrishiMitraProps> = ({ isFullPage = false }) => {
  const {
    t,
    language,
    village,
    crop,
    soil,
    advisory,
    isChatOpen,
    setIsChatOpen,
    aiMode,
    isOffline,
    showToast,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        sender: 'bot',
        text:
          language === 'hi'
            ? `नमस्ते किसान भाई! मैं कृषि मित्र हूँ। आपके गांव ${village.name} (${crop}) के मौसम और बुवाई के बारे में क्या पूछना चाहते हैं?`
            : language === 'mr'
            ? `नमस्कार शेतकरी बंधूंनो! मी कृषी मित्र आहे. आपल्या ${village.name} गावातील ${crop} पेरणी आणि पावसाच्या अंदाजाबाबत काय विचारू इच्छिता?`
            : `Hello farmer friend! I am Krishi Mitra. Ask me anything about sowing ${crop} in ${village.name}, rainfall outlook, or crop insurance!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [modelType, setModelType] = useState<GeminiChatModelChoice>('gemini-3.5-flash');

  // Audio Recording with gemini-3.5-transcribe
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Live API Voice Conversation (gemini-3.8-live) State
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [liveStatusText, setLiveStatusText] = useState<string>('');
  const liveWsRef = useRef<WebSocket | null>(null);
  const liveAudioCtxRef = useRef<AudioContext | null>(null);
  const liveMediaStreamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 1. Send Message with Multi-Turn Conversation History
  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(
        query,
        {
          villageName: village.name,
          district: village.district,
          state: village.state,
          crop,
          soil,
          status: advisory.status,
          dryBreakDays: advisory.dryBreakDays,
          safeSowingDate: advisory.safeSowingDate,
          expectedRainNext7Days: advisory.expectedRainNext7Days,
        },
        language,
        messages, // Pass multi-turn history
        modelType
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Krishi Mitra: Current sowing advisory for ${crop} in ${village.name} is ${advisory.status}. Safe sowing date: ${advisory.safeSowingDate}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // 2. Audio Input & Transcription via gemini-3.5-transcribe
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecordingAudio(false);
        setIsTranscribing(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64Data = (reader.result as string)?.split(',')[1];
          if (base64Data) {
            showToast('Transcribing audio via Gemini 3.5 Transcribe...', 'info');
            const res = await transcribeAudioWithGemini(base64Data, mediaRecorder.mimeType);
            if (res.text) {
              setInput(res.text);
              showToast(`Transcribed: "${res.text}"`, 'success');
            } else {
              showToast('Transcription completed. You can edit before sending.', 'info');
            }
          }
          setIsTranscribing(false);
        };

        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecordingAudio(true);
      showToast('Recording audio... Speak your question now', 'info');
    } catch (err) {
      console.warn('Microphone recording error:', err);
      showToast('Microphone access denied or unsupported', 'warning');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
    }
  };

  // 3. Live Voice Conversation (gemini-3.8-live) WebSocket Bridge
  const toggleLiveVoiceConversation = async () => {
    if (isLiveActive) {
      // Disconnect Live
      liveWsRef.current?.close();
      liveMediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      liveAudioCtxRef.current?.close();
      setIsLiveActive(false);
      setLiveStatusText('');
      showToast('Live voice conversation ended', 'info');
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-conversation`;
      const ws = new WebSocket(wsUrl);

      setLiveStatusText('Connecting to Gemini 3.8 Live API...');
      setIsLiveActive(true);

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      liveAudioCtxRef.current = audioCtx;

      ws.onopen = async () => {
        setLiveStatusText('Live voice connected! Listening...');
        showToast('Connected to Gemini 3.8 Live API (Real-Time Voice)', 'success');

        // Capture mic
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        liveMediaStreamRef.current = stream;

        const micCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });

        const source = micCtx.createMediaStreamSource(stream);
        const processor = micCtx.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(micCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            const buffer = new Uint8Array(pcm16.buffer);
            let binary = '';
            for (let i = 0; i < buffer.byteLength; i++) {
              binary += String.fromCharCode(buffer[i]);
            }
            const base64 = btoa(binary);
            ws.send(JSON.stringify({ audio: base64 }));
          }
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio && audioCtx) {
            setLiveStatusText('Krishi Mitra is speaking...');
            // Play raw audio chunk
            const binary = atob(msg.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const int16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

            const buffer = audioCtx.createBuffer(1, float32.length, 24000);
            buffer.getChannelData(0).set(float32);
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start();
          }
          if (msg.interrupted) {
            setLiveStatusText('Interrupted by user speech...');
          }
        } catch (err) {
          console.warn('Error playing Live audio chunk:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('Live WebSocket error:', err);
        setLiveStatusText('Live voice session error');
      };

      ws.onclose = () => {
        setIsLiveActive(false);
        setLiveStatusText('');
      };

      liveWsRef.current = ws;
    } catch (err: any) {
      console.warn('Failed to start Live API conversation:', err);
      showToast('Failed to start Live Voice session: ' + err?.message, 'warning');
      setIsLiveActive(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'cleared',
        sender: 'bot',
        text:
          language === 'hi'
            ? 'बातचीत पुनः आरंभ की गई। आप क्या जानना चाहते हैं?'
            : 'Conversation restarted. How can I assist you with your crops today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isFullPage && !isChatOpen) return null;

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* 1. Header with Model Selector & Live Voice Switcher */}
      <div className="px-4 py-3 bg-emerald-800 text-white flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold leading-tight">{t.krishiMitraTitle}</h3>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full uppercase border bg-emerald-900/60 text-emerald-200 border-emerald-400">
                Multi-Turn
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 opacity-90 truncate max-w-[200px] sm:max-w-xs">
              Context: {village.name} • {crop} • {advisory.status}
            </p>
          </div>
        </div>

        {/* Right Action Cluster: Model Selector & Live Voice Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Model Choice Dropdown */}
          <select
            value={modelType}
            onChange={(e) => {
              const val = e.target.value as GeminiChatModelChoice;
              setModelType(val);
              showToast(`Switched chat engine to ${val}`, 'info');
            }}
            className="h-8 px-1.5 sm:px-2 rounded-xl bg-emerald-900/80 border border-emerald-600 text-white text-[10px] sm:text-[11px] font-bold focus:outline-none cursor-pointer max-w-[85px] sm:max-w-none truncate"
            title="Select Gemini Model"
          >
            <option value="gemini-3.5-flash">Flash</option>
            <option value="gemini-3.1-flash-lite">Lite</option>
            <option value="gemini-3.1-pro-preview">Pro</option>
          </select>

          {/* Live Voice API Conversation Toggle Button */}
          <button
            type="button"
            onClick={toggleLiveVoiceConversation}
            className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLiveActive
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-600 border-emerald-500 text-white'
            }`}
            title="Real-Time Voice Conversation via gemini-3.8-live"
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveActive ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLiveActive ? 'Live Voice' : 'Voice Mode'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={t.clearChat}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {!isFullPage && (
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Live API Conversation Banner (when active) */}
      {isLiveActive && (
        <div className="p-3 bg-linear-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-b border-emerald-500/30 flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <div>
              <span className="text-xs font-bold block">
                Gemini 3.8 Live API Active (Real-Time Voice Exchange)
              </span>
              <span className="text-[11px] text-emerald-300 font-medium">
                {liveStatusText || 'Speak into your microphone naturally...'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleLiveVoiceConversation}
            className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
          >
            Disconnect Live
          </button>
        </div>
      )}

      {/* 3. Quick Questions Chips */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pl-1">
          Quick:
        </span>
        {t.quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* 4. Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? 'bg-slate-700 text-white'
                    : 'bg-emerald-700 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-slate-800 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <SpeechButton
                      textToSpeak={msg.text}
                      language={language}
                      size="sm"
                      className="py-0.5 px-2 text-[10px]"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce delay-200" />
            <span className="ml-1 italic">Krishi Mitra ({modelType}) is thinking...</span>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center gap-2 text-emerald-600 text-xs pl-9 font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transcribing audio recording via Gemini 3.5 Transcribe...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Input Box with Audio Recording (gemini-3.5-transcribe) */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Audio Input Recording Button (gemini-3.5-transcribe) */}
          <button
            type="button"
            onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isRecordingAudio
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
            }`}
            title={
              isRecordingAudio
                ? 'Stop recording and transcribe with Gemini 3.5 Transcribe'
                : 'Record microphone audio to transcribe'
            }
          >
            {isRecordingAudio ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecordingAudio
                ? 'Recording your voice... Click red square when done'
                : t.chatPlaceholder
            }
            className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="h-11 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
          <span>Model: {modelType} • Multi-turn memory active</span>
          <span>Audio: gemini-3.5-transcribe • Live: gemini-3.8-live</span>
        </div>
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="h-[calc(100vh-5rem)] max-w-4xl mx-auto rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {content}
      </div>
    );
  }

  // Floating modal
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full sm:max-w-lg h-[88vh] sm:h-[640px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 border border-slate-200 dark:border-slate-700">
        {content}
      </div>
    </div>
  );
};
