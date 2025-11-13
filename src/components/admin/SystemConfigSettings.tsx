/**
 * SystemConfigSettings.tsx
 * Componente para gerenciar configurações do sistema
 * Permite que administradores alterem configs em tempo real
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Settings, Save, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  getAllSystemConfigs, 
  updateSystemConfig, 
  SystemConfig,
  EnterpriseConfigKeys 
} from '../../services/systemConfigService';

interface ConfigToggle {
  key: string;
  label: string;
  description: string;
  value: boolean;
}

export default function SystemConfigSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [configs, setConfigs] = useState<ConfigToggle[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega todas as configurações do sistema
   */
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[SystemConfigSettings] Iniciando carregamento de configs...');
      const allConfigs = await getAllSystemConfigs();
      console.log('[SystemConfigSettings] Configs recebidas do service:', allConfigs);
      
      // Mapeia para estrutura de toggle
      const toggleConfigs: ConfigToggle[] = allConfigs.map(config => ({
        key: config.config_key,
        label: getConfigLabel(config.config_key),
        description: config.config_description || '',
        value: config.config_value
      }));
      
      console.log('[SystemConfigSettings] Configs mapeadas:', toggleConfigs);
      setConfigs(toggleConfigs);
      console.log('[SystemConfigSettings] Total de configs carregadas:', toggleConfigs.length);
    } catch (err: any) {
      console.error('[SystemConfigSettings] Erro ao carregar configs:', err);
      setError(err.message || 'Erro ao carregar configurações');
      toast.error('Erro ao carregar configurações do sistema');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retorna label amigável para cada config_key
   */
  const getConfigLabel = (key: string): string => {
    const labels: Record<string, string> = {
      [EnterpriseConfigKeys.SEARCH_REQUIRED]: 'Exigir pesquisa de empreendimento antes de cadastrar',
      [EnterpriseConfigKeys.ALLOW_NEW_REGISTER]: 'Permitir cadastro de novo empreendimento',
    };
    
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  /**
   * Manipula alteração de toggle
   */
  const handleToggleChange = async (configKey: string, newValue: boolean) => {
    try {
      setSaving(configKey);
      
      // Atualiza no backend
      await updateSystemConfig(configKey, newValue);
      
      // Atualiza estado local
      setConfigs(prevConfigs => 
        prevConfigs.map(config => 
          config.key === configKey 
            ? { ...config, value: newValue } 
            : config
        )
      );
      
      toast.success('Configuração atualizada com sucesso!', {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />
      });
      
    } catch (err: any) {
      console.error(`[SystemConfigSettings] Erro ao atualizar '${configKey}':`, err);
      toast.error(err.message || 'Erro ao atualizar configuração');
      
      // Recarrega configs em caso de erro para garantir sincronização
      await loadConfigs();
    } finally {
      setSaving(null);
    }
  };

  /**
   * Renderiza estado de loading
   */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-600">Carregando configurações...</p>
      </div>
    );
  }

  /**
   * Renderiza estado de erro
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao Carregar Configurações</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadConfigs}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  /**
   * Renderiza lista vazia
   */
  if (configs.length === 0) {
    console.log('[SystemConfigSettings] Renderizando "Nenhuma configuração" - configs.length:', configs.length);
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Settings className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600">Nenhuma configuração disponível</p>
        <button
          onClick={loadConfigs}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Recarregar Configurações
        </button>
      </div>
    );
  }

  console.log('[SystemConfigSettings] Renderizando lista de configs:', configs.length, 'itens');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
        </div>
        <p className="text-gray-600">
          Gerencie configurações globais que afetam o comportamento do sistema
        </p>
      </div>

      {/* Lista de Configurações */}
      <div className="glass-effect rounded-lg divide-y divide-gray-200">
        {configs.map((config, index) => (
          <div 
            key={config.key}
            className={`p-6 transition-colors ${
              saving === config.key ? 'bg-gray-50' : 'hover:bg-gray-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Info da Configuração */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {config.label}
                  </h3>
                  {saving === config.key && (
                    <Loader className="w-4 h-4 text-green-600 animate-spin" />
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {config.description}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                    <code>{config.key}</code>
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleToggleChange(config.key, !config.value)}
                  disabled={saving !== null}
                  className={`
                    relative inline-flex h-8 w-14 items-center rounded-full
                    transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    ${config.value ? 'bg-green-600' : 'bg-gray-300'}
                    ${saving !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={config.value ? 'Desativar' : 'Ativar'}
                >
                  <span
                    className={`
                      inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
                      transition-transform
                      ${config.value ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  />
                </button>
                <div className="mt-1 text-center">
                  <span className={`text-xs font-medium ${
                    config.value ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {config.value ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Informações Adicionais */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Informações Importantes
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• As alterações são aplicadas <strong>imediatamente</strong> em todo o sistema</li>
              <li>• Usuários já autenticados verão as mudanças na próxima interação</li>
              <li>• Apenas administradores podem modificar estas configurações</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botão de Recarregar (opcional) */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={loadConfigs}
          disabled={loading || saving !== null}
          className="text-sm text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
        >
          Recarregar Configurações
        </button>
      </div>
    </div>
  );
}
