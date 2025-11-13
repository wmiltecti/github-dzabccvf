import React, { useState } from 'react';
import { Activity, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../../lib/store/empreendimento';

interface AtividadesEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

/**
 * Página 3: Atividades do Empreendimento
 */
export default function AtividadesEmpreendimentoPage({ 
  onNext, 
  onPrevious 
}: AtividadesEmpreendimentoPageProps) {
  const { atividades, setAtividades, addAtividade, removeAtividade } = useEmpreendimentoStore();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    descricao: '',
    quantidade: '',
    unidade: '',
    area_ocupada: ''
  });

  const handleAddAtividade = () => {
    if (!formData.nome || !formData.tipo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    addAtividade({
      nome: formData.nome,
      tipo: formData.tipo,
      descricao: formData.descricao
    });

    setFormData({
      nome: '',
      tipo: '',
      descricao: '',
      quantidade: '',
      unidade: '',
      area_ocupada: ''
    });

    setShowForm(false);
    toast.success('Atividade adicionada!');
  };

  const handleRemoveAtividade = (index: number) => {
    removeAtividade(index);
    toast.info('Atividade removida');
  };

  const handleNext = () => {
    if (atividades.length === 0) {
      toast.error('Adicione pelo menos uma atividade');
      return;
    }

    onNext({ atividades });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Atividades do Empreendimento</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Cadastre as atividades que serão desenvolvidas no empreendimento
        </p>
      </div>

      {/* Botão Adicionar */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Atividade
        </button>
      )}

      {/* Formulário de Nova Atividade */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Nova Atividade</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Atividade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Processamento de Matéria-Prima"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Atividade <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecione...</option>
                <option value="producao">Produção</option>
                <option value="armazenamento">Armazenamento</option>
                <option value="processamento">Processamento</option>
                <option value="transporte">Transporte</option>
                <option value="comercializacao">Comercialização</option>
                <option value="servicos">Serviços</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Descreva a atividade..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade
                </label>
                <input
                  type="text"
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: ton/mês"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área Ocupada (m²)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.area_ocupada}
                  onChange={(e) => setFormData({ ...formData, area_ocupada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 500.00"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleAddAtividade}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Atividades */}
      {atividades.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Atividades Cadastradas ({atividades.length})</h3>
          
          {atividades.map((atividade, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{atividade.nome}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Tipo:</span> {atividade.tipo}
                  </p>
                  {atividade.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{atividade.descricao}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveAtividade(index)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Remover atividade"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {atividades.length === 0 && !showForm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Nenhuma atividade cadastrada</p>
        </div>
      )}

      {/* Botões de Navegação */}
      <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={atividades.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
