/**
 * Leaflet & OpenStreetMap Interactive Map Component for VarshaMitra
 * Tile Service: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
 * Usage in VarshaMitra: Serves standard cartographic tiles for Leaflet.js interactive maps.
 */

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Helper to initialize or configure Leaflet map options
 * @param {Object} options
 * @returns {Object} Map configuration object
 */
export function getMapConfig(options = {}) {
  const {
    latitude = 20.5937,
    longitude = 78.9629,
    zoom = 6,
    isDark = false,
  } = options;

  return {
    center: [latitude, longitude],
    zoom,
    tileLayer: {
      url: isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : OSM_TILE_URL,
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    },
  };
}

/**
 * Returns color coding for risk status circles on OpenStreetMap
 * @param {'RED' | 'AMBER' | 'GREEN'} status
 * @returns {string} Hex color
 */
export function getRiskStatusColor(status) {
  switch (status) {
    case 'RED':
      return '#e11d48'; // Rose-600
    case 'AMBER':
      return '#f59e0b'; // Amber-500
    case 'GREEN':
      return '#16a34a'; // Emerald-600
    default:
      return '#0284c7'; // Sky-600
  }
}
