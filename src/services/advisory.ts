import { AdvisoryResult, AdvisoryStatus, CropType, DayForecast, SoilType } from '../types';

export interface AdvisoryEngineInput {
  crop: CropType;
  soil: SoilType;
  forecasts: DayForecast[];
  customThresholdMm?: number;
  customMaxBreakDays?: number;
}

// Base 7-day cumulative rainfall thresholds (mm) required for safe germination
const CROP_THRESHOLDS: Record<CropType, number> = {
  Paddy: 70,     // High water demand, nursery puddling or direct seeding
  Cotton: 55,    // Deep root development, very sensitive to dry seedling burn
  Soybean: 50,   // High seed coat sensitivity, easily damaged by dry spell after germination
  Maize: 45,     // Moderate water requirement
  Tur: 35,       // High drought tolerance, deep taproot once established
  Urad: 30,      // Short duration pulse, low water requirement
};

// Soil moisture retention factors (modifier to rainfall effectiveness)
const SOIL_RETENTION_FACTORS: Record<SoilType, number> = {
  Black: 1.15,   // High clay content, excellent moisture holding capacity (Vertisols)
  Alluvial: 1.0, // Well balanced loam, good drainage and retention
  Red: 0.85,     // Coarser texture, rapid drainage, higher drought vulnerability
  Laterite: 0.75,// Porous, low water holding, requires frequent replenishment
};

/**
 * Pure rules engine for Kharif sowing advisories
 */
