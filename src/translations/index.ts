import { LanguageCode } from '../types';

export interface TranslationDictionary {
  // Navigation & Branding
  brandName: string;
  tagline: string;
  navFarmer: string;
  navOfficer: string;
  navSms: string;
  navInsurance: string;
  navAbout: string;
  navChat: string;
  demoScenario: string;
  aiModeLive: string;
  aiModeFallback: string;
  offlineBanner: string;

  // Setup Form
  farmerPortalTitle: string;
  farmerPortalSubtitle: string;
  selectState: string;
  selectDistrict: string;
  selectBlock: string;
  selectVillage: string;
  selectCrop: string;
  selectSoil: string;
  useMyLocation: string;
  useLiveDataToggle: string;
  liveDataActive: string;
  simulatedDataNotice: string;

  // Advisory Hero
  advisoryHeadline: string;
  confidenceScore: string;
  safeSowingDate: string;
  countdownDays: string;
  daysRemaining: string;
  whyThisAdvice: string;
  whatCanIDo: string;
  optionA: string;
  optionB: string;
  recommendedVarieties: string;
  listenAdvisory: string;
  stopAudio: string;
  shareAdvisory: string;
  advisoryCopied: string;

  // Metrics & Chart
  rainfallOutlookTitle: string;
  viewAll40Days: string;
  viewForecast30Days: string;
  zoneObserved: string;
  zoneHigh: string;
  zoneMedium: string;
  zoneIndicative: string;
  onsetConfidenceGauge: string;
  consecutiveDryDays: string;
  soilMoistureScore: string;
  dryBreakWarning: string;
  expectedRain7Days: string;

  // Farming Tips & Schemes
  farmingTipsTitle: string;
  policyHubTitle: string;
  pmfbyChecklistTitle: string;
  alertHistoryTitle: string;

  // Chatbot
  krishiMitraTitle: string;
  krishiMitraSubtitle: string;
  chatPlaceholder: string;
  quickQuestions: string[];
  clearChat: string;

  // Buttons & Common
  close: string;
  apply: string;
  save: string;
  downloadPdf: string;
  days: string;
  mm: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    brandName: 'VARSHA MITRA',
    tagline: 'Hyperlocal Monsoon & Sowing Advisory',
    navFarmer: 'Farmer Advisory',
    navOfficer: 'Officer Dashboard',
    navSms: 'Farmer Alert Dispatch',
    navInsurance: 'Insurance & Evidence',
    navAbout: 'About & Tech',
    navChat: 'Krishi Mitra AI',
    demoScenario: 'Regional Weather Zone',
    aiModeLive: 'AI: Live Gemini',
    aiModeFallback: 'AI: Station Baseline',
    offlineBanner: 'You are offline. Showing last saved advisory.',

    farmerPortalTitle: 'National Agrometeorological Sowing Portal',
    farmerPortalSubtitle: 'Hyperlocal 14 to 30 day rainfall risk outlook for Kharif planning',
    selectState: 'State',
    selectDistrict: 'District',
    selectBlock: 'Block / Taluka',
    selectVillage: 'Village / Gram Panchayat',
    selectCrop: 'Target Kharif Crop',
    selectSoil: 'Soil Type',
    useMyLocation: 'Use Live GPS Location',
    useLiveDataToggle: 'Live Doppler Radar (14-Day)',
    liveDataActive: 'National Agrometeorological Radar & Open-Meteo Feed Synced',
    simulatedDataNotice: 'National Agrometeorological Numerical Weather Prediction (NWP)',

    advisoryHeadline: 'Sowing Advisory Status',
    confidenceScore: 'Model Confidence',
    safeSowingDate: 'Safe Sowing Window',
    countdownDays: 'Days to Safe Revival',
    daysRemaining: 'days left',
    whyThisAdvice: 'Why this advice? (Rules & Agro-Climatic Factors)',
    whatCanIDo: 'What can I do now?',
    optionA: 'Option A: Wait for Revival Window',
    optionB: 'Option B: Switch to Resilient Variety',
    recommendedVarieties: 'Drought-Tolerant & Short-Duration Varieties',
    listenAdvisory: 'Read Aloud (Voice)',
    stopAudio: 'Stop Audio',
    shareAdvisory: 'Share Advisory',
    advisoryCopied: 'Advisory text copied to clipboard!',

    rainfallOutlookTitle: '30-Day Monsoon & Dry-Break Outlook',
    viewAll40Days: 'Show Past 10 Days Observed Rain',
    viewForecast30Days: 'Show Forecast Only (30 Days)',
    zoneObserved: 'Ground Truth Observed (Past 10 Days)',
    zoneHigh: 'High Confidence (Days 1 to 7)',
    zoneMedium: 'Medium Confidence (Days 8 to 14)',
    zoneIndicative: 'Indicative Outlook (Days 15 to 30)',
    onsetConfidenceGauge: 'Monsoon Onset Confidence',
    consecutiveDryDays: 'Consecutive Dry Days Forecast',
    soilMoistureScore: 'Root-Zone Moisture Stress',
    dryBreakWarning: 'Prolonged dry break detected',
    expectedRain7Days: 'Expected 7-Day Rain',

