/**
 * Geocoding API Service for VarshaMitra
 * - Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com/v1/search
 *   Powers debounced search for Indian villages, blocks, districts, cities, and PIN codes.
 * - BigDataCloud Reverse Geocoding: https://api.bigdatacloud.net/data/reverse-geocode-client
 *   Resolves GPS coordinates from navigator.geolocation into village / block administrative names.
 */

import { VillageLocation } from '../types';

export interface GeocodedLocation {
  id: string;
  name: string;
  district: string;
  block: string;
  state: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  elevation?: number;
  postcode?: string;
  displayName: string;
}

export interface ReverseGeocodedResult {
  name: string;
  block: string;
  district: string;
  state: string;
  country: string;
  countryCode: string;
  postcode?: string;
  lat: number;
  lng: number;
}

const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const BIGDATACLOUD_REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

/**
 * Search Indian locations by name, block, district, or PIN code using Open-Meteo Geocoding API
 */
export async function searchLocationsWithOpenMeteo(
  query: string,
  count: number = 10
): Promise<GeocodedLocation[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();
  const url = `${OPEN_METEO_GEOCODING_URL}?name=${encodeURIComponent(
    cleanQuery
  )}&count=${count}&language=en&format=json&countryCode=IN`;

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

    return data.results.map((item: any) => {
      const state = item.admin1 || 'India';
      const district = item.admin2 || item.admin3 || item.name;
      const block = item.admin3 || item.admin2 || item.name;
      const displayName = [
        item.name,
        item.admin2 && item.admin2 !== item.name ? item.admin2 : null,
        item.admin1,
      ]
        .filter(Boolean)
        .join(', ');

      return {
        id: `om-${item.id}`,
        name: item.name,
        district,
        block,
        state,
        country: item.country || 'India',
        countryCode: item.country_code || 'IN',
        lat: Number(item.latitude),
        lng: Number(item.longitude),
        elevation: item.elevation,
        postcode: item.postcodes?.[0] || '',
        displayName,
      };
    });
  } catch (error) {
    console.warn('[VarshaMitra Geocoding] Search error:', error);
    return [];
  }
}

/**
 * Reverse geocode latitude and longitude using BigDataCloud
 * Resolves GPS coordinates into village/block/district administrative names
 */
export async function reverseGeocodeWithBigDataCloud(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodedResult> {
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

    const admin = Array.isArray(data.localityInfo?.administrative)
      ? data.localityInfo.administrative
      : [];
    const stateObj = admin.find((a: any) => a.adminLevel === 4);
    const districtObj = admin.find(
      (a: any) => a.adminLevel === 5 || a.adminLevel === 6
    );
    const blockObj = admin.find(
      (a: any) => a.adminLevel === 6 || a.adminLevel === 7
    );

    const villageName =
      data.locality || data.city || blockObj?.name || 'Local Village';
    const district = districtObj?.name || data.city || 'District';
    const block = blockObj?.name || data.locality || district;
    const state = stateObj?.name || data.principalSubdivision || 'Maharashtra';

    return {
      name: villageName,
      block,
      district,
      state,
      country: data.countryName || 'India',
      countryCode: data.countryCode || 'IN',
      postcode: data.postcode || '',
      lat: Number(latitude),
      lng: Number(longitude),
    };
  } catch (error) {
    console.warn('[VarshaMitra Geocoding] BigDataCloud reverse geocode error:', error);
    return {
      name: `GPS Point (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`,
      block: 'Local Block',
      district: 'Local District',
      state: 'India',
      country: 'India',
      countryCode: 'IN',
      lat: Number(latitude),
      lng: Number(longitude),
    };
  }
}

/**
 * Converts a GeocodedLocation or ReverseGeocodedResult to a VillageLocation structure
 */
export function toVillageLocation(
  loc: GeocodedLocation | ReverseGeocodedResult,
  fallbackBase?: Partial<VillageLocation>
): VillageLocation {
  return {
    id: `geo-${loc.lat.toFixed(4)}-${loc.lng.toFixed(4)}`,
    name: loc.name,
    nameHi: fallbackBase?.nameHi || loc.name,
    nameMr: fallbackBase?.nameMr || loc.name,
    block: loc.block,
    district: loc.district,
    state: loc.state,
    lat: loc.lat,
    lng: loc.lng,
    defaultCrop: fallbackBase?.defaultCrop || 'Soybean',
    defaultSoil: fallbackBase?.defaultSoil || 'Black',
    registeredFarmers: fallbackBase?.registeredFarmers || 540,
    cultivatedAcreage: fallbackBase?.cultivatedAcreage || 1600,
  };
}
