// Utilitário para carregar arquivos GeoJSON ou SHP.zip da pasta pública do projeto
// Exemplo de uso: await loadGeoFileFromServer('car_12345.geojson')

export async function loadGeoFileFromServer(filename: string): Promise<any> {
	// Caminho relativo à pasta public/geo
	const url = `/geo/${filename}`;
	const ext = filename.split('.').pop()?.toLowerCase();

	if (ext === 'geojson' || ext === 'json') {
		const resp = await fetch(url);
		if (!resp.ok) throw new Error('Erro ao carregar arquivo GeoJSON');
		return await resp.json();
	}

	if (ext === 'zip' || ext === 'shp') {
		// Para SHP.zip, use shpjs para ler o arquivo
		// Certifique-se de ter shpjs instalado: npm install shpjs
		// @ts-ignore
		const shp = await import('shpjs');
		const resp = await fetch(url);
		if (!resp.ok) throw new Error('Erro ao carregar arquivo SHP/ZIP');
		const arrayBuffer = await resp.arrayBuffer();
		return await shp.default(arrayBuffer);
	}

	throw new Error('Formato de arquivo não suportado');
}
