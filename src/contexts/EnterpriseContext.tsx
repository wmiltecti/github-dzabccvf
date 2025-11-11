/**
 * EnterpriseContext.tsx
 * Context para gerenciar estado de empreendimento selecionado
 * Usado no wizard de inscrição para controlar pesquisa e seleção
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Enterprise } from '../services/enterpriseService';

interface EnterpriseContextState {
  selectedEnterprise: Enterprise | null;
  isNewEnterprise: boolean;
  searchPerformed: boolean;
}

interface EnterpriseContextValue extends EnterpriseContextState {
  selectEnterprise: (enterprise: Enterprise) => void;
  clearEnterprise: () => void;
  setNewEnterprise: () => void;
  markSearchPerformed: () => void;
  resetAll: () => void;
}

const EnterpriseContext = createContext<EnterpriseContextValue | undefined>(undefined);

/**
 * Provider do contexto de empreendimento
 */
export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EnterpriseContextState>({
    selectedEnterprise: null,
    isNewEnterprise: false,
    searchPerformed: false,
  });

  /**
   * Seleciona um empreendimento existente (vindo da pesquisa)
   */
  const selectEnterprise = useCallback((enterprise: Enterprise) => {
    console.log('[EnterpriseContext] Empreendimento selecionado:', enterprise);
    
    setState({
      selectedEnterprise: enterprise,
      isNewEnterprise: false,
      searchPerformed: true,
    });
  }, []);

  /**
   * Limpa o empreendimento selecionado
   * Mantém searchPerformed como true se já foi feita pesquisa
   */
  const clearEnterprise = useCallback(() => {
    console.log('[EnterpriseContext] Limpando empreendimento selecionado');
    
    setState((prev) => ({
      ...prev,
      selectedEnterprise: null,
      isNewEnterprise: false,
    }));
  }, []);

  /**
   * Define que será um novo cadastro de empreendimento
   */
  const setNewEnterprise = useCallback(() => {
    console.log('[EnterpriseContext] Modo novo cadastro ativado');
    
    setState({
      selectedEnterprise: null,
      isNewEnterprise: true,
      searchPerformed: true, // Considera que a decisão de novo cadastro = busca realizada
    });
  }, []);

  /**
   * Marca que a pesquisa foi realizada (mesmo sem resultados)
   */
  const markSearchPerformed = useCallback(() => {
    console.log('[EnterpriseContext] Pesquisa marcada como realizada');
    
    setState((prev) => ({
      ...prev,
      searchPerformed: true,
    }));
  }, []);

  /**
   * Reseta todo o estado (útil ao cancelar wizard ou iniciar novo processo)
   */
  const resetAll = useCallback(() => {
    console.log('[EnterpriseContext] Resetando todo o estado');
    
    setState({
      selectedEnterprise: null,
      isNewEnterprise: false,
      searchPerformed: false,
    });
  }, []);

  const value: EnterpriseContextValue = {
    ...state,
    selectEnterprise,
    clearEnterprise,
    setNewEnterprise,
    markSearchPerformed,
    resetAll,
  };

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
}

/**
 * Hook para usar o contexto de empreendimento
 * @throws Error se usado fora do EnterpriseProvider
 */
export function useEnterprise(): EnterpriseContextValue {
  const context = useContext(EnterpriseContext);
  
  if (context === undefined) {
    throw new Error('useEnterprise deve ser usado dentro de um EnterpriseProvider');
  }
  
  return context;
}

/**
 * Hook para verificar se um empreendimento foi selecionado
 */
export function useHasSelectedEnterprise(): boolean {
  const { selectedEnterprise } = useEnterprise();
  return selectedEnterprise !== null;
}

/**
 * Hook para verificar se está em modo de novo cadastro
 */
export function useIsNewEnterprise(): boolean {
  const { isNewEnterprise } = useEnterprise();
  return isNewEnterprise;
}

/**
 * Hook para verificar se a pesquisa foi realizada
 */
export function useSearchPerformed(): boolean {
  const { searchPerformed } = useEnterprise();
  return searchPerformed;
}

export default EnterpriseContext;
