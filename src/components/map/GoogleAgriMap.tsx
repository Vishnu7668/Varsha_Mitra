import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { useApp } from '../../context/AppContext';
import { VillageLocation, RealtimeDistrictWeatherData, AdvisoryResult } from '../../types';
import {
  MapPin,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  CheckCircle,
  Radio,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Crosshair,
  Layers,
  Sparkles,
  Info,
  Clock,
  Eye,
  EyeOff,
  Navigation,
  Loader2,
  Compass,
} from 'lucide-react';
import {
  fetchRadarMetadata,
  RadarData,
  RadarFrame,
  RADAR_COLOR_PALETTES,
  RADAR_LEGEND,
} from '../../services/radarService';
import { GoogleRadarOverlay } from './GoogleRadarOverlay';
import { GoogleAgriCircle } from './GoogleAgriCircle';

interface GoogleAgriMapProps {
  village: VillageLocation;
  weatherData?: RealtimeDistrictWeatherData | null;
  advisory?: AdvisoryResult | null;
  onSelectCoords?: (lat: number, lng: number, placeName?: string) => void;
  className?: string;
}

interface UserLocationState {
  lat: number;
  lng: number;
  accuracy?: number;
  placeName?: string;
  timestamp: number;
}

// Controller to smoothly pan and zoom to updated coordinates
const CameraPanController: React.FC<{
  lat: number;
  lng: number;
  zoom?: number;
  triggerKey?: number;
}> = ({ lat, lng, zoom, triggerKey }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo({ lat, lng });
      if (typeof zoom === 'number') {
        map.setZoom(zoom);
      }
    }
  }, [map, lat, lng, zoom, triggerKey]);
  return null;
};

