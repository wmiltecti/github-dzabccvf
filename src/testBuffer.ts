import { calcularBuffer } from "@/lib/geo/bufferCalculations";

const exemplo = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-63.9, -8.7],
            [-63.9, -8.8],
            [-63.8, -8.8],
            [-63.8, -8.7],
            [-63.9, -8.7],
          ],
        ],
      },
      properties: { id: 1 },
    },
  ],
};

const resultado = calcularBuffer(exemplo, 500);
console.log(JSON.stringify(resultado, null, 2));
