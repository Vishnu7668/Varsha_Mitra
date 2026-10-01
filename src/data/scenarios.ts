import { DayForecast, ScenarioPreset } from '../types';

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'false-onset-cotton',
    title: 'False Onset: Cotton, Vidarbha',
    status: 'RED',
    state: 'Maharashtra',
    district: 'Yavatmal',
    block: 'Ner',
    villageId: 'mh-yav-ner-malbori',
    crop: 'Cotton',
    soil: 'Black',
    description: 'Isolated pre-monsoon storm creates illusion of monsoon arrival, immediately followed by 14 consecutive dry, scorching days. High seed mortality risk.',
  },
  {
    id: 'dry-break-soybean',
    title: 'Prolonged Dry Break: Soybean, Marathwada',
    status: 'RED',
    state: 'Maharashtra',
    district: 'Latur',
    block: 'Renapur',
    villageId: 'mh-lat-ren-pangaon',
    crop: 'Soybean',
    soil: 'Black',
    description: 'Initial rainfall triggers germination, but a severe 15-day dry break stalls seedling development and causes irreversible moisture stress.',
  },
  {
    id: 'safe-onset-paddy',
    title: 'Safe Onset: Paddy Belt',
    status: 'GREEN',
    state: 'Maharashtra',
    district: 'Bhandara',
    block: 'Lakhani',
    villageId: 'mh-bha-lak-kesalwada',
    crop: 'Paddy',
    soil: 'Alluvial',
    description: 'Deep monsoon depression ensures 95mm+ rainfall across the first 7 days with consistent pulses in weeks 2 to 4. Optimal sowing conditions.',
  },
  {
    id: 'borderline-tur',
    title: 'Borderline Revival: Tur, Karnataka',
    status: 'AMBER',
    state: 'Karnataka',
    district: 'Kalaburagi',
    block: 'Sedam',
    villageId: 'ka-kal-sed-kudhalli',
    crop: 'Tur',
    soil: 'Red',
    description: 'Intermittent light showers (38mm) on shallow red soil with an 8-day dry pause. Recheck rainfall probability in 3 days before field prep.',
  },
  {
    id: 'delhi-ncr-paddy',
    title: 'Northern Indo-Gangetic: Delhi NCR',
    status: 'GREEN',
    state: 'Delhi NCR',
    district: 'New Delhi',
    block: 'Mehrauli',
    villageId: 'dl-ncr-south-delhi',
    crop: 'Paddy',
    soil: 'Alluvial',
    description: 'Sub-tropical alluvial belt with active monsoon precipitation and moderate humidity (57%). Favorable field moisture for Paddy and Kharif pulses.',
  },
];

/**
 * Generate a realistic 40-day time series:
 * - 10 past days: Observed ground truth data
 * - 30 outlook days: Days 1-7 (High), Days 8-14 (Medium), Days 15-30 (Indicative)
 */
