export type AdvisoryStatus = 'GREEN' | 'AMBER' | 'RED';

export type CropType =
  | 'Paddy'
  | 'Cotton'
  | 'Soybean'
  | 'Tur'
  | 'Urad'
  | 'Maize'
  | 'Wheat'
  | 'Sugarcane'
  | 'Mustard'
  | 'Potato'
  | 'Pulses';

export type SoilType =
  | 'Black'
  | 'Red'
  | 'Alluvial'
  | 'Laterite'
  | 'Sandy Loam'
  | 'Clay Loam'
  | 'Bundelkhand Mixed';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu' | 'te' | 'kn' | 'ta';

export interface VillageLocation {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  block: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  defaultCrop: CropType;
  defaultSoil: SoilType;
  registeredFarmers: number;
  cultivatedAcreage: number;
}

export interface DayForecast {
  dayNumber: number; // -14 to -1 for past days, 1 to 16 for forecast
  dateStr: string;
  isPast?: boolean;
  rainMm: number;
  rainProb: number; // 0 - 100
  tempMax: number;
  tempMin: number;
  soilMoisturePercent: number; // 0 - 100
  volumetricSoilMoisture?: number; // m3/m3 volumetric water content in 0-3cm topsoil
  et0Mm?: number; // FAO-56 Reference Evapotranspiration (mm/day)
  isBreakDay?: boolean;
  confidenceZone: 'observed' | 'high' | 'medium' | 'indicative';
}

export interface AdvisoryResult {
  status: AdvisoryStatus;
  headline: string;
  headlineHi: string;
  headlineMr: string;
  summary: string;
  confidencePercent: number;
  dryBreakDays: number;
  safeSowingDate: string;
  expectedRainNext7Days: number;
  breakProbabilityPercent: number;
  soilMoistureScore: number; // 0 - 100
  reasonsFired: string[];
  recommendedActions: {
    title: string;
    description: string;
    type: 'primary' | 'alternative';
  }[];
  alternateVarieties: {
    crop: string;
    variety: string;
    durationDays: number;
    benefits: string;
  }[];
  geminiExplanation?: string;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  status: AdvisoryStatus;
  state: string;
  district: string;
  block: string;
  villageId: string;
  crop: CropType;
  soil: SoilType;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isAudioPlaying?: boolean;
}

export interface OfficerPanchayatRisk {
  id: string;
  villageName: string;
  block: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  riskStatus: AdvisoryStatus;
  riskScore: number; // 0 to 100
  primaryCrop: CropType;
  farmersCount: number;
  acreageAtRisk: number;
  onsetConfidence: number;
  dryBreakLength: number;
  next7DaysRainMm: number;
  advisoryText: string;
  isOverridden?: boolean;
  overrideNote?: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

export interface AlertLogItem {
  id: string;
  timestamp: string;
  villageName: string;
  channel: 'SMS' | 'Voice IVR' | 'WhatsApp';
  recipientCount: number;
  messageText: string;
  status: 'Delivered' | 'Pending';
}

export interface InsuranceAnomalyRecord {
  id: string;
  hash: string;
  villageName: string;
  district: string;
  crop: CropType;
  date: string;
  observedRainMm: number;
  expectedRainMm: number;
  anomalyPercent: number;
  consecutiveDryDays: number;
  moistureStressScore: number;
  alertTriggered: AdvisoryStatus;
  isEligibleForClaim: boolean;
}

export interface RealtimeDistrictWeatherData {
  districtName: string;
  villageName: string;
  lat: number;
  lng: number;
  updatedAt: string;
  isLive: boolean;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number; // Humidity level %
  currentRainMm: number; // Current rainfall rate (mm)
  past24hRainMm: number; // Past 24h precipitation sum
  weatherCode: number;
  conditionText: string;
  windSpeed: number; // km/h
  windDirection?: number; // degrees
  surfacePressure: number; // hPa
  dewPoint: number; // °C
  soilTemp0cm?: number; // °C (surface)
  soilTemp6cm?: number; // °C (seedbed zone)
  soilTemp18cm?: number; // °C (root zone)
  volumetricSoilMoisture0to3cm?: number; // m3/m3 topsoil moisture
  et0Mm?: number; // FAO-56 Reference Evapotranspiration (mm/day)
  humidityStatus: 'Low' | 'Moderate' | 'High (Humid)' | 'Very High (Saturated)';
  rainStatus: 'No Rain' | 'Light Drizzle' | 'Moderate Rain' | 'Heavy Downpour';
  hourlyForecast: {
    time: string;
    rainMm: number;
    humidity: number;
    temp: number;
  }[];
}

