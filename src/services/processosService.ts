import * as processosAPI from '../lib/api/processos';
import { getUserId } from '../utils/authToken';

let apiAvailable = true;

function generateLocalProcessoId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function isLocalProcesso(processoId: string): boolean {
  return processoId.startsWith('local-');
}

export async function criarProcesso(userId?: string): Promise<string> {
  console.log('🔵 criarProcesso - Iniciando...');
  const finalUserId = userId || getUserId();
  console.log('🔵 criarProcesso - User ID:', finalUserId);

  if (!finalUserId) {
    console.error('❌ criarProcesso - Usuário não autenticado');
    throw new Error('Usuário não autenticado');
  }

  if (!apiAvailable) {
    console.warn('🔸 criarProcesso - API marcada como indisponível, usando ID local');
    return generateLocalProcessoId();
  }

  try {
    console.log('🔵 criarProcesso - Chamando API...');
    const response = await processosAPI.criarProcesso(finalUserId);
    console.log('✅ criarProcesso - Processo criado na API:', response.id);
    return response.id;
  } catch (error: any) {
    console.error('❌ criarProcesso - Erro ao criar processo:', error);
    const errorMsg = error.message || '';
    console.error('❌ criarProcesso - Mensagem de erro:', errorMsg);

    if (errorMsg.includes('404') || errorMsg.includes('Network Error') || errorMsg.includes('Failed to fetch') || errorMsg.includes('Erro de conexão')) {
      console.warn('🔸 criarProcesso - API indisponível, alternando para modo local');
      apiAvailable = false;
      const localId = generateLocalProcessoId();
      console.warn('🔸 criarProcesso - ID local gerado:', localId);
      return localId;
    }
    throw error;
  }
}

export async function upsertDadosGerais(
  processoId: string,
  payload: processosAPI.DadosGeraisPayload
): Promise<processosAPI.DadosGeraisResponse | void> {
  console.log('🟢 upsertDadosGerais - Iniciando...');
  console.log('🟢 upsertDadosGerais - Processo ID:', processoId);
  console.log('🟢 upsertDadosGerais - Payload:', payload);

  if (!processoId) {
    console.error('❌ upsertDadosGerais - ID do processo é obrigatório');
    throw new Error('ID do processo é obrigatório');
  }

  if (isLocalProcesso(processoId)) {
    console.warn('🔸 upsertDadosGerais - Processo é LOCAL (não veio da API)');
    console.warn('🔸 upsertDadosGerais - Salvando apenas no navegador (localStorage)');
    localStorage.setItem(`processo_${processoId}_dados_gerais`, JSON.stringify(payload));
    return;
  }

  console.log('✓ upsertDadosGerais - Processo é da API, salvando remotamente...');

  try {
    const response = await processosAPI.upsertDadosGerais(processoId, payload);
    console.log('✅ upsertDadosGerais - Dados salvos na API com sucesso');
    return response;
  } catch (error: any) {
    console.error('❌ upsertDadosGerais - Erro ao salvar na API:', error);
    const errorMsg = error.message || '';
    if (errorMsg.includes('404') || errorMsg.includes('Network Error')) {
      console.warn('🔸 upsertDadosGerais - Salvando localmente devido a erro na API');
      localStorage.setItem(`processo_${processoId}_dados_gerais`, JSON.stringify(payload));
      return;
    }
    throw error;
  }
}

export async function addLocalizacao(
  processoId: string,
  payload: processosAPI.LocalizacaoPayload
): Promise<void> {
  if (!processoId) {
    throw new Error('ID do processo é obrigatório');
  }

  if (isLocalProcesso(processoId)) {
    console.warn('🔸 Modo local: localização salva apenas no navegador');
    const localizacoes = JSON.parse(localStorage.getItem(`processo_${processoId}_localizacoes`) || '[]');
    localizacoes.push(payload);
    localStorage.setItem(`processo_${processoId}_localizacoes`, JSON.stringify(localizacoes));
    return;
  }

  try {
    await processosAPI.addLocalizacao(processoId, payload);
  } catch (error: any) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('404') || errorMsg.includes('Network Error')) {
      console.warn('🔸 Salvando localização localmente devido a erro na API');
      const localizacoes = JSON.parse(localStorage.getItem(`processo_${processoId}_localizacoes`) || '[]');
      localizacoes.push(payload);
      localStorage.setItem(`processo_${processoId}_localizacoes`, JSON.stringify(localizacoes));
      return;
    }
    throw error;
  }
}

export async function getWizardStatus(processoId: string): Promise<processosAPI.WizardStatusResponse> {
  if (!processoId) {
    throw new Error('ID do processo é obrigatório');
  }

  if (isLocalProcesso(processoId)) {
    console.warn('🔸 Modo local: retornando status do localStorage');
    const dadosGerais = localStorage.getItem(`processo_${processoId}_dados_gerais`);
    const localizacoes = JSON.parse(localStorage.getItem(`processo_${processoId}_localizacoes`) || '[]');

    return {
      processo_id: processoId,
      v_dados_gerais: !!dadosGerais,
      n_localizacoes: localizacoes.length,
      n_atividades: 0,
      v_resp_tecnico: false
    };
  }

  try {
    return await processosAPI.getWizardStatus(processoId);
  } catch (error: any) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('404') || errorMsg.includes('Network Error')) {
      console.warn('🔸 Retornando status local devido a erro na API');
      const dadosGerais = localStorage.getItem(`processo_${processoId}_dados_gerais`);
      const localizacoes = JSON.parse(localStorage.getItem(`processo_${processoId}_localizacoes`) || '[]');

      return {
        processo_id: processoId,
        v_dados_gerais: !!dadosGerais,
        n_localizacoes: localizacoes.length,
        n_atividades: 0,
        v_resp_tecnico: false
      };
    }
    throw error;
  }
}

export async function submitProcesso(processoId: string): Promise<processosAPI.SubmitResponse> {
  if (!processoId) {
    throw new Error('ID do processo é obrigatório');
  }

  if (isLocalProcesso(processoId)) {
    console.warn('🔸 Modo local: gerando protocolo local');
    const protocolo = `LOCAL-${Date.now().toString(36).toUpperCase()}`;

    return {
      processo_id: processoId,
      protocolo: protocolo,
      status: 'submitted',
      data_submissao: new Date().toISOString()
    };
  }

  try {
    return await processosAPI.submitProcesso(processoId);
  } catch (error: any) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('404') || errorMsg.includes('Network Error')) {
      console.warn('🔸 Gerando protocolo local devido a erro na API');
      const protocolo = `LOCAL-${Date.now().toString(36).toUpperCase()}`;

      return {
        processo_id: processoId,
        protocolo: protocolo,
        status: 'submitted',
        data_submissao: new Date().toISOString()
      };
    }
    throw error;
  }
}

export type { DadosGeraisPayload, LocalizacaoPayload, WizardStatusResponse, SubmitResponse } from '../lib/api/processos';