export function generateScenarioWeather(
  scenarioId: string,
  baseDate: Date = new Date()
): DayForecast[] {
  const result: DayForecast[] = [];

  // Helper date formatter
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // 1. Generate 10 Past Observed Days (Day -10 to Day -1)
  for (let i = 10; i >= 1; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);

    let rainMm = 0;
    let rainProb = 0;
    let soilMoisture = 35;

    if (scenarioId === 'false-onset-cotton') {
      // Past 10 days were mostly bone dry, with one sudden flash shower on Day -1
      if (i === 1) {
        rainMm = 28.4;
        rainProb = 90;
        soilMoisture = 52;
      } else if (i === 2) {
        rainMm = 4.2;
        rainProb = 45;
        soilMoisture = 34;
      } else {
        rainMm = 0.0;
        rainProb = 10;
        soilMoisture = 28 - (10 - i);
      }
    } else if (scenarioId === 'dry-break-soybean') {
      // Past 10 days had sporadic showers on Day -3 and -2
      if (i === 2 || i === 3) {
        rainMm = i === 2 ? 18.5 : 12.0;
        rainProb = 85;
        soilMoisture = 58;
      } else {
        rainMm = 0.2;
        rainProb = 20;
        soilMoisture = 38;
      }
    } else if (scenarioId === 'safe-onset-paddy') {
      // Past 10 days had steady build-up of monsoon clouds and gentle showers
      if (i <= 4) {
        rainMm = 8 + (5 - i) * 6;
        rainProb = 80;
        soilMoisture = 65;
      } else {
        rainMm = 2.5;
        rainProb = 35;
        soilMoisture = 45;
      }
    } else {
      // Amber scenario (Tur, Karnataka)
      if (i === 3) {
        rainMm = 14.2;
        rainProb = 70;
        soilMoisture = 42;
      } else {
        rainMm = 0.0;
        rainProb = 15;
        soilMoisture = 32;
      }
    }

    result.push({
      dayNumber: -i,
      dateStr: formatDate(d),
      isPast: true,
      rainMm,
      rainProb,
      tempMax: 35 - Math.round(rainMm * 0.15),
      tempMin: 24,
      soilMoisturePercent: Math.max(15, Math.min(95, soilMoisture)),
      isBreakDay: rainMm < 2.5,
      confidenceZone: 'observed',
    });
  }

  // 2. Generate 30 Future Outlook Days (Day 1 to Day 30)
  for (let i = 1; i <= 30; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + (i - 1));

    let rainMm = 0;
    let rainProb = 0;
    let tempMax = 33;
    let tempMin = 24;
    let soilMoisture = 45;
    let isBreakDay = false;

    const zone: 'high' | 'medium' | 'indicative' =
      i <= 7 ? 'high' : i <= 14 ? 'medium' : 'indicative';

    if (scenarioId === 'false-onset-cotton') {
      // False onset: Day 1 has some leftover rain (14mm), Day 2 has 3mm, then Days 3 to 17 are a continuous dry break!
      if (i === 1) {
        rainMm = 14.5;
        rainProb = 65;
        soilMoisture = 55;
      } else if (i === 2) {
        rainMm = 3.2;
        rainProb = 30;
        soilMoisture = 48;
      } else if (i >= 3 && i <= 17) {
        // Severe dry pause of 15 days
        rainMm = 0.0;
        rainProb = Math.max(5, 20 - i);
        tempMax = 38 - Math.sin(i) * 1.5;
        soilMoisture = Math.max(12, 45 - (i - 2) * 2.4);
        isBreakDay = true;
      } else if (i >= 18 && i <= 24) {
        // True monsoon revival after day 18!
        rainMm = 18 + (i - 18) * 4;
        rainProb = 80;
        soilMoisture = 60 + (i - 18) * 3;
      } else {
        rainMm = 6.5;
        rainProb = 50;
        soilMoisture = 65;
      }
    } else if (scenarioId === 'dry-break-soybean') {
      // Day 1 to 3 have light showers, then Days 4 to 18 is a 15-day dry break
      if (i <= 3) {
        rainMm = 12.0 - i * 2;
        rainProb = 60;
        soilMoisture = 52;
      } else if (i >= 4 && i <= 18) {
        rainMm = 0.0;
        rainProb = 12;
        tempMax = 36.5;
        soilMoisture = Math.max(15, 50 - (i - 3) * 2.3);
        isBreakDay = true;
      } else if (i >= 19 && i <= 25) {
        // Revival
        rainMm = 22.0;
        rainProb = 85;
        soilMoisture = 68;
      } else {
        rainMm = 8.0;
        rainProb = 55;
        soilMoisture = 64;
      }
    } else if (scenarioId === 'safe-onset-paddy') {
      // Continuous robust monsoon pulse
      if (i <= 7) {
        // High confidence 7 days: massive rain (total > 95 mm)
        rainMm = [16.5, 22.0, 18.5, 14.0, 12.0, 8.5, 9.0][i - 1];
        rainProb = 85 + (i % 3) * 4;
        soilMoisture = 72 + i * 2;
        tempMax = 30.5;
      } else if (i <= 14) {
        // Medium confidence: consistent intermittent rains
        rainMm = i % 2 === 0 ? 12.5 : 6.0;
        rainProb = 75;
        soilMoisture = 80;
      } else {
        // Indicative
        rainMm = i % 3 === 0 ? 10.0 : 4.0;
        rainProb = 65;
        soilMoisture = 78;
      }
      isBreakDay = rainMm < 2.5;
    } else {
      // Amber scenario (Tur, Karnataka)
      // Borderline 38mm over next 7 days, dry gap on days 6 to 14
      if (i <= 5) {
        rainMm = [8.5, 11.0, 9.2, 5.0, 4.5][i - 1];
        rainProb = 55;
        soilMoisture = 48;
      } else if (i >= 6 && i <= 14) {
        rainMm = 0.4;
        rainProb = 22;
        tempMax = 35;
        soilMoisture = Math.max(22, 45 - (i - 5) * 2.2);
        isBreakDay = true;
      } else {
        rainMm = 14.0;
        rainProb = 70;
        soilMoisture = 55;
      }
    }

    result.push({
      dayNumber: i,
      dateStr: formatDate(d),
      isPast: false,
      rainMm: Number(rainMm.toFixed(1)),
      rainProb,
      tempMax: Math.round(tempMax),
      tempMin,
      soilMoisturePercent: Math.min(100, Math.max(10, Math.round(soilMoisture))),
      isBreakDay,
      confidenceZone: zone,
    });
  }

  return result;
}
