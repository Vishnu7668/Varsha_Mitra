/**
 * Open-Meteo Forecast API Service for VarshaMitra
 * Endpoint: https://api.open-meteo.com/v1/forecast
 * Usage in VarshaMitra: Ingests real-time observations and 7–16 day forecasts:
 * temperature, humidity, wind, rainfall sum, precipitation probability,
 * volumetric soil moisture (0–3cm), and ET₀ (FAO-56 reference evapotranspiration).
 */

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch comprehensive weather observations and 7-16 day forecasts from Open-Meteo
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} forecastDays (default 16)
 * @returns {Promise<Object>} Formatted forecast and observations
 */
export async function fetchOpenMeteoForecast(latitude, longitude, forecastDays = 16) {
  const url = `${OPEN_METEO_FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,et0_fao_evapotranspiration&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,et0_fao_evapotranspiration&timezone=Asia%2FKolkata&forecast_days=${forecastDays}&past_days=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Open-Meteo Forecast API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};

    // Calculate volumetric soil moisture (0-3cm average) from hourly arrays
    const sm01 = hourly.soil_moisture_0_to_1cm || [];
    const sm13 = hourly.soil_moisture_1_to_3cm || [];
    const currentSm03 = sm01.length > 24 && sm13.length > 24
      ? Number(((sm01[24] + sm13[24]) / 2).toFixed(3))
      : 0.28;

    // Daily breakdown for 7-16 days
    const dailyForecasts = (daily.time || []).map((dateStr, idx) => {
      // Calculate daily average soil moisture 0-3cm from 24h slices
      const hourStart = idx * 24;
      const hourEnd = hourStart + 24;
      let daySm03 = 0.28;
      if (sm01.length >= hourEnd && sm13.length >= hourEnd) {
        let sum = 0;
        let count = 0;
        for (let h = hourStart; h < hourEnd; h++) {
          if (sm01[h] !== undefined && sm13[h] !== undefined) {
            sum += (sm01[h] + sm13[h]) / 2;
            count++;
          }
        }
        if (count > 0) daySm03 = Number((sum / count).toFixed(3));
      }

      const rainMm = Number((daily.precipitation_sum?.[idx] ?? 0).toFixed(1));
      const rainProb = Math.min(100, Math.max(0, daily.precipitation_probability_max?.[idx] ?? 0));
      const tempMax = Math.round(daily.temperature_2m_max?.[idx] ?? 32);
      const tempMin = Math.round(daily.temperature_2m_min?.[idx] ?? 24);
      const et0 = Number((daily.et0_fao_evapotranspiration?.[idx] ?? 4.5).toFixed(1));
      const isBreakDay = rainMm < 2.5;

      return {
        dayNumber: idx + 1,
        dateStr,
        rainMm,
        rainProb,
        tempMax,
        tempMin,
        soilMoisturePercent: Math.min(100, Math.round(daySm03 * 220)), // Normalized %
        volumetricSoilMoisture: daySm03, // m3/m3 (0-3cm)
        et0Mm: et0, // mm/day
        isBreakDay,
        confidenceZone: idx < 7 ? 'high' : idx < 12 ? 'medium' : 'indicative',
      };
    });

    return {
      isLive: true,
      current: {
        temperature: Math.round((current.temperature_2m ?? 29) * 10) / 10,
        apparentTemperature: Math.round((current.apparent_temperature ?? 31) * 10) / 10,
        relativeHumidity: Math.round(current.relative_humidity_2m ?? 65),
        currentRainMm: Number((current.rain ?? current.precipitation ?? 0).toFixed(1)),
        weatherCode: current.weather_code ?? 2,
        surfacePressure: Math.round(current.surface_pressure ?? 1008),
        windSpeed: Math.round(current.wind_speed_10m ?? 12),
        windDirection: Math.round(current.wind_direction_10m ?? 270),
        volumetricSoilMoisture0to3cm: currentSm03,
        et0Mm: Number((daily.et0_fao_evapotranspiration?.[0] ?? 4.5).toFixed(1)),
      },
      daily: dailyForecasts,
      hourly,
      source: 'Open-Meteo High-Resolution Forecast API (ECMWF & GFS Ensemble)',
    };
  } catch (error) {
    console.warn('[VarshaMitra Weather] Forecast API error:', error);
    throw error;
  }
}
