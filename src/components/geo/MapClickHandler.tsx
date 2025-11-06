import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GeoFeature, GeoLayer } from '../../lib/geo/types/geoTypes';
import React from 'react';

interface MapClickHandlerProps {
  onRightClick: (feature: GeoFeature, latlng: L.LatLng) => void;
  onMapReady: (map: L.Map) => void;
  zoomToLayerId: string | null;
  layers: GeoLayer[];
  onZoomComplete: () => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({
  onRightClick,
  onMapReady,
  zoomToLayerId,
  layers,
  onZoomComplete
}) => {
  const map = useMapEvents({
    ready: () => {
      onMapReady(map);
    },
    contextmenu: (e) => {
      // Right click on map
      // In a real implementation, we'd need to detect which feature was clicked
      // For now, just log
      // console.log('Right click at:', e.latlng);
    }
  });

  React.useEffect(() => {
    if (zoomToLayerId && map) {
      const layer = layers.find(l => l.id === zoomToLayerId);
      if (!layer || layer.features.length === 0) {
        onZoomComplete();
        return;
      }
      const allLatLngs: L.LatLngExpression[] = [];
      layer.features.forEach(feature => {
        if (feature.type === 'Point') {
          const [lng, lat] = feature.coordinates;
          if (!isNaN(lat) && !isNaN(lng)) {
            allLatLngs.push([lat, lng]);
          }
        } else if (feature.type === 'Polygon') {
          const coords = feature.coordinates[0];
          coords.forEach((coord: number[]) => {
            if (!isNaN(coord[1]) && !isNaN(coord[0])) {
              allLatLngs.push([coord[1], coord[0]]);
            }
          });
        } else if (feature.type === 'MultiPolygon') {
          feature.coordinates.forEach((polygon: any) => {
            const coords = polygon[0];
            coords.forEach((coord: number[]) => {
              if (!isNaN(coord[1]) && !isNaN(coord[0])) {
                allLatLngs.push([coord[1], coord[0]]);
              }
            });
          });
        }
      });
      if (allLatLngs.length === 0) {
        onZoomComplete();
        return;
      }
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
        animate: true,
        duration: 1.0
      });
      onZoomComplete();
    }
  }, [zoomToLayerId, map, layers, onZoomComplete]);

  return null;
};

export default MapClickHandler;
