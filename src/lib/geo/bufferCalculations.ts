// src/lib/geo/bufferCalculations.ts
import buffer from '@turf/buffer'
import difference from '@turf/difference'
import intersect from '@turf/intersect'
import area from '@turf/area'
import length from '@turf/length'
import { featureCollection } from '@turf/helpers'
import type { Feature, FeatureCollection, Geometry, Polygon, MultiPolygon } from 'geojson'

type AnyFeat = Feature<Geometry, Record<string, any>>

export function calcularBuffer(
  layer: FeatureCollection<Geometry>,
  distanciaMetros: number,
  steps: number = 16
): FeatureCollection<Geometry> {
  if (!layer || !Array.isArray(layer.features) || layer.features.length === 0) {
    throw new Error('Camada inválida: sem features.')
  }
  if (!Number.isFinite(distanciaMetros) || distanciaMetros <= 0) {
    throw new Error('Distância inválida: informe metros > 0.')
  }

  const out: AnyFeat[] = []

  for (const f of layer.features) {
    if (!f || !f.geometry) continue
    try {
      const bf = buffer(f as AnyFeat, distanciaMetros, { units: 'meters', steps }) as AnyFeat
      if (bf && bf.geometry) {
        bf.properties = {
          ...(f.properties || {}),
          _buffer_m: distanciaMetros,
          _buffer_steps: steps,
        }
        out.push(bf)
      }
    } catch (e) {
      console.warn('Falha ao gerar buffer de uma feição:', e)
    }
  }

  if (out.length === 0) {
    throw new Error('Nenhuma geometria pôde ser “bufferizada”.')
  }

  return featureCollection(out)
}

/**
 * Subtrai TODAS as feições de `referencia` de cada feição em `alvo`.
 * Implementação iterativa, pois turf.difference opera par-a-par.
 */
export function calcularDiferenca(
  alvo: FeatureCollection<Geometry>,
  referencia: FeatureCollection<Geometry>
): FeatureCollection<Geometry> {
  if (!alvo?.features?.length) return featureCollection([])
  if (!referencia?.features?.length) return alvo

  const result: AnyFeat[] = []

  for (const f of alvo.features as AnyFeat[]) {
    if (!f?.geometry) continue
    let atual: AnyFeat | null = f

    for (const g of referencia.features as AnyFeat[]) {
      if (!atual) break
      if (!g?.geometry) continue
      try {
        const diff = difference(atual as AnyFeat, g as AnyFeat) as AnyFeat | null
        atual = diff ?? null
      } catch (e) {
        console.warn('Falha em difference(); mantendo geometria atual.', e)
      }
    }

    if (atual && atual.geometry) {
      result.push(atual)
    }
  }

  return featureCollection(result)
}

/**
 * Calcula a interseção entre todas as features de dois FeatureCollections.
 * Útil para obter apenas a área de sobreposição entre buffer e referência.
 */
export function calcularIntersecao(
  alvo: FeatureCollection<Geometry>,
  referencia: FeatureCollection<Geometry>
): FeatureCollection<Geometry> {
  if (!alvo?.features?.length) return featureCollection([])
  if (!referencia?.features?.length) return featureCollection([])

  const result: AnyFeat[] = []

  for (const f of alvo.features as AnyFeat[]) {
    if (!f?.geometry) continue

    for (const g of referencia.features as AnyFeat[]) {
      if (!g?.geometry) continue
      try {
        const inter = intersect(f as AnyFeat, g as AnyFeat) as AnyFeat | null
        if (inter && inter.geometry) {
          inter.properties = {
            ...(f.properties || {}),
            ...(g.properties || {}),
            _intersected: true
          }
          result.push(inter)
        }
      } catch (e) {
        console.warn('Falha em intersect(); ignorando par.', e)
      }
    }
  }

  return featureCollection(result)
}

/**
 * Pipeline completo: buffer(base, d) -> difference(com referencia)
 */
export function calcularBufferComSubtracao(
  base: FeatureCollection<Geometry>,
  referencia: FeatureCollection<Geometry>,
  distanciaMetros: number,
  steps: number = 16
): FeatureCollection<Geometry> {
  const buf = calcularBuffer(base, distanciaMetros, steps)
  return calcularDiferenca(buf, referencia)
}

export interface FeatureMetrics {
  id: string;
  name: string;
  areaM2: number;
  areaHa: number;
  perimetroKm: number;
}

export interface LayerMetrics {
  totalAreaM2: number;
  totalAreaHa: number;
  totalPerimetroKm: number;
  features: FeatureMetrics[];
}

export function calcularArea(geojson: FeatureCollection<Geometry>): LayerMetrics {
  if (!geojson || !Array.isArray(geojson.features) || geojson.features.length === 0) {
    throw new Error('GeoJSON inválido ou sem features');
  }

  console.log('📐 Calculando áreas e perímetros...');
  console.log('📊 Total de features:', geojson.features.length);

  const featuresMetrics: FeatureMetrics[] = [];
  let totalAreaM2 = 0;
  let totalPerimetroKm = 0;

  geojson.features.forEach((feature, index) => {
    if (!feature || !feature.geometry) {
      console.warn('⚠️ Feature sem geometria, pulando...');
      return;
    }

    try {
      let featureAreaM2 = 0;
      let featurePerimetroKm = 0;

      const geomType = feature.geometry.type;

      if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
        featureAreaM2 = area(feature as Feature<Polygon | MultiPolygon>);

        try {
          featurePerimetroKm = length(feature as Feature<Polygon | MultiPolygon>, { units: 'kilometers' });
        } catch (e) {
          console.warn('⚠️ Erro ao calcular perímetro:', e);
        }
      } else if (geomType === 'Point' || geomType === 'MultiPoint') {
        console.warn('⚠️ Geometria do tipo Point não possui área/perímetro');
        return;
      } else {
        console.warn('⚠️ Tipo de geometria não suportado para cálculo de área:', geomType);
        return;
      }

      const featureAreaHa = featureAreaM2 / 10000;

      const featureName = feature.properties?.name ||
                          feature.properties?.originalFeatureName ||
                          `Feature ${index + 1}`;

      const featureId = feature.properties?.id ||
                        feature.properties?.originalFeatureId ||
                        `feat-${index}`;

      featuresMetrics.push({
        id: featureId,
        name: featureName,
        areaM2: featureAreaM2,
        areaHa: featureAreaHa,
        perimetroKm: featurePerimetroKm
      });

      totalAreaM2 += featureAreaM2;
      totalPerimetroKm += featurePerimetroKm;

      console.log(`✅ Feature ${index + 1}/${geojson.features.length}: ${featureName} - ${featureAreaHa.toFixed(2)} ha`);
    } catch (error) {
      console.error(`❌ Erro ao calcular métricas da feature ${index + 1}:`, error);
    }
  });

  const totalAreaHa = totalAreaM2 / 10000;

  console.log('✅ Cálculos concluídos!');
  console.log(`📊 Área total: ${totalAreaHa.toFixed(2)} ha (${totalAreaM2.toFixed(2)} m²)`);
  console.log(`📊 Perímetro total: ${totalPerimetroKm.toFixed(2)} km`);

  return {
    totalAreaM2,
    totalAreaHa,
    totalPerimetroKm,
    features: featuresMetrics
  };
}

export default calcularBuffer
