import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { RadarFrame, getRadarTileUrl } from '../../services/radarService';

interface GoogleRadarOverlayProps {
  active: boolean;
  frame: RadarFrame | null;
  host: string;
  opacity: number;
  colorPalette: number;
  smooth: boolean;
}

export const GoogleRadarOverlay: React.FC<GoogleRadarOverlayProps> = ({
  active,
  frame,
  host,
  opacity,
  colorPalette,
  smooth,
}) => {
  const map = useMap();
  const currentTileLayerRef = useRef<google.maps.ImageMapType | null>(null);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) {
      return;
    }

    if (!active || !frame || !frame.path) {
      // Clear overlay
      if (currentTileLayerRef.current) {
        map.overlayMapTypes.clear();
        currentTileLayerRef.current = null;
      }
      return;
    }

    // Create fresh tile layer for the selected radar frame
    const tileLayer = new google.maps.ImageMapType({
      getTileUrl: (coord: google.maps.Point, zoom: number) => {
        // Wrap tile coordinate x within valid range [0, 2^zoom - 1]
        const numTiles = 1 << zoom;
        const x = ((coord.x % numTiles) + numTiles) % numTiles;
        const y = coord.y;
        if (y < 0 || y >= numTiles) {
          return '';
        }
        return getRadarTileUrl(host, frame.path, x, y, zoom, colorPalette, smooth, true);
      },
      tileSize: new google.maps.Size(256, 256),
      opacity: opacity,
      name: `RainViewer_${frame.time}`,
      maxZoom: 18,
    });

    currentTileLayerRef.current = tileLayer;
    map.overlayMapTypes.setAt(0, tileLayer);

    return () => {
      // Don't necessarily clear on every frame change to prevent flash,
      // but if unmounting or toggling off, clear.
    };
  }, [map, active, frame?.path, frame?.time, host, colorPalette, smooth]);

  // Dynamically update opacity without rebuilding layer
  useEffect(() => {
    if (currentTileLayerRef.current) {
      currentTileLayerRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (map && map.overlayMapTypes) {
        map.overlayMapTypes.clear();
      }
    };
  }, [map]);

  return null;
};
