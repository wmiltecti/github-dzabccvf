import http from './http';

export interface DadosGeraisPayload {
  tipo_pessoa?: 'PF' | 'PJ';
  cpf?: string;
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  area?: number;
  porte?: string;
  potencial_poluidor?: string;
  cnae_codigo?: string;
  cnae_descricao?: string;
  possui_licenca_anterior?: boolean;
  licenca_tipo?: string;
  licenca_numero?: string;
  licenca_ano?: number;
  licenca_validade?: string;
  numero_empregados?: number;
  horario_inicio?: string;
  horario_fim?: string;
  descricao_resumo?: string;
  contato_email?: string;
  contato_telefone?: string;
}

export interface LocalizacaoPayload {
  endereco?: string;
  municipio_ibge?: string;
  uf?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  referencia?: string;
}

export interface ProcessoResponse {
  id: string;
  user_id: string;
  status: string;
  protocolo_interno?: string;
  numero_processo_externo?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DadosGeraisResponse {
  id: string;
  processo_id: string;
  protocolo_interno: string;
  numero_processo_externo?: string | null;
  tipo_pessoa?: 'PF' | 'PJ';
  cpf?: string;
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  area?: number;
  porte?: string;
  potencial_poluidor?: string;
  cnae_codigo?: string;
  cnae_descricao?: string;
  possui_licenca_anterior?: boolean;
  licenca_tipo?: string;
  licenca_numero?: string;
  licenca_ano?: number;
  licenca_validade?: string;
  numero_empregados?: number;
  horario_inicio?: string;
  horario_fim?: string;
  descricao_resumo?: string;
  contato_email?: string;
  contato_telefone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WizardStatusResponse {
  processo_id: string;
  v_dados_gerais: boolean;
  n_localizacoes: number;
  n_atividades: number;
  v_resp_tecnico: boolean;
}

export interface SubmitResponse {
  processo_id: string;
  protocolo: string;
  status: string;
  data_submissao: string;
}

export async function criarProcesso(userId: string): Promise<ProcessoResponse> {
  try {
    const response = await http.post<ProcessoResponse>('/processos', {
      user_id: userId,
      status: 'draft'
    });
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || 'Erro ao criar processo';
    throw new Error(message);
  }
}

export async function upsertDadosGerais(
  processoId: string,
  payload: DadosGeraisPayload
): Promise<DadosGeraisResponse> {
  try {
    const response = await http.put<DadosGeraisResponse>(`/processos/${processoId}/dados-gerais`, {
      processo_id: processoId,
      ...payload
    });
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || 'Erro ao salvar dados gerais';
    throw new Error(message);
  }
}

export async function addLocalizacao(
  processoId: string,
  payload: LocalizacaoPayload
): Promise<void> {
  try {
    await http.post(`/processos/${processoId}/localizacoes`, payload);
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || 'Erro ao adicionar localização';
    throw new Error(message);
  }
}

export async function getWizardStatus(processoId: string): Promise<WizardStatusResponse> {
  try {
    const response = await http.get<WizardStatusResponse>(`/processos/${processoId}/wizard-status`);
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || 'Erro ao obter status do wizard';
    throw new Error(message);
  }
}

export async function submitProcesso(processoId: string): Promise<SubmitResponse> {
  try {
    const response = await http.post<SubmitResponse>(`/processos/${processoId}/submit`);
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || 'Erro ao submeter processo';
    throw new Error(message);
  }
}