export function calculateAdvisory(input: AdvisoryEngineInput): AdvisoryResult {
  const { crop, soil, forecasts, customThresholdMm } = input;

  // Filter only forecast days (dayNumber 1 to 30)
  const futureDays = forecasts.filter((d) => d.dayNumber >= 1);
  const next7Days = futureDays.slice(0, 7);
  const next21Days = futureDays.slice(0, 21);

  // 1. Calculate 7-day cumulative rainfall
  const expectedRainNext7Days = Number(
    next7Days.reduce((acc, d) => acc + d.rainMm, 0).toFixed(1)
  );

  // Adjusted threshold based on crop + soil retention
  const baseThreshold = customThresholdMm || CROP_THRESHOLDS[crop];
  const soilFactor = SOIL_RETENTION_FACTORS[soil];
  // If soil holds water well (Black), farmer needs slightly less surface rain; if Red/Laterite, needs more rain
  const effectiveThreshold = Math.round(baseThreshold / soilFactor);

  // 2. Identify maximum consecutive dry break in the critical 21-day window
  // A dry day is typically < 2.5 mm rainfall
  let maxDryBreakDays = 0;
  let currentDryRun = 0;
  let breakStartDay = -1;
  let breakEndDay = -1;

  for (let i = 0; i < next21Days.length; i++) {
    const day = next21Days[i];
    if (day.rainMm < 2.5) {
      if (currentDryRun === 0) breakStartDay = day.dayNumber;
      currentDryRun++;
      if (currentDryRun > maxDryBreakDays) {
        maxDryBreakDays = currentDryRun;
        breakEndDay = day.dayNumber;
      }
    } else {
      currentDryRun = 0;
    }
  }

  // 3. Dry Break Probability & Isolated False-Onset Check
  // Check if first 1-2 days have moderate rain, but are immediately followed by 8+ consecutive dry days
  const earlyRain = (next7Days[0]?.rainMm || 0) + (next7Days[1]?.rainMm || 0);
  const subsequentRain = next7Days.slice(2, 7).reduce((acc, d) => acc + d.rainMm, 0);
  const isIsolatedFalseOnset = earlyRain >= 15 && subsequentRain < 5 && maxDryBreakDays >= 9;

  // Estimate dry break probability based on ensemble daily rain probabilities during the break
  let breakProbabilityPercent = 0;
  if (maxDryBreakDays >= 7) {
    const breakDays = next21Days.filter((d) => d.rainMm < 2.5);
    const avgRainProbDuringBreak =
      breakDays.reduce((acc, d) => acc + d.rainProb, 0) / (breakDays.length || 1);
    // Probability that it stays dry = (100 - avg rain probability)
    breakProbabilityPercent = Math.min(95, Math.max(30, Math.round(100 - avgRainProbDuringBreak)));
  } else {
    breakProbabilityPercent = Math.round(Math.max(10, 30 - maxDryBreakDays * 2));
  }

  // Average soil moisture score in root zone
  const avgSoilMoisture = Math.round(
    next7Days.reduce((acc, d) => acc + d.soilMoisturePercent, 0) / (next7Days.length || 1)
  );

  // 4. Decision Logic
  let status: AdvisoryStatus = 'AMBER';
  const reasonsFired: string[] = [];

  // Check RED conditions:
  // - High probability (>50%) of a dry break longer than 10 days
  // - Or isolated false onset event
  // - Or very poor 7-day cumulative rainfall (< 20mm for sensitive crops)
  if (maxDryBreakDays >= 11 || isIsolatedFalseOnset || breakProbabilityPercent >= 55) {
    status = 'RED';
    if (isIsolatedFalseOnset) {
      reasonsFired.push(
        `High risk of False Onset: Initial rain (${earlyRain.toFixed(1)} mm) is an isolated pulse followed by a ${maxDryBreakDays}-day dry gap.`
      );
    } else {
      reasonsFired.push(
        `Critical dry pause: Model indicates ${maxDryBreakDays} consecutive dry days starting around Day ${breakStartDay || 3}.`
      );
    }
    reasonsFired.push(
      `Dry break probability is elevated at ${breakProbabilityPercent}%, exceeding the 50% safety limit for ${crop}.`
    );
    if (soil === 'Red' || soil === 'Laterite') {
      reasonsFired.push(
        `Low moisture retention in ${soil} soil accelerates seed desiccation during dry intervals.`
      );
    }
  } else if (
    expectedRainNext7Days >= effectiveThreshold &&
    maxDryBreakDays <= 7 &&
    breakProbabilityPercent <= 30
  ) {
    // GREEN conditions:
    // - 7-day rain >= crop threshold
    // - dry break <= 7 days
    // - dry break probability < 30%
    status = 'GREEN';
    reasonsFired.push(
      `Sufficient monsoon precipitation: ${expectedRainNext7Days} mm projected over next 7 days (threshold: ${effectiveThreshold} mm for ${crop} in ${soil} soil).`
    );
    reasonsFired.push(
      `Low break risk: No prolonged dry spell anticipated (longest gap is ${maxDryBreakDays} days, well within safe tolerance).`
    );
    reasonsFired.push(
      `Sustained root-zone moisture (${avgSoilMoisture}%) ensures uniform germination and early seedling vigor.`
    );
  } else {
    // AMBER conditions (everything else)
    status = 'AMBER';
    reasonsFired.push(
      `Borderline cumulative rain: ${expectedRainNext7Days} mm expected over next 7 days vs required ${effectiveThreshold} mm.`
    );
    reasonsFired.push(
      `Moderate dry pause risk: An anticipated ${maxDryBreakDays}-day dry spell creates marginal germination moisture.`
    );
    reasonsFired.push(
      `Atmospheric monsoon surge is stabilizing. Daily updates required before finalizing field sowing.`
    );
  }

  // 5. Calculate Confidence & Safe Sowing Date
  let confidencePercent = 82;
  if (status === 'GREEN') {
    confidencePercent = Math.min(94, Math.round(75 + expectedRainNext7Days * 0.2));
  } else if (status === 'RED') {
    confidencePercent = Math.min(96, Math.round(70 + maxDryBreakDays * 1.5));
  } else {
    confidencePercent = 68;
  }

  // Safe date calculation:
  // If GREEN: Today to next 48 hours
  // If RED: Date after the dry break revives (typically breakEndDay + 2)
  // If AMBER: 3 to 5 days review date
  const now = new Date();
  let safeDateObj = new Date(now);

  if (status === 'GREEN') {
    safeDateObj.setDate(now.getDate() + 1); // Tomorrow / within 48h
  } else if (status === 'RED') {
    const daysToAdd = Math.max(16, (breakEndDay > 0 ? breakEndDay : 18) + 2);
    safeDateObj.setDate(now.getDate() + daysToAdd);
  } else {
    safeDateObj.setDate(now.getDate() + 4);
  }

  const safeSowingDate = safeDateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // 6. Actionable recommendations & variety switches
  const recommendedActions: AdvisoryResult['recommendedActions'] = [];
  const alternateVarieties: AdvisoryResult['alternateVarieties'] = [];

  if (status === 'GREEN') {
    recommendedActions.push({
      title: 'Initiate Main Field Sowing',
      description:
        'Commence sowing within the next 24 to 48 hours while topsoil moisture is optimal (depth 3-5 cm).',
      type: 'primary',
    });
    recommendedActions.push({
      title: 'Basal Fertilizer Application',
      description:
        'Apply recommended basal DAP/NPK doses at sowing time. Schedule top-dressing after Day 10 upon first weeding.',
      type: 'primary',
    });
  } else if (status === 'RED') {
    recommendedActions.push({
      title: 'Option A: Delay Sowing to Revival Window',
      description: `Hold seed drill until ${safeSowingDate}. Sowing into the temporary rain will cause seed rot followed by seedling mortality. Maintain prepared seedbeds and wait for the assured monsoon revival.`,
      type: 'primary',
    });
    recommendedActions.push({
      title: 'Option B: Switch to Resilient / Short-Duration Varieties',
      description: `If delay exceeds optimal agronomic window, switch to short-duration or drought-tolerant varieties that withstand dry spells.`,
      type: 'alternative',
    });

    // Provide crop-specific alternative varieties
    if (crop === 'Soybean') {
      alternateVarieties.push(
        {
          crop: 'Soybean',
          variety: 'JS 20-34 / NRC 37',
          durationDays: 85,
          benefits: 'Matures 15 days earlier, high terminal drought tolerance, pod-shattering resistant.',
        },
        {
          crop: 'Tur (Intercrop)',
          variety: 'BDN 711 / Asha',
          durationDays: 140,
          benefits: 'Deep root system acts as insurance buffer if soybean crop suffers mid-season stress.',
        }
      );
    } else if (crop === 'Cotton') {
      alternateVarieties.push(
        {
          crop: 'Cotton (Early Bt)',
          variety: 'Compact Short Duration Hybrid',
          durationDays: 135,
          benefits: 'Reduces vulnerability to late-season pink bollworm and terminal soil moisture deficiency.',
        },
        {
          crop: 'Switch to Pulse (Urad/Tur)',
          variety: 'Black Gram TAU-1 / Tur Maruti',
          durationDays: 75,
          benefits: 'Low input cost, can be planted up to mid-July with reliable yields in drought-prone tracts.',
        }
      );
    } else if (crop === 'Paddy') {
      alternateVarieties.push(
        {
          crop: 'Paddy (Direct Seeded)',
          variety: 'Sahbhagi Dhan / DRR Dhan 42',
          durationDays: 105,
          benefits: 'Proven 20-25 days moisture stress tolerance; saves nursery puddle water.',
        },
        {
          crop: 'Paddy (Medium Early)',
          variety: 'MTU 1010',
          durationDays: 115,
          benefits: 'Fast vegetative growth, robust tillering once rains resume.',
        }
      );
    } else {
      alternateVarieties.push(
        {
          crop: 'Millets / Pulses',
          variety: 'Pearl Millet (Bajra) / Cowpea',
          durationDays: 70,
          benefits: 'Extremely resilient to breaks up to 20 days with minimal water requirements.',
        }
      );
    }
  } else {
    // AMBER
    recommendedActions.push({
      title: 'Hold Field Operations & Re-evaluate in 72h',
      description:
        'Do not rush sowing. Monitor next 3 days weather forecasts. If soil moisture depth is below 4 inches, postpone field work.',
      type: 'primary',
    });
    recommendedActions.push({
      title: 'Dust Mulching & Seed Treatment',
      description:
        'Treat existing seeds with Trichoderma viride and Rhizobium. Practice dust mulching to conserve existing soil capillary moisture.',
      type: 'alternative',
    });
  }

  // 7. Plain-language headline and summary
  let headline = '';
  let headlineHi = '';
  let headlineMr = '';
  let summary = '';

  if (status === 'GREEN') {
    headline = 'Safe to Sow. Start within 48 hours.';
    headlineHi = 'बुवाई के लिए सुरक्षित। 48 घंटों में बुवाई शुरू करें।';
    headlineMr = 'पेरणीसाठी सुरक्षित. पुढील ४८ तासांत पेरणी सुरू करा.';
    summary = `Adequate monsoon arrival with ${expectedRainNext7Days} mm projected in next 7 days and low risk of dry pause. Top-dress first fertilizer on Day 10.`;
  } else if (status === 'RED') {
    headline = `DO NOT SOW NOW. Dry break of ${maxDryBreakDays} days expected.`;
    headlineHi = `अभी बुवाई न करें! ${maxDryBreakDays} दिनों का सूखा अंतराल अपेक्षित है।`;
    headlineMr = `आत्ता पेरणी करू नका! सुमारे ${maxDryBreakDays} दिवसांचा पावसाचा खंड अपेक्षित.`;
    summary = `High risk of seed failure. An isolated pulse of rain will be followed by a prolonged dry break of about ${maxDryBreakDays} days. Safe revival date: ${safeSowingDate}.`;
  } else {
    headline = 'Wait. Rain is unreliable. Recheck in 3 days.';
    headlineHi = 'प्रतीक्षा करें। बारिश अनिश्चित है। 3 दिनों में पुनः जांचें।';
    headlineMr = 'प्रतीक्षा करा. पाऊस अनिश्चित आहे. ३ दिवसांनी पुन्हा तपासा.';
    summary = `Moisture conditions are borderline (${expectedRainNext7Days} mm expected). Do not risk expensive seeds until monsoon surge stabilizes.`;
  }

  return {
    status,
    headline,
    headlineHi,
    headlineMr,
    summary,
    confidencePercent,
    dryBreakDays: maxDryBreakDays,
    safeSowingDate,
    expectedRainNext7Days,
    breakProbabilityPercent,
    soilMoistureScore: avgSoilMoisture,
    reasonsFired,
    recommendedActions,
    alternateVarieties,
  };
}
