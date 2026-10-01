import React, { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface GoogleAgriCircleProps {
  center: { lat: number; lng: number };
  radiusMeters?: number;
  color?: string;
  visible?: boolean;
}

export const GoogleAgriCircle: React.FC<GoogleAgriCircleProps> = ({
  center,
  radiusMeters = 5000,
  color = '#10b981',
  visible = true,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !visible || typeof google === 'undefined' || !google.maps) {
      return;
    }

    const circle = new google.maps.Circle({
      map,
      center,
      radius: radiusMeters,
      fillColor: color,
      fillOpacity: 0.12,
      strokeColor: color,
      strokeWeight: 2,
      strokeOpacity: 0.75,
      clickable: false,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, center.lat, center.lng, radiusMeters, color, visible]);

  return null;
};
