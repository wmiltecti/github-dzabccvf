// Service para integração da Aba 5 - Resíduos com FastAPI

interface ResiduoGrupoAPayload {
  processo_id: string;
  tipo: string;
  quantidade: number;
  unidade: string;
  destino: string;
}

interface ResiduoGrupoBPayload {
  processo_id: string;
  tipo: string;
  quantidade: number;
  unidade: string;
  destino: string;
}

interface ResiduoGeralPayload {
  processo_id: string;
  categoria: string;
  tipo: string;
  origem: string | null;
  quantidade: number;
  unidade: string;
  tratamento: string | null;
  destino: string;
}

interface ResiduoResponse {
  id: string;
  processo_id: string;
  tipo: string;
  quantidade: number;
  unidade: string;
  destino: string;
  inserted_at?: string;
  updated_at?: string;
}

interface ResiduoGeralResponse extends ResiduoResponse {
  categoria: string;
  origem: string | null;
  tratamento: string | null;
}

/**
 * Helper function para fazer requisições com retry automático
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 1
): Promise<Response> {
  const timeout = 10000; // 10 segundos

  const fetchWithTimeout = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  try {
    return await fetchWithTimeout();
  } catch (error: any) {
    console.warn(`⚠️ [residuosService] Tentativa falhou, retries restantes: ${retries}`, error);

    // Tentar novamente apenas em erros de rede
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('fetch'))) {
      console.log('🔄 [residuosService] Aguardando 1 segundo antes de tentar novamente...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }

    throw error;
  }
}

/**
 * Processa erros da API e retorna mensagem amigável
 */
function handleAPIError(error: any, response?: Response): string {
  console.error('❌ [residuosService] Erro na API:', error);

  if (!response) {
    return 'Falha ao conectar com servidor. Entre em contato com o suporte.';
  }

  if (response.status === 409) {
    return 'Processo inválido ou não encontrado. Verifique os dados.';
  }

  if (response.status === 422) {
    try {
      const detail = error.detail || 'Erro de validação nos dados enviados.';
      return typeof detail === 'string' ? detail : JSON.stringify(detail);
    } catch {
      return 'Erro de validação nos dados enviados.';
    }
  }

  return error.detail || `Erro ${response.status}: ${response.statusText}`;
}

// ============================================================================
// GRUPO A - RESÍDUOS INFECTANTES
// ============================================================================

/**
 * Transforma dados do formulário para o formato da API Grupo A
 */
export function transformToAPIGrupoA(formData: any, processoId: string): ResiduoGrupoAPayload {
  return {
    processo_id: processoId,
    tipo: formData.tipo,
    quantidade: parseFloat(formData.quantidade),
    unidade: 'kg',
    destino: formData.destino,
  };
}

/**
 * Transforma dados da API para o formato do formulário Grupo A
 */
export function transformFromAPIGrupoA(apiData: ResiduoResponse): any {
  return {
    id: apiData.id,
    tipo: apiData.tipo,
    quantidade: apiData.quantidade.toString(),
    destino: apiData.destino,
  };
}

/**
 * Valida dados do Grupo A antes de enviar
 */
