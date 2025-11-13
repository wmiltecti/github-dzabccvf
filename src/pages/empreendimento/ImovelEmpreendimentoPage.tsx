import React, { useState } from 'react';
import { Home, ArrowRight, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../../lib/store/empreendimento';

interface ImovelEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

/**
 * Página 1: Imóvel do Empreendimento
 * Permite buscar e selecionar ou criar novo imóvel
 */
export default function ImovelEmpreendimentoPage({ onNext, onPrevious }: ImovelEmpreendimentoPageProps) {
  const { property, setProperty, setPropertyId } = useEmpreendimentoStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    area: '',
    endereco: '',
    municipio: '',
    bairro: '',
    cep: ''
  });

  const handleSearch = () => {
    // TODO: Implementar busca no backend
    toast.info('Busca de imóveis em desenvolvimento');
  };

  const handleCreateNew = () => {
    setShowForm(true);
  };

  const handleSaveImovel = () => {
    if (!formData.nome || !formData.endereco) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    // Salva no store
    setProperty({
      nome: formData.nome,
      matricula: formData.matricula,
      area: parseFloat(formData.area) || 0,
      endereco: formData.endereco,
      municipio: formData.municipio,
      bairro: formData.bairro
    });

    toast.success('Imóvel salvo!');
  };

  const handleNext = () => {
    if (!property || !property.nome) {
      toast.error('Selecione ou cadastre um imóvel');
      return;
    }

    onNext({ property });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Home className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Imóvel do Empreendimento</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Busque um imóvel existente ou cadastre um novo
        </p>
      </div>

      {/* Busca de Imóvel */}
      {!showForm && !property && (
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, matrícula ou endereço..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>

          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">Ou</p>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cadastrar Novo Imóvel
            </button>
          </div>
        </div>
      )}

      {/* Formulário de Novo Imóvel */}
      {showForm && !property && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Cadastrar Novo Imóvel</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Imóvel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Fazenda Santa Maria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matrícula
              </label>
              <input
                type="text"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área (hectares)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 100.50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 12345-678"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Rodovia BR-101, Km 50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Município
              </label>
              <input
                type="text"
                value={formData.municipio}
                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: São Paulo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Centro"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleSaveImovel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Salvar Imóvel
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

      {/* Imóvel Selecionado */}
      {property && (
        <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
          <h3 className="text-lg font-semibold mb-4 text-green-800">Imóvel Selecionado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Nome:</span>
              <p className="text-gray-900">{property.nome}</p>
            </div>
            {property.matricula && (
              <div>
                <span className="font-medium text-gray-700">Matrícula:</span>
                <p className="text-gray-900">{property.matricula}</p>
              </div>
            )}
            {property.area && (
              <div>
                <span className="font-medium text-gray-700">Área:</span>
                <p className="text-gray-900">{property.area} ha</p>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Endereço:</span>
              <p className="text-gray-900">{property.endereco}</p>
            </div>
            {property.municipio && (
              <div>
                <span className="font-medium text-gray-700">Município:</span>
                <p className="text-gray-900">{property.municipio}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setProperty(null);
              setShowForm(false);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Remover e Buscar Outro
          </button>
        </div>
      )}

      {/* Botões de Navegação */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <div>
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Voltar
            </button>
          )}
        </div>
        <button
          onClick={handleNext}
          disabled={!property}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
