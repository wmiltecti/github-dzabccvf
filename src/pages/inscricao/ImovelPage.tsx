import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import { searchImoveis, SearchImovelResult } from '../../lib/api/property';
import { Home, MapPin, ArrowLeft, ArrowRight, Plus, Trash2, AlertTriangle, X, Search } from 'lucide-react';

type ModalStep = 'search' | 'confirm';

export default function ImovelPage() {
  const navigate = useNavigate();
  const { processoId } = useInscricaoContext();
  const { 
    property, 
    setProperty, 
    setPropertyId,
    isStepComplete,
    canProceedToStep
  } = useInscricaoStore();
  
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchImovelResult[]>([]);
  const [selectedImovel, setSelectedImovel] = useState<SearchImovelResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      setError(null);

      try {
        const result = await searchImoveis(searchTerm);
        if (result.error) {
          setError(result.error.message);
          setSearchResults([]);
        } else {
          setSearchResults(result.data || []);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar imóveis');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleOpenModal = () => {
    setShowModal(true);
    setModalStep('search');
    setSearchTerm('');
    setSearchResults([]);
    setSelectedImovel(null);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalStep('search');
    setSearchTerm('');
    setSearchResults([]);
    setSelectedImovel(null);
    setError(null);
  };

  const handleSelectImovel = (imovel: SearchImovelResult) => {
    setSelectedImovel(imovel);
    setModalStep('confirm');
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleBackToSearch = () => {
    setModalStep('search');
    setSelectedImovel(null);
  };

  const handleConfirmImovel = () => {
    if (!selectedImovel) return;

    // Mapeia o imóvel selecionado para o formato do store
    const propertyData = {
      kind: selectedImovel.kind,
      nome: selectedImovel.nome || '',
      areatotal: selectedImovel.areatotal || 0,
      municipio_sede: selectedImovel.municipio_sede || '',
      roteiro_acesso: '',
      utm_lat: selectedImovel.utm_lat || '',
      utm_long: selectedImovel.utm_long || '',
      utm_zona: '',
      dms_lat: selectedImovel.dms_lat || '',
      dms_long: selectedImovel.dms_long || '',
      car_codigo: selectedImovel.car_codigo || '',
      address: {
        cep: selectedImovel.cep || '',
        logradouro: selectedImovel.logradouro || '',
        numero: selectedImovel.numero || '',
        bairro: selectedImovel.bairro || '',
        complemento: '',
        ponto_referencia: '',
        uf: selectedImovel.uf || '',
        municipio: selectedImovel.municipio || ''
      }
    };

    setProperty(propertyData);
    setPropertyId(selectedImovel.id);
    handleCloseModal();
    alert('Imóvel selecionado com sucesso!');
  };

  const handleRemoveProperty = () => {
    if (!confirm('Deseja remover o imóvel selecionado?')) return;
    
    setProperty(undefined);
    setPropertyId(undefined);
  };

  const handleNext = () => {
    // TODO: Validação temporariamente desabilitada para aprovação de design
    // Reativar validação: if (canProceedToStep(3))
    navigate('/inscricao/empreendimento');
  };

  const handleBack = () => {
    navigate('/inscricao/participantes');
  };

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'URBANO':
        return 'Urbano';
      case 'RURAL':
        return 'Rural';
      case 'LINEAR':
        return 'Linear';
      default:
        return kind;
    }
  };

  const getKindBadgeColor = (kind: string) => {
    switch (kind) {
      case 'URBANO':
        return 'bg-blue-100 text-blue-800';
      case 'RURAL':
        return 'bg-green-100 text-green-800';
      case 'LINEAR':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAddress = (imovel: SearchImovelResult) => {
    const parts = [];
    if (imovel.logradouro) parts.push(imovel.logradouro);
    if (imovel.numero) parts.push(imovel.numero);
    if (imovel.bairro) parts.push(imovel.bairro);
    if (imovel.municipio) parts.push(imovel.municipio);
    if (imovel.uf) parts.push(imovel.uf);
    return parts.join(', ') || 'Endereço não informado';
  };

  // Mostra loading enquanto aguarda processoId
  if (!processoId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Inicializando processo...</h3>
          <p className="text-gray-600">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Imóvel do Processo</h2>
        <p className="text-gray-600">
          Busque e selecione o imóvel onde será desenvolvido o empreendimento.
        </p>
      </div>

      {/* Imóvel Selecionado */}
      {property ? (
        <div className="space-y-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Home className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {property.kind === 'RURAL' && property.car_codigo ? `CAR: ${property.car_codigo}` : 
                       property.municipio_sede || 'Imóvel selecionado'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getKindBadgeColor(property.kind || '')}`}>
                      {getKindLabel(property.kind || '')}
                    </span>
                  </div>
                  
                  {property.address && (property.address.logradouro || property.address.municipio) ? (
                    <p className="text-sm text-gray-600">
                      {property.address.logradouro && `${property.address.logradouro}`}
                      {property.address.numero && `, ${property.address.numero}`}
                      {property.address.bairro && ` - ${property.address.bairro}`}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Endereço não cadastrado</p>
                  )}
                  
                  {property.nome && (
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Nome:</span> {property.nome}
                    </p>
                  )}
                  
                  {property.areatotal && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Área Total:</span> {property.areatotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha
                    </p>
                  )}
                  
                  {(property.address?.municipio || property.address?.uf) && (
                    <p className="text-sm text-gray-500">
                      {property.address.municipio}{property.address.uf && ` - ${property.address.uf}`}
                    </p>
                  )}

                  {(property.utm_lat || property.dms_lat) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {property.utm_lat && `UTM: ${property.utm_lat}, ${property.utm_long}`}
                      {property.dms_lat && ` | DMS: ${property.dms_lat}, ${property.dms_long}`}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleRemoveProperty}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel selecionado</h3>
            <p className="text-gray-500 mb-4">Busque um imóvel cadastrado para continuar</p>
          </div>
        </div>
      )}

      {/* Botão Buscar Imóvel */}
      <div className="mb-6">
        <button
          onClick={handleOpenModal}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {property ? 'Alterar Imóvel' : 'Buscar Imóvel'}
        </button>
      </div>

      {/* Mensagem de Alerta */}
      {!property && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Imóvel obrigatório</h4>
              <p className="text-sm text-yellow-800 mt-1">
                É necessário selecionar um imóvel para continuar com a inscrição.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar: Participantes
        </button>
        
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          Próximo: Empreendimento
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de Busca */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Buscar Imóvel</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {modalStep === 'search' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar Imóvel Cadastrado
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar por CAR, Matrícula, Município ou Endereço..."
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          autoFocus
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                      </div>
                    </div>
                    {searchTerm.length > 0 && searchTerm.length < 3 && (
                      <p className="text-sm text-gray-500 mt-1">Digite pelo menos 3 caracteres</p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {searching && (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Buscando...</p>
                    </div>
                  )}

                  {!searching && searchResults.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resultados da busca:
                      </label>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nome</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Área Total (ha)</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">CAR/Matrícula</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Localização</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {searchResults.map((imovel) => (
                              <tr key={imovel.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getKindBadgeColor(imovel.kind)}`}>
                                    {getKindLabel(imovel.kind)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {imovel.nome || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {imovel.areatotal ? imovel.areatotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {imovel.car_codigo || imovel.matricula || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  <div className="max-w-xs">
                                    <p className="truncate">{formatAddress(imovel)}</p>
                                    {imovel.municipio_sede && (
                                      <p className="text-xs text-gray-500">Município sede: {imovel.municipio_sede}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleSelectImovel(imovel)}
                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                  >
                                    Selecionar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {!searching && searchTerm.length >= 3 && searchResults.length === 0 && !error && (
                    <div className="text-center py-8">
                      <Home className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 mb-4">Nenhum imóvel encontrado</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 mb-2">Imóvel não encontrado?</p>
                        <p className="text-xs text-blue-600">
                          O imóvel precisa estar previamente cadastrado no sistema para ser selecionado.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalStep === 'confirm' && selectedImovel && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imóvel Selecionado:
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <Home className="w-5 h-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {selectedImovel.kind === 'RURAL' && selectedImovel.car_codigo 
                                ? `CAR: ${selectedImovel.car_codigo}` 
                                : selectedImovel.municipio_sede || 'Imóvel'}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getKindBadgeColor(selectedImovel.kind)}`}>
                              {getKindLabel(selectedImovel.kind)}
                            </span>
                          </div>

                          {selectedImovel.matricula && (
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">Matrícula:</span> {selectedImovel.matricula}
                            </p>
                          )}

                          <p className="text-sm text-gray-600 mb-2">
                            {formatAddress(selectedImovel)}
                          </p>

                          {selectedImovel.nome && (
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">Nome:</span> {selectedImovel.nome}
                            </p>
                          )}

                          {selectedImovel.areatotal && (
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">Área Total:</span> {selectedImovel.areatotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha
                            </p>
                          )}

                          {selectedImovel.cep && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">CEP:</span> {selectedImovel.cep}
                            </p>
                          )}

                          {(selectedImovel.utm_lat || selectedImovel.dms_lat) && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              {selectedImovel.utm_lat && (
                                <p className="text-xs text-gray-500">
                                  <span className="font-medium">UTM:</span> {selectedImovel.utm_lat}, {selectedImovel.utm_long}
                                </p>
                              )}
                              {selectedImovel.dms_lat && (
                                <p className="text-xs text-gray-500">
                                  <span className="font-medium">DMS:</span> {selectedImovel.dms_lat}, {selectedImovel.dms_long}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Confirme que este é o imóvel correto para o processo de licenciamento.
                    </p>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={handleBackToSearch}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleConfirmImovel}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Confirmar Imóvel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