function validateGrupoA(formData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.tipo) {
    errors.push('Tipo é obrigatório');
  }

  if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
    errors.push('Quantidade deve ser maior que zero');
  }

  if (!formData.destino) {
    errors.push('Destino é obrigatório');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Salva um novo resíduo do Grupo A
 */
export async function saveResiduoGrupoA(processoId: string, formData: any): Promise<ResiduoResponse> {
  console.log('🚀 [residuosService] Salvando resíduo Grupo A...');
  console.log('📝 Processo ID:', processoId);
  console.log('📊 Dados do formulário:', formData);

  const validation = validateGrupoA(formData);
  if (!validation.valid) {
    console.error('❌ [residuosService] Validação falhou:', validation.errors);
    throw new Error(validation.errors.join('; '));
  }

  const payload = transformToAPIGrupoA(formData, processoId);
  console.log('📤 Payload para API:', payload);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/grupo-a`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    const resultado = await response.json();
    console.log('✅ [residuosService] Resíduo Grupo A salvo com sucesso!');
    console.log('📨 Response da API:', resultado);

    return resultado;
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao salvar Grupo A:', error);
    throw new Error(error.message || 'Falha ao conectar com servidor. Entre em contato com o suporte.');
  }
}

/**
 * Carrega resíduos do Grupo A de um processo
 */
export async function loadResiduosGrupoA(processoId: string): Promise<any[]> {
  console.log('🔍 [residuosService] Carregando resíduos Grupo A...');
  console.log('📝 Processo ID:', processoId);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/grupo-a?processo_id=${processoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 404) {
      console.log('ℹ️ [residuosService] Nenhum resíduo Grupo A encontrado');
      return [];
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    const apiData = await response.json();
    console.log('📥 [residuosService] Dados carregados:', apiData);

    const formData = Array.isArray(apiData)
      ? apiData.map(transformFromAPIGrupoA)
      : [transformFromAPIGrupoA(apiData)];

    console.log('✅ [residuosService] Resíduos Grupo A transformados:', formData);
    return formData;
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao carregar Grupo A:', error);
    return [];
  }
}

/**
 * Atualiza um resíduo do Grupo A
 */
export async function updateResiduoGrupoA(residuoId: string, formData: any, processoId: string): Promise<ResiduoResponse> {
  console.log('🔄 [residuosService] Atualizando resíduo Grupo A...');
  console.log('🆔 Resíduo ID:', residuoId);

  const validation = validateGrupoA(formData);
  if (!validation.valid) {
    console.error('❌ [residuosService] Validação falhou:', validation.errors);
    throw new Error(validation.errors.join('; '));
  }

  const payload = transformToAPIGrupoA(formData, processoId);
  console.log('📤 Payload para API:', payload);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/grupo-a/${residuoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    const resultado = await response.json();
    console.log('✅ [residuosService] Resíduo Grupo A atualizado com sucesso!');

    return resultado;
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao atualizar Grupo A:', error);
    throw new Error(error.message || 'Falha ao conectar com servidor. Entre em contato com o suporte.');
  }
}

/**
 * Exclui um resíduo do Grupo A
 */
export async function deleteResiduoGrupoA(residuoId: string): Promise<void> {
  console.log('🗑️ [residuosService] Excluindo resíduo Grupo A...');
  console.log('🆔 Resíduo ID:', residuoId);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/grupo-a/${residuoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status !== 204 && !response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    console.log('✅ [residuosService] Resíduo Grupo A excluído com sucesso!');
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao excluir Grupo A:', error);
    throw new Error(error.message || 'Falha ao conectar com servidor. Entre em contato com o suporte.');
  }
}

// ============================================================================
// GRUPO B - RESÍDUOS QUÍMICOS
// ============================================================================

/**
 * Transforma dados do formulário para o formato da API Grupo B
 */
export function transformToAPIGrupoB(formData: any, processoId: string): ResiduoGrupoBPayload {
  return {
    processo_id: processoId,
    tipo: formData.tipo,
    quantidade: parseFloat(formData.quantidade),
    unidade: 'kg',
    destino: formData.destino,
  };
}

/**
 * Transforma dados da API para o formato do formulário Grupo B
 */
export function transformFromAPIGrupoB(apiData: ResiduoResponse): any {
  return {
    id: apiData.id,
    tipo: apiData.tipo,
    quantidade: apiData.quantidade.toString(),
    destino: apiData.destino,
  };
}

/**
 * Valida dados do Grupo B antes de enviar
 */
function validateGrupoB(formData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.tipo) {
    errors.push('Tipo é obrigatório');
  }

  if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
    errors.push('Quantidade deve ser maior que zero');
  }

  if (!formData.destino) {
    errors.push('Destino é obrigatório');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Salva um novo resíduo do Grupo B
 */
export async function saveResiduoGrupoB(processoId: string, formData: any): Promise<ResiduoResponse> {
  console.log('🚀 [residuosService] Salvando resíduo Grupo B...');
  console.log('📝 Processo ID:', processoId);
  console.log('📊 Dados do formulário:', formData);

  const validation = validateGrupoB(formData);
  if (!validation.valid) {
    console.error('❌ [residuosService] Validação falhou:', validation.errors);
    throw new Error(validation.errors.join('; '));
  }

  const payload = transformToAPIGrupoB(formData, processoId);
  console.log('📤 Payload para API:', payload);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/grupo-b`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    const resultado = await response.json();
    console.log('✅ [residuosService] Resíduo Grupo B salvo com sucesso!');
    console.log('📨 Response da API:', resultado);

    return resultado;
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao salvar Grupo B:', error);
    throw new Error(error.message || 'Falha ao conectar com servidor. Entre em contato com o suporte.');
  }
}

