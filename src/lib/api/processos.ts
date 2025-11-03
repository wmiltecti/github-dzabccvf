import http from './http';

export interface DadosGeraisPayload {
  tipo_pessoa?: 'PF' | 'PJ';
  cpf?: string;
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  area_total?: number;
  porte?: string;
  potencial_poluidor?: string;
  cnae_codigo?: string;
  cnae_descricao?: string;
  possui_licenca_anterior?: boolean;
  tipo_licenca_anterior?: string;
  numero_licenca_anterior?: string;
  ano_emissao_licenca?: number;
  validade_licenca?: string;
  numero_empregados?: number;
  horario_funcionamento_inicio?: string;
  horario_funcionamento_fim?: string;
  descricao_resumo?: string;
  contato_email?: string;
  contato_telefone?: string;
  numero_processo_externo?: string;
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
  area_total?: number;
  porte?: string;
  potencial_poluidor?: string;
  cnae_codigo?: string;
  cnae_descricao?: string;
  possui_licenca_anterior?: boolean;
  tipo_licenca_anterior?: string;
  numero_licenca_anterior?: string;
  ano_emissao_licenca?: number;
  validade_licenca?: string;
  numero_empregados?: number;
  horario_funcionamento_inicio?: string;
  horario_funcionamento_fim?: string;
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
    console.log('📡 criarProcesso - Iniciando chamada:', { userId });

    const response = await http.post<ProcessoResponse>('/processos/', {
      user_id: userId,
      status: 'draft'
    });

    console.log('📡 criarProcesso - Response recebido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('📡 criarProcesso - Erro:', error);
    const message = error?.response?.data?.detail || error?.message || 'Erro ao criar processo';
    throw new Error(message);
  }
}

export async function upsertDadosGerais(
  processoId: string,
  payload: DadosGeraisPayload
): Promise<DadosGeraisResponse> {
  try {
    console.log('📡 upsertDadosGerais - Iniciando chamada:', {
      processoId,
      payload
    });

    const response = await http.put<DadosGeraisResponse>(`/processos/${processoId}/dados-gerais`, {
      processo_id: processoId,
      ...payload
    });

    console.log('📡 upsertDadosGerais - Response recebido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('📡 upsertDadosGerais - Erro:', error);
    const message = error?.response?.data?.detail || error?.message || 'Erro ao salvar dados gerais';
    throw new Error(message);
  }
}

export async function getDadosGerais(
  processoId: string
): Promise<DadosGeraisResponse | null> {
  try {
    console.log('📡 getDadosGerais - Iniciando chamada:', { processoId });

    // Usa o endpoint /processos/{id} e extrai os dados gerais
    const response = await http.get<any>(`/processos/${processoId}`);

    console.log('📡 getDadosGerais - Response recebido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('📡 getDadosGerais - Erro:', error);
    // Se retornar 404, significa que não há dados ainda
    if (error?.response?.status === 404) {
      console.log('📡 getDadosGerais - Nenhum dado encontrado (404)');
      return null;
    }
    const message = error?.response?.data?.detail || error?.message || 'Erro ao buscar dados gerais';
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

export interface ParticipanteProcessoPayload {
  pessoa_id: number;
  papel: 'Requerente' | 'Procurador' | 'Responsável Técnico';
}

export interface ParticipanteProcessoResponse {
  id: string;
  processo_id: string;
  pessoa_id: number;
  papel: string;
  created_at: string;
  updated_at: string;
  pessoa_nome: string;
  pessoa_cpf_cnpj: string;
  pessoa_tipo: number;
  pessoa_email?: string;
  pessoa_telefone?: string;
}

export async function addParticipanteProcesso(
  processoId: string,
  payload: ParticipanteProcessoPayload
): Promise<ParticipanteProcessoResponse> {
  try {
    console.log('📡 addParticipanteProcesso - Iniciando chamada:', {
      processoId,
      payload
    });

    const response = await http.post<ParticipanteProcessoResponse>(
      `/processos/${processoId}/participantes`,
      payload
    );

    console.log('📡 addParticipanteProcesso - Response recebido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('📡 addParticipanteProcesso - Erro:', error);
    console.error('📡 Status HTTP:', error?.response?.status);
    console.error('📡 Detail:', error?.response?.data?.detail);
    console.error('📡 Response completo:', JSON.stringify(error?.response?.data, null, 2));
    
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;
    const message = error?.response?.data?.message || error?.message;

    if (status === 404) {
      throw new Error(detail || 'Pessoa não encontrada');
    } else if (status === 409) {
      // Mostra a mensagem exata do backend se disponível
      const errorMsg = typeof detail === 'string' ? detail : 'Esta pessoa já está cadastrada com este papel no processo. Escolha outro papel ou remova o cadastro anterior.';
      throw new Error(errorMsg);
    }

    throw new Error(detail || message || 'Erro ao adicionar participante');
  }
}

export async function getParticipantesProcesso(
  processoId: string
): Promise<ParticipanteProcessoResponse[]> {
  try {
    console.log('📡 getParticipantesProcesso - Iniciando chamada:', { processoId });

    const response = await http.get<ParticipanteProcessoResponse[]>(
      `/processos/${processoId}/participantes`
    );

    console.log('📡 getParticipantesProcesso - Response recebido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('📡 getParticipantesProcesso - Erro:', error);
    if (error?.response?.status === 404) {
      return [];
    }
    const message = error?.response?.data?.detail || error?.message || 'Erro ao buscar participantes';
    throw new Error(message);
  }
}

export async function removeParticipanteProcesso(
  processoId: string,
  participanteId: string
): Promise<void> {
  try {
    console.log('📡 removeParticipanteProcesso - Iniciando chamada:', {
      processoId,
      participanteId
    });

    await http.delete(`/processos/${processoId}/participantes/${participanteId}`);

    console.log('📡 removeParticipanteProcesso - Participante removido com sucesso');
  } catch (error: any) {
    console.error('📡 removeParticipanteProcesso - Erro:', error);
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;
    const message = error?.response?.data?.message || error?.message;

    if (status === 404) {
      throw new Error(detail || 'Participante não encontrado');
    }

    throw new Error(detail || message || 'Erro ao remover participante');
  }
}
