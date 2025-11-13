# Sugestão de Estrutura Modular para Funções Geo

## Diretórios principais

- `src/lib/geo/layers/`  
  Camadas e componentes de visualização (ex: PolygonLayer, RasterLayer, LayerControls)
- `src/lib/geo/services/`  
  Serviços de domínio geo: importação/exportação, integração com APIs externas, cálculos de buffer, métricas, etc.
- `src/lib/geo/utils/`  
  Funções utilitárias genéricas: loaders, parsers, helpers, validações, etc.
- `src/lib/geo/types/`  
  Tipos TypeScript compartilhados: GeoFeature, GeoLayer, GeoJson, etc.

## Exemplo de arquivos futuros

- `layers/PolygonLayer.tsx` — Camada de polígonos
- `layers/LayerControls.tsx` — Componente de controle de visibilidade/ordem
- `services/carService.ts` — Serviço para lógica de CAR (importação, validação, etc)
- `services/metricsService.ts` — Cálculo de métricas de área, perímetro, etc
- `utils/geoFileLoader.ts` — Loader de arquivos geo (GeoJSON, SHP, ZIP)
- `utils/geoValidators.ts` — Funções de validação de arquivos geo
- `types/geoTypes.ts` — Tipos compartilhados

## Recomendações
- Centralize exports em cada `index.ts` para facilitar imports.
- Separe lógica de visualização (layers) da lógica de domínio (services) e utilitários (utils).
- Use tipos compartilhados para garantir consistência entre módulos.

---

Esta estrutura facilita a escalabilidade, manutenção e onboarding de novos devs para o domínio geo.
