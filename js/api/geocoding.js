/**
 * Geocoding API Service for VarshaMitra
 * - Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com/v1/search
 *   Powers debounced search for Indian villages, blocks, districts, cities, and PIN codes.
 * - BigDataCloud Reverse Geocoding: https://api.bigdatacloud.net/data/reverse-geocode-client
 *   Resolves GPS coordinates from navigator.geolocation into village / block administrative names.
 */

const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const BIGDATACLOUD_REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

/**
 * Search Indian locations by name or PIN code using Open-Meteo Geocoding API
 * @param {string} query - Location name or PIN code
 * @param {number} count - Maximum results (default 10)
 * @returns {Promise<Array>} List of matching locations
 */
export async function searchLocations(query, count = 10) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();
  const url = `${OPEN_METEO_GEOCODING_URL}?name=${encodeURIComponent(cleanQuery)}&count=${count}&language=en&format=json&countryCode=IN`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Open-Meteo Geocoding returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item) => ({
      id: `om-${item.id}`,
      name: item.name,
      district: item.admin2 || item.admin3 || item.name,
      block: item.admin3 || item.admin2 || item.name,
      state: item.admin1 || 'India',
      country: item.country || 'India',
      countryCode: item.country_code || 'IN',
      lat: item.latitude,
      lng: item.longitude,
      elevation: item.elevation,
      postcode: item.postcodes?.[0] || '',
      displayName: `${item.name}, ${item.admin2 ? item.admin2 + ', ' : ''}${item.admin1 || ''}`,
    }));
  } catch (error) {
    console.warn('[VarshaMitra Geocoding] Search error:', error);
    return [];
  }
}

/**
 * Reverse geocode latitude and longitude using BigDataCloud
 * Resolves GPS coordinates into village/block/district administrative names
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Resolved location details
 */
export async function reverseGeocodeGPS(latitude, longitude) {
  const url = `${BIGDATACLOUD_REVERSE_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`BigDataCloud Reverse Geocoding returned HTTP ${res.status}`);
    }

    const data = await res.json();

    // Extract village/block/district hierarchy from administrative array or locality fields
    const admin = data.localityInfo?.administrative || [];
    const stateObj = admin.find((a) => a.adminLevel === 4);
    const districtObj = admin.find((a) => a.adminLevel === 5 || a.adminLevel === 6);
    const blockObj = admin.find((a) => a.adminLevel === 6 || a.adminLevel === 7);

    const villageName = data.locality || data.city || blockObj?.name || 'Local Agro Station';
    const district = districtObj?.name || data.city || 'Agro District';
    const block = blockObj?.name || data.locality || district;
    const state = stateObj?.name || data.principalSubdivision || 'Maharashtra';

    return {
      name: villageName,
      block: block,
      district: district,
      state: state,
      country: data.countryName || 'India',
      countryCode: data.countryCode || 'IN',
      postcode: data.postcode || '',
      lat: Number(latitude),
      lng: Number(longitude),
      raw: data,
    };
  } catch (error) {
    console.warn('[VarshaMitra Geocoding] BigDataCloud reverse geocode error:', error);
    return {
      name: `GPS Point (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`,
      block: 'Local Block',
      district: 'Local District',
      state: 'India',
      country: 'India',
      lat: Number(latitude),
      lng: Number(longitude),
    };
  }
}
