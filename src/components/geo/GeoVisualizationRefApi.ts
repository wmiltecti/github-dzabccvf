// API de métodos expostos via ref do GeoVisualization

export interface GeoVisualizationRefApi {
  loadGeoFile: (filename: string) => Promise<void>;
  importGeoFileFromServer: (filename: string) => Promise<void>;
}