export const GoogleAgriMap: React.FC<GoogleAgriMapProps> = ({
  village,
  weatherData,
  advisory,
  onSelectCoords,
  className = 'h-96 w-full',
}) => {
  const { detectLiveLocation, isLocatingGPS, showToast, setVillage } = useApp();

  const [selectedMarkerType, setSelectedMarkerType] = useState<'station' | 'user' | null>('station');
  const [mapTypeId, setMapTypeId] = useState<'hybrid' | 'roadmap' | 'satellite' | 'terrain'>('hybrid');
  
  // Current user GPS location state
  const [userLocation, setUserLocation] = useState<UserLocationState | null>(null);
  const [isLocatingThisMap, setIsLocatingThisMap] = useState<boolean>(false);
  const [targetCamera, setTargetCamera] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
    triggerKey: number;
  }>({
    lat: village.lat,
    lng: village.lng,
    zoom: 12,
    triggerKey: Date.now(),
  });

  // Radar & Precipitation Layer State
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.75);
  const [colorPalette, setColorPalette] = useState<number>(2); // 2 = Universal Rainbow Doppler
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(true);
  const [showControlsDeck, setShowControlsDeck] = useState<boolean>(true);
  const [showRadarCircle, setShowRadarCircle] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Sync camera when village prop updates from outside
  useEffect(() => {
    setTargetCamera((prev) => ({
      lat: village.lat,
      lng: village.lng,
      zoom: prev.zoom || 12,
      triggerKey: Date.now(),
    }));
  }, [village.lat, village.lng]);

  // Handle "Show My Current Location" button click
  const handleShowCurrentLocation = useCallback(() => {
    setIsLocatingThisMap(true);
    showToast('Acquiring high-accuracy GPS coordinates for Google Maps...', 'info');

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy || 60;

          let placeLabel = `Current Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;

          // Reverse geocode via Google Geocoding API if key is present
          try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAAoNTNBsb_JVxs9YCm9STK3YkcqI4ymz4';
            if (apiKey) {
              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
                { signal: AbortSignal.timeout(4000) }
              );
              if (res.ok) {
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                  placeLabel = data.results[0].formatted_address;
                }
              }
            }
          } catch (e) {
            console.warn('Geocoding fallback:', e);
          }

          const newLoc: UserLocationState = {
            lat,
            lng,
            accuracy,
            placeName: placeLabel,
            timestamp: Date.now(),
          };

          setUserLocation(newLoc);
          setSelectedMarkerType('user');
          setTargetCamera({
            lat,
            lng,
            zoom: 15, // Detailed view of fields and surroundings
            triggerKey: Date.now(),
          });
          setIsLocatingThisMap(false);

          if (onSelectCoords) {
            onSelectCoords(lat, lng, placeLabel);
          } else {
            detectLiveLocation();
          }

          showToast(
            `Google Maps centered on your current location (±${Math.round(accuracy)}m accuracy)`,
            'success'
          );
        },
        (err) => {
          console.warn('Browser GPS prompt denied or timed out:', err);
          setIsLocatingThisMap(false);
          showToast('Requesting location via network fallback...', 'info');
          detectLiveLocation();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocatingThisMap(false);
      detectLiveLocation();
    }
  }, [detectLiveLocation, onSelectCoords, showToast]);

  // Fetch real-time weather radar frames
  useEffect(() => {
    let isMounted = true;
    setIsLoadingRadar(true);

    fetchRadarMetadata()
      .then((data) => {
        if (!isMounted) return;
        setRadarData(data);
        // Default to latest live frame
        if (data.frames.length > 0) {
          setCurrentFrameIndex(data.frames.length - 1);
        }
      })
      .catch((err) => {
        console.error('Error fetching radar data:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRadar(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Animation playback interval for radar frames
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isPlaying || !radarData || radarData.frames.length <= 1) {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
      return;
    }

    playTimerRef.current = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % radarData.frames.length);
    }, 650); // 650ms per frame for smooth Doppler rain progression

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, radarData]);

  // Current active frame
  const currentFrame: RadarFrame | null =
    radarData && radarData.frames.length > 0
      ? radarData.frames[currentFrameIndex] || radarData.frames[radarData.frames.length - 1]
      : null;

  // Status color based on advisory
  const statusColor =
    advisory?.status === 'RED'
      ? '#ef4444' // red-500
      : advisory?.status === 'GREEN'
      ? '#10b981' // emerald-500
      : '#f59e0b'; // amber-500

  // Click on map to place new farm pin
  const handleMapClick = useCallback(
    (e: any) => {
      if (e.detail?.latLng && onSelectCoords) {
        const lat = e.detail.latLng.lat;
        const lng = e.detail.latLng.lng;
        onSelectCoords(lat, lng, `Farm Plot (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`);
      }
    },
    [onSelectCoords]
  );

  return (
    <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-slate-950 flex flex-col">
      {/* Top Map Header & Controls */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-10 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        {/* Farm & Station Badge */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-emerald-500/40 text-[11px] sm:text-xs font-semibold text-white shadow-lg flex items-center gap-1.5 sm:gap-2">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-emerald-300">{village.name}</span>
          <span className="text-slate-400 hidden xs:inline">|</span>
          <span className="text-slate-300 hidden xs:inline">{village.district}</span>
        </div>

        {/* View & Radar Toggle Controls */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 backdrop-blur-md p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-white/10 shadow-lg flex-wrap">
          {/* Map Base Layer Modes */}
          <button
            type="button"
            onClick={() => setMapTypeId('hybrid')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              mapTypeId === 'hybrid'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapTypeId('roadmap')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              mapTypeId === 'roadmap'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Street
          </button>
          <button
            type="button"
            onClick={() => setMapTypeId('terrain')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              mapTypeId === 'terrain'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Terrain
          </button>

          <div className="h-4 w-px bg-white/20 mx-0.5" />

          {/* PRIMARY SHOW MY CURRENT LOCATION BUTTON */}
          <button
            type="button"
            onClick={handleShowCurrentLocation}
            disabled={isLocatingThisMap || isLocatingGPS}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              isLocatingThisMap || isLocatingGPS
                ? 'bg-blue-800 text-blue-100 cursor-wait'
                : userLocation
                ? 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white ring-2 ring-blue-400/50 shadow-blue-500/30'
                : 'bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white'
            }`}
            title="Show My Current Location on Google Maps"
          >
            {isLocatingThisMap || isLocatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-white animate-bounce" />
            )}
            <span>
              {isLocatingThisMap || isLocatingGPS
                ? 'Locating...'
                : userLocation
                ? 'Center My Location'
                : 'Show My Current Location'}
            </span>
          </button>

          <div className="h-4 w-px bg-white/20 mx-0.5" />

          {/* PRIMARY TOGGLE: Weather Radar & Precipitation Layer */}
          <button
            type="button"
            onClick={() => {
              const nextState = !showRadar;
              setShowRadar(nextState);
              if (nextState) setShowControlsDeck(true);
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 shadow-md ${
              showRadar
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/30 ring-2 ring-sky-400/50'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Real-Time Weather Radar & Precipitation Layer"
          >
            <CloudRain className={`w-3.5 h-3.5 ${showRadar ? 'text-amber-300 animate-bounce' : 'text-slate-400'}`} />
            <span>Weather Radar</span>
            {showRadar && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>

          {/* 5km Radius Ring Toggle */}
          <button
            type="button"
            onClick={() => setShowRadarCircle(!showRadarCircle)}
            className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
              showRadarCircle
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle 5km Agro-Climatic Station Radius"
          >
            <Radio className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Google Maps Canvas */}
      <div className={`relative ${className}`} style={{ minHeight: '400px' }}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: village.lat, lng: village.lng }}
          defaultZoom={12}
          mapTypeId={mapTypeId}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={handleMapClick}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          <CameraPanController
            lat={targetCamera.lat}
            lng={targetCamera.lng}
            zoom={targetCamera.zoom}
            triggerKey={targetCamera.triggerKey}
          />

          {/* Real-time Precipitation Radar Overlay */}
          <GoogleRadarOverlay
            active={showRadar}
            frame={currentFrame}
            host={radarData?.host || 'https://tilecache.rainviewer.com'}
            opacity={radarOpacity}
            colorPalette={colorPalette}
            smooth={true}
          />

          {/* 5km Agro-Climatic Radius Circle for Station */}
          <GoogleAgriCircle
            center={{ lat: village.lat, lng: village.lng }}
            radiusMeters={5000}
            color={statusColor}
            visible={showRadarCircle}
          />

          {/* Accuracy Circle for User's Current Location */}
          {userLocation && (
            <GoogleAgriCircle
              center={{ lat: userLocation.lat, lng: userLocation.lng }}
              radiusMeters={Math.max(userLocation.accuracy || 60, 40)}
              color="#3b82f6"
              visible={true}
            />
          )}

          {/* Primary Farm / Station Marker */}
          <AdvancedMarker
            position={{ lat: village.lat, lng: village.lng }}
            onClick={() => setSelectedMarkerType('station')}
            title={`${village.name} - Agro-Climatic Station`}
          >
            <div className="relative cursor-pointer group">
              {/* Outer pulsing ring */}
              <div
                className="absolute -inset-2 rounded-full opacity-60 animate-ping"
                style={{ backgroundColor: statusColor }}
              />

              {/* Styled pin container */}
              <div
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-2xl border-2 border-white transition-transform group-hover:scale-110"
                style={{ backgroundColor: statusColor }}
              >
                <MapPin className="w-3.5 h-3.5 fill-current" />
                <span className="font-mono">{village.name}</span>
                {weatherData && (
                  <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px]">
                    {weatherData.temperature}°C
                  </span>
                )}
              </div>
            </div>
          </AdvancedMarker>

          {/* DEDICATED USER CURRENT LOCATION MARKER */}
          {userLocation && (
            <AdvancedMarker
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              onClick={() => setSelectedMarkerType('user')}
              title="Your Current Location (GPS)"
              zIndex={120}
            >
              <div className="relative cursor-pointer flex items-center justify-center">
                {/* Dynamic pulsing waves */}
                <div className="absolute w-10 h-10 rounded-full bg-blue-500/30 animate-ping" />
                <div className="absolute w-14 h-14 rounded-full bg-blue-400/20 animate-pulse" />

                {/* Native Google Maps Blue Beacon Dot */}
                <div className="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center ring-2 ring-blue-500/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Floating Tag */}
                <div className="absolute -top-7 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-lg border border-white/90">
                  📍 You Are Here
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* User Current Location Info Window */}
          {selectedMarkerType === 'user' && userLocation && (
            <InfoWindow
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              onCloseClick={() => setSelectedMarkerType(null)}
            >
              <div className="p-2.5 max-w-xs text-slate-900 space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                    <h4 className="font-black text-sm text-blue-950">
                      Your Current Location
                    </h4>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Live GPS
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium">
                  {userLocation.placeName || `${village.name}, ${village.district}`}
                </p>

                <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-200/60 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Coordinates:</span>
                    <span className="font-mono font-bold text-blue-900">
                      {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
                    </span>
                  </div>
                  {userLocation.accuracy && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Accuracy:</span>
                      <span className="text-blue-800 font-semibold">
                        Within ±{Math.round(userLocation.accuracy)}m
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectCoords) {
                        onSelectCoords(
                          userLocation.lat,
                          userLocation.lng,
                          userLocation.placeName || 'My Current Location'
                        );
                      }
                      showToast('Farm profile calibrated to your current GPS position!', 'success');
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Set As Active Farm Location</span>
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Station Info Window */}
          {selectedMarkerType === 'station' && (
            <InfoWindow
              position={{ lat: village.lat, lng: village.lng }}
              onCloseClick={() => setSelectedMarkerType(null)}
            >
              <div className="p-2 max-w-xs text-slate-900 space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <h4 className="font-bold text-sm text-emerald-900">
                    {village.name}
                  </h4>
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: statusColor }}
                  >
                    {advisory?.status || 'Active'}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Block: <strong>{village.block}</strong> • {village.district}, {village.state}
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-slate-100">
                  <div className="bg-slate-50 p-1.5 rounded flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                    <span>Temp: <strong>{weatherData?.temperature ?? 31}°C</strong></span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-sky-500" />
                    <span>Rain (7d): <strong>{advisory?.expectedRainNext7Days || 0}mm</strong></span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Soil: <strong>{weatherData ? Math.round((weatherData.volumetricSoilMoisture0to3cm ?? 0.28) * 100) : 52}%</strong></span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Wind: <strong>{weatherData?.windSpeed ?? 12} km/h</strong></span>
                  </div>
                </div>

                {advisory && (
                  <div className="mt-1 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                    <div className="font-bold flex items-center gap-1 mb-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sowing Advisory:</span>
                    </div>
                    <p className="line-clamp-2">{advisory.summary}</p>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-center font-mono">
                  Coordinates: {village.lat.toFixed(4)}°N, {village.lng.toFixed(4)}°E
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Floating Google Maps Target GPS FAB */}
        <div className="absolute right-3.5 bottom-16 sm:bottom-20 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleShowCurrentLocation();
            }}
            disabled={isLocatingThisMap || isLocatingGPS}
            aria-label="Show My Current Location on Google Maps"
            title="Show My Current Location on Google Maps"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white shadow-2xl border border-white/20 flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition-all cursor-pointer group active:scale-95 backdrop-blur-md"
          >
            {isLocatingThisMap || isLocatingGPS ? (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            ) : (
              <Crosshair className="w-5 h-5 text-slate-200 group-hover:text-blue-400 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* Floating Radar Control Deck (Docked at Bottom-Left / Center when Radar is Active) */}
      {showRadar && (
        <div className="border-t border-white/10 bg-slate-900/95 backdrop-blur-xl p-2.5 sm:p-4 text-white space-y-2.5 sm:space-y-3">
          {/* Top Row: Play/Pause, Frame Time, Speed, and Layer Opacity */}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            {/* Play/Pause & Live Frame Indicator */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
                title={isPlaying ? 'Pause Radar Loop' : 'Play Radar Precipitation Loop'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play Radar'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (radarData && radarData.frames.length > 0) {
                    setIsPlaying(false);
                    setCurrentFrameIndex(radarData.frames.length - 1);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Jump directly to real-time live radar scan"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden xs:inline">Jump to</span>
                <span>Live</span>
              </button>

              {/* Timestamp & Relative Age Badge */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/70 border border-slate-700/60 px-2.5 sm:px-3 py-1 rounded-xl text-xs">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-mono font-bold text-sky-300 text-[11px] sm:text-xs">
                  {currentFrame?.formattedTime || 'Loading...'}
                </span>
                <span className={`px-1.5 py-0.2 rounded-md font-bold text-[10px] ${
                  currentFrame?.relativeLabel.includes('LIVE')
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {currentFrame?.relativeLabel || 'Live'}
                </span>
              </div>
            </div>

            {/* Opacity Slider & Palette Selector */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Opacity Slider */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 border border-slate-800 px-2 sm:px-2.5 py-1 rounded-xl text-xs">
                <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  <span className="hidden xs:inline">Opacity:</span>
                </span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={Math.round(radarOpacity * 100)}
                  onChange={(e) => setRadarOpacity(Number(e.target.value) / 100)}
                  className="w-16 xs:w-20 sm:w-24 h-1.5 accent-sky-400 cursor-pointer rounded-lg bg-slate-700"
                />
                <span className="font-mono text-[10px] sm:text-[11px] text-sky-300 min-w-[28px] sm:min-w-[32px] text-right">
                  {Math.round(radarOpacity * 100)}%
                </span>
              </div>

              {/* Color Scheme Picker */}
              <select
                value={colorPalette}
                onChange={(e) => setColorPalette(Number(e.target.value))}
                className="bg-slate-950/80 border border-slate-700/70 text-slate-200 text-xs rounded-xl px-2 py-1 focus:ring-1 focus:ring-sky-400 focus:outline-none font-medium max-w-[120px] sm:max-w-none truncate"
              >
                {RADAR_COLOR_PALETTES.map((pal) => (
                  <option key={pal.id} value={pal.id}>
                    {pal.name}
                  </option>
                ))}
              </select>

              {/* Legend Toggle */}
              <button
                type="button"
                onClick={() => setShowLegend(!showLegend)}
                className={`p-1.5 rounded-xl border text-xs transition-all ${
                  showLegend
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Radar Intensity Legend"
              >
                {showLegend ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Timeline Scrubber Bar across available 12+ radar scans */}
          {radarData && radarData.frames.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={radarData.frames.length - 1}
                  value={currentFrameIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentFrameIndex(Number(e.target.value));
                  }}
                  className="w-full h-2 accent-emerald-400 cursor-pointer rounded-lg bg-slate-800"
                />
              </div>

              {/* Time ticks indicator */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
                <span>{radarData.frames[0]?.relativeLabel || '2h ago'} ({radarData.frames[0]?.formattedTime})</span>
                <span className="text-center text-slate-500 hidden sm:inline">
                  Drag timeline or play loop to visualize rain clouds &amp; storm trajectory
                </span>
                <span className="text-emerald-400 font-bold">
                  {radarData.frames[radarData.frames.length - 1]?.relativeLabel} ({radarData.frames[radarData.frames.length - 1]?.formattedTime})
                </span>
              </div>
            </div>
          )}

          {/* Radar Intensity Color Legend */}
          {showLegend && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold text-slate-300">Rainfall Intensity (Doppler dBZ):</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {RADAR_LEGEND.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded-lg text-[10px]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-300">{item.label}</span>
                    <span className="text-slate-400 font-mono">({item.rate})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Hint Footbar */}
      <div className="px-4 py-2 bg-slate-900 text-slate-300 text-xs flex flex-wrap items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click anywhere on the Google Map in India to pin your exact farm field!</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            IMD &amp; Doppler Meteorological Satellite Stream
          </span>
          <span>•</span>
          <span>Google Maps Platform</span>
        </div>
      </div>
    </div>
  );
};
