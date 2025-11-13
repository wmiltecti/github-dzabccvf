import React, { useState } from 'react';
import { FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../../lib/store/empreendimento';

interface DadosGeraisEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

/**
 * Página 2: Dados Gerais do Empreendimento
 */
export default function DadosGeraisEmpreendimentoPage({ 
  onNext, 
  onPrevious 
}: DadosGeraisEmpreendimentoPageProps) {
  const { dadosGerais, setDadosGerais } = useEmpreendimentoStore();
  
  const [formData, setFormData] = useState({
    nome_empreendimento: dadosGerais?.nome_empreendimento || '',
    descricao: dadosGerais?.descricao || '',
    tipo: dadosGerais?.tipo || '',
    porte: dadosGerais?.porte || '',
    investimento: dadosGerais?.investimento || 0,
    objetivo: '',
    prazo_implantacao: '',
    area_construida: '',
    capacidade_producao: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!formData.nome_empreendimento || !formData.descricao) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    // Salva no store
    setDadosGerais(formData);
    
    onNext({ dadosGerais: formData });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Dados Gerais do Empreendimento</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Informe os dados básicos do empreendimento
        </p>
      </div>

      {/* Formulário */}
      <div className="space-y-6">
        {/* Nome do Empreendimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Empreendimento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nome_empreendimento}
            onChange={(e) => handleChange('nome_empreendimento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: Complexo Industrial XYZ"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Descreva o empreendimento..."
          />
        </div>

        {/* Tipo e Porte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porte
            </label>
            <select
              value={formData.porte}
              onChange={(e) => handleChange('porte', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecione...</option>
              <option value="micro">Micro</option>
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
              <option value="excepcional">Excepcional</option>
            </select>
          </div>
        </div>

        {/* Investimento e Prazo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investimento Estimado (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.investimento}
              onChange={(e) => handleChange('investimento', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 5000000.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prazo de Implantação (meses)
            </label>
            <input
              type="number"
              value={formData.prazo_implantacao}
              onChange={(e) => handleChange('prazo_implantacao', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 24"
            />
          </div>
        </div>

        {/* Área Construída e Capacidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área Construída (m²)
            </label>
            <input
              type="number"
              step="0.01"
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

        {/* Objetivo */}
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
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
