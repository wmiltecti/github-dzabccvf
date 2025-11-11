/**
 * useSystemConfig.ts
 * Custom hook para gerenciar configurações do sistema
 * Busca e cacheia configs, fornece funções helper
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getEnterpriseConfigs,
  EnterpriseConfigKeys 
} from '../services/systemConfigService';

interface SystemConfigState {
  searchRequired: boolean;
  allowNewRegister: boolean;
}

interface UseSystemConfigReturn {
  loading: boolean;
  error: string | null;
  configs: SystemConfigState;
  shouldShowEnterpriseTab: () => boolean;
  allowNewEnterprise: () => boolean;
  isSearchRequired: () => boolean;
  refreshConfigs: () => Promise<void>;
}

/**
 * Hook para gerenciar configurações do sistema
 * @returns Objeto com loading, error, configs e funções helper
 */
export function useSystemConfig(): UseSystemConfigReturn {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [configs, setConfigs] = useState<SystemConfigState>({
    searchRequired: false,
    allowNewRegister: true,
  });

  /**
   * Carrega as configurações do sistema
   */
  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const enterpriseConfigs = await getEnterpriseConfigs();
      
      setConfigs({
        searchRequired: enterpriseConfigs.searchRequired,
        allowNewRegister: enterpriseConfigs.allowNewRegister,
      });
      
      console.log('[useSystemConfig] Configurações carregadas:', enterpriseConfigs);
    } catch (err: any) {
      console.error('[useSystemConfig] Erro ao carregar configurações:', err);
      setError(err.message || 'Erro ao carregar configurações');
      
      // Em caso de erro, usa valores padrão seguros
      setConfigs({
        searchRequired: false,
        allowNewRegister: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega configs na montagem do componente
   */
  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  /**
   * Determina se a aba de empreendimento deve ser exibida
   * A aba sempre é exibida, mas pode ter comportamentos diferentes
   */
  const shouldShowEnterpriseTab = useCallback((): boolean => {
    // A aba sempre é mostrada, mas as regras de validação mudam
    return true;
  }, []);

  /**
   * Determina se é permitido cadastrar novo empreendimento
   */
  const allowNewEnterprise = useCallback((): boolean => {
    return configs.allowNewRegister;
  }, [configs.allowNewRegister]);

  /**
   * Determina se a pesquisa de empreendimento é obrigatória
   */
  const isSearchRequired = useCallback((): boolean => {
    return configs.searchRequired;
  }, [configs.searchRequired]);

  /**
   * Força recarregamento das configurações
   * Útil para atualizar após mudanças nas configs
   */
  const refreshConfigs = useCallback(async (): Promise<void> => {
    await loadConfigs();
  }, [loadConfigs]);

  return {
    loading,
    error,
    configs,
    shouldShowEnterpriseTab,
    allowNewEnterprise,
    isSearchRequired,
    refreshConfigs,
  };
}

/**
 * Hook simplificado apenas para verificar se pesquisa é obrigatória
 * Útil quando só precisa dessa informação específica
 */
export function useEnterpriseSearchRequired(): {
  loading: boolean;
  isRequired: boolean;
} {
  const { loading, configs } = useSystemConfig();
  
  return {
    loading,
    isRequired: configs.searchRequired,
  };
}

/**
 * Hook simplificado apenas para verificar se permite novo cadastro
 * Útil quando só precisa dessa informação específica
 */
export function useAllowNewEnterprise(): {
  loading: boolean;
  isAllowed: boolean;
} {
  const { loading, configs } = useSystemConfig();
  
  return {
    loading,
    isAllowed: configs.allowNewRegister,
  };
}

export default useSystemConfig;
