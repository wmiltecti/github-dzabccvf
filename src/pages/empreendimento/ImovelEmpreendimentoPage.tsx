import React, { useState, useEffect } from 'react';
import { Home, ArrowRight, Search, CheckCircle, X, Plus, Map } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../../lib/store/empreendimento';
import { searchImoveis, SearchImovelResult } from '../../lib/api/property';
import NewPropertyModal from '../../components/property/NewPropertyModal';

interface ImovelEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

type SearchType = 'car' | 'matricula' | 'documento';

export default function ImovelEmpreendimentoPage({ onNext, onPrevious }: ImovelEmpreendimentoPageProps) {
  const { property, setProperty, setPropertyId } = useEmpreendimentoStore();

  const [searchType, setSearchType] = useState<SearchType>('documento');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchImovelResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchImovelResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [newPropertyType, setNewPropertyType] = useState<'RURAL' | 'URBANO' | 'LINEAR' | ''>('');
  const [showGeoFrontIframe, setShowGeoFrontIframe] = useState(false);
  
  // Estados para novo imóvel RURAL
  const [newRuralData, setNewRuralData] = useState({
    nome: '',
    car_codigo: '',
    car_situacao: 'Ativo',
    municipio: '',
    uf: '',
    area_total: '',
    sistema_referencia: 'SIRGAS 2000',
    coordenadas_utm_lat: '',
    coordenadas_utm_long: ''
  });

  // Estados para novo imóvel URBANO
  const [newUrbanoData, setNewUrbanoData] = useState({
    nome: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    complemento: '',
    municipio: '',
    uf: '',
    matricula: '',
    area_total: '',
    sistema_referencia: 'SIRGAS 2000',
    coordenadas_utm_lat: '',
    coordenadas_utm_long: ''
  });

  // Estados para novo imóvel LINEAR
  const [newLinearData, setNewLinearData] = useState({
    nome: '',
    municipio_inicio: '',
    uf_inicio: '',
    municipio_final: '',
    uf_final: '',
    extensao_km: '',
    sistema_referencia: 'SIRGAS 2000'
  });

  // ✨ Carrega dados do imóvel quando em modo edição
  useEffect(() => {
    if (property && property.nome) {
      console.log('🏠 [IMÓVEL] Carregando dados do store:', property);
      // Property já está no store, formulários devem exibir os dados
      // Se for RURAL, preenche newRuralData
      if (property.kind === 'RURAL') {
        setNewRuralData({
          nome: property.nome || '',
          car_codigo: property.car_codigo || '',
          car_situacao: property.situacao_car || 'Ativo',
          municipio: property.municipio || '',
          uf: property.uf || '',
          area_total: property.area_total?.toString() || '',
          sistema_referencia: property.coordenadas?.sistema_referencia || 'SIRGAS 2000',
          coordenadas_utm_lat: property.coordenadas?.latitude?.toString() || '',
          coordenadas_utm_long: property.coordenadas?.longitude?.toString() || ''
        });
        setNewPropertyType('RURAL');
      }
      // Se for URBANO
      else if (property.kind === 'URBANO') {
        setNewUrbanoData({
          nome: property.nome || '',
          cep: property.cep || '',
          logradouro: property.endereco_completo || '',
          numero: '',
          bairro: property.bairro || '',
          complemento: '',
          municipio: property.municipio || '',
          uf: property.uf || '',
          matricula: property.matricula || '',
          area_total: property.area_total?.toString() || '',
          sistema_referencia: property.coordenadas?.sistema_referencia || 'SIRGAS 2000',
          coordenadas_utm_lat: property.coordenadas?.latitude?.toString() || '',
          coordenadas_utm_long: property.coordenadas?.longitude?.toString() || ''
        });
        setNewPropertyType('URBANO');
      }
      // Se for LINEAR
      else if (property.kind === 'LINEAR') {
        setNewLinearData({
          nome: property.nome || '',
          municipio_inicio: property.municipio || '',
          uf_inicio: property.uf || '',
          municipio_final: '',
          uf_final: '',
          extensao_km: property.area_total?.toString() || '',
          sistema_referencia: property.coordenadas?.sistema_referencia || 'SIRGAS 2000'
        });
        setNewPropertyType('LINEAR');
      }
    } else {
      // Modo criação: abre modal automaticamente
      console.log('🏠 Nenhum imóvel selecionado, abrindo modal de cadastro...');
      setShowNewPropertyModal(true);
    }
  }, [property]); // Reage a mudanças no property

  const getSearchPlaceholder = () => {
    return 'Digite o CPF ou CNPJ do proprietário...';
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

  const handleOpenNewPropertyModal = () => {
    setShowNewPropertyModal(true);
    setNewPropertyType('');
  };

  const handleCloseNewPropertyModal = () => {
    setShowNewPropertyModal(false);
    setNewPropertyType('');
    // Reset forms
    setNewRuralData({
      nome: '',
      car_codigo: '',
      car_situacao: 'Ativo',
      municipio: '',
      uf: '',
      area_total: '',
      sistema_referencia: 'SIRGAS 2000',
      coordenadas_utm_lat: '',
      coordenadas_utm_long: ''
    });
    setNewUrbanoData({
      nome: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      complemento: '',
      municipio: '',
      uf: '',
      matricula: '',
      area_total: '',
      sistema_referencia: 'SIRGAS 2000',
      coordenadas_utm_lat: '',
      coordenadas_utm_long: ''
    });
    setNewLinearData({
      nome: '',
      municipio_inicio: '',
      uf_inicio: '',
      municipio_final: '',
      uf_final: '',
      extensao_km: '',
      sistema_referencia: 'SIRGAS 2000'
    });
  };

  const generatePropertyJSON = (type: 'RURAL' | 'URBANO' | 'LINEAR', data: any) => {
    let jsonData: any = {};

    if (type === 'RURAL') {
      jsonData = {
        tipoImovel: 'RURAL',
        nomeImovel: data.nome,
        codigoCar: data.car_codigo,
        situacaoCar: data.car_situacao || 'ATIVO',
        areaTotalHa: parseFloat(data.area_total) || 0,
        municipio: data.municipio,
        uf: data.uf,
        sistemaReferencia: data.sistema_referencia || 'SIRGAS 2000',
        coordenadas: {
          latitude: parseFloat(data.coordenadas_utm_lat) || 0,
          longitude: parseFloat(data.coordenadas_utm_long) || 0
        }
      };
    } else if (type === 'URBANO') {
      jsonData = {
        tipoImovel: 'URBANO',
        nomeImovel: data.nome,
        cep: data.cep,
        matricula: data.matricula,
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        complemento: data.complemento,
        municipio: data.municipio,
        uf: data.uf,
        areaTotalM2: parseFloat(data.area_total) || 0,
        sistemaReferencia: data.sistema_referencia || 'SIRGAS 2000',
        coordenadas: {
          latitude: parseFloat(data.coordenadas_utm_lat) || 0,
          longitude: parseFloat(data.coordenadas_utm_long) || 0
        }
      };
    } else if (type === 'LINEAR') {
      jsonData = {
        tipoImovel: 'LINEAR',
        nomeEmpreendimento: data.nome,
        pontoInicio: {
          municipio: data.municipio_inicio,
          uf: data.uf_inicio
        },
        pontoFinal: {
          municipio: data.municipio_final,
          uf: data.uf_final
        },
        extensaoKm: parseFloat(data.extensao_km) || 0,
        sistemaReferencia: data.sistema_referencia || 'SIRGAS 2000'
      };
    }

    // Adicionar metadados
    const jsonCompleto = {
      metadados: {
        timestamp: new Date().toISOString(),
        versao: '2.5.2',
        branch: 'feature/working-branch',
        origem: 'botao_preencher_dados'
      },
      imovel: jsonData
    };

    // Exibir no console para debug
    console.log('📦 JSON Gerado - Imóvel:', JSON.stringify(jsonCompleto, null, 2));

    // Download do arquivo JSON (desabilitado durante testes automatizados)
    const isAutomatedTest = window.location.search.includes('automated=true') || 
                           (window.navigator.webdriver === true);
    
    if (!isAutomatedTest) {
      const blob = new Blob([JSON.stringify(jsonCompleto, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `imovel_${type.toLowerCase()}_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`JSON do imóvel ${type} gerado e baixado!`);
    } else {
      console.log('⚠️ Download de JSON desabilitado durante testes automatizados');
    }
  };

  const handleFillPropertyData = () => {
    if (!newPropertyType) {
      toast.warning('Selecione o tipo de imóvel primeiro');
      return;
    }

    let filledData: any = {};

    if (newPropertyType === 'RURAL') {
      filledData = {
        nome: 'Fazenda Santa Clara',
        car_codigo: 'RO-1100205-1234567890ABCDEF1234567890ABCDEF',
        car_situacao: 'Ativo',
        municipio: 'Porto Velho',
        uf: 'RO',
        area_total: '150.75',
        sistema_referencia: 'SIRGAS 2000',
        coordenadas_utm_lat: '-8.761940',
        coordenadas_utm_long: '-63.903850'
      };
      setNewRuralData(filledData);
    } else if (newPropertyType === 'URBANO') {
      filledData = {
        nome: 'Lote Comercial Centro',
        cep: '76801-000',
        logradouro: 'Av. 7 de Setembro',
        numero: '1500',
        bairro: 'Centro',
        complemento: 'Sala 201',
        municipio: 'Porto Velho',
        uf: 'RO',
        matricula: '12345',
        area_total: '250.00',
        sistema_referencia: 'SIRGAS 2000',
        coordenadas_utm_lat: '-8.761940',
        coordenadas_utm_long: '-63.903850'
      };
      setNewUrbanoData(filledData);
    } else if (newPropertyType === 'LINEAR') {
      filledData = {
        nome: 'Rodovia RO-010',
        municipio_inicio: 'Porto Velho',
        uf_inicio: 'RO',
        municipio_final: 'Ariquemes',
        uf_final: 'RO',
        extensao_km: '38.5',
        sistema_referencia: 'SIRGAS 2000'
      };
      setNewLinearData(filledData);
    }

    toast.success('Dados preenchidos automaticamente');

    // Gerar JSON após preencher
    setTimeout(() => {
      generatePropertyJSON(newPropertyType as 'RURAL' | 'URBANO' | 'LINEAR', filledData);
    }, 500);
  };

  const handleSaveNewProperty = () => {
    // Validações básicas
    if (!newPropertyType) {
      toast.error('Selecione o tipo de imóvel');
      return;
    }

    let propertyData: any = {};

    if (newPropertyType === 'RURAL') {
      if (!newRuralData.nome || !newRuralData.car_codigo || !newRuralData.municipio) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      propertyData = {
        kind: 'RURAL',
        nome: newRuralData.nome,
        car_codigo: newRuralData.car_codigo,
        municipio: newRuralData.municipio,
        area: parseFloat(newRuralData.area_total) || 0,
        endereco: `${newRuralData.municipio}, ${newRuralData.uf}`,
        bairro: '',
        matricula: ''
      };
    } else if (newPropertyType === 'URBANO') {
      if (!newUrbanoData.nome || !newUrbanoData.logradouro || !newUrbanoData.municipio) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      propertyData = {
        kind: 'URBANO',
        nome: newUrbanoData.nome,
        matricula: newUrbanoData.matricula,
        municipio: newUrbanoData.municipio,
        area: parseFloat(newUrbanoData.area_total) || 0,
        endereco: `${newUrbanoData.logradouro}, ${newUrbanoData.numero} - ${newUrbanoData.bairro}`,
        bairro: newUrbanoData.bairro,
        car_codigo: ''
      };
    } else if (newPropertyType === 'LINEAR') {
      if (!newLinearData.nome || !newLinearData.municipio_inicio || !newLinearData.municipio_final) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      propertyData = {
        kind: 'LINEAR',
        nome: newLinearData.nome,
        municipio: newLinearData.municipio_inicio,
        endereco: `De ${newLinearData.municipio_inicio}/${newLinearData.uf_inicio} até ${newLinearData.municipio_final}/${newLinearData.uf_final}`,
        area: parseFloat(newLinearData.extensao_km) || 0,
        bairro: '',
        matricula: '',
        car_codigo: ''
      };
    }

    // Salva no store
    setProperty(propertyData);
    setPropertyId(propertyData.id || `new-${Date.now()}`);

    toast.success('Imóvel cadastrado com sucesso!');
    handleCloseNewPropertyModal();
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Tipo de Busca:</span> CPF/CNPJ do Proprietário
                </p>
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
              💡 Digite o CPF ou CNPJ do proprietário do imóvel
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
                        onClick={handleOpenNewPropertyModal}
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

      {/* Painel do Mapa do Imóvel */}
      {property && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mapa do Imóvel</h3>
            <button
              onClick={() => setShowGeoFrontIframe(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Map className="w-4 h-4" />
              Ver no Mapa
            </button>
          </div>

          {!showGeoFrontIframe && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">
                Visualize e edite o mapa georreferenciado do imóvel
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Clique no botão acima para abrir o editor de mapas
              </p>
            </div>
          )}

          {/* GeoFront Iframe */}
          {showGeoFrontIframe && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-800">GeoFront - Editor de Mapas</h4>
                <button
                  onClick={() => setShowGeoFrontIframe(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <iframe 
                  src="https://geofront-frontend.onrender.com/index-refactored-ro.html?processo=PROC-2024-002&context=imovel"
                  width="100%" 
                  height="800px" 
                  style={{ border: 'none' }}
                  title="GeoFront Editor - Imóvel"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <NewPropertyModal
        isOpen={showNewPropertyModal}
        onClose={handleCloseNewPropertyModal}
        onSave={handleSaveNewProperty}
        onFillData={handleFillPropertyData}
        propertyType={newPropertyType}
        onPropertyTypeChange={setNewPropertyType}
        ruralData={newRuralData}
        urbanoData={newUrbanoData}
        linearData={newLinearData}
        onRuralChange={(field, value) => setNewRuralData(prev => ({ ...prev, [field]: value }))}
        onUrbanoChange={(field, value) => setNewUrbanoData(prev => ({ ...prev, [field]: value }))}
        onLinearChange={(field, value) => setNewLinearData(prev => ({ ...prev, [field]: value }))}
      />

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
