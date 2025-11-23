import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, X, Check, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

interface Condicionante {
  id: string;
  texto: string;
  dataCriacao: string;
}

interface CondicionantesProps {
  processoId: string;
  numeroProcesso: string;
  onVoltar: () => void;
}

export default function Condicionantes({ processoId, numeroProcesso, onVoltar }: CondicionantesProps) {
  const [condicionantes, setCondicionantes] = useState<Condicionante[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [condicionanteSelecionada, setCondicionanteSelecionada] = useState<Condicionante | null>(null);
  const [textoCondicionante, setTextoCondicionante] = useState('');

  const handleNova = () => {
    setModoEdicao(false);
    setCondicionanteSelecionada(null);
    setTextoCondicionante('');
    setShowFormModal(true);
  };

  const handleEditar = (condicionante: Condicionante) => {
    setModoEdicao(true);
    setCondicionanteSelecionada(condicionante);
    setTextoCondicionante(condicionante.texto);
    setShowFormModal(true);
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta condicionante?')) {
      setCondicionantes(condicionantes.filter(c => c.id !== id));
      toast.success('Condicionante excluída com sucesso!');
    }
  };

  const handleSalvar = () => {
    if (!textoCondicionante.trim()) {
      toast.error('Digite o texto da condicionante.');
      return;
    }

    if (modoEdicao && condicionanteSelecionada) {
      setCondicionantes(
        condicionantes.map(c =>
          c.id === condicionanteSelecionada.id
            ? { ...c, texto: textoCondicionante }
            : c
        )
      );
      toast.success('Condicionante atualizada com sucesso!');
    } else {
      const novaCondicionante: Condicionante = {
        id: Date.now().toString(),
        texto: textoCondicionante,
        dataCriacao: new Date().toLocaleDateString('pt-BR')
      };
      setCondicionantes([...condicionantes, novaCondicionante]);
      toast.success('Condicionante cadastrada com sucesso!');
    }

    setShowFormModal(false);
    setTextoCondicionante('');
    setCondicionanteSelecionada(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onVoltar}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Condicionantes</h1>
              <p className="text-gray-600 mt-1">Processo: {numeroProcesso}</p>
            </div>
          </div>
          <button
            onClick={handleNova}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Condicionante
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {condicionantes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhuma condicionante cadastrada</p>
              <p className="text-gray-400 text-sm mt-2">
                Clique em "Nova Condicionante" para adicionar a primeira condicionante deste processo
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {condicionantes.map((condicionante, index) => (
                <div
                  key={condicionante.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          Cadastrada em {condicionante.dataCriacao}
                        </span>
                      </div>
                      <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                        {condicionante.texto}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditar(condicionante)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar condicionante"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExcluir(condicionante.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir condicionante"
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

        <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p>
            <strong>Informação:</strong> As condicionantes cadastradas aqui serão incluídas na licença ambiental quando emitida.
            Certifique-se de revisar todas as condicionantes antes de finalizar a emissão da licença.
          </p>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modoEdicao ? 'Editar Condicionante' : 'Nova Condicionante'}
              </h2>
              <button
                onClick={() => {
                  setShowFormModal(false);
                  setTextoCondicionante('');
                  setCondicionanteSelecionada(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto da Condicionante <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={textoCondicionante}
                  onChange={(e) => setTextoCondicionante(e.target.value)}
                  placeholder="Digite o texto completo da condicionante específica para este processo..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Seja claro e específico ao descrever a condicionante. Use linguagem técnica apropriada.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowFormModal(false);
                  setTextoCondicionante('');
                  setCondicionanteSelecionada(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Check className="w-5 h-5" />
                {modoEdicao ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
