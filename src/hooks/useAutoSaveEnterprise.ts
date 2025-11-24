/**
 * Hook para auto-salvar empreendimento sempre que houver mudanças
 * Atualiza o JSON no mockup em tempo real
 */

import { useEffect, useRef } from 'react';
import { useEmpreendimentoStore } from '../lib/store/empreendimento';
import { buildEnterpriseJSON, saveMockEnterprise } from '../services/mockupService';
import { shouldUseMockup } from '../config/mockup';

export const useAutoSaveEnterprise = () => {
  const store = useEmpreendimentoStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<string>('');

  useEffect(() => {
    // Só funciona se mockup estiver ativo
    if (!shouldUseMockup()) {
      return;
    }

    // Monta JSON atual do store
    const currentData = {
      property: store.property,
      basic_info: store.dadosGerais,
      participants: store.participes,
      activities: store.atividades,
      characterization: store.caracterizacao
    };

    // Serializa para comparar se mudou
    const currentJSON = JSON.stringify(currentData);

    // Se não mudou nada, não salva
    if (currentJSON === lastSaveRef.current) {
      return;
    }

    // Cancela timeout anterior se existir
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Aguarda 2 segundos sem mudanças antes de salvar (debounce)
    saveTimeoutRef.current = setTimeout(() => {
      const empreendimentoId = store.empreendimentoId;
      
      // Só salva se tiver ID e dados básicos mínimos
      if (!empreendimentoId) {
        console.log('⏸️ [AUTO-SAVE] Aguardando ID do empreendimento...');
        return;
      }

      // Verifica se há dados mínimos para salvar
      const hasMinimalData = 
        currentData.property?.nome || 
        currentData.basic_info?.nome_empreendimento;

      if (!hasMinimalData) {
        console.log('⏸️ [AUTO-SAVE] Aguardando dados mínimos...');
        return;
      }

      try {
        console.log('💾 [AUTO-SAVE] Salvando alterações automaticamente...');
        
        // Detecta se é criação ou edição
        const isCreating = String(empreendimentoId).startsWith('emp_');
        const existingId = isCreating ? null : empreendimentoId;

        // Monta JSON para API
        const enterpriseJSON = buildEnterpriseJSON(currentData);

        // Salva no mockup (atualiza se já existe)
        saveMockEnterprise(enterpriseJSON, true, existingId); // true = rascunho

        lastSaveRef.current = currentJSON;
        console.log('✅ [AUTO-SAVE] Rascunho salvo automaticamente');
      } catch (error) {
        console.error('❌ [AUTO-SAVE] Erro ao salvar:', error);
      }
    }, 2000); // 2 segundos de debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    store.property,
    store.dadosGerais,
    store.participes,
    store.atividades,
    store.caracterizacao,
    store.empreendimentoId
  ]);
};
