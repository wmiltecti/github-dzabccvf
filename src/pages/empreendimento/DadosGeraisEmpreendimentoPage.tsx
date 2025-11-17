import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore, SituacaoEmpreendimento, EmpreendimentoParticipe } from '../../lib/store/empreendimento';
import ParticipesManager, { Participe } from '../../components/ParticipesManager';

interface DadosGeraisEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

export default function DadosGeraisEmpreendimentoPage({
  onNext,
  onPrevious
}: DadosGeraisEmpreendimentoPageProps) {
  const {
    empreendimentoId,
    dadosGerais,
    participes,
    setDadosGerais,
    setParticipes,
    addParticipe,
    removeParticipe
  } = useEmpreendimentoStore();

  const [formData, setFormData] = useState({
    nome_empreendimento: dadosGerais?.nome_empreendimento || '',
    situacao: dadosGerais?.situacao || ('' as SituacaoEmpreendimento | ''),
    numero_empregados: dadosGerais?.numero_empregados || 0,
    horario_funcionamento: dadosGerais?.horario_funcionamento || '',
    descricao: dadosGerais?.descricao || '',
    tipo: dadosGerais?.tipo || '',
    investimento: dadosGerais?.investimento || 0,
    objetivo: dadosGerais?.objetivo || '',
    prazo_implantacao: dadosGerais?.prazo_implantacao || '',
    area_construida: dadosGerais?.area_construida || '',
    capacidade_producao: dadosGerais?.capacidade_producao || ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddParticipe = async (participe: Participe): Promise<void> => {
    const empreendimentoParticipe: EmpreendimentoParticipe = {
      id: participe.id,
      pessoa_id: participe.pessoa_id,
      pessoa_nome: participe.pessoa_nome,
      pessoa_cpf_cnpj: participe.pessoa_cpf_cnpj,
      pessoa_tipo: participe.pessoa_tipo,
      papel: participe.papel,
      pessoa_email: participe.pessoa_email,
      pessoa_telefone: participe.pessoa_telefone
    };

    addParticipe(empreendimentoParticipe);
  };

  const handleRemoveParticipe = async (participeId: string): Promise<void> => {
    removeParticipe(participeId);
  };

  const validateForm = (): boolean => {
    if (!formData.nome_empreendimento?.trim()) {
      toast.error('Nome do Empreendimento é obrigatório');
      return false;
    }

    if (!formData.situacao) {
      toast.error('Situação do Empreendimento é obrigatória');
      return false;
    }

    if (formData.numero_empregados < 0) {
      toast.error('Número de Empregados deve ser maior ou igual a zero');
      return false;
    }

    const hasRequerente = participes.some(p => p.papel === 'Requerente');
    if (!hasRequerente) {
      toast.error('É necessário adicionar pelo menos um Requerente');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    setDadosGerais(formData);

    toast.success('Dados gerais salvos com sucesso!');
    onNext({ dadosGerais: formData, participes });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Dados Gerais do Empreendimento</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Informe os dados básicos do empreendimento e os partícipes envolvidos
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome_empreendimento}
                onChange={(e) => handleChange('nome_empreendimento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Complexo Industrial XYZ"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situação <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.situacao}
                  onChange={(e) => handleChange('situacao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione...</option>
                  <option value="Planejado">Planejado</option>
                  <option value="Operando">Operando</option>
                  <option value="Instalado">Instalado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nº de Empregados
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numero_empregados}
                  onChange={(e) => handleChange('numero_empregados', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={formData.horario_funcionamento}
                onChange={(e) => handleChange('horario_funcionamento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 08:00 às 18:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Descreva o empreendimento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Empreendimento
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecione...</option>
                <option value="industrial">Industrial</option>
                <option value="comercial">Comercial</option>
                <option value="residencial">Residencial</option>
                <option value="agropecuario">Agropecuário</option>
                <option value="servicos">Serviços</option>
                <option value="infraestrutura">Infraestrutura</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investimento Estimado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.investimento}
                  onChange={(e) => handleChange('investimento', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 5000000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo de Implantação (meses)
                </label>
                <input
                  type="text"
                  value={formData.prazo_implantacao}
                  onChange={(e) => handleChange('prazo_implantacao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 24"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área Construída (m²)
                </label>
                <input
                  type="text"
                  value={formData.area_construida}
                  onChange={(e) => handleChange('area_construida', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 5000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidade de Produção
                </label>
                <input
                  type="text"
                  value={formData.capacidade_producao}
                  onChange={(e) => handleChange('capacidade_producao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 1000 ton/mês"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objetivo do Empreendimento
              </label>
              <textarea
                value={formData.objetivo}
                onChange={(e) => handleChange('objetivo', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Descreva os objetivos..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ParticipesManager
            participes={participes}
            onAdd={handleAddParticipe}
            onRemove={handleRemoveParticipe}
          />
        </div>
      </div>

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
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
