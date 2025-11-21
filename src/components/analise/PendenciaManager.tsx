import React, { useState } from 'react';
import { X, AlertCircle, Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

interface PendenciaManagerProps {
  processoId: string;
  etapaAtual: string;
  onClose: () => void;
}

interface Pendencia {
  id: string;
  texto: string;
  etapa: string;
  dataCriacao: string;
}

const mockPendenciasModelo = [
  'Apresentar Certidão de Registro do Imóvel atualizada',
  'Apresentar Anotação de Responsabilidade Técnica (ART/RRT)',
  'Complementar documentação sobre sistema de tratamento de efluentes',
  'Apresentar autorização do órgão gestor de recursos hídricos',
  'Retificar coordenadas geográficas do empreendimento'
];

export default function PendenciaManager({ processoId, etapaAtual, onClose }: PendenciaManagerProps) {
  const [view, setView] = useState<'menu' | 'modelo' | 'nova' | 'lista'>('menu');
  const [pendenciasSelecionadas, setPendenciasSelecionadas] = useState<string[]>([]);
  const [novaPendencia, setNovaPendencia] = useState('');
  const [pendencias, setPendencias] = useState<Pendencia[]>([
    {
      id: '1',
      texto: 'Apresentar Certidão de Registro do Imóvel atualizada',
      etapa: 'Imóvel',
      dataCriacao: '2025-11-20'
    }
  ]);

  const handleSelecionarModelo = (modelo: string) => {
    if (pendenciasSelecionadas.includes(modelo)) {
      setPendenciasSelecionadas(pendenciasSelecionadas.filter(p => p !== modelo));
    } else {
      setPendenciasSelecionadas([...pendenciasSelecionadas, modelo]);
    }
  };

  const handleSalvarModelos = () => {
    if (pendenciasSelecionadas.length === 0) {
      toast.warning('Selecione pelo menos uma pendência');
      return;
    }

    const novasPendencias: Pendencia[] = pendenciasSelecionadas.map((texto, idx) => ({
      id: `${Date.now()}-${idx}`,
      texto,
      etapa: etapaAtual,
      dataCriacao: new Date().toISOString()
    }));

    setPendencias([...pendencias, ...novasPendencias]);
    setPendenciasSelecionadas([]);
    toast.success(`${novasPendencias.length} pendência(s) adicionada(s) com sucesso!`);
    setView('menu');
  };

  const handleSalvarNova = () => {
    if (!novaPendencia.trim()) {
      toast.warning('Digite o texto da pendência');
      return;
    }

    const novaPend: Pendencia = {
      id: Date.now().toString(),
      texto: novaPendencia,
      etapa: etapaAtual,
      dataCriacao: new Date().toISOString()
    };

    setPendencias([...pendencias, novaPend]);
    setNovaPendencia('');
    toast.success('Pendência criada com sucesso!');
    setView('menu');
  };

  const handleExcluir = (id: string) => {
    if (confirm('Deseja realmente excluir esta pendência?')) {
      setPendencias(pendencias.filter(p => p.id !== id));
      toast.success('Pendência excluída com sucesso!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Registro de Pendência</h3>
              <p className="text-sm text-gray-600">Etapa: {etapaAtual}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'menu' && (
            <div className="space-y-3">
              <button
                onClick={() => setView('modelo')}
                className="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Modelo de Pendência</h4>
                    <p className="text-xs text-gray-600">Selecionar pendências pré-cadastradas</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setView('nova')}
                className="w-full p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Redigir Nova</h4>
                    <p className="text-xs text-gray-600">Criar uma nova pendência personalizada</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setView('lista')}
                className="w-full p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Ver Pendências</h4>
                    <p className="text-xs text-gray-600">Visualizar, editar ou excluir pendências existentes</p>
                  </div>
                  {pendencias.length > 0 && (
                    <span className="ml-auto px-2 py-1 bg-amber-600 text-white text-xs rounded-full">
                      {pendencias.length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}

          {view === 'modelo' && (
            <div className="space-y-4">
              <button
                onClick={() => setView('menu')}
                className="text-sm text-blue-600 hover:text-blue-700 mb-4"
              >
                ← Voltar ao menu
              </button>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Selecione uma ou mais pendências:
              </h4>
              <div className="space-y-2">
                {mockPendenciasModelo.map((modelo, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={pendenciasSelecionadas.includes(modelo)}
                      onChange={() => handleSelecionarModelo(modelo)}
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm text-gray-700">{modelo}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setView('menu')}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarModelos}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Adicionar Selecionadas
                </button>
              </div>
            </div>
          )}

          {view === 'nova' && (
            <div className="space-y-4">
              <button
                onClick={() => setView('menu')}
                className="text-sm text-blue-600 hover:text-blue-700 mb-4"
              >
                ← Voltar ao menu
              </button>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Nova Pendência</h4>
              <textarea
                value={novaPendencia}
                onChange={(e) => setNovaPendencia(e.target.value)}
                rows={6}
                placeholder="Descreva a pendência..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setNovaPendencia('');
                    setView('menu');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarNova}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}

          {view === 'lista' && (
            <div className="space-y-4">
              <button
                onClick={() => setView('menu')}
                className="text-sm text-blue-600 hover:text-blue-700 mb-4"
              >
                ← Voltar ao menu
              </button>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Pendências da Etapa {etapaAtual}
              </h4>
              {pendencias.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Nenhuma pendência registrada nesta etapa</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendencias.map((pend) => (
                    <div
                      key={pend.id}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 mb-2">{pend.texto}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Etapa: {pend.etapa}</span>
                            <span>
                              Criada em: {new Date(pend.dataCriacao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toast.info('Função de edição será implementada')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExcluir(pend.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
