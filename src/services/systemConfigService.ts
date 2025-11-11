/**
 * systemConfigService.ts
 * Serviço para gerenciar configurações do sistema
 * Responsável por buscar e atualizar configurações armazenadas no Supabase
 */

import axios from 'axios';

const API_BASE_URL = '/api/v1/system-config';

/**
 * Interface para estrutura de configuração do sistema
 */
export interface SystemConfig {
  id: string;
  config_key: string;
  config_value: boolean;
  config_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para resposta de lista de configurações
 */
export interface SystemConfigsResponse {
  success: boolean;
  data: SystemConfig[];
  message?: string;
}

/**
 * Interface para resposta de configuração única
 */
export interface SystemConfigResponse {
  success: boolean;
  data: SystemConfig;
  message?: string;
}

/**
 * Interface para atualização de configuração
 */
export interface UpdateConfigPayload {
  config_value: boolean;
}

/**
 * Busca todas as configurações ativas do sistema
 * @returns Promise com array de configurações
 * @throws Error em caso de falha na requisição
 */
export async function getAllSystemConfigs(): Promise<SystemConfig[]> {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get<SystemConfigsResponse>(API_BASE_URL, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao buscar configurações do sistema');
  } catch (error: any) {
    console.error('[systemConfigService] Erro ao buscar configurações:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Erro ao buscar configurações do sistema'
    );
  }
}

/**
 * Busca uma configuração específica por chave
 * @param key - Chave da configuração (ex: 'empreendimento_search_required')
 * @returns Promise com a configuração encontrada
 * @throws Error em caso de falha na requisição ou configuração não encontrada
 */
export async function getSystemConfigByKey(key: string): Promise<SystemConfig> {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get<SystemConfigResponse>(`${API_BASE_URL}/${key}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || `Configuração '${key}' não encontrada`);
  } catch (error: any) {
    console.error(`[systemConfigService] Erro ao buscar configuração '${key}':`, error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      `Erro ao buscar configuração '${key}'`
    );
  }
}

/**
 * Atualiza o valor de uma configuração específica
 * @param key - Chave da configuração a ser atualizada
 * @param value - Novo valor booleano da configuração
 * @returns Promise com a configuração atualizada
 * @throws Error em caso de falha na requisição ou permissões insuficientes
 */
export async function updateSystemConfig(
  key: string, 
  value: boolean
): Promise<SystemConfig> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const payload: UpdateConfigPayload = { config_value: value };
    
    const response = await axios.put<SystemConfigResponse>(
      `${API_BASE_URL}/${key}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erro ao atualizar configuração');
  } catch (error: any) {
    console.error(`[systemConfigService] Erro ao atualizar configuração '${key}':`, error);
    
    // Tratamento especial para erros de permissão
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error('Você não tem permissão para alterar configurações do sistema');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Erro ao atualizar configuração do sistema'
    );
  }
}

/**
 * Busca múltiplas configurações por suas chaves
 * Útil para carregar apenas as configs necessárias de uma vez
 * @param keys - Array com as chaves das configurações desejadas
 * @returns Promise com objeto mapeando chave → configuração
 */
export async function getSystemConfigsByKeys(
  keys: string[]
): Promise<Record<string, SystemConfig>> {
  try {
    const allConfigs = await getAllSystemConfigs();
    const configMap: Record<string, SystemConfig> = {};
    
    allConfigs.forEach(config => {
      if (keys.includes(config.config_key)) {
        configMap[config.config_key] = config;
      }
    });
    
    return configMap;
  } catch (error: any) {
    console.error('[systemConfigService] Erro ao buscar configurações por chaves:', error);
    throw error;
  }
}

/**
 * Helpers para configs específicas do empreendimento
 * Facilitam o acesso às configs mais usadas
 */
export const EnterpriseConfigKeys = {
  SEARCH_REQUIRED: 'empreendimento_search_required',
  ALLOW_NEW_REGISTER: 'empreendimento_allow_new_register',
} as const;

/**
 * Busca as configurações relacionadas a empreendimento
 * @returns Promise com objeto contendo as duas configs principais
 */
export async function getEnterpriseConfigs(): Promise<{
  searchRequired: boolean;
  allowNewRegister: boolean;
}> {
  try {
    const configs = await getSystemConfigsByKeys([
      EnterpriseConfigKeys.SEARCH_REQUIRED,
      EnterpriseConfigKeys.ALLOW_NEW_REGISTER,
    ]);
    
    return {
      searchRequired: configs[EnterpriseConfigKeys.SEARCH_REQUIRED]?.config_value ?? false,
      allowNewRegister: configs[EnterpriseConfigKeys.ALLOW_NEW_REGISTER]?.config_value ?? true,
    };
  } catch (error) {
    console.error('[systemConfigService] Erro ao buscar configs de empreendimento:', error);
    // Retorna valores padrão em caso de erro
    return {
      searchRequired: false,
      allowNewRegister: true,
    };
  }
}
