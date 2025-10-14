// src/lib/geo/bufferCalculations.ts
import buffer from "@turf/buffer";
import { featureCollection } from "@turf/helpers";
import type { FeatureCollection, Geometry } from "geojson";

export function calcularBuffer(layer: FeatureCollection<Geometry>, distanciaMetros: number) {
  if (!layer || !layer.features || layer.features.length === 0) {
    throw new Error("Camada inválida: sem features.");
  }

  const results = [];

  for (const feat of layer.features) {
    try {
      const buffered = buffer(feat, distanciaMetros, { units: "meters" });
      if (buffered) results.push(buffered);
    } catch (err) {
      console.warn("Erro ao gerar buffer:", err);
    }
  }

  return featureCollection(results);
}
