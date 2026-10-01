/**
 * Real-Time Weather Radar & Precipitation Layer Service
 * Powered by composite meteorological Doppler radar & satellite precipitation feeds.
 * Updates every 5-10 minutes with historical scans and nowcast precipitation predictions.
 */

export interface RadarFrame {
  time: number; // Unix timestamp in seconds
  path: string; // RainViewer tile path, e.g. "/v2/radar/6bad22c675eb"
  formattedTime: string; // e.g. "12:45 PM"
  relativeLabel: string; // e.g. "Live Now", "10m ago", "+15m forecast"
  isNowcast: boolean;
}

export interface RadarData {
  host: string;
  frames: RadarFrame[];
  generatedAt: number;
}

export interface RadarColorPalette {
  id: number;
  name: string;
  description: string;
}

export const RADAR_COLOR_PALETTES: RadarColorPalette[] = [
  { id: 2, name: 'Universal Rainbow', description: 'Standard Doppler Radar (Blue ➔ Green ➔ Yellow ➔ Red)' },
  { id: 4, name: 'Smooth Reflectivity', description: 'Smooth high-contrast Doppler storm reflectivity' },
  { id: 6, name: 'Precipitation Rate (mm/h)', description: 'Calibrated precipitation intensity' },
  { id: 1, name: 'Classic Black & White', description: 'Monochrome cloud density' },
];

export const RADAR_LEGEND = [
  { label: 'Drizzle', rate: '< 1.5 mm/h', color: '#60a5fa', dbz: '15-25 dBZ' },
  { label: 'Moderate', rate: '1.5 - 5 mm/h', color: '#34d399', dbz: '25-35 dBZ' },
  { label: 'Heavy', rate: '5 - 15 mm/h', color: '#fbbf24', dbz: '35-45 dBZ' },
  { label: 'Severe / Storm', rate: '> 15 mm/h', color: '#ef4444', dbz: '45-60+ dBZ' },
];

let cachedRadarData: RadarData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Format relative minutes (e.g. "Live Now", "10m ago", "+20m nowcast")
 */
function getRelativeTimeLabel(timestampSec: number, latestSec: number, isNowcast: boolean): string {
  const diffSec = latestSec - timestampSec;
  const diffMin = Math.round(diffSec / 60);

  if (isNowcast) {
    const futureMin = Math.round((timestampSec - latestSec) / 60);
    return `+${futureMin}m Nowcast`;
  }

  if (diffMin <= 5) {
    return '🔴 LIVE NOW';
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  const hours = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  return remMin === 0 ? `${hours}h ago` : `${hours}h ${remMin}m ago`;
}

/**
 * Format clock time e.g. "01:25 PM"
 */
function formatClockTime(timestampSec: number): string {
  try {
    const d = new Date(timestampSec * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Live';
  }
}

/**
 * Fetch real-time weather radar frames metadata from RainViewer
 */
export async function fetchRadarMetadata(): Promise<RadarData> {
  const now = Date.now();
  if (cachedRadarData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedRadarData;
  }

  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!res.ok) {
      throw new Error(`RainViewer API returned status ${res.status}`);
    }
    const json = await res.json();
    const host: string = json.host || 'https://tilecache.rainviewer.com';
    const past: Array<{ time: number; path: string }> = json.radar?.past || [];
    const nowcast: Array<{ time: number; path: string }> = json.radar?.nowcast || [];

    const latestPastTime = past.length > 0 ? past[past.length - 1].time : Math.floor(now / 1000);

    const pastFrames: RadarFrame[] = past.map((item, index) => {
      const isLatest = index === past.length - 1;
      return {
        time: item.time,
        path: item.path,
        formattedTime: formatClockTime(item.time),
        relativeLabel: isLatest ? '🔴 LIVE NOW' : getRelativeTimeLabel(item.time, latestPastTime, false),
        isNowcast: false,
      };
    });

    const nowcastFrames: RadarFrame[] = nowcast.map((item) => ({
      time: item.time,
      path: item.path,
      formattedTime: formatClockTime(item.time),
      relativeLabel: getRelativeTimeLabel(item.time, latestPastTime, true),
      isNowcast: true,
    }));

    const allFrames = [...pastFrames, ...nowcastFrames];

    cachedRadarData = {
      host,
      frames: allFrames,
      generatedAt: json.generated || Math.floor(now / 1000),
    };
    lastFetchTime = now;
    return cachedRadarData;
  } catch (err) {
    console.warn('Failed to fetch real-time radar metadata, returning fallback frames', err);

    // Fallback recent timestamp frames if offline or network failure
    const baseTime = Math.floor(Date.now() / 1000);
    const mockFrames: RadarFrame[] = [
      {
        time: baseTime - 1800,
        path: '/v2/radar/sample_30',
        formattedTime: formatClockTime(baseTime - 1800),
        relativeLabel: '30m ago',
        isNowcast: false,
      },
      {
        time: baseTime - 600,
        path: '/v2/radar/sample_10',
        formattedTime: formatClockTime(baseTime - 600),
        relativeLabel: '10m ago',
        isNowcast: false,
      },
      {
        time: baseTime,
        path: '/v2/radar/sample_live',
        formattedTime: formatClockTime(baseTime),
        relativeLabel: '🔴 LIVE NOW',
        isNowcast: false,
      },
    ];

    return {
      host: 'https://tilecache.rainviewer.com',
      frames: mockFrames,
      generatedAt: baseTime,
    };
  }
}

/**
 * Generate tile URL for Google Maps and Leaflet
 * ColorScheme: 2 (Universal), smooth: 1 (anti-aliased), snow: 1 (show snow if cold)
 */
export function getRadarTileUrl(
  host: string,
  path: string,
  x: number,
  y: number,
  zoom: number,
  colorScheme: number = 2,
  smooth: boolean = true,
  snow: boolean = true
): string {
  const smoothVal = smooth ? 1 : 0;
  const snowVal = snow ? 1 : 0;
  return `${host}${path}/256/${zoom}/${x}/${y}/${colorScheme}/${smoothVal}_${snowVal}.png`;
}
