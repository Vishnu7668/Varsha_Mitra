import { AdvisoryResult, CropType, LanguageCode, SoilType, VillageLocation } from '../types';

export interface ChatRequestContext {
  villageName: string;
  district: string;
  state: string;
  crop: CropType;
  soil: SoilType;
  status: string;
  dryBreakDays: number;
  safeSowingDate: string;
  expectedRainNext7Days: number;
}

export type GeminiChatModelChoice = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';

export async function sendChatMessage(
  message: string,
  context: ChatRequestContext,
  language: LanguageCode = 'en',
  conversationHistory: { sender: 'user' | 'bot'; text: string }[] = [],
  modelType: GeminiChatModelChoice = 'gemini-3.5-flash'
): Promise<{ text: string; aiMode: 'live' | 'fallback'; modelUsed?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9500); // 9.5s timeout

    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context,
        language,
        conversationHistory,
        modelType,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      return {
        text: data.text,
        aiMode: data.aiMode || 'fallback',
        modelUsed: data.modelUsed,
      };
    }
  } catch (err) {
    console.warn('Chat API fetch failed, utilizing client offline fallback:', err);
  }

  // Client side fallback if backend is unreachable
  return {
    text: getClientEmergencyFallback(message, context, language),
    aiMode: 'fallback',
    modelUsed: 'offline-rules',
  };
}

// Google Search Grounding Client Service (gemini-3.5-flash)
export async function searchWithGoogleGrounding(params: {
  query: string;
  district: string;
  state: string;
  crop: CropType;
  language?: LanguageCode;
}): Promise<{
  text: string;
  sources: { title: string; uri: string }[];
  aiMode: 'live' | 'fallback';
}> {
  try {
    const resp = await fetch('/api/ai/search-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (resp.ok) {
      return await resp.json();
    }
  } catch (err) {
    console.warn('Search grounding fetch error:', err);
  }

  return {
    text: `Latest agricultural reports for ${params.district}: Current monsoon trends and APMC crop values are monitored by state agrimarketing boards.`,
    sources: [
      { title: 'India Meteorological Department', uri: 'https://mausam.imd.gov.in' },
      { title: 'Kisan Suvidha Portal', uri: 'https://kisansuvidha.gov.in' },
    ],
    aiMode: 'fallback',
  };
}

// Google Maps Grounding Client Service (gemini-3.5-flash)
export async function findNearbyAgriCentersWithMaps(params: {
  query: string;
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  language?: LanguageCode;
}): Promise<{
  text: string;
  places: { title: string; uri: string; address?: string }[];
  aiMode: 'live' | 'fallback';
}> {
  try {
    const resp = await fetch('/api/ai/maps-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (resp.ok) {
      return await resp.json();
    }
  } catch (err) {
    console.warn('Maps grounding fetch error:', err);
  }

  return {
    text: `Agricultural facilities located near ${params.district}: KVK Agricultural Research Center, APMC Market Yard, and District Soil Testing Laboratory.`,
    places: [
      {
        title: `Krishi Vigyan Kendra (KVK) ${params.district}`,
        uri: `https://www.google.com/maps/search/?api=1&query=Krishi+Vigyan+Kendra+${encodeURIComponent(params.district)}`,
        address: `${params.district} District Center`,
      },
      {
        title: `APMC Produce Market Yard`,
        uri: `https://www.google.com/maps/search/?api=1&query=APMC+Market+${encodeURIComponent(params.district)}`,
        address: `Regulated Mandi, ${params.district}`,
      },
      {
        title: `Soil Testing Laboratory`,
        uri: `https://www.google.com/maps/search/?api=1&query=Soil+Testing+Laboratory+${encodeURIComponent(params.district)}`,
        address: `Krishi Bhavan, ${params.district}`,
      },
    ],
    aiMode: 'fallback',
  };
}

