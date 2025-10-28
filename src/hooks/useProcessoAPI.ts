import { useState } from 'react';
import {
  criarProcesso as apiCriarProcesso,
  upsertDadosGerais as apiUpsertDadosGerais,
  ProcessoResponse,
  DadosGeraisResponse,
  DadosGeraisPayload
} from '../lib/api/processos';
import { saveOfflineOperation } from '../lib/services/syncService';

interface UseProcessoAPIReturn {
  loading: boolean;
  error: string | null;
  processoData: ProcessoResponse | DadosGeraisResponse | null;
  isOfflineMode: boolean;
  createProcesso: (userId: string) => Promise<ProcessoResponse | null>;
  upsertDadosGerais: (processoId: string, data: DadosGeraisPayload) => Promise<DadosGeraisResponse | null>;
  clearError: () => void;
}

export function useProcessoAPI(): UseProcessoAPIReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processoData, setProcessoData] = useState<ProcessoResponse | DadosGeraisResponse | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const clearError = () => setError(null);

  const createProcesso = async (userId: string): Promise<ProcessoResponse | null> => {
    setLoading(true);
    setError(null);
    setIsOfflineMode(false);

    try {
      const result = await apiCriarProcesso(userId);
      setProcessoData(result);
      return result;
    } catch (err: any) {
      const isNetworkError = (err as any).isNetworkError;

      if (isNetworkError) {
        setIsOfflineMode(true);

        try {
          const tempProcessoId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await saveOfflineOperation(
            userId,
            tempProcessoId,
            { user_id: userId, status: 'draft' },
            'CREATE_PROCESSO'
          );

          const offlineProcesso: ProcessoResponse = {
            id: tempProcessoId,
            user_id: userId,
            status: 'draft',
            protocolo_interno: 'OFFLINE',
            numero_processo_externo: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setProcessoData(offlineProcesso);
          return offlineProcesso;
        } catch (saveError) {
          setError('Falha ao salvar dados offline. Verifique sua conexão.');
          return null;
        }
      } else {
        setError(err.message || 'Erro ao criar processo');
        return null;
      }
    } finally {
      setLoading(false);
    }
  };

  const upsertDadosGerais = async (
    processoId: string,
    data: DadosGeraisPayload
  ): Promise<DadosGeraisResponse | null> => {
    setLoading(true);
    setError(null);
    setIsOfflineMode(false);

    try {
      const result = await apiUpsertDadosGerais(processoId, data);
      setProcessoData(result);
      return result;
    } catch (err: any) {
      const isNetworkError = (err as any).isNetworkError;

      if (isNetworkError) {
        setIsOfflineMode(true);

        try {
          const userId = localStorage.getItem('user_id') || '';
          await saveOfflineOperation(
            userId,
            processoId,
            { processo_id: processoId, ...data },
            'UPSERT_DADOS_GERAIS'
          );

          const offlineResponse: DadosGeraisResponse = {
            id: `temp_dg_${Date.now()}`,
            processo_id: processoId,
            protocolo_interno: 'OFFLINE',
            numero_processo_externo: null,
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setProcessoData(offlineResponse);
          return offlineResponse;
        } catch (saveError) {
          setError('Falha ao salvar dados offline. Verifique sua conexão.');
          return null;
        }
      } else {
        setError(err.message || 'Erro ao salvar dados gerais');
        return null;
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    processoData,
    isOfflineMode,
    createProcesso,
    upsertDadosGerais,
    clearError,
  };
}
