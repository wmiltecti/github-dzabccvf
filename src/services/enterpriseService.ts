/**
 * enterpriseService.ts
 * Serviço para gerenciar empreendimentos
 * Responsável por buscar e gerenciar dados de empresas (PF e PJ)
 */

import axios from 'axios';

const API_BASE_URL = '/api/v1/enterprises';

/**
 * Interface para estrutura de empreendimento
 */
export interface Enterprise {
  id: string;
  cnpj_cpf: string; // Pode ser CNPJ (PJ) ou CPF (PF)
  razao_social?: string; // Pessoa Jurídica
  nome_fantasia?: string; // Pessoa Jurídica
  nome_completo?: string; // Pessoa Física
  tipo_pessoa: 'fisica' | 'juridica';
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para resposta de pesquisa
 */
export interface EnterpriseSearchResponse {
  success: boolean;
  data: Enterprise[];
  count: number;
  message?: string;
}

/**
 * Interface para resposta de empreendimento único
 */
export interface EnterpriseResponse {
  success: boolean;
  data: Enterprise;
  message?: string;
}

/**
 * Busca empreendimentos por query (CNPJ, CPF, Razão Social ou Nome Fantasia)
 * @param query - Termo de busca (CNPJ, CPF, nome, razão social)
 * @returns Promise com array de empreendimentos encontrados
 * @throws Error em caso de falha na requisição
 */
export async function searchEnterprises(query: string): Promise<Enterprise[]> {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('Termo de busca não pode estar vazio');
    }

    const token = localStorage.getItem('auth_token');
    const response = await axios.get<EnterpriseSearchResponse>(
      `${API_BASE_URL}/search`,
      {
        params: { query: query.trim() },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar empreendimentos');
  } catch (error: any) {
    console.error('[enterpriseService] Erro ao buscar empreendimentos:', error);
    
    // Se for erro 404, retorna array vazio (nenhum resultado)
    if (error.response?.status === 404) {
      return [];
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Erro ao buscar empreendimentos'
    );
  }
}

/**
 * Busca empreendimento por ID
 * @param id - ID do empreendimento
 * @returns Promise com o empreendimento encontrado
 * @throws Error em caso de falha ou não encontrado
 */
export async function getEnterpriseById(id: string): Promise<Enterprise> {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get<EnterpriseResponse>(
      `${API_BASE_URL}/${id}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Empreendimento não encontrado');
  } catch (error: any) {
    console.error(`[enterpriseService] Erro ao buscar empreendimento ${id}:`, error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Erro ao buscar empreendimento'
    );
  }
}

/**
 * Cria um novo empreendimento no backend
 * @param payload - Dados do empreendimento mínimo: { tipo_pessoa, cnpj_cpf, ... }
 * @returns Enterprise criado pelo backend
 */
export async function createEnterprise(payload: Partial<Enterprise>): Promise<Enterprise> {
  try {
    const token = localStorage.getItem('auth_token');

    if (!payload || !payload.tipo_pessoa || !payload.cnpj_cpf) {
      throw new Error('Payload inválido: é necessário informar tipo_pessoa e cnpj_cpf');
    }

    const response = await axios.post<EnterpriseResponse>(
      `${API_BASE_URL}`,
      payload,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Erro ao criar empreendimento');
  } catch (error: any) {
    console.error('[enterpriseService] Erro ao criar empreendimento:', error);
    throw new Error(error.response?.data?.message || error.message || 'Erro ao criar empreendimento');
  }
}

/**
 * Helpers para formatação
 */

/**
 * Formata CNPJ (XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  
  return clean.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Formata CPF (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  
  return clean.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    '$1.$2.$3-$4'
  );
}

/**
 * Formata CNPJ ou CPF automaticamente
 */
export function formatDocument(doc: string): string {
  const clean = doc.replace(/\D/g, '');
  
  if (clean.length === 11) {
    return formatCPF(clean);
  } else if (clean.length === 14) {
    return formatCNPJ(clean);
  }
  
  return doc;
}

/**
 * Retorna o nome de exibição do empreendimento
 * Prioriza: nome_fantasia > razao_social > nome_completo
 */
export function getEnterpriseName(enterprise: Enterprise): string {
  if (enterprise.tipo_pessoa === 'juridica') {
    return enterprise.nome_fantasia || enterprise.razao_social || 'Empresa não informada';
  } else {
    return enterprise.nome_completo || 'Nome não informado';
  }
}

/**
 * Retorna o documento formatado do empreendimento
 */
export function getEnterpriseDocument(enterprise: Enterprise): string {
  return formatDocument(enterprise.cnpj_cpf);
}

/**
 * Valida se é um CNPJ válido (formato básico)
 */
export function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  return clean.length === 14;
}

/**
 * Valida se é um CPF válido (formato básico)
 */
export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  return clean.length === 11;
}

/**
 * Detecta o tipo de documento (CPF ou CNPJ)
 */
export function detectDocumentType(doc: string): 'cpf' | 'cnpj' | 'unknown' {
  const clean = doc.replace(/\D/g, '');
  
  if (clean.length === 11) return 'cpf';
  if (clean.length === 14) return 'cnpj';
  
  return 'unknown';
}

/**
 * Retorna endereço completo formatado
 */
export function getFullAddress(enterprise: Enterprise): string {
  const parts = [
    enterprise.endereco,
    enterprise.cidade,
    enterprise.estado,
    enterprise.cep
  ].filter(Boolean);
  
  return parts.join(', ') || 'Endereço não informado';
}
