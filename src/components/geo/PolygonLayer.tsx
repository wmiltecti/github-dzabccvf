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
  console.log('[PolygonLayer] feature:', feature);
  console.log('[PolygonLayer] feature.type:', feature.type);
  console.log('[PolygonLayer] feature.coordinates:', feature.coordinates);
  if (feature.type === 'MultiPolygon') {
    try {
      feature.coordinates.forEach((polygon: any, i: number) => {
        console.log(`[PolygonLayer] MultiPolygon polygon[${i}]`, polygon);
        polygon.forEach((ring: any, j: number) => {
          console.log(`[PolygonLayer]   ring[${j}]`, ring);
        });
      });
    } catch (e) {
      console.warn('[PolygonLayer] Erro ao logar MultiPolygon:', e);
    }
  }
  // Suporte correto a MultiPolygon: retorna array de polígonos, cada um com seus anéis
  const convertCoordinates = (coords: any): L.LatLngExpression[][][] | L.LatLngExpression[][] => {
    if (feature.type === 'MultiPolygon') {
      // MultiPolygon: [[[ [ [lng, lat], ... ], ... ]], ...]
      return coords.map((polygon: any) =>
        polygon.map((ring: any) =>
          ring.map((coord: any) => [coord[1], coord[0]] as L.LatLngExpression)
        )
      );
    } else if (feature.type === 'Polygon') {
      // Polygon: [ [ [lng, lat], ... ], ... ]
      return coords.map((ring: any) =>
        ring.map((coord: any) => [coord[1], coord[0]] as L.LatLngExpression)
      );
    }
    return [];
  };

  const positions = convertCoordinates(feature.coordinates);
  console.log('[PolygonLayer] positions (convertCoordinates):', positions);

  if (feature.type === 'Polygon' && feature.coordinates.length > 1) {
    console.log(`🍩 Polígono com buraco detectado: ${feature.name}`, {
      rings: feature.coordinates.length,
      outerRingPoints: feature.coordinates[0].length,
      holes: feature.coordinates.length - 1
    });
  }

  // Para MultiPolygon, renderizar um <Polygon> para cada polígono
  if (feature.type === 'MultiPolygon' && Array.isArray(positions)) {
    console.log('[PolygonLayer] Renderizando MultiPolygon:', positions.length, 'polígonos');
    return (
      <>
        {(positions as L.LatLngExpression[][][]).map((polygon, idx) => {
          console.log(`[PolygonLayer] Renderizando Polygon idx=${idx}`, polygon);
          return (
            <Polygon
              key={feature.id + '-' + idx}
              positions={polygon}
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
                {/* ...popup content as before... */}
              </Popup>
            </Polygon>
          );
        })}
      </>
    );
  }

  // Polygon simples
  return (
    <Polygon
      positions={positions as L.LatLngExpression[][]}
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
        {/* ...popup content as before... */}
      </Popup>
    </Polygon>
  );
};

export default PolygonLayer;
