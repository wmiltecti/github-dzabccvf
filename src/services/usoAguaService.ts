// Service para integração da Aba 3 - Uso de Água com FastAPI

interface ConsumoAguaPayload {
  processo_id: string;
  origem_rede_publica: boolean;
  origem_poco_artesiano: boolean;
  origem_poco_cacimba: boolean;
  origem_captacao_superficial: boolean;
  origem_captacao_pluvial: boolean;
  origem_caminhao_pipa: boolean;
  origem_outro: boolean;
  origem_outro_texto: string | null;
  consumo_humano_m3_dia: number | null;
  consumo_outros_m3_dia: number | null;
  volume_despejo_m3_dia: number | null;
  destino_final: string;
  destino_final_outro_texto: string | null;
}

interface ConsumoAguaResponse {
  id: string;
  processo_id: string;
  origem_rede_publica: boolean;
  origem_poco_artesiano: boolean;
  origem_poco_cacimba: boolean;
  origem_captacao_superficial: boolean;
  origem_captacao_pluvial: boolean;
  origem_caminhao_pipa: boolean;
  origem_outro: boolean;
  origem_outro_texto: string | null;
  consumo_humano_m3_dia: number | null;
  consumo_outros_m3_dia: number | null;
  volume_despejo_m3_dia: number | null;
  destino_final: string;
  destino_final_outro_texto: string | null;
  inserted_at: string;
  updated_at: string;
}

/**
 * Transforma os dados do formulário (UI) para o formato da API
 * Converte array de strings em booleans individuais
 */
export function transformToAPI(formData: any, processoId: string): ConsumoAguaPayload {
  const origens = formData.origens || [];

  return {
    processo_id: processoId,
    origem_rede_publica: origens.includes('Rede Pública'),
    origem_poco_artesiano: origens.includes('Poço Artesiano'),
    origem_poco_cacimba: origens.includes('Poço Cacimba'),
    origem_captacao_superficial: origens.includes('Captação Superficial'),
    origem_captacao_pluvial: origens.includes('Captação Pluvial'),
    origem_caminhao_pipa: origens.includes('Caminhão Pipa'),
    origem_outro: origens.includes('Outro'),
    origem_outro_texto: formData.origemOutroTexto || null,
    consumo_humano_m3_dia: formData.consumoHumano ? parseFloat(formData.consumoHumano) : null,
    consumo_outros_m3_dia: formData.consumoOutros ? parseFloat(formData.consumoOutros) : null,
    volume_despejo_m3_dia: formData.volumeDespejo ? parseFloat(formData.volumeDespejo) : null,
    destino_final: formData.destinoFinal || '',
    destino_final_outro_texto: formData.destinoFinalOutroTexto || null
  };
}

/**
 * Transforma os dados da API para o formato do formulário (UI)
 * Converte booleans individuais de volta para array de strings
 */
export function transformFromAPI(apiData: ConsumoAguaResponse): any {
  const origens: string[] = [];

  if (apiData.origem_rede_publica) origens.push('Rede Pública');
  if (apiData.origem_poco_artesiano) origens.push('Poço Artesiano');
  if (apiData.origem_poco_cacimba) origens.push('Poço Cacimba');
  if (apiData.origem_captacao_superficial) origens.push('Captação Superficial');
  if (apiData.origem_captacao_pluvial) origens.push('Captação Pluvial');
  if (apiData.origem_caminhao_pipa) origens.push('Caminhão Pipa');
  if (apiData.origem_outro) origens.push('Outro');

  return {
    origens,
    origemOutroTexto: apiData.origem_outro_texto || '',
    consumoHumano: apiData.consumo_humano_m3_dia?.toString() || '',
    consumoOutros: apiData.consumo_outros_m3_dia?.toString() || '',
    volumeDespejo: apiData.volume_despejo_m3_dia?.toString() || '',
    destinoFinal: apiData.destino_final || '',
    destinoFinalOutroTexto: apiData.destino_final_outro_texto || '',
    // Outorgas não são persistidas na API ainda (conforme acordo com PO)
    outorgas: []
  };
}

/**
 * Valida os dados antes de enviar para a API
 */
function validateData(formData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar origens
  if (!formData.origens || formData.origens.length === 0) {
    errors.push('Selecione ao menos uma origem de água');
  }

  // Validar consumos - pelo menos um deve estar preenchido
  const temConsumoHumano = formData.consumoHumano && parseFloat(formData.consumoHumano) > 0;
  const temConsumoOutros = formData.consumoOutros && parseFloat(formData.consumoOutros) > 0;

  if (!temConsumoHumano && !temConsumoOutros) {
    errors.push('Informe ao menos um tipo de consumo (humano ou outros usos)');
  }

  // Validar volume de despejo
  if (!formData.volumeDespejo || parseFloat(formData.volumeDespejo) < 0) {
    errors.push('Informe o volume de despejo (pode ser 0)');
  }

  // Validar destino final
  if (!formData.destinoFinal) {
    errors.push('Selecione o destino final do efluente');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Salva os dados de uso de água na API
 */
export async function saveConsumoAgua(processoId: string, formData: any): Promise<ConsumoAguaResponse> {
  console.log('🚀 [usoAguaService] Iniciando salvamento do uso de água...');
  console.log('📝 Processo ID:', processoId);
  console.log('📊 Dados do formulário:', formData);

  // Validar dados
  const validation = validateData(formData);
  if (!validation.valid) {
    console.error('❌ [usoAguaService] Validação falhou:', validation.errors);
    throw new Error(validation.errors.join('; '));
  }

  console.log('✓ Validação de dados passou com sucesso');

  // Transformar dados para formato da API
  const payload = transformToAPI(formData, processoId);
  console.log('📤 Payload a ser enviado para API:', payload);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}consumo-agua`;
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
      console.error('❌ [usoAguaService] Erro na API:', errorData);
      throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log('✅ [usoAguaService] Dados salvos com sucesso na API!');
    console.log('📨 Response da API:', resultado);

    return resultado;
  } catch (error: any) {
    console.error('❌ [usoAguaService] Erro ao salvar:', error);
    throw error;
  }
}

/**
 * Carrega os dados de uso de água da API
 */
export async function loadConsumoAgua(processoId: string): Promise<any | null> {
  console.log('🔍 [usoAguaService] Carregando dados de uso de água...');
  console.log('📝 Processo ID:', processoId);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}consumo-agua/${processoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Se não encontrou dados (404), retorna null - não é um erro
    if (response.status === 404) {
      console.log('ℹ️ [usoAguaService] Nenhum dado encontrado (processo novo)');
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      console.error('❌ [usoAguaService] Erro na API:', errorData);
      throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
    }

    const apiData = await response.json();
    console.log('📥 [usoAguaService] Dados carregados da API:', apiData);

    // Transformar dados da API para formato do formulário
    const formData = transformFromAPI(apiData);
    console.log('✅ [usoAguaService] Dados transformados para o formulário:', formData);

    return formData;
  } catch (error: any) {
    console.error('❌ [usoAguaService] Erro ao carregar:', error);
    // Não propaga o erro - retorna null e deixa o formulário vazio
    return null;
  }
}