    farmingTipsTitle: 'Seasonal Agronomy Tips',
    policyHubTitle: 'Schemes & Crop Insurance Hub',
    pmfbyChecklistTitle: 'PMFBY Sowing Failure Claim Checklist',
    alertHistoryTitle: 'Village Alert History Timeline',

    krishiMitraTitle: 'Krishi Mitra AI Assistant',
    krishiMitraSubtitle: 'Ask in simple words about sowing, rains, seeds, or crop insurance',
    chatPlaceholder: 'Ask Krishi Mitra (e.g. Should I sow today?)...',
    quickQuestions: [
      'Should I sow today?',
      'When will the dry spell end?',
      'How do I claim PMFBY?',
      'Which seed variety should I use?',
    ],
    clearChat: 'Clear Conversation',

    close: 'Close',
    apply: 'Apply',
    save: 'Save',
    downloadPdf: 'Download PMFBY Report (PDF)',
    days: 'days',
    mm: 'mm',
  },

  hi: {
    brandName: 'वर्षा मित्र',
    tagline: 'बारिश का पूर्वानुमान, खेती का सही निर्णय।',
    navFarmer: 'किसान सलाह',
    navOfficer: 'अधिकारी डैशबोर्ड',
    navSms: 'किसान संदेश प्रेषण (SMS/IVR)',
    navInsurance: 'बीमा व साक्ष्य',
    navAbout: 'प्रणाली जानकारी',
    navChat: 'कृषि मित्र AI',
    demoScenario: 'कृषि-जलवायु क्षेत्र',
    aiModeLive: 'AI: लाइव जेमिनी',
    aiModeFallback: 'AI: मौसम केंद्र मोड',
    offlineBanner: 'आप ऑफलाइन हैं। अंतिम सहेजी गई सलाह प्रदर्शित की जा रही है।',

    farmerPortalTitle: 'राष्ट्रीय कृषि-मौसम बुवाई पोर्टल',
    farmerPortalSubtitle: 'खरीफ बुवाई हेतु 14 से 30 दिनों का वर्षा व सूखा अंतराल पूर्वानुमान',
    selectState: 'राज्य चुनें',
    selectDistrict: 'जिला चुनें',
    selectBlock: 'ब्लॉक / तहसील',
    selectVillage: 'गांव / ग्राम पंचायत',
    selectCrop: 'खरीफ फसल',
    selectSoil: 'मिट्टी का प्रकार',
    useMyLocation: 'लाइव GPS स्थान खोजें',
    useLiveDataToggle: 'लाइव मौसम रडार (14 दिन)',
    liveDataActive: 'राष्ट्रीय कृषि-मौसम उपग्रह व रडार सक्रिय',
    simulatedDataNotice: 'संख्यात्मक मौसम पूर्वानुमान (NWP) डेटा',

    advisoryHeadline: 'बुवाई सलाह स्थिति',
    confidenceScore: 'पूर्वानुमान सटीकता',
    safeSowingDate: 'सुरक्षित बुवाई तिथि',
    countdownDays: 'सुरक्षित बुवाई में शेष दिन',
    daysRemaining: 'दिन शेष',
    whyThisAdvice: 'यह सलाह क्यों दी गई? (नियम व विश्लेषण)',
    whatCanIDo: 'किसान भाई अब क्या करें?',
    optionA: 'विकल्प A: बारिश लौटने तक बुवाई टालें',
    optionB: 'विकल्प B: कम अवधि/सूखा प्रतिरोधी बीज अपनाएं',
    recommendedVarieties: 'अनुशंसित सूखा-रोधी व अल्पकालिक किस्में',
    listenAdvisory: 'बोलकर सुनाएं (आवाज)',
    stopAudio: 'आवाज रोकें',
    shareAdvisory: 'सलाह साझा करें',
    advisoryCopied: 'सलाह संदेश कॉपी हो गया!',

    rainfallOutlookTitle: '30-दिवसीय वर्षा एवं सूखा अंतराल ग्राफ',
    viewAll40Days: 'पिछले 10 दिनों की वास्तविक बारिश देखें',
    viewForecast30Days: 'केवल आगामी 30 दिन देखें',
    zoneObserved: 'वास्तविक दर्ज वर्षा (पिछले 10 दिन)',
    zoneHigh: 'उच्च विश्वसनीयता (दिन 1 से 7)',
    zoneMedium: 'मध्यम विश्वसनीयता (दिन 8 से 14)',
    zoneIndicative: 'संकेतात्मक दृष्टिकोण (दिन 15 से 30)',
    onsetConfidenceGauge: 'मानसून आगमन विश्वास',
    consecutiveDryDays: 'लगातार सूखे दिनों का अनुमान',
    soilMoistureScore: 'जड़ क्षेत्र नमी तनाव',
    dryBreakWarning: 'लंबे सूखे अंतराल की चेतावनी',
    expectedRain7Days: 'आगामी 7 दिनों की बारिश',

    farmingTipsTitle: 'मौसमी कृषि परामर्श',
    policyHubTitle: 'फसल बीमा व सरकारी योजनाएं',
    pmfbyChecklistTitle: 'प्रधानमंत्री फसल बीमा (PMFBY) दावा चेकलिस्ट',
    alertHistoryTitle: 'ग्राम चेतावनी इतिहास',

    krishiMitraTitle: 'कृषि मित्र AI सहायक',
    krishiMitraSubtitle: 'बुवाई, मौसम, खाद या बीमा के संबंध में सरल भाषा में पूछें',
    chatPlaceholder: 'कृषि मित्र से पूछें (उदा. क्या आज बुवाई करें?)...',
    quickQuestions: [
      'क्या मुझे आज बुवाई करनी चाहिए?',
      'सूखा कब खत्म होगा?',
      'PMFBY बीमा दावा कैसे करें?',
      'कौन सी बीज किस्म उपयुक्त है?',
    ],
    clearChat: 'बातचीत मिटाएं',

    close: 'बंद करें',
    apply: 'लागू करें',
    save: 'सुरक्षित करें',
    downloadPdf: 'दावा रिपोर्ट डाउनलोड करें (PDF)',
    days: 'दिन',
    mm: 'मिमी',
  },

  mr: {
    brandName: 'वर्षा मित्र',
    tagline: 'पावसाचा अचूक अंदाज, पेरणीचा योग्य निर्णय.',
    navFarmer: 'शेतकरी सल्ला',
    navOfficer: 'कृषी अधिकारी कक्ष',
    navSms: 'शेतकरी संदेश वितरण (SMS/IVR)',
    navInsurance: 'पीक विमा पुरावा',
    navAbout: 'तंत्रज्ञान माहिती',
    navChat: 'कृषी मित्र AI',
    demoScenario: 'कृषी-हवामान विभाग',
    aiModeLive: 'AI: लाइव्ह जेमिनी',
    aiModeFallback: 'AI: वेधशाळा मोड',
    offlineBanner: 'तुम्ही ऑफलाइन आहात. शेवटचा सेव्ह केलेला सल्ला दाखवत आहे.',

    farmerPortalTitle: 'राष्ट्रीय कृषी-हवामान पेरणी पोर्टल',
    farmerPortalSubtitle: 'खरीप नियोजनासाठी १४ ते ३० दिवसांचा पावसाचा आणि खंडाचा अचूक अंदाज',
    selectState: 'राज्य निवडा',
    selectDistrict: 'जिल्हा निवडा',
    selectBlock: 'तालुका निवडा',
    selectVillage: 'गाव / ग्रामपंचायत',
    selectCrop: 'खरीप पीक',
    selectSoil: 'जमिनीचा प्रकार',
    useMyLocation: 'थेट GPS स्थान वापरा',
    useLiveDataToggle: 'थेट हवामान रडार (१४ दिवस)',
    liveDataActive: 'राष्ट्रीय कृषी-हवामान उपग्रह व रडार सक्रिय',
    simulatedDataNotice: 'संख्यात्मक हवामान अंदाज (NWP) डेटा',

    advisoryHeadline: 'पेरणी सल्ला स्थिती',
    confidenceScore: 'अंदाज अचूकता',
    safeSowingDate: 'सुरक्षित पेरणीची तारीख',
    countdownDays: 'सुरक्षित पेरणीसाठी उर्वरित दिवस',
    daysRemaining: 'दिवस बाकी',
    whyThisAdvice: 'हा सल्ला का दिला? (तांत्रिक विश्लेषण)',
    whatCanIDo: 'शेतकऱ्यांनी आता काय करावे?',
    optionA: 'पर्याय अ: पाऊस पुन्हा सुरू होईपर्यंत पेरणी लांबवा',
    optionB: 'पर्याय ब: कमी कालावधीचे / दुष्काळ प्रतिकारक वाण निवडा',
    recommendedVarieties: 'दुष्काळ प्रतिकारक व कमी कालावधीचे वाण',
    listenAdvisory: 'ऐका (व्हॉइस)',
    stopAudio: 'आवाज थांबवा',
    shareAdvisory: 'सल्ला शेअर करा',
    advisoryCopied: 'सल्ला मेसेज कॉपी झाला!',

    rainfallOutlookTitle: '३० दिवसांचा पाऊस आणि खंड आलेख',
    viewAll40Days: 'मागील १० दिवसांचा प्रत्यक्ष पाऊस पहा',
    viewForecast30Days: 'केवळ पुढील ३० दिवस पहा',
    zoneObserved: 'नोंदवलेला प्रत्यक्ष पाऊस (मागील १० दिवस)',
    zoneHigh: 'उच्च अचूकता (दिवस १ ते ७)',
    zoneMedium: 'मध्यम अचूकता (दिवस ८ ते १४)',
    zoneIndicative: 'संकेतात्मक अंदाज (दिवस १५ ते ३०)',
    onsetConfidenceGauge: 'मान्सून आगमनाचा विश्वास',
    consecutiveDryDays: 'पावसाचा सलग खंड (दिवस)',
    soilMoistureScore: 'जमिनीतील ओलावा ताण',
    dryBreakWarning: 'मोठ्या पावसाच्या खंडाचा धोका',
    expectedRain7Days: 'पुढील ७ दिवसांतील पाऊस',

    farmingTipsTitle: 'हंगामी कृषी सल्ला',
    policyHubTitle: 'पीक विमा आणि शासकीय योजना',
    pmfbyChecklistTitle: 'पंतप्रधान पीक विमा योजना (PMFBY) क्लेम चेकलिस्ट',
    alertHistoryTitle: 'गाव अलर्ट इतिहास',

    krishiMitraTitle: 'कृषी मित्र AI सहाय्यक',
    krishiMitraSubtitle: 'पेरणी, हवामान, बी-बियाणे किंवा विम्यासंदर्भात सोप्या भाषेत विचारा',
    chatPlaceholder: 'कृषी मित्राला विचारा (उदा. आज पेरणी करावी का?)...',
    quickQuestions: [
      'मी आज पेरणी करावी का?',
      'पावसाचा खंड कधी संपेल?',
      'पीक विम्याचा दावा कसा करावा?',
      'कोणते बियाणे वापरावे?',
    ],
    clearChat: 'संभाषण साफ करा',

    close: 'बंद करा',
    apply: 'लागू करा',
    save: 'जतन करा',
    downloadPdf: 'विमा अहवाल डाऊनलोड करा (PDF)',
    days: 'दिवस',
    mm: 'मिमी',
  },

  gu: {
    brandName: 'વર્ષા મિત્ર',
    tagline: 'વરસાદની આગાહી, વાવણીનો સાચો નિર્ણય.',
    navFarmer: 'ખેડૂત સલાહ',
    navOfficer: 'અધિકારી ડેશબોર્ડ',
    navSms: 'SMS / IVR સિમ્યુલેટર',
    navInsurance: 'વીમા પુરાવા',
    navAbout: 'ટેકનિકલ માહિતી',
    navChat: 'કૃષિ મિત્ર AI',
    demoScenario: 'ડેમો સિનેરિયો',
    aiModeLive: 'AI: લાઈવ જેમિની',
    aiModeFallback: 'AI: ઓફલાઈન મોડ',
    offlineBanner: 'તમે ઑફલાઇન છો. સાચવેલી છેલ્લી સલાહ બતાવી રહ્યું છે.',
    farmerPortalTitle: 'ગામ સ્તરનું વાવણી નિર્ણય પોર્ટલ',
    farmerPortalSubtitle: 'ખરીફ વાવણી માટે 7 થી 30 દિવસનો વરસાદ અને સૂકા વિરામનો અંદાજ',
    selectState: 'રાજ્ય પસંદ કરો',
    selectDistrict: 'જિલ્લો પસંદ કરો',
    selectBlock: 'તાલુકો પસંદ કરો',
    selectVillage: 'ગામ પસંદ કરો',
    selectCrop: 'પાક',
    selectSoil: 'જમીનનો પ્રકાર',
    useMyLocation: 'મારું સ્થાન શોધો',
    useLiveDataToggle: 'લાઈવ હવામાન (દિવસ 1-7)',
    liveDataActive: 'લાઈવ હવામાન સક્રિય',
    simulatedDataNotice: 'પ્રોટોટાઇપ માટે વિસ્તૃત અંદાજ',
    advisoryHeadline: 'વાવણી સલાહ સ્થિતિ',
    confidenceScore: 'આગાહી ચોકસાઈ',
    safeSowingDate: 'સુરક્ષિત વાવણી તારીખ',
    countdownDays: 'સુરક્ષિત વાવણી માટે બાકી દિવસો',
    daysRemaining: 'દિવસ બાકી',
    whyThisAdvice: 'આ સલાહ શા માટે? (નિયમો અને વિશ્લેષણ)',
    whatCanIDo: 'ખેડૂતોએ હવે શું કરવું?',
    optionA: 'વિકલ્પ A: વરસાદ પાછો ન આવે ત્યાં સુધી વાવણી મુલતવી રાખો',
    optionB: 'વિકલ્પ B: ઓછી મુદતની/દુષ્કાળ પ્રતિરોધક જાત અપનાવો',
    recommendedVarieties: 'ભલામણ કરેલ દુષ્કાળ પ્રતિરોધક જાતો',
    listenAdvisory: 'સાંભળો (અવાજ)',
    stopAudio: 'અવાજ બંધ કરો',
    shareAdvisory: 'શેર કરો',
    advisoryCopied: 'સલાહ મેસેજ કૉપિ થયો!',
    rainfallOutlookTitle: '30-દિવસનો વરસાદ અને ડ્રાય બ્રેક ગ્રાફ',
    viewAll40Days: 'છેલ્લા 10 દિવસનો વરસાદ જુઓ',
    viewForecast30Days: 'માત્ર આગામી 30 દિવસ જુઓ',
    zoneObserved: 'નોંધાયેલ વાસ્તવિક વરસાદ (છેલ્લા 10 દિવસ)',
    zoneHigh: 'ઉચ્ચ સચોટતા (દિવસ 1 થી 7)',
    zoneMedium: 'મધ્યમ સચોટતા (દિવસ 8 થી 14)',
    zoneIndicative: 'સૂચક દ્રષ્ટિકોણ (દિવસ 15 થી 30)',
    onsetConfidenceGauge: 'ચોમાસા આગમન વિશ્વાસ',
    consecutiveDryDays: 'સતત સૂકા દિવસોનો અંદાજ',
    soilMoistureScore: 'જમીન ભેજ તણાવ',
    dryBreakWarning: 'લાંબા સૂકા વિરામની ચેતવણી',
    expectedRain7Days: 'આગામી 7 દિવસનો વરસાદ',
    farmingTipsTitle: 'મોસમી કૃષિ સલાહ',
    policyHubTitle: 'પાક વીમો અને યોજનાઓ',
    pmfbyChecklistTitle: 'PMFBY પાક નિષ્ફળતા ક્લેમ ચેકલિસ્ટ',
    alertHistoryTitle: 'ગામ ચેતવણી ઇતિહાસ',
    krishiMitraTitle: 'કૃષિ મિત્ર AI',
    krishiMitraSubtitle: 'વાવણી, હવામાન, બિયારણ અંગે સરળ ભાષામાં પૂછો',
    chatPlaceholder: 'કૃષિ મિત્રને પૂછો...',
    quickQuestions: ['શું આજે વાવણી કરવી જોઈએ?', 'સૂકો સમય ક્યારે સમાપ્ત થશે?', 'PMFBY ક્લેમ કેવી રીતે કરવો?', 'કયું બિયારણ વાપરવું?'],
    clearChat: 'ચેટ સાફ કરો',
    close: 'બંધ કરો',
    apply: 'લાગુ કરો',
    save: 'સાચવો',
    downloadPdf: 'વીમા અહેવાલ ડાઉનલોડ (PDF)',
    days: 'દિવસ',
    mm: 'મીમી',
  },

  te: {
    brandName: 'వర్ష మిత్ర',
    tagline: 'వర్షపాత అంచనా, సరైన విత్తన నిర్ణయం.',
    navFarmer: 'రైతు సలహా',
    navOfficer: 'అధికారి డాష్‌బోర్డ్',
    navSms: 'SMS / IVR సిమ్యులేటర్',
    navInsurance: 'భీమా & సాక్ష్యం',
    navAbout: 'సాంకేతిక వివరాలు',
    navChat: 'కృషి మిత్ర AI',
    demoScenario: 'డెమో దృశ్యం',
    aiModeLive: 'AI: లైవ్ జెమినీ',
    aiModeFallback: 'AI: ఆఫ్‌లైన్ మోడ్',
    offlineBanner: 'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. చివరిగా సేవ్ చేసిన సలహాను చూపుతోంది.',
    farmerPortalTitle: 'గ్రామ స్థాయి విత్తన నిర్ణయ పోర్టల్',
    farmerPortalSubtitle: 'ఖరీఫ్ ప్రణాళిక కోసం 7 నుండి 30 రోజుల వర్షపాతం మరియు పొడి విరామ అంచనా',
    selectState: 'రాష్ట్రం',
    selectDistrict: 'జిల్లా',
    selectBlock: 'మండలం',
    selectVillage: 'గ్రామం',
    selectCrop: 'పంట',
    selectSoil: 'నేల రకం',
    useMyLocation: 'నా స్థానాన్ని గుర్తించు',
    useLiveDataToggle: 'లైవ్ వాతావరణం (రోజులు 1-7)',
    liveDataActive: 'లైవ్ వాతావరణం యాక్టివ్',
    simulatedDataNotice: 'ప్రోటోటైప్ పరీక్ష కోసం విస్తరించిన అంచనా',
    advisoryHeadline: 'విత్తన సలహా స్థితి',
    confidenceScore: 'నమూనా విశ్వాసం',
    safeSowingDate: 'సురక్షిత విత్తన తేదీ',
    countdownDays: 'సురక్షిత తేదీకి మిగిలిన రోజులు',
    daysRemaining: 'రోజులు మిగిలి ఉన్నాయి',
    whyThisAdvice: 'ఈ సలహా ఎందుకు? (నియమాలు & విశ్లేషణ)',
    whatCanIDo: 'రైతులు ఇప్పుడు ఏమి చేయాలి?',
    optionA: 'ఎంపిక A: వర్షం తిరిగి పుంజుకునే వరకు వేచి ఉండండి',
    optionB: 'ఎంపిక B: స్వల్పకాలిక/కరువు తట్టుకునే రకాలను ఎంచుకోండి',
    recommendedVarieties: 'సిఫార్సు చేయబడిన రకాలు',
    listenAdvisory: 'వినండి (వాయిస్)',
    stopAudio: 'ఆపు',
    shareAdvisory: 'షేర్ చేయండి',
    advisoryCopied: 'సలహా కాపీ చేయబడింది!',
    rainfallOutlookTitle: '30 రోజుల వర్షపాతం & పొడి విరామ గ్రాఫ్',
    viewAll40Days: 'గత 10 రోజుల వర్షపాతం చూడండి',
    viewForecast30Days: 'రాబోయే 30 రోజులు మాత్రమే చూడండి',
    zoneObserved: 'గమనించిన వర్షం (గత 10 రోజులు)',
    zoneHigh: 'అధిక ఖచ్చితత్వం (1 నుండి 7 రోజులు)',
    zoneMedium: 'మధ్యస్థ ఖచ్చితత్వం (8 నుండి 14 రోజులు)',
    zoneIndicative: 'సూచిక అంచనా (15 నుండి 30 రోజులు)',
    onsetConfidenceGauge: 'వర్షాకాల ప్రారంభ విశ్వాసం',
    consecutiveDryDays: 'వరుస పొడి రోజుల అంచనా',
    soilMoistureScore: 'నేల తేమ ఒత్తిడి',
    dryBreakWarning: 'సుదీర్ఘ పొడి విరామ హెచ్చరిక',
    expectedRain7Days: 'రాబోయే 7 రోజుల వర్షం',
    farmingTipsTitle: 'రైతు సలహాలు',
    policyHubTitle: 'పంట బీమా & పథకాలు',
    pmfbyChecklistTitle: 'PMFBY క్లెయిమ్ చెక్‌లిస్ట్',
    alertHistoryTitle: 'హెచ్చరికల చరిత్ర',
    krishiMitraTitle: 'కృషి మిత్ర AI',
    krishiMitraSubtitle: 'విత్తనాలు, వర్షం, భీమా గురించి సులభంగా అడగండి',
    chatPlaceholder: 'కృషి మిత్రను అడగండి...',
    quickQuestions: ['నేను ఈరోజు విత్తవచ్చా?', 'పొడి వాతావరణం ఎప్పుడు ముగుస్తుంది?', 'PMFBY క్లెయిమ్ ఎలా చేయాలి?', 'ఏ రకం విత్తనం వాడాలి?'],
    clearChat: 'చాట్ క్లియర్ చేయండి',
    close: 'మూసివేయి',
    apply: 'వర్తింపజేయి',
    save: 'సేవ్ చేయండి',
    downloadPdf: 'రిపోర్ట్ డౌన్‌లోడ్ (PDF)',
    days: 'రోజులు',
    mm: 'మి.మీ',
  },

  kn: {
    brandName: 'ವರ್ಷಾ ಮಿತ್ರ',
    tagline: 'ಮಳೆಯ ಮುನ್ಸೂಚನೆ, ಬಿತ್ತನೆಯ ಸರಿಯಾದ ನಿರ್ಧಾರ.',
    navFarmer: 'ರೈತರ ಸಲಹೆ',
    navOfficer: 'ಅಧಿಕಾರಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    navSms: 'SMS / IVR ಸಿಮ್ಯುಲೇಟರ್',
    navInsurance: 'ವಿಮೆ ಮತ್ತು ಪುರಾವೆ',
    navAbout: 'ತಂತ್ರಜ್ಞಾನ ಮಾಹಿತಿ',
    navChat: 'ಕೃಷಿ ಮಿತ್ರ AI',
    demoScenario: 'ಡೆಮೊ ಸನ್ನಿವೇಶ',
    aiModeLive: 'AI: ಲೈವ್ ಜೆಮಿನಿ',
    aiModeFallback: 'AI: ಆಫ್‌ಲೈನ್ ಮೋಡ್',
    offlineBanner: 'ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಕೊನೆಯದಾಗಿ ಉಳಿಸಿದ ಸಲಹೆಯನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.',
    farmerPortalTitle: 'ಗ್ರಾಮ ಮಟ್ಟದ ಬಿತ್ತನೆ ನಿರ್ಧಾರ ಪೋರ್ಟಲ್',
    farmerPortalSubtitle: 'ಖಾರೀಫ್ ಯೋಜನೆಗಾಗಿ 7 ರಿಂದ 30 ದಿನಗಳ ಮಳೆ ಮತ್ತು ಒಣ ಬಿಡುವಿನ ಮುನ್ಸೂಚನೆ',
    selectState: 'ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ',
    selectDistrict: 'ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ',
    selectBlock: 'ತಾಲೂಕು',
    selectVillage: 'ಗ್ರಾಮ',
    selectCrop: 'ಬೆಳೆ',
    selectSoil: 'ಮಣ್ಣಿನ ಮಾದರಿ',
    useMyLocation: 'ನನ್ನ ಸ್ಥಳ ಬಳಸಿ',
    useLiveDataToggle: 'ಲೈವ್ ಹವಾಮಾನ (ದಿನಗಳು 1-7)',
    liveDataActive: 'ಲೈವ್ ಹವಾಮಾನ ಸಕ್ರಿಯವಾಗಿದೆ',
    simulatedDataNotice: 'ಮಾದರಿ ಪರೀಕ್ಷೆಗಾಗಿ ವಿಸ್ತೃತ ಮುನ್ಸೂಚನೆ',
    advisoryHeadline: 'ಬಿತ್ತನೆ ಸಲಹೆ ಸ್ಥಿತಿ',
    confidenceScore: 'ಮುನ್ಸೂಚನೆ ನಿಖರತೆ',
    safeSowingDate: 'ಸುರಕ್ಷಿತ ಬಿತ್ತನೆ ದಿನಾಂಕ',
    countdownDays: 'ಸುರಕ್ಷಿತ ದಿನಾಂಕಕ್ಕೆ ಉಳಿದ ದಿನಗಳು',
    daysRemaining: 'ದಿನಗಳು ಬಾಕಿ',
    whyThisAdvice: 'ಈ ಸಲಹೆ ಏಕೆ? (ನಿಯಮಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ)',
    whatCanIDo: 'ರೈತರು ಈಗ ಏನು ಮಾಡಬೇಕು?',
    optionA: 'ಆಯ್ಕೆ A: ಮಳೆ ಮರಳುವವರೆಗೆ ಬಿತ್ತನೆ ಮುಂದೂಡಿ',
    optionB: 'ಆಯ್ಕೆ B: ಅಲ್ಪಾವಧಿ/ಬರ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಆರಿಸಿ',
    recommendedVarieties: 'ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿಗಳು',
    listenAdvisory: 'ಆಲಿಸಿ (ಧ್ವನಿ)',
    stopAudio: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
    shareAdvisory: 'ಹಂಚಿಕೊಳ್ಳಿ',
    advisoryCopied: 'ಸಲಹೆ ಸಂದೇಶ ನಕಲಿಸಲಾಗಿದೆ!',
    rainfallOutlookTitle: '30 ದಿನಗಳ ಮಳೆ ಮತ್ತು ಒಣ ಬಿಡುವಿನ ಮುನ್ಸೂಚನೆ',
    viewAll40Days: 'ಕಳೆದ 10 ದಿನಗಳ ಮಳೆ ವೀಕ್ಷಿಸಿ',
    viewForecast30Days: 'ಮುಂದಿನ 30 ದಿನಗಳನ್ನು ಮಾತ್ರ ವೀಕ್ಷಿಸಿ',
    zoneObserved: 'ದಾಖಲಾದ ವಾಸ್ತವಿಕ ಮಳೆ (ಕಳೆದ 10 ದಿನಗಳು)',
    zoneHigh: 'ಹೆಚ್ಚಿನ ನಿಖರತೆ (ದಿನಗಳು 1 ರಿಂದ 7)',
    zoneMedium: 'ಮಧ್ಯಮ ನಿಖರತೆ (ದಿನಗಳು 8 ರಿಂದ 14)',
    zoneIndicative: 'ಸೂಚಕ ಮುನ್ನೋಟ (ದಿನಗಳು 15 ರಿಂದ 30)',
    onsetConfidenceGauge: 'ಮುಂಗಾರು ಆರಂಭದ ವಿಶ್ವಾಸ',
    consecutiveDryDays: 'ಸತತ ಒಣ ದಿನಗಳ ಮುನ್ಸೂಚನೆ',
    soilMoistureScore: 'ಮಣ್ಣಿನ ತೇವಾಂಶದ ಒತ್ತಡ',
    dryBreakWarning: 'ದೀರ್ಘ ಒಣ ಬಿಡುವಿನ ಎಚ್ಚರಿಕೆ',
    expectedRain7Days: 'ಮುಂದಿನ 7 ದಿನಗಳ ಮಳೆ',
    farmingTipsTitle: 'ಕೃಷಿ ಸಲಹೆಗಳು',
    policyHubTitle: 'ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಯೋಜನೆಗಳು',
    pmfbyChecklistTitle: 'PMFBY ಕ್ಲೈಮ್ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ',
    alertHistoryTitle: 'ಎಚ್ಚರಿಕೆ ಇತಿಹಾಸ',
    krishiMitraTitle: 'ಕೃಷಿ ಮಿತ್ರ AI',
    krishiMitraSubtitle: 'ಬಿತ್ತನೆ, ಹವಾಮಾನ, ಬೀಜಗಳ ಬಗ್ಗೆ ಸರಳವಾಗಿ ಕೇಳಿ',
    chatPlaceholder: 'ಕೃಷಿ ಮಿತ್ರನನ್ನು ಕೇಳಿ...',
    quickQuestions: ['ನಾನು ಇಂದು ಬಿತ್ತನೆ ಮಾಡಬಹುದೇ?', 'ಒಣ ಹವೆ ಯಾವಾಗ ಮುಗಿಯುತ್ತದೆ?', 'PMFBY ಕ್ಲೈಮ್ ಮಾಡುವುದು ಹೇಗೆ?', 'ಯಾವ ಬೀಜದ ತಳಿ ಬಳಸಬೇಕು?'],
    clearChat: 'ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ',
    close: 'ಮುಚ್ಚಿ',
    apply: 'ಅನ್ವಯಿಸು',
    save: 'ಉಳಿಸಿ',
    downloadPdf: 'ವರದಿ ಡೌನ್‌ಲೋಡ್ (PDF)',
    days: 'ದಿನಗಳು',
    mm: 'ಮಿ.ಮೀ',
  },

  ta: {
    brandName: 'வர்ஷா மித்ரா',
    tagline: 'மழை முன்னறிவிப்பு, சரியான விதைப்பு முடிவு.',
    navFarmer: 'விவசாயி ஆலோசனை',
    navOfficer: 'அதிகாரி கட்டுப்பாட்டு அறை',
    navSms: 'SMS / IVR மாதிரி',
    navInsurance: 'பயிர் காப்பீடு ஆதாரம்',
    navAbout: 'தொழில்நுட்பம்',
    navChat: 'கிருஷி மித்ரா AI',
    demoScenario: 'டெமோ நிலைமை',
    aiModeLive: 'AI: நேரடி ஜெமினி',
    aiModeFallback: 'AI: ஆஃப்லைன் முறை',
    offlineBanner: 'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். கடைசியாக சேமிக்கப்பட்ட ஆலோசனை காட்டப்படுகிறது.',
    farmerPortalTitle: 'கிராம அளவிலான விதைப்பு முடிவு தளம்',
    farmerPortalSubtitle: 'காரீஃப் திட்டமிடலுக்கான 7 முதல் 30 நாட்கள் மழை மற்றும் வறட்சி இடைவெளி முன்னறிவிப்பு',
    selectState: 'மாநிலம்',
    selectDistrict: 'மாவட்டம்',
    selectBlock: 'வட்டம்',
    selectVillage: 'கிராமம்',
    selectCrop: 'பயிர்',
    selectSoil: 'மண் வகை',
    useMyLocation: 'என் இருப்பிடத்தைப் பயன்படுத்து',
    useLiveDataToggle: 'நேரடி வானிலை (நாட்கள் 1-7)',
    liveDataActive: 'நேரடி வானிலை செயலில் உள்ளது',
    simulatedDataNotice: 'முன்மாதிரி சோதனைக்கான விரிவான முன்னறிவிப்பு',
    advisoryHeadline: 'விதைப்பு ஆலோசனை நிலை',
    confidenceScore: 'மாதிரி நம்பிக்கை',
    safeSowingDate: 'பாதுகாப்பான விதைப்பு தேதி',
    countdownDays: 'பாதுகாப்பான விதைப்புக்கு மீதமுள்ள நாட்கள்',
    daysRemaining: 'நாட்கள் மீதம்',
    whyThisAdvice: 'இந்த ஆலோசனை ஏன்? (விதிகள் மற்றும் பகுப்பாய்வு)',
    whatCanIDo: 'விவசாயிகள் இப்போது என்ன செய்ய வேண்டும்?',
    optionA: 'விருப்பம் A: மழை மீண்டும் தொடங்கும் வரை விதைப்பைத் தள்ளிப்போடுங்கள்',
    optionB: 'விருப்பம் B: குறுகிய கால/வறட்சி தாங்கும் ரகங்களுக்கு மாறுங்கள்',
    recommendedVarieties: 'பரிந்துரைக்கப்பட்ட ரகங்கள்',
    listenAdvisory: 'கேளுங்கள் (குரல்)',
    stopAudio: 'நிறுத்து',
    shareAdvisory: 'பகிர்',
    advisoryCopied: 'ஆலோசனை செய்தி நகலெடுக்கப்பட்டது!',
    rainfallOutlookTitle: '30 நாட்கள் மழை மற்றும் வறட்சி இடைவெளி வரைபடம்',
    viewAll40Days: 'கடந்த 10 நாட்களின் மழையைக் காண்க',
    viewForecast30Days: 'அடுத்த 30 நாட்களை மட்டும் காண்க',
    zoneObserved: 'பதிவான உண்மை மழை (கடந்த 10 நாட்கள்)',
    zoneHigh: 'உயர் துல்லியம் (நாட்கள் 1 முதல் 7)',
    zoneMedium: 'நடுத்தர துல்லியம் (நாட்கள் 8 முதல் 14)',
    zoneIndicative: 'குறிப்பீட்டு முன்னறிவிப்பு (நாட்கள் 15 முதல் 30)',
    onsetConfidenceGauge: 'பருவமழை தொடக்க நம்பிக்கை',
    consecutiveDryDays: 'தொடர்ச்சியான வறண்ட நாட்கள்',
    soilMoistureScore: 'மண் ஈரப்பத அழுத்தம்',
    dryBreakWarning: 'நீண்ட வறட்சி இடைவெளி எச்சரிக்கை',
    expectedRain7Days: 'அடுத்த 7 நாட்களில் எதிர்பார்க்கப்படும் மழை',
    farmingTipsTitle: 'விவசாய ஆலோசனைகள்',
    policyHubTitle: 'பயிர் காப்பீடு மற்றும் திட்டங்கள்',
    pmfbyChecklistTitle: 'PMFBY உரிமைகோரல் பட்டியல்',
    alertHistoryTitle: 'எச்சரிக்கை வரலாறு',
    krishiMitraTitle: 'கிருஷி மித்ரா AI',
    krishiMitraSubtitle: 'விதைப்பு, வானிலை, விதைகள் குறித்து எளிய தமிழில் கேளுங்கள்',
    chatPlaceholder: 'கிருஷி மித்ராவிடம் கேளுங்கள்...',
    quickQuestions: ['நான் இன்று விதைக்கலாமா?', 'வறண்ட வானிலை எப்போது முடியும்?', 'PMFBY காப்பீடு பெறுவது எப்படி?', 'எந்த விதை ரகத்தைப் பயன்படுத்த வேண்டும்?'],
    clearChat: 'அரட்டையை அழி',
    close: 'மூடு',
    apply: 'பயன்படுத்து',
    save: 'சேமி',
    downloadPdf: 'அறிக்கை பதிவிறக்கம் (PDF)',
    days: 'நாட்கள்',
    mm: 'மி.மீ',
  },
};
