/**
 * systemConfigService.ts
 * Serviço para gerenciar configurações do sistema
 * Responsável por buscar e atualizar configurações armazenadas no Supabase
 */

import { supabase } from '../lib/supabaseClient';

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
 * Busca todas as configurações ativas do sistema
 * @returns Promise com array de configurações
 * @throws Error em caso de falha na requisição
 */
export async function getAllSystemConfigs(): Promise<SystemConfig[]> {
  try {
    console.log('[systemConfigService] Iniciando busca de configurações...');
    
    const { data, error } = await supabase
      .from('system_configurations')
      .select('*')
      .eq('is_active', true)
      .order('config_key');

    console.log('[systemConfigService] Resposta do Supabase:', { data, error });

    if (error) {
      console.error('[systemConfigService] Erro Supabase:', error);
      throw new Error(error.message || 'Erro ao buscar configurações do sistema');
    }

    console.log('[systemConfigService] Configurações encontradas:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('[systemConfigService] Erro ao buscar configurações:', error);
    throw new Error(
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
    const { data, error } = await supabase
      .from('system_configurations')
      .select('*')
      .eq('config_key', key)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`[systemConfigService] Erro Supabase ao buscar '${key}':`, error);
      throw new Error(error.message || `Configuração '${key}' não encontrada`);
    }

    if (!data) {
      throw new Error(`Configuração '${key}' não encontrada`);
    }

    return data;
  } catch (error: any) {
    console.error(`[systemConfigService] Erro ao buscar configuração '${key}':`, error);
    throw new Error(
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
    const { data, error } = await supabase
      .from('system_configurations')
      .update({ 
        config_value: value,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', key)
      .select()
      .single();

    if (error) {
      console.error(`[systemConfigService] Erro Supabase ao atualizar '${key}':`, error);
      
      // Tratamento especial para erros de permissão
      if (error.code === 'PGRST301' || error.code === '42501') {
        throw new Error('Você não tem permissão para alterar configurações do sistema');
      }
      
      throw new Error(error.message || 'Erro ao atualizar configuração');
    }

    if (!data) {
      throw new Error(`Configuração '${key}' não encontrada para atualização`);
    }

    return data;
  } catch (error: any) {
    console.error(`[systemConfigService] Erro ao atualizar configuração '${key}':`, error);
    throw new Error(
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
