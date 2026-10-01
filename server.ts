import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Gemini API client on server if key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health & AI status check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiMode: ai ? 'live' : 'fallback',
    timestamp: new Date().toISOString(),
  });
});

// Fallback rule replies for Krishi Mitra chatbot
function getRuleFallbackReply(message: string, context: any, lang: string): string {
  const text = message.toLowerCase();
  const crop = context?.crop || 'crop';
  const village = context?.villageName || 'your village';
  const status = context?.status || 'AMBER';
  const safeDate = context?.safeSowingDate || 'next week';
  const dryBreakDays = context?.dryBreakDays || 12;

  if (lang === 'hi') {
    if (text.includes('बुवाई') || text.includes('बोएं') || text.includes('sow')) {
      if (status === 'RED') {
        return `कृषि मित्र सलाह: ${village} में अभी ${crop} की बुवाई न करें! आगे लगभग ${dryBreakDays} दिनों का सूखा अंतराल संभावित है जिससे बीज सूखने या सड़ने का खतरा है। सुरक्षित बुवाई की अनुमानित तिथि ${safeDate} है।`;
      } else if (status === 'GREEN') {
        return `कृषि मित्र सलाह: ${village} में ${crop} की बुवाई के लिए मौसम बिल्कुल अनुकूल है। अगले 48 घंटों में पर्याप्त वर्षा की संभावना है। 10वें दिन पहला उर्वरक डालें।`;
      } else {
        return `कृषि मित्र सलाह: अभी रुकें! वर्षा की स्थिति अनिश्चित है। अगले 3 दिनों में फिर से मौसम की जांच करें और तब तक खेत की तैयारी रखें।`;
      }
    }
    if (text.includes('बीमा') || text.includes('pmfby') || text.includes('claim')) {
      return `PMFBY दावा प्रक्रिया: यदि वर्षा न होने या सूखे के कारण बुवाई नहीं हो सकी, तो 72 घंटे के भीतर कृषि रक्षक पोर्टल या 14447 पर कॉल कर सूचना दें। पटवारी/तहसीलदार पंचनामा तैयार करवाएं।`;
    }
    if (text.includes('बीज') || text.includes('seed') || text.includes('किस्म')) {
      return `बीज सिफारिश: सूखे की स्थिति में कम अवधि की किस्में चुनें (जैसे सोयाबीन के लिए JS 20-34, कपास के लिए अल्पकालिक हाइब्रिड या अरहर/उड़द जैसी दलहनी फसलें)। बीज उपचार अवश्य करें।`;
    }
    if (text.includes('खाद') || text.includes('fertilizer') || text.includes('उर्वरक')) {
      return `उर्वरक सलाह: बुवाई के समय केवल अनुशंसित डीएपी/एनपीके की बेसल खुराक दें। यूरिया की टॉप-ड्रेसिंग बारिश रुकने पर या पहली निराई-गुड़ाई के बाद (10वें दिन) ही करें।`;
    }
    return `कृषि मित्र: ${village} में ${crop} की वर्तमान स्थिति "${status}" है। मुख्य सलाह: ${status === 'RED' ? 'सूखे अंतराल के कारण बुवाई टालें' : 'मौसम अनुकूल है'}। अधिक जानकारी के लिए स्थानीय कृषि सहायक से संपर्क करें।`;
  }

  if (lang === 'mr') {
    if (text.includes('पेरणी') || text.includes('sow')) {
      if (status === 'RED') {
        return `कृषी मित्र सल्ला: ${village} मध्ये आत्ता ${crop} ची पेरणी करू नका! सुमारे ${dryBreakDays} दिवसांचा पावसाचा मोठा खंड अपेक्षित आहे. बियाणे वाया जाण्याची भीती आहे. सुरक्षित पेरणी तारीख: ${safeDate}.`;
      } else if (status === 'GREEN') {
        return `कृषी मित्र सल्ला: ${village} मध्ये ${crop} पेरणीसाठी हवामान अत्यंत अनुकूल आहे. पुढील ४८ तासांत पेरणी उरका. १० व्या दिवशी पहिले खत द्या.`;
      } else {
        return `कृषी मित्र सल्ला: कृपया घाई करू नका! पाऊस अनिश्चित आहे. पुढील ३ दिवस वाट पहा आणि जमिनीतील ओलावा ४ इंचांपेक्षा जास्त असल्यासच निर्णय घ्या.`;
      }
    }
    if (text.includes('विमा') || text.includes('pmfby')) {
      return `पीक विमा दावा: पावसाच्या खंडामुळे पेरणी न झाल्यास किंवा बियाणे जळून गेल्यास ७२ तासांच्या आत पीक विमा ॲप किंवा १४४४७ वर तक्रार नोंदवा. कृषी पर्यवेक्षकांचा पंचनामा आवश्यक आहे.`;
    }
    if (text.includes('बियाणे') || text.includes('वाण') || text.includes('seed')) {
      return `वाण निवड: पावसाचा खंड असल्यास कमी कालावधीचे वाण निवडा (उदा. सोयाबीनसाठी JS 20-34, कपाशीसाठी लवकर येणारे संकरित वाण किंवा उडीद/तूर). ट्रायकोडर्माची बीजप्रक्रिया करा.`;
    }
    return `कृषी मित्र: ${village} मधील ${crop} पिकासाठी स्थिती "${status}" आहे. सुरक्षित पेरणी तारीख ${safeDate} आहे. अधिक माहितीसाठी जवळच्या कृषी विज्ञान केंद्राशी संपर्क साधा.`;
  }

  // English fallback
  if (text.includes('sow') || text.includes('plant') || text.includes('today')) {
    if (status === 'RED') {
      return `Krishi Mitra Advisory: DO NOT sow ${crop} in ${village} right now! A dry spell of about ${dryBreakDays} days is anticipated, creating high risk of seed mortality. Safe revival window starts around ${safeDate}.`;
    } else if (status === 'GREEN') {
      return `Krishi Mitra Advisory: Safe to sow ${crop} in ${village}! Consistent monsoon rain is expected over the next 7 days. Initiate sowing within 48 hours and apply first fertilizer on Day 10.`;
    } else {
      return `Krishi Mitra Advisory: Wait and observe. Current rain in ${village} is marginal. Recheck the 3-day radar outlook before drilling seeds into dry subsoil.`;
    }
  }
  if (text.includes('insurance') || text.includes('pmfby') || text.includes('claim')) {
    return `PMFBY Guidance: For prevented sowing due to deficient rainfall or prolonged break, notify your insurance company or call toll-free 14447 within 72 hours. Keep your crop booking receipt and Aadhaar ready.`;
  }
  if (text.includes('seed') || text.includes('variety')) {
    return `Seed Selection: If sowing is delayed, opt for drought-hardy or short-duration varieties (e.g. Soybean JS 20-34, direct-seeded Paddy Sahbhagi Dhan, or intercrop with Tur BDN 711). Always treat seeds before sowing.`;
  }
  return `Krishi Mitra: Current status for ${crop} in ${village} is ${status}. Projected safe sowing window: ${safeDate}. Contact your local Taluka Agriculture Officer or KVK for on-ground assistance.`;
}

