import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import { searchImoveis, SearchImovelResult } from '../../lib/api/property';
import { Home, MapPin, ArrowLeft, ArrowRight, Plus, Trash2, AlertTriangle, X, Search, Eye } from 'lucide-react';
import ImovelGeoPanel from '../../components/ImovelGeoPanel';

type ModalStep = 'search' | 'confirm';

export default function ImovelPage() {
  const navigate = useNavigate();
  const { processoId } = useInscricaoContext();
  const {
    property,
    setProperty,
    setPropertyId,
    isStepComplete,
    canProceedToStep,
    setCurrentStep
  } = useInscricaoStore();
  
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchImovelResult[]>([]);
  const [selectedImovel, setSelectedImovel] = useState<SearchImovelResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para dados LINEAR (virão das APIs)
  const [municipios, setMunicipios] = useState<Array<{id: number, nome: string, uf: string}>>([]);
  const [ufs, setUfs] = useState<Array<{sigla: string, nome: string}>>([]);
  const [sistemasReferencia, setSistemasReferencia] = useState<string[]>(['SIRGAS 2000', 'WGS 84', 'SAD 69']);
  
  // Estados temporários para edição de imóvel LINEAR
  const [editingLinear, setEditingLinear] = useState(false);
  const [linearData, setLinearData] = useState({
    municipio_inicio: '',
    uf_inicio: '',
    municipio_final: '',
    uf_final: '',
    sistema_referencia: 'SIRGAS 2000'
  });

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

  // Carrega dados LINEAR quando o imóvel muda
  useEffect(() => {
    if (property && property.kind === 'LINEAR') {
      setLinearData({
        municipio_inicio: property.municipio_inicio || '',
        uf_inicio: property.uf_inicio || '',
        municipio_final: property.municipio_final || '',
        uf_final: property.uf_final || '',
        sistema_referencia: property.sistema_referencia || 'SIRGAS 2000'
      });
    }
  }, [property]);

  // TODO: Carregar municípios e UFs das APIs quando estiverem prontas
  useEffect(() => {
    // Placeholder - será substituído pela chamada real da API
    // Exemplo de estrutura esperada:
    // const loadMunicipios = async () => {
    //   const { data } = await fetchMunicipios();
    //   setMunicipios(data);
    // };
    // const loadUfs = async () => {
    //   const { data } = await fetchUfs();
    //   setUfs(data);
    // };
    
    // Dados mockados baseados na estrutura real do banco (f_estado)
    setUfs([
      { sigla: 'AC', nome: 'Acre' },
      { sigla: 'AL', nome: 'Alagoas' },
      { sigla: 'AP', nome: 'Amapá' },
      { sigla: 'AM', nome: 'Amazonas' },
      { sigla: 'BA', nome: 'Bahia' },
      { sigla: 'CE', nome: 'Ceará' },
      { sigla: 'DF', nome: 'Distrito Federal' },
      { sigla: 'ES', nome: 'Espírito Santo' },
      { sigla: 'GO', nome: 'Goiás' },
      { sigla: 'MA', nome: 'Maranhão' },
      { sigla: 'MT', nome: 'Mato Grosso' },
      { sigla: 'MS', nome: 'Mato Grosso do Sul' },
      { sigla: 'MG', nome: 'Minas Gerais' },
      { sigla: 'PA', nome: 'Pará' },
      { sigla: 'PB', nome: 'Paraíba' },
      { sigla: 'PR', nome: 'Paraná' },
      { sigla: 'PE', nome: 'Pernambuco' },
      { sigla: 'PI', nome: 'Piauí' },
      { sigla: 'RJ', nome: 'Rio de Janeiro' },
      { sigla: 'RN', nome: 'Rio Grande do Norte' },
      { sigla: 'RS', nome: 'Rio Grande do Sul' },
      { sigla: 'RO', nome: 'Rondônia' },
      { sigla: 'RR', nome: 'Roraima' },
      { sigla: 'SC', nome: 'Santa Catarina' },
      { sigla: 'SP', nome: 'São Paulo' },
      { sigla: 'SE', nome: 'Sergipe' },
      { sigla: 'TO', nome: 'Tocantins' }
    ]);
    
    // Dados mockados baseados na estrutura real do banco (f_municipio)
    // Incluindo municípios de vários estados para teste
    setMunicipios([
      // Rondônia
      { id: 1100015, nome: 'Alta Floresta D\'Oeste', uf: 'RO' },
      { id: 1100023, nome: 'Ariquemes', uf: 'RO' },
      { id: 1100031, nome: 'Cabixi', uf: 'RO' },
      { id: 1100049, nome: 'Cacoal', uf: 'RO' },
      { id: 1100056, nome: 'Cerejeiras', uf: 'RO' },
      { id: 1100064, nome: 'Colorado do Oeste', uf: 'RO' },
      { id: 1100072, nome: 'Corumbiara', uf: 'RO' },
      { id: 1100080, nome: 'Costa Marques', uf: 'RO' },
      { id: 1100098, nome: 'Espigão D\'Oeste', uf: 'RO' },
      { id: 1100106, nome: 'Guajará-Mirim', uf: 'RO' },
      { id: 1100114, nome: 'Jaru', uf: 'RO' },
      { id: 1100122, nome: 'Ji-Paraná', uf: 'RO' },
      { id: 1100130, nome: 'Machadinho D\'Oeste', uf: 'RO' },
      { id: 1100148, nome: 'Nova Brasilândia D\'Oeste', uf: 'RO' },
      { id: 1100155, nome: 'Ouro Preto do Oeste', uf: 'RO' },
      { id: 1100189, nome: 'Pimenta Bueno', uf: 'RO' },
      { id: 1100205, nome: 'Porto Velho', uf: 'RO' },
      { id: 1100254, nome: 'Presidente Médici', uf: 'RO' },
      { id: 1100262, nome: 'Rio Crespo', uf: 'RO' },
      { id: 1100288, nome: 'Rolim de Moura', uf: 'RO' },
      { id: 1100296, nome: 'Santa Luzia D\'Oeste', uf: 'RO' },
      { id: 1100304, nome: 'Vilhena', uf: 'RO' },
      { id: 1100320, nome: 'São Miguel do Guaporé', uf: 'RO' },
      { id: 1100338, nome: 'Nova Mamoré', uf: 'RO' },
      { id: 1100346, nome: 'Alvorada D\'Oeste', uf: 'RO' },
      { id: 1100379, nome: 'Alto Alegre dos Parecis', uf: 'RO' },
      { id: 1100403, nome: 'Alto Paraíso', uf: 'RO' },
      { id: 1100452, nome: 'Buritis', uf: 'RO' },
      { id: 1100502, nome: 'Novo Horizonte do Oeste', uf: 'RO' },
      { id: 1100601, nome: 'Cacaulândia', uf: 'RO' },
      { id: 1100700, nome: 'Campo Novo de Rondônia', uf: 'RO' },
      { id: 1100809, nome: 'Candeias do Jamari', uf: 'RO' },
      { id: 1100908, nome: 'Castanheiras', uf: 'RO' },
      { id: 1100924, nome: 'Chupinguaia', uf: 'RO' },
      { id: 1100940, nome: 'Cujubim', uf: 'RO' },
      { id: 1101005, nome: 'Governador Jorge Teixeira', uf: 'RO' },
      { id: 1101104, nome: 'Itapuã do Oeste', uf: 'RO' },
      { id: 1101203, nome: 'Ministro Andreazza', uf: 'RO' },
      { id: 1101302, nome: 'Mirante da Serra', uf: 'RO' },
      { id: 1101401, nome: 'Monte Negro', uf: 'RO' },
      { id: 1101435, nome: 'Nova União', uf: 'RO' },
      { id: 1101450, nome: 'Parecis', uf: 'RO' },
      { id: 1101468, nome: 'Pimenteiras do Oeste', uf: 'RO' },
      { id: 1101476, nome: 'Primavera de Rondônia', uf: 'RO' },
      { id: 1101484, nome: 'São Felipe D\'Oeste', uf: 'RO' },
      { id: 1101492, nome: 'São Francisco do Guaporé', uf: 'RO' },
      { id: 1101500, nome: 'Seringueiras', uf: 'RO' },
      { id: 1101559, nome: 'Teixeirópolis', uf: 'RO' },
      { id: 1101609, nome: 'Theobroma', uf: 'RO' },
      { id: 1101708, nome: 'Urupá', uf: 'RO' },
      { id: 1101757, nome: 'Vale do Anari', uf: 'RO' },
      { id: 1101807, nome: 'Vale do Paraíso', uf: 'RO' },
      
      // Acre (alguns exemplos)
      { id: 1200013, nome: 'Acrelândia', uf: 'AC' },
      { id: 1200054, nome: 'Assis Brasil', uf: 'AC' },
      { id: 1200104, nome: 'Brasiléia', uf: 'AC' },
      { id: 1200138, nome: 'Bujari', uf: 'AC' },
      { id: 1200179, nome: 'Capixaba', uf: 'AC' },
      { id: 1200203, nome: 'Cruzeiro do Sul', uf: 'AC' },
      { id: 1200252, nome: 'Epitaciolândia', uf: 'AC' },
      { id: 1200302, nome: 'Feijó', uf: 'AC' },
      { id: 1200328, nome: 'Jordão', uf: 'AC' },
      { id: 1200336, nome: 'Mâncio Lima', uf: 'AC' },
      { id: 1200344, nome: 'Manoel Urbano', uf: 'AC' },
      { id: 1200351, nome: 'Marechal Thaumaturgo', uf: 'AC' },
      { id: 1200385, nome: 'Plácido de Castro', uf: 'AC' },
      { id: 1200393, nome: 'Porto Walter', uf: 'AC' },
      { id: 1200401, nome: 'Rio Branco', uf: 'AC' },
      { id: 1200427, nome: 'Rodrigues Alves', uf: 'AC' },
      { id: 1200435, nome: 'Santa Rosa do Purus', uf: 'AC' },
      { id: 1200450, nome: 'Senador Guiomard', uf: 'AC' },
      { id: 1200500, nome: 'Sena Madureira', uf: 'AC' },
      { id: 1200609, nome: 'Tarauacá', uf: 'AC' },
      { id: 1200708, nome: 'Xapuri', uf: 'AC' },
      { id: 1200807, nome: 'Porto Acre', uf: 'AC' },
      
      // Amazonas (alguns exemplos)
      { id: 1300029, nome: 'Alvarães', uf: 'AM' },
      { id: 1300060, nome: 'Amaturá', uf: 'AM' },
      { id: 1300086, nome: 'Anamã', uf: 'AM' },
      { id: 1300102, nome: 'Anori', uf: 'AM' },
      { id: 1300144, nome: 'Apuí', uf: 'AM' },
      { id: 1300201, nome: 'Atalaia do Norte', uf: 'AM' },
      { id: 1300300, nome: 'Autazes', uf: 'AM' },
      { id: 1300409, nome: 'Barcelos', uf: 'AM' },
      { id: 1300508, nome: 'Barreirinha', uf: 'AM' },
      { id: 1300607, nome: 'Benjamin Constant', uf: 'AM' },
      { id: 1300631, nome: 'Beruri', uf: 'AM' },
      { id: 1300680, nome: 'Boa Vista do Ramos', uf: 'AM' },
      { id: 1300706, nome: 'Boca do Acre', uf: 'AM' },
      { id: 1300805, nome: 'Borba', uf: 'AM' },
      { id: 1300839, nome: 'Caapiranga', uf: 'AM' },
      { id: 1300904, nome: 'Canutama', uf: 'AM' },
      { id: 1301001, nome: 'Carauari', uf: 'AM' },
      { id: 1301100, nome: 'Careiro', uf: 'AM' },
      { id: 1301159, nome: 'Careiro da Várzea', uf: 'AM' },
      { id: 1301209, nome: 'Coari', uf: 'AM' },
      { id: 1301308, nome: 'Codajás', uf: 'AM' },
      { id: 1301407, nome: 'Eirunepé', uf: 'AM' },
      { id: 1301506, nome: 'Envira', uf: 'AM' },
      { id: 1301605, nome: 'Fonte Boa', uf: 'AM' },
      { id: 1301654, nome: 'Guajará', uf: 'AM' },
      { id: 1301704, nome: 'Humaitá', uf: 'AM' },
      { id: 1301803, nome: 'Ipixuna', uf: 'AM' },
      { id: 1301852, nome: 'Iranduba', uf: 'AM' },
      { id: 1301902, nome: 'Itacoatiara', uf: 'AM' },
      { id: 1301951, nome: 'Itamarati', uf: 'AM' },
      { id: 1302009, nome: 'Itapiranga', uf: 'AM' },
      { id: 1302108, nome: 'Japurá', uf: 'AM' },
      { id: 1302207, nome: 'Juruá', uf: 'AM' },
      { id: 1302306, nome: 'Jutaí', uf: 'AM' },
      { id: 1302405, nome: 'Lábrea', uf: 'AM' },
      { id: 1302504, nome: 'Manacapuru', uf: 'AM' },
      { id: 1302553, nome: 'Manaquiri', uf: 'AM' },
      { id: 1302603, nome: 'Manaus', uf: 'AM' },
      { id: 1302702, nome: 'Manicoré', uf: 'AM' },
      { id: 1302801, nome: 'Maraã', uf: 'AM' },
      { id: 1302900, nome: 'Maués', uf: 'AM' },
      { id: 1303007, nome: 'Nhamundá', uf: 'AM' },
      { id: 1303106, nome: 'Nova Olinda do Norte', uf: 'AM' },
      { id: 1303205, nome: 'Novo Airão', uf: 'AM' },
      { id: 1303304, nome: 'Novo Aripuanã', uf: 'AM' },
      { id: 1303403, nome: 'Parintins', uf: 'AM' },
      { id: 1303502, nome: 'Pauini', uf: 'AM' },
      { id: 1303536, nome: 'Presidente Figueiredo', uf: 'AM' },
      { id: 1303569, nome: 'Rio Preto da Eva', uf: 'AM' },
      { id: 1303601, nome: 'Santa Isabel do Rio Negro', uf: 'AM' },
      { id: 1303700, nome: 'Santo Antônio do Içá', uf: 'AM' },
      { id: 1303809, nome: 'São Gabriel da Cachoeira', uf: 'AM' },
      { id: 1303908, nome: 'São Paulo de Olivença', uf: 'AM' },
      { id: 1303957, nome: 'São Sebastião do Uatumã', uf: 'AM' },
      { id: 1304005, nome: 'Silves', uf: 'AM' },
      { id: 1304062, nome: 'Tabatinga', uf: 'AM' },
      { id: 1304104, nome: 'Tapauá', uf: 'AM' },
      { id: 1304203, nome: 'Tefé', uf: 'AM' },
      { id: 1304237, nome: 'Tonantins', uf: 'AM' },
      { id: 1304260, nome: 'Uarini', uf: 'AM' },
      { id: 1304302, nome: 'Urucará', uf: 'AM' },
      { id: 1304401, nome: 'Urucurituba', uf: 'AM' }
    ]);
    
    // Sistemas de Referência baseados na estrutura real (f_projecao)
    setSistemasReferencia([
      'SIRGAS 2000',
      'WGS 84',
      'SAD 69',
      'SIRGAS 2000 / UTM zone 20S',
      'SIRGAS 2000 / UTM zone 21S',
      'SIRGAS 2000 / UTM zone 22S',
      'SIRGAS 2000 / UTM zone 23S',
      'SIRGAS 2000 / UTM zone 24S',
      'SIRGAS 2000 / UTM zone 25S',
      'Córrego Alegre 1970-72 / UTM zone 21S',
      'Córrego Alegre 1970-72 / UTM zone 22S',
      'Córrego Alegre 1970-72 / UTM zone 23S',
      'Córrego Alegre 1970-72 / UTM zone 24S',
      'Córrego Alegre 1970-72 / UTM zone 25S'
    ]);
  }, []);

  const handleLinearFieldChange = (field: string, value: string) => {
    setLinearData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveLinearData = () => {
    if (!property) return;
    
    // Validação
    if (!linearData.municipio_inicio) {
      toast.error('Município de Início é obrigatório');
      return;
    }
    if (!linearData.uf_inicio) {
      toast.error('UF de Início é obrigatória');
      return;
    }
    if (!linearData.municipio_final) {
      toast.error('Município Final é obrigatório');
      return;
    }

    // Atualiza o property com os novos dados
    setProperty({
      ...property,
      municipio_inicio: linearData.municipio_inicio,
      uf_inicio: linearData.uf_inicio,
      municipio_final: linearData.municipio_final,
      uf_final: linearData.uf_final || linearData.uf_inicio, // Se não informado, assume mesma UF
      sistema_referencia: linearData.sistema_referencia
    });
    
    setEditingLinear(false);
    toast.success('Dados do imóvel LINEAR atualizados!');
  };

  const handleCancelLinearEdit = () => {
    // Restaura dados originais
    if (property) {
      setLinearData({
        municipio_inicio: property.municipio_inicio || '',
        uf_inicio: property.uf_inicio || '',
        municipio_final: property.municipio_final || '',
        uf_final: property.uf_final || '',
        sistema_referencia: property.sistema_referencia || 'SIRGAS 2000'
      });
    }
    setEditingLinear(false);
  };

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

    // Validação para imóvel LINEAR
    if (selectedImovel.kind === 'LINEAR') {
      if (!selectedImovel.municipio_inicio || !selectedImovel.municipio_final) {
        toast.error('Imóvel LINEAR deve ter município de início e fim cadastrados');
        return;
      }
      if (!selectedImovel.uf_inicio) {
        toast.error('Imóvel LINEAR deve ter UF de início cadastrada');
        return;
      }
    }

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
      arquivogeorreferenciamento: selectedImovel.arquivogeorreferenciamento || '',
      address: {
        cep: selectedImovel.cep || '',
        logradouro: selectedImovel.logradouro || '',
        numero: selectedImovel.numero || '',
        bairro: selectedImovel.bairro || '',
        complemento: '',
        ponto_referencia: '',
        uf: selectedImovel.uf || '',
        municipio: selectedImovel.municipio || ''
      },
      // Campos específicos para LINEAR
      municipio_inicio: selectedImovel.municipio_inicio || '',
      uf_inicio: selectedImovel.uf_inicio || '',
      municipio_final: selectedImovel.municipio_final || '',
      uf_final: selectedImovel.uf_final || '',
      sistema_referencia: selectedImovel.sistema_referencia || 'SIRGAS 2000'
    };

    setProperty(propertyData);
    setPropertyId(selectedImovel.id);
    handleCloseModal();
    toast.success('Imóvel selecionado com sucesso!');
  };

  const handleRemoveProperty = () => {
    if (!window.confirm('Deseja remover o imóvel selecionado?')) return;
    
    setProperty(undefined);
    setPropertyId(undefined);
  };

  const handleNext = () => {
    // TODO: Validação temporariamente desabilitada para aprovação de design
    // Reativar validação: if (canProceedToStep(3))
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/empreendimento');
    } else {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/participantes');
    } else {
      setCurrentStep(1);
    }
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
          {/* DEBUG: Mostrar tipo do imóvel */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
            <strong>DEBUG - Tipo do Imóvel:</strong> {property.kind || 'não definido'} | 
            <strong> Nome:</strong> {property.nome || 'sem nome'} | 
            <strong> Município Início:</strong> {property.municipio_inicio || 'não definido'} |
            <strong> UF Início:</strong> {property.uf_inicio || 'não definido'}
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Home className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {property.kind === 'RURAL' && property.car_codigo ? `CAR: ${property.car_codigo}` : 
                       property.kind === 'LINEAR' && property.municipio_inicio ? `Linear: ${property.municipio_inicio} → ${property.municipio_final}` :
                       property.municipio_sede || property.nome || 'Imóvel selecionado'}
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
                      <span className="font-medium">Nome do Imóvel:</span> {property.nome}
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
          {/* Painel Visualização Geo */}
          <ImovelGeoPanel carFileName={property?.arquivogeorreferenciamento ? `CAR_${property.arquivogeorreferenciamento}.geojson` : undefined} />
          
          {/* Dados Específicos para Imóvel LINEAR */}
          {property.kind === 'LINEAR' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-purple-900">
                    Dados do Empreendimento Linear
                  </h4>
                </div>
                {!editingLinear ? (
                  <button
                    onClick={() => setEditingLinear(true)}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelLinearEdit}
                      className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveLinearData}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* UF (Início) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UF (Início) <span className="text-red-500">*</span>
                  </label>
                  {editingLinear ? (
                    <select
                      value={linearData.uf_inicio}
                      onChange={(e) => handleLinearFieldChange('uf_inicio', e.target.value)}
                      className="w-full px-3 py-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Selecione</option>
                      {ufs.map(uf => (
                        <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-white px-3 py-2 rounded border border-purple-100">
                      {property.uf_inicio || '-'}
                    </p>
                  )}
                </div>
                
                {/* Município de Início */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Município de Início <span className="text-red-500">*</span>
                  </label>
                  {editingLinear ? (
                    <select
                      value={linearData.municipio_inicio}
                      onChange={(e) => handleLinearFieldChange('municipio_inicio', e.target.value)}
                      className="w-full px-3 py-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Selecione</option>
                      {municipios
                        .filter(m => !linearData.uf_inicio || m.uf === linearData.uf_inicio)
                        .map(m => (
                          <option key={m.id} value={m.nome}>{m.nome}</option>
                        ))
                      }
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-white px-3 py-2 rounded border border-purple-100">
                      {property.municipio_inicio || '-'}
                    </p>
                  )}
                </div>
                
                {/* UF Final (Opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UF (Final)
                  </label>
                  {editingLinear ? (
                    <select
                      value={linearData.uf_final}
                      onChange={(e) => handleLinearFieldChange('uf_final', e.target.value)}
                      className="w-full px-3 py-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Mesma UF de início</option>
                      {ufs.map(uf => (
                        <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-white px-3 py-2 rounded border border-purple-100">
                      {property.uf_final || property.uf_inicio || '-'}
                    </p>
                  )}
                </div>
                
                {/* Município Final */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Município Final <span className="text-red-500">*</span>
                  </label>
                  {editingLinear ? (
                    <select
                      value={linearData.municipio_final}
                      onChange={(e) => handleLinearFieldChange('municipio_final', e.target.value)}
                      className="w-full px-3 py-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Selecione</option>
                      {municipios
                        .filter(m => !linearData.uf_final || m.uf === linearData.uf_final)
                        .map(m => (
                          <option key={m.id} value={m.nome}>{m.nome}</option>
                        ))
                      }
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-white px-3 py-2 rounded border border-purple-100">
                      {property.municipio_final || '-'}
                    </p>
                  )}
                </div>
                
                {/* Sistema de Referência */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sistema de Referência/Projeção
                  </label>
                  {editingLinear ? (
                    <select
                      value={linearData.sistema_referencia}
                      onChange={(e) => handleLinearFieldChange('sistema_referencia', e.target.value)}
                      className="w-full px-3 py-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {sistemasReferencia.map(sistema => (
                        <option key={sistema} value={sistema}>{sistema}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-white px-3 py-2 rounded border border-purple-100">
                      {property.sistema_referencia || 'SIRGAS 2000'}
                    </p>
                  )}
                </div>
              </div>
              
              {editingLinear && (
                <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-purple-100">
                  <strong>Nota:</strong> Os campos marcados com * são obrigatórios para imóveis lineares.
                </div>
              )}
            </div>
          )}

          {/* PREVIEW: Como ficaria se fosse LINEAR (apenas para demonstração) */}
          {property.kind !== 'LINEAR' && (
            <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">
                  PREVIEW: Como ficaria se este imóvel fosse do tipo LINEAR
                </h4>
              </div>
              
              <p className="text-sm text-blue-700 mb-3">
                Este imóvel atual é do tipo <strong>{property.kind}</strong>. Abaixo está um exemplo de como 
                apareceria a seção de dados editável se fosse LINEAR:
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-purple-900">
                      Dados do Empreendimento Linear
                    </h4>
                  </div>
                  <button
                    disabled
                    className="px-3 py-1 text-sm bg-purple-400 text-white rounded cursor-not-allowed opacity-60"
                  >
                    Editar
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UF (Início) <span className="text-red-500">*</span>
                    </label>
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-purple-200 rounded bg-white cursor-not-allowed opacity-75"
                      value="RO"
                    >
                      <option>RO - Rondônia</option>
                      <option>AC - Acre</option>
                      <option>AM - Amazonas</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Município de Início <span className="text-red-500">*</span>
                    </label>
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-purple-200 rounded bg-white cursor-not-allowed opacity-75"
                      value="Porto Velho"
                    >
                      <option>Porto Velho</option>
                      <option>Ji-Paraná</option>
                      <option>Ariquemes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UF (Final)
                    </label>
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-purple-200 rounded bg-white cursor-not-allowed opacity-75"
                    >
                      <option>Mesma UF de início</option>
                      <option>RO - Rondônia</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Município Final <span className="text-red-500">*</span>
                    </label>
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-purple-200 rounded bg-white cursor-not-allowed opacity-75"
                      value="Ji-Paraná"
                    >
                      <option>Ji-Paraná</option>
                      <option>Porto Velho</option>
                      <option>Cacoal</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sistema de Referência/Projeção
                    </label>
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-purple-200 rounded bg-white cursor-not-allowed opacity-75"
                      value="SIRGAS 2000"
                    >
                      <option>SIRGAS 2000</option>
                      <option>WGS 84</option>
                      <option>SAD 69</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-purple-100">
                  <strong>Nota:</strong> Ao clicar em "Editar", os campos ficarão editáveis com combos de seleção.
                </div>
              </div>
            </div>
          )}
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
                              <span className="font-medium">Nome do Imóvel:</span> {selectedImovel.nome}
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

                          {/* Dados específicos para LINEAR */}
                          {selectedImovel.kind === 'LINEAR' && (
                            <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50 -mx-3 -mb-3 px-3 py-3 rounded-b-lg">
                              <p className="text-xs font-medium text-purple-900 mb-2">Dados do Empreendimento Linear</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-gray-700">Município Início:</span>
                                  <span className="text-gray-900 ml-1">{selectedImovel.municipio_inicio || '-'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">UF Início:</span>
                                  <span className="text-gray-900 ml-1">{selectedImovel.uf_inicio || '-'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Município Final:</span>
                                  <span className="text-gray-900 ml-1">{selectedImovel.municipio_final || '-'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Sistema Ref.:</span>
                                  <span className="text-gray-900 ml-1">{selectedImovel.sistema_referencia || 'SIRGAS 2000'}</span>
                                </div>
                              </div>
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
