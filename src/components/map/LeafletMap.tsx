import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { OSM_TILE_URL, OSM_ATTRIBUTION } from '../../../js/components/map.js';
import { fetchRadarMetadata, RadarData, RadarFrame } from '../../services/radarService';
import { CloudRain } from 'lucide-react';

// Fix Leaflet's default icon paths in bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: '',
});
L.Marker.prototype.options.icon = defaultIcon;

interface LeafletMapProps {
  lat: number;
  lng: number;
  villageName: string;
  district: string;
  state: string;
  status?: 'GREEN' | 'AMBER' | 'RED';
  zoom?: number;
  isDarkMode?: boolean;
  className?: string;
}

// Subcomponent to dynamically recenter when coordinates change
function ChangeMapView({ coords, zoom }: { coords: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom, { animate: true });
  }, [coords, zoom, map]);
  return null;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  lat,
  lng,
  villageName,
  district,
  state,
  status = 'GREEN',
  zoom = 10,
  isDarkMode = false,
  className = 'h-64 w-full rounded-2xl overflow-hidden',
}) => {
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [radarData, setRadarData] = useState<RadarData | null>(null);

  useEffect(() => {
    fetchRadarMetadata().then((data) => setRadarData(data));
  }, []);

  const latestFrame: RadarFrame | null =
    radarData && radarData.frames.length > 0
      ? radarData.frames[radarData.frames.length - 1]
      : null;

  const statusColor =
    status === 'RED'
      ? '#e11d48'
      : status === 'AMBER'
      ? '#f59e0b'
      : '#10b981';

  return (
    <div className={`relative ${className} border border-slate-200 dark:border-slate-700 shadow-inner z-0`}>
      {/* Radar Toggle Button */}
      <div className="absolute top-2 right-2 z-[400]">
        <button
          type="button"
          onClick={() => setShowRadar(!showRadar)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all backdrop-blur-md ${
            showRadar
              ? 'bg-sky-500 text-white shadow-sky-500/30 ring-1 ring-sky-300'
              : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>{showRadar ? 'Radar: ON' : 'Radar: OFF'}</span>
        </button>
      </div>

      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <ChangeMapView coords={[lat, lng]} zoom={zoom} />

        {/* Standard Cartographic OpenStreetMap Tile Service */}
        <TileLayer
          attribution={OSM_ATTRIBUTION}
          url={
            isDarkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : OSM_TILE_URL
          }
          maxZoom={19}
        />

        {/* Weather Radar / Precipitation Tile Layer */}
        {showRadar && latestFrame && (
          <TileLayer
            key={latestFrame.path}
            url={`${radarData?.host || 'https://tilecache.rainviewer.com'}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.7}
            maxZoom={19}
          />
        )}

        {/* Dynamic agro-meteorological radius ring */}
        <Circle
          center={[lat, lng]}
          radius={5000} // 5 km agro-radar radius
          pathOptions={{
            color: statusColor,
            fillColor: statusColor,
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '4, 4',
          }}
        />

        <Marker position={[lat, lng]}>
          <Popup>
            <div className="p-1 text-xs">
              <strong className="block text-sm font-bold text-slate-900">{villageName}</strong>
              <div className="text-slate-600">
                {district}, {state}
              </div>
              <div className="mt-1 flex items-center gap-1 font-semibold text-slate-800">
                <span>GPS:</span>
                <span>
                  {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
                </span>
              </div>
              <div
                className="mt-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-white text-center"
                style={{ backgroundColor: statusColor }}
              >
                Monsoon Status: {status}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Cartographic source attribution watermark pill */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
        OpenStreetMap • {showRadar ? 'Live Precipitation Radar' : 'Cartographic Service'}
      </div>
    </div>
  );
};
