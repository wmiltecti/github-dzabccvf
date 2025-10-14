import buffer from '@turf/buffer';
import difference from '@turf/difference';
import { featureCollection, feature, polygon, multiPolygon, point } from '@turf/helpers';
import type { Feature, Geometry } from 'geojson';

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

function geoFeatureToTurfFeature(geoFeature: GeoFeature): Feature<Geometry> {
  let geom: Geometry;

  if (geoFeature.type === 'Point') {
    const [lng, lat] = geoFeature.coordinates;
    geom = point([lng, lat]).geometry;
  } else if (geoFeature.type === 'Polygon') {
    geom = polygon(geoFeature.coordinates).geometry;
  } else if (geoFeature.type === 'MultiPolygon') {
    geom = multiPolygon(geoFeature.coordinates).geometry;
  } else {
    throw new Error(`Tipo de geometria não suportado: ${geoFeature.type}`);
  }

  return feature(geom, geoFeature.properties || {});
}

export function calcularBuffer(layer: GeoLayer, distanciaMetros: number): GeoLayer {
  if (!layer || !layer.features || layer.features.length === 0) {
    throw new Error('Camada inválida ou sem features');
  }

  if (!Number.isFinite(distanciaMetros) || distanciaMetros <= 0) {
    throw new Error('Distância deve ser maior que zero');
  }

  console.log('🎯 Calculando buffer para camada:', layer.name);
  console.log('📏 Distância:', distanciaMetros, 'metros');
  console.log('📊 Features na camada:', layer.features.length);

  const bufferedFeatures: GeoFeature[] = [];
  const distanciaKm = distanciaMetros / 1000;

  layer.features.forEach((geoFeat, index) => {
    try {
      const turfFeat = geoFeatureToTurfFeature(geoFeat);

      const buffered = buffer(turfFeat, distanciaKm, {
        units: 'kilometers',
        steps: 16
      });

      if (!buffered || !buffered.geometry) {
        console.warn('⚠️ Não foi possível gerar buffer para feature:', geoFeat.name);
        return;
      }

      const bufferedCoordinates = buffered.geometry.coordinates;
      const bufferedType = buffered.geometry.type as 'Polygon' | 'MultiPolygon';

      bufferedFeatures.push({
        id: `${geoFeat.id}-buffer`,
        name: `${geoFeat.name} (Buffer ${distanciaMetros}m)`,
        type: bufferedType,
        coordinates: bufferedCoordinates,
        properties: {
          ...geoFeat.properties,
          bufferDistance: distanciaMetros,
          originalFeatureId: geoFeat.id,
          originalFeatureName: geoFeat.name
        },
        layerId: `${layer.id}-buffer`
      });

      console.log(`✅ Buffer calculado para feature ${index + 1}/${layer.features.length}: ${geoFeat.name}`);
    } catch (error) {
      console.error(`❌ Erro ao calcular buffer para feature ${geoFeat.name}:`, error);
    }
  });

  if (bufferedFeatures.length === 0) {
    throw new Error('Não foi possível calcular buffer para nenhuma feature');
  }

  const bufferLayer: GeoLayer = {
    id: `${layer.id}-buffer`,
    name: `Zona de Amortecimento - ${layer.name} (${distanciaMetros}m)`,
    features: bufferedFeatures,
    visible: true,
    color: '#3B82F6',
    opacity: 0.4,
    source: 'imported',
    uploadedAt: new Date().toISOString(),
    featureCount: bufferedFeatures.length
  };

  console.log('✅ Buffer calculado com sucesso!');
  console.log('📊 Features com buffer:', bufferedFeatures.length);

  return bufferLayer;
}

export function subtrairGeometrias(baseLayer: GeoLayer, referenceLayer: GeoLayer): GeoLayer {
  if (!baseLayer || !baseLayer.features || baseLayer.features.length === 0) {
    throw new Error('Camada base inválida ou sem features');
  }

  if (!referenceLayer || !referenceLayer.features || referenceLayer.features.length === 0) {
    throw new Error('Camada de referência inválida ou sem features');
  }

  console.log('🎯 Subtraindo geometrias');
  console.log('📍 Base:', baseLayer.name, '- Features:', baseLayer.features.length);
  console.log('📍 Referência:', referenceLayer.name, '- Features:', referenceLayer.features.length);

  const resultFeatures: GeoFeature[] = [];

  baseLayer.features.forEach((baseFeature, index) => {
    try {
      if (baseFeature.type === 'Point') {
        console.warn('⚠️ Tipo Point não suportado para subtração, mantendo original');
        resultFeatures.push(baseFeature);
        return;
      }

      let currentFeature = geoFeatureToTurfFeature(baseFeature);

      referenceLayer.features.forEach((refFeature) => {
        try {
          if (refFeature.type === 'Point') {
            return;
          }

          const refTurfFeature = geoFeatureToTurfFeature(refFeature);

          const diff = difference(featureCollection([currentFeature, refTurfFeature]));

          if (diff && diff.geometry) {
            currentFeature = diff;
          }
        } catch (error) {
          console.warn('⚠️ Erro ao subtrair feature de referência:', error);
        }
      });

      if (currentFeature && currentFeature.geometry) {
        resultFeatures.push({
          id: `${baseFeature.id}-subtracted`,
          name: `${baseFeature.name} (Subtraído)`,
          type: currentFeature.geometry.type as 'Polygon' | 'MultiPolygon',
          coordinates: currentFeature.geometry.coordinates,
          properties: {
            ...baseFeature.properties,
            subtracted: true,
            originalFeatureId: baseFeature.id
          },
          layerId: `${baseLayer.id}-subtracted`
        });

        console.log(`✅ Subtração concluída para feature ${index + 1}/${baseLayer.features.length}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao subtrair geometria da feature ${baseFeature.name}:`, error);
      resultFeatures.push(baseFeature);
    }
  });

  const resultLayer: GeoLayer = {
    id: `${baseLayer.id}-subtracted`,
    name: `${baseLayer.name} - Subtraído`,
    features: resultFeatures,
    visible: true,
    color: baseLayer.color,
    opacity: baseLayer.opacity,
    source: 'imported',
    uploadedAt: new Date().toISOString(),
    featureCount: resultFeatures.length
  };

  console.log('✅ Subtração concluída!');
  console.log('📊 Features resultantes:', resultFeatures.length);

  return resultLayer;
}

export function calcularBufferComSubtracao(
  baseLayer: GeoLayer,
  referenceLayer: GeoLayer,
  distanciaMetros: number
): GeoLayer {
  console.log('🎯 Iniciando cálculo de zona de amortecimento com subtração');

  const bufferLayer = calcularBuffer(baseLayer, distanciaMetros);

  console.log('📊 Buffer gerado, iniciando subtração...');

  const finalLayer = subtrairGeometrias(bufferLayer, referenceLayer);

  finalLayer.name = `Zona de Amortecimento - ${baseLayer.name} (${distanciaMetros}m) - Subtraído`;
  finalLayer.color = '#06B6D4';
  finalLayer.opacity = 0.5;

  console.log('✅ Zona de amortecimento calculada com sucesso!');

  return finalLayer;
}

export default calcularBuffer;
