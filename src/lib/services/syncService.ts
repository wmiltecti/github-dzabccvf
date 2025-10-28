import { supabase } from '../supabase';
import { criarProcesso, upsertDadosGerais, DadosGeraisPayload, ProcessoResponse, DadosGeraisResponse } from '../api/processos';

export interface PendingSyncOperation {
  id: string;
  user_id: string;
  processo_id_local: string;
  dados_completos: any;
  tipo_operacao: 'CREATE_PROCESSO' | 'UPSERT_DADOS_GERAIS';
  synced: boolean;
  created_at: string;
  synced_at?: string | null;
}

export async function saveOfflineOperation(
  userId: string,
  processoIdLocal: string,
  dadosCompletos: any,
  tipoOperacao: 'CREATE_PROCESSO' | 'UPSERT_DADOS_GERAIS'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('processos_pendentes_sync')
      .insert({
        user_id: userId,
        processo_id_local: processoIdLocal,
        dados_completos: dadosCompletos,
        tipo_operacao: tipoOperacao,
        synced: false,
      });

    if (error) {
      console.error('Error saving offline operation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to save offline operation:', error);
    throw error;
  }
}

export async function getPendingOperations(userId: string): Promise<PendingSyncOperation[]> {
  try {
    const { data, error } = await supabase
      .from('processos_pendentes_sync')
      .select('*')
      .eq('user_id', userId)
      .eq('synced', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting pending operations:', error);
      throw error;
    }

    return (data || []) as PendingSyncOperation[];
  } catch (error) {
    console.error('Failed to get pending operations:', error);
    return [];
  }
}

export async function retrySyncOperation(
  operation: PendingSyncOperation
): Promise<{ success: boolean; result?: ProcessoResponse | DadosGeraisResponse; error?: string }> {
  try {
    if (operation.tipo_operacao === 'CREATE_PROCESSO') {
      const result = await criarProcesso(operation.user_id);
      return { success: true, result };
    } else if (operation.tipo_operacao === 'UPSERT_DADOS_GERAIS') {
      const { processo_id, ...payload } = operation.dados_completos;
      const result = await upsertDadosGerais(processo_id, payload as DadosGeraisPayload);
      return { success: true, result };
    }

    return { success: false, error: 'Tipo de operação desconhecido' };
  } catch (error: any) {
    const isNetworkError = (error as any).isNetworkError;
    return {
      success: false,
      error: isNetworkError ? 'network' : error.message
    };
  }
}

export async function markAsSynced(operationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('processos_pendentes_sync')
      .update({
        synced: true,
        synced_at: new Date().toISOString()
      })
      .eq('id', operationId);

    if (error) {
      console.error('Error marking operation as synced:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to mark operation as synced:', error);
    throw error;
  }
}

export async function deleteOperation(operationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('processos_pendentes_sync')
      .delete()
      .eq('id', operationId);

    if (error) {
      console.error('Error deleting operation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete operation:', error);
    throw error;
  }
}