/**
 * Carrega resíduos do Grupo B de um processo
 */
export async function loadResiduosGrupoB(processoId: string): Promise<any[]> {
  console.log('🔍 [residuosService] Carregando resíduos Grupo B...');
  console.log('📝 Processo ID:', processoId);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/grupo-b?processo_id=${processoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 404) {
      console.log('ℹ️ [residuosService] Nenhum resíduo Grupo B encontrado');
      return [];
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    const apiData = await response.json();
    console.log('📥 [residuosService] Dados carregados:', apiData);

    const formData = Array.isArray(apiData)
      ? apiData.map(transformFromAPIGrupoB)
      : [transformFromAPIGrupoB(apiData)];

    console.log('✅ [residuosService] Resíduos Grupo B transformados:', formData);
    return formData;
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao carregar Grupo B:', error);
    return [];
  }
}

/**
 * Atualiza um resíduo do Grupo B
 */
export async function updateResiduoGrupoB(residuoId: string, formData: any, processoId: string): Promise<ResiduoResponse> {
  console.log('🔄 [residuosService] Atualizando resíduo Grupo B...');
  console.log('🆔 Resíduo ID:', residuoId);

  const validation = validateGrupoB(formData);
  if (!validation.valid) {
    console.error('❌ [residuosService] Validação falhou:', validation.errors);
    throw new Error(validation.errors.join('; '));
  }

  const payload = transformToAPIGrupoB(formData, processoId);
  console.log('📤 Payload para API:', payload);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/grupo-b/${residuoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    const resultado = await response.json();
    console.log('✅ [residuosService] Resíduo Grupo B atualizado com sucesso!');

    return resultado;
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao atualizar Grupo B:', error);
    throw new Error(error.message || 'Falha ao conectar com servidor. Entre em contato com o suporte.');
  }
}

/**
 * Exclui um resíduo do Grupo B
 */
export async function deleteResiduoGrupoB(residuoId: string): Promise<void> {
  console.log('🗑️ [residuosService] Excluindo resíduo Grupo B...');
  console.log('🆔 Resíduo ID:', residuoId);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/grupo-b/${residuoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status !== 204 && !response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    console.log('✅ [residuosService] Resíduo Grupo B excluído com sucesso!');
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao excluir Grupo B:', error);
    throw new Error(error.message || 'Falha ao conectar com servidor. Entre em contato com o suporte.');
  }
}

// ============================================================================
// RESÍDUOS GERAIS - SÓLIDOS E LÍQUIDOS
// ============================================================================

/**
 * Transforma dados do formulário para o formato da API Gerais
 */
export function transformToAPIGerais(formData: any, processoId: string): ResiduoGeralPayload {
  return {
    processo_id: processoId,
    categoria: formData.categoria,
    tipo: formData.tipo,
    origem: formData.origem && formData.origem.trim() !== '' ? formData.origem : null,
    quantidade: parseFloat(formData.quantidade),
    unidade: 'kg',
    tratamento: formData.tratamento && formData.tratamento.trim() !== '' ? formData.tratamento : null,
    destino: formData.destino,
  };
}

/**
 * Transforma dados da API para o formato do formulário Gerais
 */