// 1. Multi-Turn Krishi Mitra Chatbot Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    message,
    conversationHistory = [],
    modelType = 'gemini-3.5-flash',
    context,
    language = 'en',
  } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Select valid Gemini model per instructions
  let selectedModel = 'gemini-3.5-flash';
  if (modelType === 'gemini-3.1-flash-lite') {
    selectedModel = 'gemini-3.1-flash-lite';
  } else if (modelType === 'gemini-3.1-pro-preview') {
    selectedModel = 'gemini-3.1-pro-preview';
  }

  if (ai) {
    try {
      const systemInstruction = `You are Krishi Mitra, a friendly, authoritative agricultural AI assistant for Indian smallholder farmers. 
Your role is to guide farmers on Kharif sowing decisions, rainfall probability, seed choices, fertilizers, and PMFBY crop insurance.
Always reply in the user's selected language (${language}). 
Use simple, easy-to-understand phrasing. Keep answers concise (under 90 words) with direct actionable next steps.
Context of the farmer's location:
- Village: ${context?.villageName || 'Unknown'}, District: ${context?.district || 'Unknown'}, State: ${context?.state || 'Unknown'}
- Crop: ${context?.crop || 'Kharif crop'}, Soil: ${context?.soil || 'Black soil'}
- Sowing Status: ${context?.status || 'AMBER'}
- Consecutive Dry Break Length: ${context?.dryBreakDays || 12} days
- Safe Sowing Window: ${context?.safeSowingDate || 'Mid-July'}
- Expected 7-Day Rain: ${context?.expectedRainNext7Days || 25} mm
Never guarantee rain; if uncertain, suggest consulting the local Taluka Agriculture Officer or KVK.`;

      // Build multi-turn contents array with conversation history
      const contents: any[] = [];
      if (Array.isArray(conversationHistory)) {
        for (const turn of conversationHistory) {
          if (turn.text && turn.sender) {
            contents.push({
              role: turn.sender === 'user' ? 'user' : 'model',
              parts: [{ text: turn.text }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
        },
      });

      const replyText = response.text?.trim();
      if (replyText) {
        return res.json({
          text: replyText,
          aiMode: 'live',
          modelUsed: selectedModel,
        });
      }
    } catch (err: any) {
      console.warn(`Gemini chat error (${selectedModel}), using fallback:`, err?.message || err);
    }
  }

  // Graceful rule fallback
  const fallbackText = getRuleFallbackReply(message, context, language);
  return res.json({
    text: fallbackText,
    aiMode: 'fallback',
    modelUsed: 'rule-engine',
  });
});

// 2. Google Search Grounding Endpoint (gemini-3.5-flash with googleSearch tool)
app.post('/api/ai/search-grounding', async (req: Request, res: Response) => {
  const { query, district, state, crop, language = 'en' } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (ai) {
    try {
      const prompt = `You are an Indian agricultural intelligence officer. Search for the latest up-to-date information regarding: "${query}".
Regional Context: District ${district || 'Vidarbha'}, State ${state || 'Maharashtra'}, Crop ${crop || 'Cotton/Soybean'}.
Provide an accurate, grounded answer in ${language}. Keep the summary under 120 words with key numbers and dates.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text?.trim() || '';
      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const sources = groundingChunks
        .filter((chunk: any) => chunk.web?.uri)
        .map((chunk: any) => ({
          title: chunk.web?.title || 'Web Source',
          uri: chunk.web?.uri,
        }))
        .slice(0, 6);

      return res.json({
        text,
        sources,
        aiMode: 'live',
      });
    } catch (err: any) {
      console.warn('Google Search Grounding error:', err?.message || err);
    }
  }

  // Fallback search information
  return res.json({
    text: `IMD & Agrometeorological Advisory Bulletin: For ${district || 'your district'}, monsoon surge conditions are actively monitored. For verified updates, check the Indian Meteorological Department (mausam.imd.gov.in) and state Krishi Bhavan portals.`,
    sources: [
      { title: 'India Meteorological Department (IMD)', uri: 'https://mausam.imd.gov.in' },
      { title: 'Kisan Suvidha Portal', uri: 'https://kisansuvidha.gov.in' },
    ],
    aiMode: 'fallback',
  });
});

// 3. Google Maps Grounding Endpoint (gemini-3.5-flash with googleMaps tool)
app.post('/api/ai/maps-grounding', async (req: Request, res: Response) => {
  const { query, latitude, longitude, district, state, language = 'en' } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const lat = Number(latitude) || 20.4578;
  const lng = Number(longitude) || 78.0211;

  if (ai) {
    try {
      const prompt = `Find nearby agricultural support resources near ${district || 'this district'} (${lat}, ${lng}): "${query}". 
Identify the nearest Krishi Vigyan Kendra (KVK), APMC Agriculture Mandi, Soil Testing Laboratory, or Taluka Agriculture Office. 
Respond in ${language}. List each location clearly with its name and distance if available.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng,
              },
            },
          },
        },
      });

      const text = response.text?.trim() || '';
      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const places: { title: string; uri: string; address?: string; reviewSnippets?: string[] }[] = [];
      for (const chunk of groundingChunks) {
        if (chunk.maps?.uri) {
          const rawSnippets: any[] = chunk.maps?.placeAnswerSources?.reviewSnippets || [];
          const snippetStrings: string[] = rawSnippets
            .map((s: any) => (typeof s === 'string' ? s : s?.reviewText || s?.text || s?.snippet || ''))
            .filter((s: string) => Boolean(s.trim()));

          places.push({
            title: chunk.maps?.title || 'Google Maps Location',
            uri: chunk.maps?.uri,
            address: snippetStrings[0] || district,
            reviewSnippets: snippetStrings,
          });
        }
      }

      return res.json({
        text,
        places,
        aiMode: 'live',
      });
    } catch (err: any) {
      console.warn('Google Maps Grounding error:', err?.message || err);
    }
  }

  // Fallback Maps resources
  return res.json({
    text: `Nearby Agricultural Centers for ${district || 'Your District'}:
1. Krishi Vigyan Kendra (KVK) ${district} - District Agricultural Research & Extension Center
2. APMC Mandi Market Yard ${district} - Official Government Regulated Produce Market
3. Taluka Krishi Adhikari Karyalaya - Seed Quality & PMFBY Verification Office`,
    places: [
      {
        title: `Krishi Vigyan Kendra (KVK) ${district}`,
        uri: `https://www.google.com/maps/search/?api=1&query=Krishi+Vigyan+Kendra+${encodeURIComponent(district || 'Yavatmal')}`,
        address: `${district} Main Road`,
      },
      {
        title: `APMC Mandi Yard ${district}`,
        uri: `https://www.google.com/maps/search/?api=1&query=APMC+Mandi+${encodeURIComponent(district || 'Yavatmal')}`,
        address: `Agricultural Produce Market Committee, ${district}`,
      },
      {
        title: `District Soil Testing Laboratory`,
        uri: `https://www.google.com/maps/search/?api=1&query=Soil+Testing+Laboratory+${encodeURIComponent(district || 'Yavatmal')}`,
        address: `Krishi Bhavan, ${district}`,
      },
    ],
    aiMode: 'fallback',
  });
});

