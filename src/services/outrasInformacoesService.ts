// Service para integração da Aba 6 - Outras Informações com FastAPI

interface OutrasInformacoesPayload {
  processo_id: string;
  previsao_supressao_vegetacao: boolean | null;
  impacto_quilombolas: boolean | null;
  impacto_bens_culturais: boolean | null;
  utilizacao_agrotoxicos: boolean | null;
  implantacao_area_app: boolean | null;
  cultivo_especies_hibridas_exoticas: boolean | null;
  tanques_instalados_curso_agua: boolean | null;
  sistema_tratamento_aguas: boolean | null;
  interferencia_corpos_hidricos: boolean | null;
  barragem_rejeitos: boolean | null;
  outras_informacoes_relevantes: string | null;
}

interface OutrasInformacoesResponse {
  id: string;
  processo_id: string;
  previsao_supressao_vegetacao: boolean | null;
  impacto_quilombolas: boolean | null;
  impacto_bens_culturais: boolean | null;
  utilizacao_agrotoxicos: boolean | null;
  implantacao_area_app: boolean | null;
  cultivo_especies_hibridas_exoticas: boolean | null;
  tanques_instalados_curso_agua: boolean | null;
  sistema_tratamento_aguas: boolean | null;
  interferencia_corpos_hidricos: boolean | null;
  barragem_rejeitos: boolean | null;
  outras_informacoes_relevantes: string | null;
  inserted_at?: string;
  updated_at?: string;
}

/**
 * Mapeamento entre IDs do formulário e campos da API
 */
const FIELD_MAPPING: Record<string, string> = {
  usaRecursosNaturais: 'previsao_supressao_vegetacao',
  geraEfluentesLiquidos: 'impacto_quilombolas',
  geraEmissoesAtmosfericas: 'impacto_bens_culturais',
  geraResiduosSolidos: 'utilizacao_agrotoxicos',
  geraRuidosVibracao: 'implantacao_area_app',
  localizadoAreaProtegida: 'cultivo_especies_hibridas_exoticas',
  necessitaSupressaoVegetacao: 'tanques_instalados_curso_agua',
  interfereCursoAgua: 'sistema_tratamento_aguas',
  armazenaSubstanciaPerigosa: 'interferencia_corpos_hidricos',
  possuiPlanoEmergencia: 'barragem_rejeitos',
};

/**
 * Transforma os dados do formulário (UI) para o formato da API
 * Converte estrutura {respostas: {campo: boolean}} para campos individuais
 */
export function transformToAPI(formData: any, processoId: string): OutrasInformacoesPayload {
  const respostas = formData.respostas || {};

  const payload: any = {
    processo_id: processoId,
  };

  // Mapear cada campo do formulário para o campo correspondente da API
  Object.keys(FIELD_MAPPING).forEach(formKey => {
    const apiKey = FIELD_MAPPING[formKey];
    const value = respostas[formKey];

    // Converter undefined para null (pergunta não respondida)
    payload[apiKey] = value === undefined ? null : value;
  });

  // Campo de texto livre
  payload.outras_informacoes_relevantes = formData.outrasInformacoes?.trim() || null;

  return payload as OutrasInformacoesPayload;
}

/**
 * Transforma os dados da API para o formato do formulário (UI)
 * Converte campos individuais de volta para estrutura {respostas: {campo: boolean}}
 */
export function transformFromAPI(apiData: OutrasInformacoesResponse): any {
  const respostas: Record<string, boolean | null> = {};

  // Mapear cada campo da API de volta para o campo do formulário
  Object.keys(FIELD_MAPPING).forEach(formKey => {
    const apiKey = FIELD_MAPPING[formKey];
    respostas[formKey] = (apiData as any)[apiKey] ?? null;
  });

  return {
    respostas,
    outrasInformacoes: apiData.outras_informacoes_relevantes || '',
  };
}

/**
 * Salva os dados de outras informações na API (PUT - upsert)
 */
export async function saveOutrasInformacoes(
  processoId: string,
  formData: any
): Promise<OutrasInformacoesResponse> {
  console.log('🚀 [outrasInformacoesService] Iniciando salvamento de outras informações...');
  console.log('📝 Processo ID:', processoId);
  console.log('📊 Dados do formulário:', formData);

  // Transformar dados para formato da API
  const payload = transformToAPI(formData, processoId);
  console.log('📤 Payload a ser enviado para API:', payload);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/processos/${processoId}/outras-informacoes`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      console.error('❌ [outrasInformacoesService] Erro na API:', errorData);
      throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log('✅ [outrasInformacoesService] Dados salvos com sucesso na API!');
    console.log('📨 Response da API:', resultado);

    return resultado;
  } catch (error: any) {
    console.error('❌ [outrasInformacoesService] Erro ao salvar:', error);
    throw error;
  }
}

/**
 * Carrega os dados de outras informações da API (GET)
 */
export async function loadOutrasInformacoes(processoId: string): Promise<any | null> {
  console.log('🔍 [outrasInformacoesService] Carregando dados de outras informações...');
  console.log('📝 Processo ID:', processoId);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/processos/${processoId}/outras-informacoes`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Se não encontrou dados (404), retorna null - não é um erro
    if (response.status === 404) {
      console.log('ℹ️ [outrasInformacoesService] Nenhum dado encontrado (processo novo)');
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      console.error('❌ [outrasInformacoesService] Erro na API:', errorData);
      throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
    }

    const apiData = await response.json();
    console.log('📥 [outrasInformacoesService] Dados carregados da API:', apiData);

    // Transformar dados da API para formato do formulário
    const formData = transformFromAPI(apiData);
    console.log('✅ [outrasInformacoesService] Dados transformados para o formulário:', formData);

    return formData;
  } catch (error: any) {
    console.error('❌ [outrasInformacoesService] Erro ao carregar:', error);
    // Não propaga o erro - retorna null e deixa o formulário vazio
    return null;
  }
}
