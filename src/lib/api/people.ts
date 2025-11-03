import { supabase } from '../supabase';
import { friendlyError, err, ServiceError } from './errors';
import { ID, PersonPF, PersonPJ } from './types';
import http from './http';
import { formatCPF, formatCNPJ, formatPhone, formatDate, formatBoolean, formatCEP } from '../formatters';

// helpers
const onlyDigits = (s?: string | null) => (s || '').replace(/\D+/g, '');
const isCPF = (v?: string | null) => onlyDigits(v).length === 11;
const isCNPJ = (v?: string | null) => onlyDigits(v).length === 14;

async function requireProfileId(): Promise<string> {
  const { data: { user }, error: e1 } = await supabase.auth.getUser();
  if (e1 || !user) throw err('Usuário não autenticado', 'AUTH');
  const uid = user.id;

  const { data, error } = await supabase.from('profiles').select('id').eq('id', uid).single();
  if (error) throw friendlyError(error);
  return data.id as string;
}

function formatPersonData(rawData: any): any {
  if (!rawData) return null;

  const formatted: any = { ...rawData };

  if (formatted.cpf) {
    formatted.cpf_display = formatCPF(formatted.cpf);
  }

  if (formatted.cnpj) {
    formatted.cnpj_display = formatCNPJ(formatted.cnpj);
  }

  if (formatted.telefone) {
    formatted.telefone_display = formatPhone(formatted.telefone);
  }

  if (formatted.celular) {
    formatted.celular_display = formatPhone(formatted.celular);
  }

  if (formatted.cep) {
    formatted.cep_display = formatCEP(formatted.cep);
  }

  if (formatted.data_nascimento) {
    formatted.data_nascimento_display = formatDate(formatted.data_nascimento);
  }

  if (formatted.created_at) {
    formatted.created_at_display = formatDate(formatted.created_at);
  }

  if (formatted.updated_at) {
    formatted.updated_at_display = formatDate(formatted.updated_at);
  }

  if (typeof formatted.ativo === 'boolean') {
    formatted.ativo_display = formatBoolean(formatted.ativo);
  }

  if (typeof formatted.aceita_comunicacao === 'boolean') {
    formatted.aceita_comunicacao_display = formatBoolean(formatted.aceita_comunicacao);
  }

  return formatted;
}

export async function getByCpf(cpf: string) {
  try {
    const cpfDigits = onlyDigits(cpf);

    if (!isCPF(cpfDigits)) {
      return { data: null, error: err('CPF inválido. Deve conter 11 dígitos', 'VALIDATION') };
    }

    const { data } = await http.get(`/api/v1/pessoas/cpf/${cpfDigits}`);
    const formattedData = formatPersonData(data);
    return { data: formattedData, error: null as ServiceError | null };
  } catch (error: any) {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;
    const message = error?.response?.data?.message || error?.message;

    if (status === 400) {
      const errorMessage = detail || 'CPF inválido. Verifique o formato e tente novamente.';
      return { data: null, error: err(errorMessage, 'VALIDATION') };
    } else if (status === 404) {
      const errorMessage = detail || 'Pessoa não encontrada com o CPF informado.';
      return { data: null, error: err(errorMessage, 'NOT_FOUND') };
    } else if (status === 500) {
      const errorMessage = detail || 'Erro interno no servidor ao consultar pessoa. Tente novamente mais tarde.';
      return { data: null, error: err(errorMessage, 'SERVER_ERROR') };
    } else if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return { data: null, error: err('Tempo de resposta excedido. Verifique sua conexão e tente novamente.', 'TIMEOUT') };
    } else if (!error?.response) {
      return { data: null, error: err('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.', 'NETWORK_ERROR') };
    }

    const fallbackMessage = detail || message || 'Erro ao buscar pessoa por CPF. Tente novamente.';
    return { data: null, error: err(fallbackMessage, 'UNKNOWN') };
  }
}

