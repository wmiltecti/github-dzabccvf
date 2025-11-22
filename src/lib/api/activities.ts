import http from './http';

/**
 * Interface para Atividade retornada pela API
 */
export interface ActivityResponse {
  id: string;
  code: number;
  name: string;
  description?: string;
  measurement_unit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  enterprise_size?: {
    id: string;
    name: string;
  };
  pollution_potential?: {
    id: string;
    name: string;
  };
  
  // Faixas de porte (pode ter múltiplas)
  enterprise_size_ranges?: Array<{
    id: string;
    range_name: string;
    range_start: number;
    range_end: number;
    enterprise_size: {
      id: string;
      name: string;
    };
  }>;
}

/**
 * Buscar todas as atividades cadastradas
 * 
 * @param includeInactive - Se deve incluir atividades inativas (padrão: false)
 * @returns Lista de atividades
 */
export async function getActivities(includeInactive = false): Promise<{ 
  data: ActivityResponse[] | null; 
  error: any 
}> {
  try {
    console.log('📡 getActivities - Buscando atividades...', { includeInactive });

    const params = new URLSearchParams();
    if (includeInactive) {
      params.append('include_inactive', 'true');
    }

    const url = `/api/v1/activities${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await http.get<ActivityResponse[]>(url);

    console.log('✅ getActivities - Sucesso:', response.data.length, 'atividades encontradas');
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error('❌ getActivities - Erro:', error.response?.data || error.message);
    return {
      data: null,
      error: error.response?.data || { message: error.message }
    };
  }
}

/**
 * Buscar uma atividade por ID
 * 
 * @param id - ID da atividade
 * @returns Dados da atividade
 */
export async function getActivityById(id: string): Promise<{ 
  data: ActivityResponse | null; 
  error: any 
}> {
  try {
    console.log('📡 getActivityById - Buscando atividade:', id);

    const response = await http.get<ActivityResponse>(`/api/v1/activities/${id}`);

    console.log('✅ getActivityById - Sucesso');
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error('❌ getActivityById - Erro:', error.response?.data || error.message);
    return {
      data: null,
      error: error.response?.data || { message: error.message }
    };
  }
}

/**
 * Buscar atividades com filtro de busca
 * 
 * @param searchTerm - Termo de busca (código, nome ou descrição)
 * @returns Lista de atividades filtradas
 */
export async function searchActivities(searchTerm: string): Promise<{ 
  data: ActivityResponse[] | null; 
  error: any 
}> {
  try {
    console.log('📡 searchActivities - Buscando:', searchTerm);

    const params = new URLSearchParams();
    params.append('q', searchTerm);

    const response = await http.get<ActivityResponse[]>(`/api/v1/activities/search?${params.toString()}`);

    console.log('✅ searchActivities - Sucesso:', response.data.length, 'resultados');
    
    return {
      data: response.data,
      error: null
    };
  } catch (error: any) {
    console.error('❌ searchActivities - Erro:', error.response?.data || error.message);
    return {
      data: null,
      error: error.response?.data || { message: error.message }
    };
  }
}
