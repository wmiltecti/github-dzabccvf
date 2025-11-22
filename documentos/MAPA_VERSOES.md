# Referência de Versões de Mapas

## 🗺️ MAP v1.0 - React Leaflet (Implementação Atual)

### Componentes:
- **GeoVisualization** (`src/components/geo/GeoVisualization.tsx`)
  - Componente principal de visualização de mapas
  - Usa React Leaflet
  - 1469 linhas
  
- **ImovelGeoPanel** (`src/components/ImovelGeoPanel.tsx`)
  - Panel que encapsula o GeoVisualization
  - Interface de controle do mapa
  
- **GeoUpload** (`src/components/geo/GeoUpload.tsx`)
  - Upload de arquivos georreferenciados
  - Formatos: Shapefile, GeoJSON, KML
  
- **GeoSettings** (`src/components/geo/GeoSettings.tsx`)
  - Configurações do mapa
  
- **GeoExport** (`src/components/geo/GeoExport.tsx`)
  - Exportação de dados georreferenciados
  
- **GeoColorPicker** (`src/components/geo/GeoColorPicker.tsx`)
  - Seletor de cores para camadas do mapa

### Telas que usam MAP v1.0:
1. **ImovelPage** (`src/pages/inscricao/ImovelPage.tsx`)
2. **ImovelWorkflowPage** (`src/pages/inscricao/workflow/ImovelWorkflowPage.tsx`)
3. **ImovelWorkflowPageMotor** (`src/pages/inscricao/workflow/ImovelWorkflowPageMotor.tsx`)
4. **Step1Caracteristicas** (`src/components/Step1Caracteristicas.tsx`)
5. **DadosGeraisEmpreendimentoPage** (`src/pages/empreendimento/DadosGeraisEmpreendimentoPage.tsx`)

### Tecnologia:
- **React Leaflet** (biblioteca de mapas JavaScript)
- **Leaflet** 1.9.4
- **@types/leaflet** 1.9.21

---

## 🗺️ MAP v2.0 - GeoFront Integration (Nova Implementação)

### Implementação:
```html
<iframe 
  src="https://geofront-frontend.onrender.com/index-refactored-ro.html?processo=PROC-2024-002"
  width="100%" 
  height="800px" 
  frameborder="0">
</iframe>
```

### Características:
- **URL Base**: `https://geofront-frontend.onrender.com/`
- **Endpoint**: `/index-refactored-ro.html`
- **Parâmetros**: `?processo={process_id}`
- **Modo**: Read-only (ro)
- **Integração**: Via iframe

### Diferenças entre v1.0 e v2.0:

| Aspecto | MAP v1.0 | MAP v2.0 |
|---------|----------|----------|
| Tecnologia | React Leaflet | GeoFront (iframe) |
| Hospedagem | Local (componente React) | Externo (Render.com) |
| Integração | Nativa React | iframe embedding |
| Modo | Interativo | Read-only |
| Dados | API local | Parâmetro URL |
| Customização | Total (código próprio) | Limitada (iframe) |

### Uso Proposto:
- Visualização de processos existentes
- Modo leitura para consulta
- Integração rápida sem necessidade de desenvolvimento

---

## 📝 Notas de Implementação:

### Quando usar MAP v1.0:
- Cadastro/edição de imóveis
- Upload de arquivos georreferenciados
- Interação completa com camadas
- Customização de estilos e cores

### Quando usar MAP v2.0:
- Visualização rápida de processos
- Consulta de dados georreferenciados
- Integração externa sem necessidade de manutenção
- Modo read-only

---

**Data de criação**: 21/11/2025
**Contexto**: Documentação para referência no Copilot

Com base na busca, aqui estão as telas que tem mapas associados:

ImovelPage (ImovelPage.tsx)

Tela de cadastro de Imóvel na inscrição
Usa ImovelGeoPanel
ImovelWorkflowPage (ImovelWorkflowPage.tsx)

Tela de Imóvel no workflow de inscrição
Usa ImovelGeoPanel
ImovelWorkflowPageMotor (ImovelWorkflowPageMotor.tsx)

Tela de Imóvel no workflow com motor BPMN
Usa ImovelGeoPanel
Step1Caracteristicas (Step1Caracteristicas.tsx)

Step 1 do wizard de nova solicitação
Usa ImovelGeoPanel
DadosGeraisEmpreendimentoPage (DadosGeraisEmpreendimentoPage.tsx)

Tem upload de arquivos georreferenciados
Usa GeoUpload
Componentes de Mapa:

GeoVisualization - Componente principal de visualização de mapas (Leaflet)
ImovelGeoPanel - Panel que encapsula o GeoVisualization
GeoUpload - Upload de arquivos geo (Shapefile, GeoJSON, KML)
GeoSettings - Configurações do mapa
GeoExport - Exportação de dados geo
GeoColorPicker - Seletor de cores para camadas
Tecnologia: React Leaflet (biblioteca de mapas)
