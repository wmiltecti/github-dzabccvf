interface OutorgaFormData {
  id: string;
  tipo: string;
  numero: string;
  validade: string;
  vazao: string;
}

interface OutorgaAPIPayload {
  tipo: string;
  numero: string;
  validade: string;
  vazao: number;
}

interface OutorgasPayload {
  processo_id: string;
  outorgas: OutorgaAPIPayload[];
}

interface OutorgaAPIResponse {
  tipo: string;
  numero: string;
  validade: string;
  vazao: number;
}

function transformOutorgasToAPI(outorgas: OutorgaFormData[]): OutorgaAPIPayload[] {
  return outorgas.map(outorga => ({
    tipo: outorga.tipo,
    numero: outorga.numero,
    validade: outorga.validade,
    vazao: parseFloat(outorga.vazao)
  }));
}

function transformOutorgasFromAPI(outorgas: OutorgaAPIResponse[]): OutorgaFormData[] {
  return outorgas.map((outorga, index) => ({
    id: `${Date.now()}-${index}`,
    tipo: outorga.tipo,
    numero: outorga.numero,
    validade: outorga.validade,
    vazao: outorga.vazao.toString()
  }));
}

export async function saveOutorgas(processoId: string, outorgas: OutorgaFormData[]): Promise<void> {
  console.log('🌊 [outorgasService] Salvando outorgas...');
  console.log('📝 Processo ID:', processoId);
  console.log('📊 Outorgas:', outorgas);

  if (!outorgas || outorgas.length === 0) {
    console.log('ℹ️ [outorgasService] Nenhuma outorga para salvar');
    return;
  }

  const outorgasTransformadas = transformOutorgasToAPI(outorgas);
  const payload: OutorgasPayload = {
    processo_id: processoId,
    outorgas: outorgasTransformadas
  };

  console.log('📤 Payload de outorgas:', payload);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/outorgas`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      console.error('❌ [outorgasService] Erro na API:', errorData);
      throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log('✅ [outorgasService] Outorgas salvas com sucesso!');
    console.log('📨 Response da API:', resultado);
  } catch (error: any) {
    console.error('❌ [outorgasService] Erro ao salvar outorgas:', error);
    throw error;
  }
}

export async function loadOutorgas(processoId: string): Promise<OutorgaFormData[]> {
  console.log('🔍 [outorgasService] Carregando outorgas...');
  console.log('📝 Processo ID:', processoId);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/outorgas?processo_id=${processoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 404) {
      console.log('ℹ️ [outorgasService] Nenhuma outorga encontrada (processo sem outorgas)');
      return [];
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      console.error('❌ [outorgasService] Erro na API:', errorData);
      throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
    }

    const apiData = await response.json();
    console.log('📥 [outorgasService] Outorgas carregadas da API:', apiData);

    const outorgas = apiData.outorgas || [];
    const outorgasTransformadas = transformOutorgasFromAPI(outorgas);
    console.log('✅ [outorgasService] Outorgas transformadas:', outorgasTransformadas);

    return outorgasTransformadas;
  } catch (error: any) {
    console.error('❌ [outorgasService] Erro ao carregar outorgas:', error);
    return [];
  }
}
