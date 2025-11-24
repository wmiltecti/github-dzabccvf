/**
 * 🎭 CONFIGURAÇÃO DE MOCKUP
 * 
 * ⚠️ ATENÇÃO: Este arquivo controla o uso de dados mockados
 * 
 * Para DESATIVAR completamente o mockup quando o backend estiver pronto:
 * - Altere USE_MOCKUP para false
 * 
 * @version 1.0.0
 * @date 2025-11-24
 */

export const MOCKUP_CONFIG = {
  /**
   * ⚠️ MASTER SWITCH - Desative aqui quando o backend estiver pronto
   * 
   * true  = Usa dados mockados (desenvolvimento)
   * false = Usa APIs reais (produção)
   */
  USE_MOCKUP: true,

  /**
   * Configurações específicas por módulo
   */
  modules: {
    /**
     * Lista de empreendimentos
     * - Se lista vier vazia da API, carrega 5 registros mockados
     */
    enterpriseList: {
      enabled: true,
      loadIfEmpty: true,
    },

    /**
     * Salvamento de caracterização
     * - Salva dados mockados com variação aleatória
     */
    characterization: {
      enabled: true,
      randomizeData: true,
    },
  },

  /**
   * Configurações de log/debug
   */
  debug: {
    logMockupUsage: true, // Mostra no console quando usa mockup
    showWarnings: false,  // NÃO mostra avisos em tela
  },
};

/**
 * Helper para verificar se deve usar mockup
 */
export const shouldUseMockup = (module?: keyof typeof MOCKUP_CONFIG.modules): boolean => {
  if (!MOCKUP_CONFIG.USE_MOCKUP) return false;
  if (!module) return true;
  return MOCKUP_CONFIG.modules[module]?.enabled ?? false;
};

/**
 * Helper para log de mockup
 */
export const logMockup = (message: string, data?: any) => {
  if (MOCKUP_CONFIG.debug.logMockupUsage) {
    console.log(`🎭 [MOCKUP] ${message}`, data || '');
  }
};
