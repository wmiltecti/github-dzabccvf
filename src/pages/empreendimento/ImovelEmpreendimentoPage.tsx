import React, { useState, useEffect } from 'react';
import { Home, ArrowRight, Search, CheckCircle, X, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../../lib/store/empreendimento';
import { searchImoveis, SearchImovelResult } from '../../lib/api/property';

interface ImovelEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

type SearchType = 'car' | 'matricula' | 'documento';

export default function ImovelEmpreendimentoPage({ onNext, onPrevious }: ImovelEmpreendimentoPageProps) {
  const { property, setProperty, setPropertyId } = useEmpreendimentoStore();

  const [searchType, setSearchType] = useState<SearchType>('car');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchImovelResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchImovelResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'car':
        return 'Digite o número do CAR...';
      case 'matricula':
        return 'Digite o número da matrícula...';
      case 'documento':
        return 'Digite o CPF ou CNPJ do proprietário...';
      default:
        return 'Digite para buscar...';
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Digite algo para buscar');
      return;
    }

    if (searchTerm.trim().length < 3) {
      toast.error('Digite pelo menos 3 caracteres');
      return;
    }

    try {
      setSearching(true);
      setShowResults(true);
      setSearchPerformed(false);

      const { data, error } = await searchImoveis(searchTerm.trim());

      if (error) {
        toast.error(error.message || 'Erro ao buscar imóveis');
        setSearchResults([]);
        setSearchPerformed(true);
        return;
      }

      if (!data || data.length === 0) {
        toast.info('Nenhum imóvel encontrado');
        setSearchResults([]);
        setSearchPerformed(true);
        return;
      }

      setSearchResults(data);
      setSearchPerformed(true);
      toast.success(`${data.length} imóvel(is) encontrado(s)`);
    } catch (err: any) {
      console.error('Erro na busca:', err);
      toast.error('Erro ao realizar busca');
      setSearchResults([]);
      setSearchPerformed(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProperty = (imovel: SearchImovelResult) => {
    setSelectedResult(imovel);
    setShowConfirmModal(true);
  };

  const handleConfirmSelection = () => {
    if (!selectedResult) return;

    setProperty({
      id: selectedResult.id,
      nome: selectedResult.nome || 'Imóvel selecionado',
      matricula: selectedResult.matricula,
      area: selectedResult.areatotal,
      endereco: [
        selectedResult.logradouro,
        selectedResult.numero,
        selectedResult.bairro
      ].filter(Boolean).join(', ') || 'Endereço não informado',
      municipio: selectedResult.municipio || selectedResult.municipio_sede,
      bairro: selectedResult.bairro,
      car_codigo: selectedResult.car_codigo
    });

    setPropertyId(selectedResult.id);
    toast.success('Imóvel selecionado com sucesso!');
    setShowConfirmModal(false);
    setShowResults(false);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleClearProperty = () => {
    setProperty(null);
    setPropertyId(null);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleNext = () => {
    if (!property || !property.nome) {
      toast.error('Selecione um imóvel antes de continuar');
      return;
    }

    onNext({ property });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Home className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Imóvel do Empreendimento</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Busque um imóvel cadastrado no sistema
        </p>
      </div>

      {!property && (
        <>
          <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Buscar Imóvel</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Busca
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('car');
                    setSearchTerm('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchType === 'car'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Número CAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('matricula');
                    setSearchTerm('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchType === 'matricula'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Matrícula
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('documento');
                    setSearchTerm('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchType === 'documento'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  CPF/CNPJ
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={getSearchPlaceholder()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching || searchTerm.trim().length < 3}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-gray-500">
              {searchType === 'car' && '💡 Digite o código do Cadastro Ambiental Rural (CAR)'}
              {searchType === 'matricula' && '💡 Digite o número de matrícula do imóvel'}
              {searchType === 'documento' && '💡 Digite o CPF ou CNPJ do proprietário do imóvel'}
            </div>
          </div>

          {showResults && (
            <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Resultados da Busca {searchResults.length > 0 && `(${searchResults.length})`}
                </h3>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setSearchResults([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">Nenhum imóvel encontrado</p>
                  <p className="text-sm mt-1 text-gray-400">Tente buscar com outros termos ou cadastre um novo imóvel</p>
                  
                  {searchPerformed && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowNewPropertyModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Cadastrar Novo Imóvel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((imovel) => (
                    <div
                      key={imovel.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer"
                      onClick={() => handleSelectProperty(imovel)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                              {imovel.kind || 'N/D'}
                            </span>
                            {imovel.car_codigo && (
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                CAR: {imovel.car_codigo}
                              </span>
                            )}
                            {imovel.matricula && (
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                Mat: {imovel.matricula}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {imovel.municipio_sede && (
                              <div>
                                <span className="font-medium text-gray-700">Município:</span>{' '}
                                <span className="text-gray-900">{imovel.municipio_sede}</span>
                              </div>
                            )}
                            {imovel.areatotal && (
                              <div>
                                <span className="font-medium text-gray-700">Área:</span>{' '}
                                <span className="text-gray-900">{imovel.areatotal} ha</span>
                              </div>
                            )}
                            {imovel.logradouro && (
                              <div className="col-span-2">
                                <span className="font-medium text-gray-700">Endereço:</span>{' '}
                                <span className="text-gray-900">
                                  {[imovel.logradouro, imovel.numero, imovel.bairro].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                            {(imovel.utm_lat || imovel.dms_lat) && (
                              <div className="col-span-2">
                                <span className="font-medium text-gray-700">Coordenadas:</span>{' '}
                                <span className="text-gray-900 text-xs">
                                  {imovel.utm_lat && imovel.utm_long ? `UTM: ${imovel.utm_lat}, ${imovel.utm_long}` : ''}
                                  {imovel.dms_lat && imovel.dms_long ? `DMS: ${imovel.dms_lat}, ${imovel.dms_long}` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProperty(imovel);
                          }}
                        >
                          Selecionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {property && (
        <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Imóvel Selecionado
            </h3>
            <button
              onClick={handleClearProperty}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Trocar Imóvel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Nome:</span>
              <p className="text-gray-900">{property.nome || 'N/D'}</p>
            </div>
            {property.car_codigo && (
              <div>
                <span className="font-medium text-gray-700">CAR:</span>
                <p className="text-gray-900 font-mono text-xs">{property.car_codigo}</p>
              </div>
            )}
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
            <div className="col-span-2">
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
        </div>
      )}

      {showNewPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Cadastrar Novo Imóvel
              </h3>
              <button
                onClick={() => setShowNewPropertyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>📋 Em Desenvolvimento:</strong> O formulário completo de cadastro de imóvel será implementado aqui.
                  Por enquanto, você pode buscar imóveis já cadastrados no sistema.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Imóvel <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="">Selecione o tipo...</option>
                    <option value="RURAL">Rural (com CAR)</option>
                    <option value="URBANO">Urbano</option>
                    <option value="LINEAR">Linear (rodovia, ferrovia, etc)</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  <Home className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Formulário completo em desenvolvimento</p>
                  <p className="text-xs mt-1">Campos de cadastro detalhado serão adicionados em breve</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNewPropertyModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                disabled
                className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Salvar (em breve)
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Seleção de Imóvel</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">Confirma a seleção deste imóvel para o empreendimento?</p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  {selectedResult.kind && (
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                      {selectedResult.kind}
                    </span>
                  )}
                  {selectedResult.car_codigo && (
                    <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                      CAR: {selectedResult.car_codigo}
                    </span>
                  )}
                </div>
                {selectedResult.municipio_sede && (
                  <p><strong>Município:</strong> {selectedResult.municipio_sede}</p>
                )}
                {selectedResult.areatotal && (
                  <p><strong>Área Total:</strong> {selectedResult.areatotal} ha</p>
                )}
                {selectedResult.logradouro && (
                  <p><strong>Endereço:</strong> {[selectedResult.logradouro, selectedResult.numero, selectedResult.bairro].filter(Boolean).join(', ')}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSelection}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar Seleção
              </button>
            </div>
          </div>
        </div>
      )}

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
