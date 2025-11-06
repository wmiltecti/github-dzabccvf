import React from 'react';
import { Polygon, Popup } from 'react-leaflet';
import { GeoFeature } from '../../lib/geo/types/geoTypes';

interface PolygonLayerProps {
  feature: GeoFeature;
  color: string;
  opacity: number;
  onRightClick: (feature: GeoFeature, latlng: L.LatLng) => void;
}

const PolygonLayer: React.FC<PolygonLayerProps> = ({ feature, color, opacity, onRightClick }) => {
  const convertCoordinates = (coords: any): L.LatLngExpression[][] => {
    if (feature.type === 'MultiPolygon') {
      return coords[0].map((ring: any) =>
        ring.map((coord: any) => [coord[1], coord[0]] as L.LatLngExpression)
      );
    } else if (feature.type === 'Polygon') {
      return coords.map((ring: any) =>
        ring.map((coord: any) => [coord[1], coord[0]] as L.LatLngExpression)
      );
    }
    return [];
  };

  const positions = convertCoordinates(feature.coordinates);

  if (feature.type === 'Polygon' && feature.coordinates.length > 1) {
    console.log(`🍩 Polígono com buraco detectado: ${feature.name}`, {
      rings: feature.coordinates.length,
      outerRingPoints: feature.coordinates[0].length,
      holes: feature.coordinates.length - 1
    });
  }

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: color,
        weight: 2,
        opacity: 1.0,
        fillColor: color,
        fillOpacity: opacity * 0.4
      }}
      eventHandlers={{
        contextmenu: (e) => {
          e.originalEvent.preventDefault();
          onRightClick(feature, e.latlng);
        }
      }}
    >
      <Popup maxWidth={300}>
        <div className="text-sm">
          <h4 className="font-semibold text-gray-900 mb-2 text-base">{feature.name}</h4>
          <div className="space-y-1 mb-2">
            <p className="text-gray-600 flex items-center justify-between">
              <span className="font-medium">Tipo:</span>
              <span className="text-gray-800">{feature.type}</span>
            </p>
            {feature.properties?.area_ha && (
              <p className="text-green-600 flex items-center justify-between">
                <span className="font-medium">Área:</span>
                <span className="font-semibold">{Number(feature.properties.area_ha).toFixed(2)} ha</span>
              </p>
            )}
            {feature.properties?.area_m2 && (
              <p className="text-gray-500 flex items-center justify-between text-xs">
                <span>Área (m²):</span>
                <span>{Number(feature.properties.area_m2).toLocaleString('pt-BR')} m²</span>
              </p>
            )}
            {feature.properties?.perimeter_km && (
              <p className="text-blue-600 flex items-center justify-between">
                <span className="font-medium">Perímetro:</span>
                <span className="font-semibold">{Number(feature.properties.perimeter_km).toFixed(2)} km</span>
              </p>
            )}
            {feature.properties?.buffer_distance && (
              <p className="text-cyan-600 flex items-center justify-between">
                <span className="font-medium">Buffer:</span>
                <span className="font-semibold">{feature.properties.buffer_distance} m</span>
              </p>
            )}
          </div>
          {feature.properties && Object.keys(feature.properties).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Propriedades adicionais:</p>
              {Object.entries(feature.properties)
                .filter(([key]) => !['area_ha', 'area_m2', 'perimeter_km', 'buffer_distance', 'base_layer', 'reference_layer'].includes(key))
                .slice(0, 3)
                .map(([key, value]) => (
                  <div key={key} className="text-xs text-gray-500 flex justify-between">
                    <strong className="text-gray-600">{key}:</strong>
                    <span className="ml-2 text-right">{String(value).substring(0, 50)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Popup>
    </Polygon>
  );
};

export default PolygonLayer;