// Audio Transcription Client Service (gemini-3.5-transcribe)
export async function transcribeAudioWithGemini(
  audioBase64: string,
  mimeType: string = 'audio/webm'
): Promise<{ text: string; aiMode: 'live' | 'fallback' }> {
  try {
    const resp = await fetch('/api/ai/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType }),
    });
    if (resp.ok) {
      return await resp.json();
    }
  } catch (err) {
    console.warn('Audio transcription fetch error:', err);
  }

  return {
    text: '',
    aiMode: 'fallback',
  };
}

export async function explainAdvisoryWithAI(
  village: VillageLocation,
  advisory: AdvisoryResult,
  crop: CropType,
  soil: SoilType,
  language: LanguageCode
): Promise<{ text: string; aiMode: 'live' | 'fallback' }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const resp = await fetch('/api/explain-advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          villageName: village.name,
          district: village.district,
          state: village.state,
          crop,
          soil,
          status: advisory.status,
          expectedRainNext7Days: advisory.expectedRainNext7Days,
          dryBreakDays: advisory.dryBreakDays,
          breakProbabilityPercent: advisory.breakProbabilityPercent,
          safeSowingDate: advisory.safeSowingDate,
        },
        language,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      return { text: data.text, aiMode: data.aiMode || 'fallback' };
    }
  } catch (err) {
    console.warn('Explain advisory API error:', err);
  }

  return {
    text: advisory.reasonsFired.join(' '),
    aiMode: 'fallback',
  };
}

export async function generateOfficerAlertPreview(params: {
  villageName: string;
  crop: CropType;
  status: string;
  dryBreakDays: number;
  safeSowingDate: string;
  language: LanguageCode;
  channel: 'SMS' | 'Voice IVR' | 'WhatsApp';
}): Promise<{ text: string; aiMode: 'live' | 'fallback' }> {
  try {
    const resp = await fetch('/api/officer/alert-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (resp.ok) {
      const data = await resp.json();
      return { text: data.text, aiMode: data.aiMode || 'fallback' };
    }
  } catch (err) {
    console.warn('Officer preview API error:', err);
  }

  // Fallback
  return {
    text: `VARSHA MITRA: ${params.status === 'RED' ? 'DO NOT SOW' : 'SAFE TO SOW'} ${params.crop} in ${params.villageName}. Dry break: ${params.dryBreakDays}d. Safe date: ${params.safeSowingDate}.`,
    aiMode: 'fallback',
  };
}

function getClientEmergencyFallback(
  message: string,
  context: ChatRequestContext,
  lang: LanguageCode
): string {
  const m = message.toLowerCase();
  if (lang === 'hi') {
    if (m.includes('बोएं') || m.includes('बुवाई')) {
      return context.status === 'RED'
        ? `कृषि मित्र (ऑफलाइन): ${context.villageName} में अभी ${context.crop} न बोएं। लगभग ${context.dryBreakDays} दिनों का सूखा अंतराल संभावित है। सुरक्षित तिथि ${context.safeSowingDate} है।`
        : `कृषि मित्र (ऑफलाइन): बुवाई के लिए स्थितियां अनुकूल हैं। अगले 48 घंटों में बुवाई करें।`;
    }
    return `कृषि मित्र (ऑफलाइन): ${context.villageName} में वर्तमान सलाह "${context.status}" है। स्थानीय कृषि अधिकारी या 1800-180-1551 से संपर्क करें।`;
  }
  if (lang === 'mr') {
    return `कृषी मित्र (ऑफलाइन): ${context.villageName} मध्ये सध्याची स्थिती "${context.status}" आहे. सुरक्षित पेरणी तारीख: ${context.safeSowingDate}. अधिक माहितीसाठी कृषी सहाय्यकांशी संपर्क साधा.`;
  }
  return `Krishi Mitra (Offline): Advisory for ${context.crop} in ${context.villageName} is ${context.status}. Safe sowing window: ${context.safeSowingDate}. Contact your local KVK for assistance.`;
}