export function transformFromAPIGerais(apiData: ResiduoGeralResponse): any {
  return {
    id: apiData.id,
    categoria: apiData.categoria,
    tipo: apiData.tipo,
    origem: apiData.origem || '',
    quantidade: apiData.quantidade.toString(),
    tratamento: apiData.tratamento || '',
    destino: apiData.destino,
  };
}

/**
 * Valida dados dos Resíduos Gerais antes de enviar
 */
function validateGerais(formData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.categoria) {
    errors.push('Categoria é obrigatória');
  }

  if (!formData.tipo) {
    errors.push('Tipo é obrigatório');
  }

  if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
    errors.push('Quantidade deve ser maior que zero');
  }

  if (!formData.destino) {
    errors.push('Destino é obrigatório');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Salva um novo resíduo geral
 */
export async function saveResiduoGeral(processoId: string, formData: any): Promise<ResiduoGeralResponse> {
  console.log('🚀 [residuosService] Salvando resíduo geral...');
  console.log('📝 Processo ID:', processoId);
  console.log('📊 Dados do formulário:', formData);

  const validation = validateGerais(formData);
  if (!validation.valid) {
    console.error('❌ [residuosService] Validação falhou:', validation.errors);
    throw new Error(validation.errors.join('; '));
  }

  const payload = transformToAPIGerais(formData, processoId);
  console.log('📤 Payload para API:', payload);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/gerais`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    const resultado = await response.json();
    console.log('✅ [residuosService] Resíduo geral salvo com sucesso!');
    console.log('📨 Response da API:', resultado);

    return resultado;
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao salvar resíduo geral:', error);
    throw new Error(error.message || 'Falha ao conectar com servidor. Entre em contato com o suporte.');
  }
}

/**
 * Carrega resíduos gerais de um processo
 */
export async function loadResiduosGerais(processoId: string): Promise<any[]> {
  console.log('🔍 [residuosService] Carregando resíduos gerais...');
  console.log('📝 Processo ID:', processoId);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/gerais?processo_id=${processoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 404) {
      console.log('ℹ️ [residuosService] Nenhum resíduo geral encontrado');
      return [];
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    const apiData = await response.json();
    console.log('📥 [residuosService] Dados carregados:', apiData);

    const formData = Array.isArray(apiData)
      ? apiData.map(transformFromAPIGerais)
      : [transformFromAPIGerais(apiData)];

    console.log('✅ [residuosService] Resíduos gerais transformados:', formData);
    return formData;
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao carregar resíduos gerais:', error);
    return [];
  }
}

/**
 * Atualiza um resíduo geral
 */
export async function updateResiduoGeral(residuoId: string, formData: any, processoId: string): Promise<ResiduoGeralResponse> {
  console.log('🔄 [residuosService] Atualizando resíduo geral...');
  console.log('🆔 Resíduo ID:', residuoId);

  const validation = validateGerais(formData);
  if (!validation.valid) {
    console.error('❌ [residuosService] Validação falhou:', validation.errors);
    throw new Error(validation.errors.join('; '));
  }

  const payload = transformToAPIGerais(formData, processoId);
  console.log('📤 Payload para API:', payload);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/gerais/${residuoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    const resultado = await response.json();
    console.log('✅ [residuosService] Resíduo geral atualizado com sucesso!');

    return resultado;
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao atualizar resíduo geral:', error);
    throw new Error(error.message || 'Falha ao conectar com servidor. Entre em contato com o suporte.');
  }
}

/**
 * Exclui um resíduo geral
 */
export async function deleteResiduoGeral(residuoId: string): Promise<void> {
  console.log('🗑️ [residuosService] Excluindo resíduo geral...');
  console.log('🆔 Resíduo ID:', residuoId);

  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}residuos/gerais/${residuoId}`;
    console.log('🌐 URL da API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status !== 204 && !response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(handleAPIError(errorData, response));
    }

    console.log('✅ [residuosService] Resíduo geral excluído com sucesso!');
  } catch (error: any) {
    console.error('❌ [residuosService] Erro ao excluir resíduo geral:', error);
    throw new Error(error.message || 'Falha ao conectar com servidor. Entre em contato com o suporte.');
  }
}