// 4. Audio Transcription Endpoint (gemini-3.5-transcribe)
app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
  const { audioBase64, mimeType = 'audio/webm' } = req.body;

  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  if (ai) {
    try {
      const audioPart = {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text: 'Transcribe this audio recording accurately verbatim. Maintain the exact spoken language (Hindi, Marathi, English, Gujarati, Telugu, Kannada, or Tamil). Do not add commentary.',
            },
          ],
        },
      });

      const transcription = response.text?.trim();
      if (transcription) {
        return res.json({
          text: transcription,
          aiMode: 'live',
        });
      }
    } catch (err: any) {
      console.warn('gemini-3.5-transcribe error:', err?.message || err);
    }
  }

  // Fallback text if transcription model is unavailable
  return res.json({
    text: 'क्या आज बुवाई करना सुरक्षित है? (Should I sow today?)',
    aiMode: 'fallback',
  });
});

// 5. Advisory Explanation Generator Endpoint
app.post('/api/explain-advisory', async (req: Request, res: Response) => {
  const { context, language = 'en' } = req.body;

  if (ai) {
    try {
      const prompt = `You are an agro-meteorology expert writing for a village farmer in India. 
Generate a clear, 2-3 sentence plain-language explanation of why this advisory was issued in ${language}.
Context:
Village: ${context.villageName}, Crop: ${context.crop}, Soil: ${context.soil}
Status: ${context.status}
7-Day Projected Rain: ${context.expectedRainNext7Days} mm
Expected Dry Spell: ${context.dryBreakDays} days
Break Probability: ${context.breakProbabilityPercent}%
Safe Sowing Date: ${context.safeSowingDate}
Keep it under 60 words. No technical jargon. Give direct action.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) {
        return res.json({ text, aiMode: 'live' });
      }
    } catch (err) {
      console.warn('Advisory explanation Gemini error, using template:', err);
    }
  }

  // Fallback explanation
  let fallbackExplanation = '';
  if (context.status === 'RED') {
    fallbackExplanation =
      language === 'hi'
        ? `चेतावनी: प्रारंभिक बारिश के बाद अगले ${context.dryBreakDays} दिनों तक वर्षा रुकने का भारी जोखिम है। यदि अभी बुवाई की गई तो बीज अंकुरित होने के बाद नमी की कमी से नष्ट हो जाएंगे। कृपया ${context.safeSowingDate} तक बुवाई टालें।`
        : language === 'mr'
        ? `धोका सूचना: सुरुवातीच्या पावसानंतर पुढील ${context.dryBreakDays} दिवस पावसाचा खंड पडणार आहे. आत्ता पेरणी केल्यास कोवळी रोपे जळून मोठे नुकसान होईल. कृपया ${context.safeSowingDate} पर्यंत वाट पहा.`
        : `Warning: A severe dry break of ${context.dryBreakDays} days is anticipated after initial showers. Sowing now will lead to seed desiccation and seedling mortality. Hold sowing operations until ${context.safeSowingDate}.`;
  } else if (context.status === 'GREEN') {
    fallbackExplanation =
      language === 'hi'
        ? `अनुकूल मौसम: आगामी 7 दिनों में लगभग ${context.expectedRainNext7Days} मिमी बारिश और कम सूखे अंतराल के कारण बुवाई के लिए श्रेष्ठ समय है। अगले 48 घंटों में बुवाई पूरी करें।`
        : language === 'mr'
        ? `उत्तम संधी: पुढील ७ दिवसांत सुमारे ${context.expectedRainNext7Days} मिमी पाऊस अपेक्षित असून खंड धोकादायक नाही. पुढील ४८ तासांत पेरणी पूर्ण करावी.`
        : `Safe conditions: Consistent monsoon surge with ${context.expectedRainNext7Days} mm over the next 7 days and low break risk. Commence field sowing within 48 hours.`;
  } else {
    fallbackExplanation =
      language === 'hi'
        ? `सावधानी: वर्तमान बारिश पर्याप्त नहीं है। मिट्टी की ऊपरी सतह में नमी कम है। 3 दिन रुकें और मौसम स्थिर होने पर ही बुवाई का निर्णय लें।`
        : language === 'mr'
        ? `सावधानता: सध्याचा पाऊस पुरेसा नाही. जमिनीतील ओलावा कमी आहे. पुढील ३ दिवस थांबा आणि मान्सून स्थिर झाल्यावरच पेरणी करा.`
        : `Caution: Borderline moisture availability. Topsoil moisture is insufficient for uniform germination. Hold sowing for 3 days until rain stabilizes.`;
  }

  return res.json({ text: fallbackExplanation, aiMode: 'fallback' });
});

// 6. Officer Alert Preview Generator Endpoint
app.post('/api/officer/alert-preview', async (req: Request, res: Response) => {
  const { villageName, crop, status, dryBreakDays, safeSowingDate, language = 'en', channel = 'SMS' } = req.body;

  if (ai) {
    try {
      const prompt = `Write a crisp, urgent agricultural advisory message for Indian farmers in ${language}.
Channel: ${channel} (MUST be under 150 characters for SMS).
Details:
Village: ${villageName}
Crop: ${crop}
Status: ${status}
Dry Break: ${dryBreakDays} days
Safe Date: ${safeSowingDate}
Format: Start with "VARSHA MITRA:" then clear instruction.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) {
        return res.json({ text, aiMode: 'live' });
      }
    } catch (err) {
      console.warn('Officer alert Gemini error:', err);
    }
  }

  // Fallback SMS templates (<160 chars)
  let fallbackSms = '';
  if (status === 'RED') {
    if (language === 'hi') {
      fallbackSms = `VARSHA MITRA: ${villageName} में अभी ${crop} न बोएं! ~${dryBreakDays} दिन सूखा रहेगा। सुरक्षित तिथि: ${safeSowingDate}। जानकारी हेतु 1, बीज हेतु 2 भेजें।`;
    } else if (language === 'mr') {
      fallbackSms = `VARSHA MITRA: ${villageName} मध्ये आत्ता ${crop} पेरू नका! ~${dryBreakDays} दिवस पावसाचा खंड. सुरक्षित तारीख: ${safeSowingDate}. माहितीसाठी 1 पाठवा.`;
    } else {
      fallbackSms = `VARSHA MITRA: DO NOT sow ${crop} in ${villageName}! Rain pauses ~${dryBreakDays} days. Safe date: ${safeSowingDate}. Reply 1 for details, 2 for seeds.`;
    }
  } else if (status === 'GREEN') {
    if (language === 'hi') {
      fallbackSms = `VARSHA MITRA: ${villageName} में ${crop} की बुवाई शुरू करें! अगले 48 घंटे सुरक्षित हैं। 10वें दिन खाद डालें। हेल्पलाइन: 1800-180-1551.`;
    } else {
      fallbackSms = `VARSHA MITRA: Safe to sow ${crop} in ${villageName}! Start within 48h. Consistent rain expected. Apply first fertilizer on Day 10.`;
    }
  } else {
    fallbackSms = `VARSHA MITRA: Wait. Rain in ${villageName} is borderline. Do not risk ${crop} seeds. Recheck in 3 days. Safe date: ${safeSowingDate}.`;
  }

  return res.json({ text: fallbackSms, aiMode: 'fallback' });
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Create HTTP server to support both HTTP endpoints and WebSocket for Live API
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
    if (pathname === '/api/live-conversation') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  // WebSocket Live Voice Conversation with model: gemini-3.8-live
  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('Client connected to Gemini Live Voice session');

    if (!ai) {
      clientWs.send(
        JSON.stringify({
          type: 'text_fallback',
          text: 'Gemini Live API requires an active server-side API key. Switched to high-fidelity audio synthesizer.',
        })
      );
      return;
    }

    try {
      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction:
            'You are Krishi Mitra, a friendly conversational voice assistant for Indian farmers. Speak briefly and warmly in simple words about Kharif sowing, weather, and crops.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audioData =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              clientWs.send(JSON.stringify({ type: 'audio', audio: audioData }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
            }
          },
          onerror: (err) => {
            console.warn('Gemini Live API session error:', err);
            clientWs.send(JSON.stringify({ type: 'error', message: err?.message || 'Live session error' }));
          },
          onclose: () => {
            clientWs.send(JSON.stringify({ type: 'closed', closed: true }));
          },
        },
      });

      clientWs.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (parsed.text) {
            session.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (err) {
          console.warn('Error handling client live audio message:', err);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch {
          // ignore
        }
      });
    } catch (err: any) {
      console.warn('Failed to start gemini-3.8-live session:', err?.message || err);
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: 'Unable to connect to Live API: ' + (err?.message || 'Connection failed'),
        })
      );
    }
  });

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(
      `VARSHA MITRA server running on http://0.0.0.0:${PORT} (AI mode: ${
        ai ? 'live' : 'fallback'
      }) with Live Voice WebSocket on /api/live-conversation`
    );
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
});
