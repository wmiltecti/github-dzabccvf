import http from '../lib/api/http';

// Tipos para respostas da API do dashboard
export interface DashboardStats {
  total: number;
  pendentes: number;
  em_analise: number;
  aprovados: number;
  rejeitados: number;
}

export interface ProcessoItem {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  protocolo_interno?: string;
  numero_processo_externo?: string;
  tipo_pessoa?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cpf?: string;
  cnpj?: string;
  potencial_poluidor?: string;
}

export interface DashboardProcessosResponse {
  items: ProcessoItem[];
  total: number;
  skip: number;
  limit: number;
}

const BASE_URL = 'http://localhost:8000/api/v1/processos';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const res = await http.get(`${BASE_URL}/dashboard/stats`);
    return res.data;
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    throw error;
  }
}

export async function getProcessos(
  status?: string,
  skip: number = 0,
  limit: number = 50
): Promise<DashboardProcessosResponse> {
  try {
    const params: Record<string, any> = { skip, limit };
    if (status) params.status = status;
    const res = await http.get(`${BASE_URL}/dashboard`, { params });
    return res.data;
  } catch (error: any) {
    console.error('Erro ao buscar processos do dashboard:', error);
    throw error;
  }
}
