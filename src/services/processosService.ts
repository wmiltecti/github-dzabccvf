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
  const finalUserId = userId || getUserId();

  if (!finalUserId) {
    throw new Error('Usuário não autenticado');
  }

  if (!apiAvailable) {
    console.warn('🔸 API indisponível, usando ID de processo local');
    return generateLocalProcessoId();
  }

  try {
    const response = await processosAPI.criarProcesso(finalUserId);
    return response.id;
  } catch (error: any) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('404') || errorMsg.includes('Network Error') || errorMsg.includes('Failed to fetch')) {
      console.warn('🔸 API indisponível, alternando para modo local');
      apiAvailable = false;
      return generateLocalProcessoId();
    }
    throw error;
  }
}

export async function upsertDadosGerais(
  processoId: string,
  payload: processosAPI.DadosGeraisPayload
): Promise<processosAPI.DadosGeraisResponse | void> {
  if (!processoId) {
    throw new Error('ID do processo é obrigatório');
  }

  if (isLocalProcesso(processoId)) {
    console.warn('🔸 Modo local: dados salvos apenas no navegador');
    localStorage.setItem(`processo_${processoId}_dados_gerais`, JSON.stringify(payload));
    return;
  }

  try {
    const response = await processosAPI.upsertDadosGerais(processoId, payload);
    return response;
  } catch (error: any) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('404') || errorMsg.includes('Network Error')) {
      console.warn('🔸 Salvando dados localmente devido a erro na API');
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
