// Tipos compartilhados para contexto geo

export interface GeoFeature {
	id: string;
	name: string;
	type: 'Point' | 'Polygon' | 'MultiPolygon';
	coordinates: any;
	properties: any;
	layerId: string;
}

export interface GeoLayer {
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
