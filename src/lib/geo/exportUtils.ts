import type { FeatureCollection, Geometry } from 'geojson';

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

export function exportarGeoJSON(layer: GeoLayer): void {
  const geojson: FeatureCollection<Geometry> = {
    type: 'FeatureCollection',
    features: layer.features.map(feat => ({
      type: 'Feature',
      geometry: {
        type: feat.type,
        coordinates: feat.coordinates
      },
      properties: {
        id: feat.id,
        name: feat.name,
        ...feat.properties
      }
    }))
  };

  const content = JSON.stringify(geojson, null, 2);
  const blob = new Blob([content], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(layer.name)}.geojson`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ GeoJSON exportado: ${layer.name}`);
}

export function exportarFeatureCollection(fc: FeatureCollection<Geometry>, filename: string): void {
  const content = JSON.stringify(fc, null, 2);
  const blob = new Blob([content], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(filename)}.geojson`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ FeatureCollection exportada: ${filename}`);
}

export function exportarKML(layer: GeoLayer): void {
  const placemarks = layer.features.map(feat => {
    const coords = formatCoordinatesForKML(feat.type, feat.coordinates);
    const geometryTag = getKMLGeometryTag(feat.type, coords);

    return `
    <Placemark>
      <name>${escapeXML(feat.name)}</name>
      <description>${escapeXML(JSON.stringify(feat.properties))}</description>
      <Style>
        <LineStyle>
          <color>ff0000ff</color>
          <width>2</width>
        </LineStyle>
        <PolyStyle>
          <color>4d0000ff</color>
          <fill>1</fill>
          <outline>1</outline>
        </PolyStyle>
      </Style>
      ${geometryTag}
    </Placemark>`;
  }).join('');

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXML(layer.name)}</name>
    <description>Exportado do Sistema de Licenciamento Ambiental</description>
    ${placemarks}
  </Document>
</kml>`;

  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(layer.name)}.kml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ KML exportado: ${layer.name}`);
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatCoordinatesForKML(type: string, coordinates: any): string {
  if (type === 'Point') {
    const [lng, lat] = coordinates;
    return `${lng},${lat},0`;
  } else if (type === 'Polygon') {
    return coordinates[0].map((coord: number[]) => `${coord[0]},${coord[1]},0`).join(' ');
  } else if (type === 'MultiPolygon') {
    return coordinates[0][0].map((coord: number[]) => `${coord[0]},${coord[1]},0`).join(' ');
  }
  return '';
}

function getKMLGeometryTag(type: string, coords: string): string {
  if (type === 'Point') {
    return `<Point><coordinates>${coords}</coordinates></Point>`;
  } else if (type === 'Polygon' || type === 'MultiPolygon') {
    return `<Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coords}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>`;
  }
  return '';
}

export function exportarCSV(layer: GeoLayer): void {
  const headers = ['id', 'name', 'type', 'geometry'];
  const rows = layer.features.map(feat => {
    return [
      feat.id,
      `"${feat.name}"`,
      feat.type,
      `"${JSON.stringify(feat.coordinates)}"`,
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(layer.name)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ CSV exportado: ${layer.name}`);
}