export async function getByCpfCnpj(cpfOrCnpj: string) {
  const key = onlyDigits(cpfOrCnpj);

  if (isCPF(key)) {
    return getByCpf(key);
  } else if (isCNPJ(key)) {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('cpf_cnpj', key)
      .maybeSingle();
    if (error) return { data: null, error: friendlyError(error) };
    return { data, error: null as ServiceError | null };
  }

  return { data: null, error: err('Identificação inválida. Deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)') };
}

export async function createPF(payload: PersonPF) {
  if (!isCPF(payload.cpf)) return { data: null, error: err('CPF inválido.') };
  const created_by = await requireProfileId();

  const { data, error } = await supabase
    .from('people')
    .insert({
      type: 'PF',
      cpf_cnpj: onlyDigits(payload.cpf),
      nome_razao: payload.nome.trim(),
      sexo: payload.sexo || null,
      estado_civil: payload.estado_civil || null,
      nacionalidade: payload.nacionalidade || null,
      profissao: payload.profissao || null,
      celular: payload.celular || null,
      email: payload.email || null,
      created_by,
    })
    .select()
    .single();

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export async function createPJ(payload: PersonPJ) {
  if (!isCNPJ(payload.cnpj)) return { data: null, error: err('CNPJ inválido.') };
  const created_by = await requireProfileId();

  const { data, error } = await supabase
    .from('people')
    .insert({
      type: 'PJ',
      cpf_cnpj: onlyDigits(payload.cnpj),
      nome_razao: payload.razao_social.trim(),
      inscricao_estadual: payload.inscricao_estadual || null,
      celular: payload.celular || null,
      email: payload.email || null,
      created_by,
    })
    .select()
    .single();

  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export async function updatePerson(id: ID, patch: Partial<Record<string, any>>) {
  const { data, error } = await supabase.from('people').update(patch).eq('id', id).select().single();
  if (error) return { data: null, error: friendlyError(error) };
  return { data, error: null };
}

export interface SearchPessoaResult {
  pkpessoa: number;
  tipo: number;
  cpf?: string;
  cnpj?: string;
  nome?: string;
  razaosocial?: string;
  email?: string;
  telefone?: string;
  profissao?: string;
}

export async function searchPessoas(query: string) {
  try {
    if (!query || query.trim().length < 3) {
      return { data: null, error: err('Digite pelo menos 3 caracteres para buscar', 'VALIDATION') };
    }

    const cleanQuery = query.trim();
    const { data } = await http.get(`/pessoas/buscar?q=${encodeURIComponent(cleanQuery)}`);

    const formattedData = (data || []).map((pessoa: any) => ({
      ...pessoa,
      cpf_display: pessoa.cpf ? formatCPF(pessoa.cpf) : undefined,
      cnpj_display: pessoa.cnpj ? formatCNPJ(pessoa.cnpj) : undefined,
      telefone_display: pessoa.telefone ? formatPhone(pessoa.telefone) : undefined,
    }));

    return { data: formattedData, error: null as ServiceError | null };
  } catch (error: any) {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;
    const message = error?.response?.data?.message || error?.message;

    if (status === 400) {
      const errorMessage = detail || 'Parâmetros de busca inválidos. Verifique e tente novamente.';
      return { data: null, error: err(errorMessage, 'VALIDATION') };
    } else if (status === 404) {
      return { data: [], error: null as ServiceError | null };
    } else if (status === 500) {
      const errorMessage = detail || 'Erro interno no servidor ao buscar pessoas. Tente novamente mais tarde.';
      return { data: null, error: err(errorMessage, 'SERVER_ERROR') };
    } else if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return { data: null, error: err('Tempo de resposta excedido. Verifique sua conexão e tente novamente.', 'TIMEOUT') };
    } else if (!error?.response) {
      return { data: null, error: err('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.', 'NETWORK_ERROR') };
    }

    const fallbackMessage = detail || message || 'Erro ao buscar pessoas. Tente novamente.';
    return { data: null, error: err(fallbackMessage, 'UNKNOWN') };
  }
}
