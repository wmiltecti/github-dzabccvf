import type { FeatureCollection, Geometry } from 'geojson';
import { feature, polygon, multiPolygon, point } from '@turf/helpers';

interface GeoFeature {
  id: string;
  name: string;
  type: 'Point' | 'Polygon' | 'MultiPolygon';
  coordinates: any;
  properties: any;
  layerId: string;
}

interface GeoLayer {
  id: string;
  name: string;
  features: GeoFeature[];
  visible: boolean;
  color: string;
  opacity: number;
  source: 'system' | 'imported';
  uploadedAt?: string;
  featureCount: number;
}

export function geoLayerToFeatureCollection(layer: GeoLayer): FeatureCollection<Geometry> {
  const features = layer.features.map((geoFeat) => {
    let geom: Geometry;

    if (geoFeat.type === 'Point') {
      const [lng, lat] = geoFeat.coordinates;
      geom = point([lng, lat]).geometry;
    } else if (geoFeat.type === 'Polygon') {
      geom = polygon(geoFeat.coordinates).geometry;
    } else if (geoFeat.type === 'MultiPolygon') {
      geom = multiPolygon(geoFeat.coordinates).geometry;
    } else {
      throw new Error(`Tipo de geometria não suportado: ${geoFeat.type}`);
    }

    return feature(geom, {
      ...geoFeat.properties,
      id: geoFeat.id,
      name: geoFeat.name,
      layerId: geoFeat.layerId
    });
  });

  return {
    type: 'FeatureCollection',
    features
  };
}
