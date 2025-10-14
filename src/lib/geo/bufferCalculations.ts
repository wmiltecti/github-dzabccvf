// src/lib/geo/bufferCalculations.ts
import buffer from '@turf/buffer'
import difference from '@turf/difference'
import { featureCollection } from '@turf/helpers'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

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

export default calcularBuffer
