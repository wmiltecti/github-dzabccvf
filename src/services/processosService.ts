import * as processosAPI from '../lib/api/processos';
import { getUserId } from '../utils/authToken';

export async function criarProcesso(userId?: string): Promise<string> {
  const finalUserId = userId || getUserId();

  if (!finalUserId) {
    throw new Error('Usuário não autenticado');
  }

  const response = await processosAPI.criarProcesso(finalUserId);
  return response.id;
}

export async function upsertDadosGerais(
  processoId: string,
  payload: processosAPI.DadosGeraisPayload
): Promise<void> {
  if (!processoId) {
    throw new Error('ID do processo é obrigatório');
  }

  await processosAPI.upsertDadosGerais(processoId, payload);
}

export async function addLocalizacao(
  processoId: string,
  payload: processosAPI.LocalizacaoPayload
): Promise<void> {
  if (!processoId) {
    throw new Error('ID do processo é obrigatório');
  }

  await processosAPI.addLocalizacao(processoId, payload);
}

export async function getWizardStatus(processoId: string): Promise<processosAPI.WizardStatusResponse> {
  if (!processoId) {
    throw new Error('ID do processo é obrigatório');
  }

  return await processosAPI.getWizardStatus(processoId);
}

export async function submitProcesso(processoId: string): Promise<processosAPI.SubmitResponse> {
  if (!processoId) {
    throw new Error('ID do processo é obrigatório');
  }

  return await processosAPI.submitProcesso(processoId);
}

export type { DadosGeraisPayload, LocalizacaoPayload, WizardStatusResponse, SubmitResponse } from '../lib/api/processos';
