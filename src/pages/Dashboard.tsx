import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, getProcessos, DashboardStats, DashboardProcessosResponse, ProcessoItem } from '../services/dashboardService';
import NewProcessModal from '../components/NewProcessModal';
import ProcessDetailsModal from '../components/ProcessDetailsModal';
import AdminDashboard from '../components/admin/AdminDashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { APP_VERSION, APP_NAME } from '../config/version';
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Search,
  Bell,
  Settings,
  Home,
  Building2,
  BarChart3,
  Shield,
  LogOut,
  MapPin,
  Menu,
  X,
  FilePlus,
  FileCheck,
  User,
  ArrowLeft
} from 'lucide-react';
import GeoVisualization from '../components/geo/GeoVisualization';
import InscricaoWizard from '../components/InscricaoWizard';
import InscricaoWizardMotor from '../components/InscricaoWizardMotor';
import PessoasFisicas from './PessoasFisicas';
import PessoasJuridicas from './PessoasJuridicas';
import treeIcon from '/src/assets/tree_icon_menu.svg';
import arrowIcon from '/src/assets/arrow.svg';
import submenuIcon from '/src/assets/files_7281182-1759864502693-files_7281182-1759864312235-tree_icon_menu.svg';
import homeIcon from '/src/assets/icon_home.svg';

export default function Dashboard() {
  // Limpa resultados da pesquisa ao clicar em filtro
  const handleFilterStatus = (status: string | undefined) => {
    console.log('🎯 handleFilterStatus chamado - status:', status);
    setFilterStatus(status);
    setSearchState({ results: [], loading: false, error: null, active: false });
    setLoadingProcesses(true);
    console.log('🎯 setLoadingProcesses(true) chamado em handleFilterStatus');
  };
  // Estados para busca de processos por protocolo
  const [searchProtocol, setSearchProtocol] = useState('');
  const [searchState, setSearchState] = useState<{ results: ProcessoItem[]; loading: boolean; error: string | null; active: boolean }>({ results: [], loading: false, error: null, active: false });
  // Filtro inicial: tipo 2 em análise
  React.useEffect(() => {
    setFilterStatus('2');
  }, []);
  // Função para buscar processos por protocolo
  async function searchProcessByProtocol(protocolo: string) {
  console.log('[Dashboard] searchProcessByProtocol chamada:', protocolo);
    setSearchState({ results: [], loading: true, error: null, active: true });
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(
        `/api/v1/license_processes/search?protocolo=${encodeURIComponent(protocolo)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      console.log('[Dashboard] response da API searchProcessByProtocol:', res);
      setSearchState({ results: res.data && Array.isArray(res.data.items) ? res.data.items : [], loading: false, error: null, active: true });
    } catch (err: any) {
      setSearchState({ results: [], loading: false, error: err?.response?.data?.message || err?.message || 'Erro ao buscar processos', active: true });
    }
  }
  const navigate = useNavigate();
  const { user, userMetadata, signOut, loading, isConfigured, isSupabaseReady } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [generalExpanded, setGeneralExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [showNewProcessModal, setShowNewProcessModal] = useState(false);
  const [showProcessDetails, setShowProcessDetails] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [processes, setProcesses] = useState<ProcessoItem[]>([]);
  // Estados para paginação do painel de atividade recente
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // quantidade por página
  const [total, setTotal] = useState(0); // total de registros
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [externalUserName, setExternalUserName] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pendentes: 0,
    em_analise: 0,
    aprovados: 0,
    rejeitados: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [showWizardInInscricoes, setShowWizardInInscricoes] = useState(false);
  const [showWizardMotor, setShowWizardMotor] = useState(false); // Wizard do motor BPMN
  const [showWizardInProcessesMotor, setShowWizardInProcessesMotor] = useState(false); // Controla wizard na aba Processos Motor

  React.useEffect(() => {
    const loadExternalUserData = () => {
      try {
        console.log('🔄 INICIANDO CARREGAMENTO DE DADOS DO USUÁRIO');
        const authUserData = localStorage.getItem('auth_user');
        console.log('🔍 Raw data do localStorage:', authUserData);
        console.log('🔍 Tipo:', typeof authUserData);

        if (authUserData) {
          const userData = JSON.parse(authUserData);
          console.log('📦 Dados parseados:', userData);
          console.log('📦 Tipo do objeto:', typeof userData);
          console.log('📦 Keys do objeto:', Object.keys(userData));
          console.log('📦 userData.nome:', userData.nome);
          console.log('📦 userData["nome"]:', userData["nome"]);

          if (userData.nome) {
            console.log('✅ Nome encontrado:', userData.nome);
            console.log('✅ Chamando setExternalUserName com:', userData.nome);
            setExternalUserName(userData.nome);
            console.log('✅ setExternalUserName chamado!');
          } else {
            console.warn('⚠️ Campo nome não encontrado no objeto userData');
            console.warn('⚠️ Estrutura completa:', JSON.stringify(userData, null, 2));
          }
        } else {
          console.warn('⚠️ Nenhum dado encontrado em auth_user no localStorage');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário do localStorage:', error);
      }
    };

    loadExternalUserData();
  }, []);

  React.useEffect(() => {
    console.log('🎨 RENDERIZANDO DASHBOARD - externalUserName atual:', externalUserName);
  }, [externalUserName]);

  const getFirstName = (fullName: string | null) => {
    if (!fullName) return 'Carregando...';
    return fullName.split(' ')[0];
  };

  const loadProcesses = React.useCallback(async () => {
    console.log('🔄 loadProcesses iniciado - setLoadingProcesses(true)');
    setLoadingProcesses(true);
    try {
      // Adapta para paginação
  const skip = (page - 1) * limit;
  const data: DashboardProcessosResponse = await getProcessos(filterStatus, skip, limit);
      console.log('Response completa da API:', JSON.stringify(data, null, 2));
      console.log('Processos recebidos da API:', data.items);
      setProcesses(data.items);
      setTotal(data.total || 0); // espera que a API retorne total
    } catch (error) {
      console.error('Error loading processes:', error);
      setProcesses([]);
    } finally {
      console.log('✅ loadProcesses finalizado - setLoadingProcesses(false)');
      setLoadingProcesses(false);
    }
  }, [filterStatus, page, limit]);

  const loadStats = React.useCallback(async () => {
    setLoadingStats(true);
    try {
      const statsData = await getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        total: 0,
        pendentes: 0,
        em_analise: 0,
        aprovados: 0,
        rejeitados: 0
      });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  React.useEffect(() => {
    if (user && isConfigured && isSupabaseReady) {
      loadStats();
    }
  }, [user, isConfigured, isSupabaseReady, loadStats]);

  React.useEffect(() => {
    console.log('[Dashboard] useEffect disparado:', { user, isConfigured, isSupabaseReady, filterStatus, page, limit });
    if (user && isConfigured && isSupabaseReady) {
      console.log('[Dashboard] Chamando loadProcesses por filtro/página:', filterStatus, page, limit);
      loadProcesses();
    }
  }, [user, isConfigured, isSupabaseReady, filterStatus, page, limit, loadProcesses]);

  const handleNewProcess = async (processData: any) => {
    try {
      // Aqui seria chamada de criação de processo, se existir
      loadProcesses();
      loadStats();
    } catch (error) {
      console.error('Error creating process:', error);
    }
  };

  const handleProcessClick = (process: any) => {
    const processWithDefaults = {
      ...process,
      companies: process.companies || {
        name: 'Empresa não informada',
        city: 'N/A',
        state: 'N/A'
      }
    };

    setSelectedProcess(processWithDefaults);
    setShowProcessDetails(true);
  };

  const handleUpdateProcess = async (processId: string, updates: any) => {
    try {
      // Aqui seria chamada de atualização de processo, se existir
      loadProcesses();
      loadStats();
      if (selectedProcess && selectedProcess.id === processId) {
        setSelectedProcess(prev => prev ? {
          ...prev,
          ...updates,
          updated_at: new Date().toISOString()
        } : null);
      }
    } catch (error) {
      console.error('Error updating process:', error);
      toast.error('Erro ao atualizar processo: ' + (error as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isConfigured || !isSupabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative text-center max-w-2xl mx-4 glass-effect p-8 rounded-lg">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema Não Configurado</h1>
          <p className="text-gray-600 mb-4">
            {!isConfigured
              ? "As variáveis de ambiente do Supabase não estão configuradas corretamente."
              : "Não foi possível conectar ao Supabase. Verifique se as credenciais estão corretas."
            }
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'text-green-700 bg-green-100 border-green-200';
      case 'rejeitado': return 'text-red-700 bg-red-100 border-red-200';
      case 'em_analise': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'submitted': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'documentacao_pendente': return 'text-orange-700 bg-orange-100 border-orange-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovado': return 'Aprovada';
      case 'rejeitado': return 'Rejeitada';
      case 'em_analise': return 'Em Análise';
      case 'submitted': return 'Submetida';
      case 'documentacao_pendente': return 'Documentação Pendente';
      default: return status;
    }
  };

  const getLicenseTypeName = (type: string) => {
    switch (type) {
      case 'LP': return 'Licença Prévia';
      case 'LI': return 'Licença de Instalação';
      case 'LO': return 'Licença de Operação';
      default: return type;
    }
  };

  const filteredProcessos = processes.filter((proc) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      proc.razao_social?.toLowerCase().includes(searchLower) ||
      proc.nome_fantasia?.toLowerCase().includes(searchLower) ||
      proc.cpf?.toLowerCase().includes(searchLower) ||
      proc.cnpj?.toLowerCase().includes(searchLower) ||
      proc.potencial_poluidor?.toLowerCase().includes(searchLower)
    );
  });

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'inscricoes', name: 'Solicitação de Processo', icon: FileCheck },
    { id: 'processes', name: 'Processos', icon: FileText },
    { id: 'processesmotor', name: 'Processos Motor', icon: FileText }
  ];

  const otherNavigation = [
    // { id: 'form-wizard', name: 'Formulário', icon: FileText },
    // { id: 'companies', name: 'Empresas', icon: Building2 },
    // { id: 'reports', name: 'Relatórios', icon: BarChart3 },
    // { id: 'compliance', name: 'Conformidade', icon: Shield },
    // { id: 'geo', name: 'Visualização Geo', icon: MapPin }
  ];

  const generalSubSections = [
    { id: 'pessoas-fisicas', name: 'Pessoas Físicas' },
    { id: 'pessoas-juridicas', name: 'Pessoas Jurídicas' }
  ];

  const adminDirectSections = [
    { id: 'system-configurations', name: 'Configurações do Sistema' },
    { id: 'property-types', name: 'Tipos de Imóvel' },
    { id: 'process-types', name: 'Tipos de Processo' },
    { id: 'license-types', name: 'Tipos de Licença' },
    { id: 'activities', name: 'Atividades' },
    { id: 'enterprise-sizes', name: 'Porte do Empreendimento' },
    { id: 'pollution-potentials', name: 'Potencial Poluidor' },
    { id: 'reference-units', name: 'Unidades de Referência' },
    { id: 'study-types', name: 'Tipos de Estudo' },
    { id: 'documentation-templates', name: 'Documentação' },
    { id: 'billing-configurations', name: 'Configuração de Cobrança' }
  ];

  const Spinner = () => (
    <div className="w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* CABEÇALHO COM AÇÕES FIXO ACIMA DAS ESTATÍSTICAS */}
      {/* ============================================ */}
      <div className="sticky top-0 z-30 bg-white pb-2 pt-2 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Painel de Controle</h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
              onClick={() => {
                setActiveTab('inscricoes');
                setShowWizardInInscricoes(true);
              }}
              title="Iniciar nova solicitação (fluxo manual)"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Nova Solicitação</span>
              <span className="xs:hidden">Solicitação</span>
            </button>
            
            {/* Botão para testar Workflow Engine (Motor BPMN) */}
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
              onClick={() => setShowWizardMotor(true)}
              title="Nova solicitação com Workflow Engine (Motor BPMN)"
            >
              <FilePlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Motor BPMN</span>
              <span className="sm:hidden">Motor</span>
            </button>
          </div>
        </div>
      </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4 sticky top-[56px] z-30 bg-white pb-2 pt-2 shadow-sm">
        <div
          className={`stat-card p-4 sm:p-6 rounded-lg cursor-pointer transition-all ${filterStatus === undefined ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => handleFilterStatus(undefined)}
        >
          <div className="flex items-center min-w-0">
            <div className="p-2 bg-blue-50/50 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400/60" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total de Processos</p>
              {loadingStats ? (
                <Spinner />
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              )}
            </div>
          </div>
        </div>

        <div
          className={`stat-card p-4 sm:p-6 rounded-lg cursor-pointer transition-all ${filterStatus === '1' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => handleFilterStatus('1')}
        >
          <div className="flex items-center min-w-0">
            <div className="p-2 bg-yellow-50/50 rounded-lg flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400/60" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pendentes</p>
              {loadingStats ? (
                <Spinner />
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendentes}</p>
              )}
            </div>
          </div>
        </div>

        <div
          className={`stat-card p-4 sm:p-6 rounded-lg cursor-pointer transition-all ${filterStatus === '2' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleFilterStatus('2')}
        >
          <div className="flex items-center min-w-0">
            <div className="p-2 bg-blue-50/50 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400/60" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Em Análise</p>
              {loadingStats ? (
                <Spinner />
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.em_analise}</p>
              )}
            </div>
          </div>
        </div>

        <div
          className={`stat-card p-4 sm:p-6 rounded-lg cursor-pointer transition-all ${filterStatus === '3' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => handleFilterStatus('3')}
        >
          <div className="flex items-center min-w-0">
            <div className="p-2 bg-green-50/50 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400/60" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Aprovadas</p>
              {loadingStats ? (
                <Spinner />
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.aprovados}</p>
              )}
            </div>
          </div>
        </div>

        <div
          className={`stat-card p-4 sm:p-6 rounded-lg cursor-pointer transition-all ${filterStatus === '4' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => handleFilterStatus('4')}
        >
          <div className="flex items-center min-w-0">
            <div className="p-2 bg-red-50/50 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400/60" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Rejeitadas</p>
              {loadingStats ? (
                <Spinner />
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.rejeitados}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200 border-opacity-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Atividade Recente</h2>
          <form
            className="w-full sm:w-72"
            onSubmit={e => {
              e.preventDefault();
              if (searchProtocol.trim()) searchProcessByProtocol(searchProtocol.trim());
            }}
          >
            <div className="relative">
              <input
                type="text"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Buscar por protocolo..."
                value={searchProtocol}
                onChange={e => setSearchProtocol(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
            </div>
          </form>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Renderização condicional: pesquisa ativa tem prioridade */}
            {(() => {
              console.log('🎨 Renderizando Atividade Recente - loadingProcesses:', loadingProcesses, 'searchState.active:', searchState.active);
              return null;
            })()}
            {searchState.active ? (
              searchState.loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : searchState.error ? (
                <div className="text-red-600 text-sm">{searchState.error}</div>
              ) : searchState.results.length === 0 ? (
                <div className="text-gray-500 text-sm">Nenhum processo encontrado.</div>
              ) : (
                searchState.results.map((proc) => (
                  <div
                    key={proc.id}
                    className="flex items-center space-x-4 p-4 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 cursor-pointer transition-all duration-200 hover:transform hover:scale-[1.02]"
                    onClick={() => handleProcessClick(proc)}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${proc.status === '1' ? 'bg-yellow-50/50' : ''}
                        ${proc.status === '2' ? 'bg-blue-50/50' : ''}
                        ${proc.status === '3' ? 'bg-green-50/50' : ''}
                        ${proc.status === '4' ? 'bg-red-50/50' : ''}
                        ${proc.status === undefined ? 'bg-blue-50/50' : ''}
                      `}>
                        {proc.status === '1' && <Clock className="w-5 h-5 text-yellow-400/60" />}
                        {proc.status === '2' && <TrendingUp className="w-5 h-5 text-blue-400/60" />}
                        {proc.status === '3' && <CheckCircle className="w-5 h-5 text-green-400/60" />}
                        {proc.status === '4' && <AlertTriangle className="w-5 h-5 text-red-400/60" />}
                        {(proc.status === undefined || proc.status === null || proc.status === '') && <FileText className="w-5 h-5 text-blue-400/60" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-bold">Protocolo:</span> {proc.protocolo_interno || '-'}<br />
                        <span className="font-bold">Nome/Razão Social:</span> {proc.razao_social || proc.nome_fantasia || proc.cpf || proc.cnpj || <span className="text-gray-400 italic">(não informado)</span>}<br />
                        <span className="font-bold">Tipo:</span> {proc.tipo_pessoa || <span className="text-gray-400 italic">(não informado)</span>}<br />
                        <span className="font-bold">Potencial Poluidor:</span> {proc.potencial_poluidor || <span className="text-gray-400 italic">(não informado)</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-bold">Criado em:</span> {proc.created_at ? new Date(proc.created_at).toLocaleString('pt-BR') : <span className="text-gray-400 italic">(não informado)</span>}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(proc.status)}`}>
                        {getStatusText(proc.status)}
                      </span>
                    </div>
                  </div>
                ))
              )
            ) : loadingProcesses ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              processes.length === 0 ? (
                <div className="text-gray-500 text-sm">Nenhuma atividade recente encontrada.</div>
              ) : (
                processes.map((proc) => (
                  <div
                    key={proc.id}
                    className="flex items-center space-x-4 p-4 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 cursor-pointer transition-all duration-200 hover:transform hover:scale-[1.02]"
                    onClick={() => handleProcessClick(proc)}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${proc.status === '1' ? 'bg-yellow-50/50' : ''}
                        ${proc.status === '2' ? 'bg-blue-50/50' : ''}
                        ${proc.status === '3' ? 'bg-green-50/50' : ''}
                        ${proc.status === '4' ? 'bg-red-50/50' : ''}
                        ${proc.status === undefined ? 'bg-blue-50/50' : ''}
                      `}>
                        {proc.status === '1' && <Clock className="w-5 h-5 text-yellow-400/60" />}
                        {proc.status === '2' && <TrendingUp className="w-5 h-5 text-blue-400/60" />}
                        {proc.status === '3' && <CheckCircle className="w-5 h-5 text-green-400/60" />}
                        {proc.status === '4' && <AlertTriangle className="w-5 h-5 text-red-400/60" />}
                        {(proc.status === undefined || proc.status === null || proc.status === '') && <FileText className="w-5 h-5 text-blue-400/60" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-bold">Protocolo:</span> {proc.protocolo_interno || '-'}<br />
                        <span className="font-bold">Nome/Razão Social:</span> {proc.razao_social || proc.nome_fantasia || proc.cpf || proc.cnpj || '-'}<br />
                        <span className="font-bold">Tipo:</span> {proc.tipo_pessoa || '-'}<br />
                        <span className="font-bold">Potencial Poluidor:</span> {proc.potencial_poluidor || '-'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-bold">Criado em:</span> {proc.created_at ? new Date(proc.created_at).toLocaleString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(proc.status)}`}>
                        {getStatusText(proc.status)}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
          {/* Barra de navegação/paginação */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-500">Mostrando {processes.length} de {total} registros</span>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs"
                disabled={page === 1}
                onClick={() => setPage(1)}
              >&#171; Primeira</button>
              <button
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >&#8249; Anterior</button>
              <button
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs"
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
              >Próxima &#8250;</button>
              <button
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs"
                disabled={page * limit >= total}
                onClick={() => setPage(Math.ceil(total / limit))}
              >Última &#187;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProcesses = () => (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* CABEÇALHO COM AÇÕES - NOVA FUNCIONALIDADE   */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Processos de Licenciamento</h1>
        <div className="flex space-x-2 sm:space-x-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
            onClick={() => setShowNewProcessModal(true)}
            title="Criar novo processo"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Novo Processo</span>
            <span className="xs:hidden">Processo</span>
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
            onClick={() => {
              setActiveTab('inscricoes');
              setShowWizardInInscricoes(true);
            }}
            title="Iniciar nova solicitação"
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Nova Solicitação</span>
            <span className="xs:hidden">Solicitação</span>
          </button>
        </div>
      </div>

      <div className="glass-effect rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por empresa ou atividade..."
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="submitted">Submetida</option>
              <option value="em_analise">Em Análise</option>
              <option value="documentacao_pendente">Documentação Pendente</option>
              <option value="aprovado">Aprovada</option>
              <option value="rejeitado">Rejeitada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200 border-opacity-50">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Lista de Processos</h2>
          {loadingProcesses && (
            <div className="text-green-600 text-sm mt-2">Carregando processos...</div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocolo Interno</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número do Processo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome/Razão Social</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF/CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potencial Poluidor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProcessos.map((proc) => (
                <tr
                  key={proc.id}
                  className="hover:bg-green-50 hover:bg-opacity-50 cursor-pointer transition-all duration-200"
                  onClick={() => handleProcessClick(proc)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{proc.protocolo_interno || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.numero_processo_externo || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.tipo_pessoa || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.razao_social || proc.nome_fantasia || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.cpf || proc.cnpj || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.potencial_poluidor || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(proc.status)}`}>
                      {getStatusText(proc.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.created_at ? new Date(proc.created_at).toLocaleString('pt-BR') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:underline mr-2" onClick={(e) => { e.stopPropagation(); handleProcessClick(proc); }}>Ver Detalhes</button>
                    <button className="text-green-600 hover:underline" onClick={(e) => { e.stopPropagation(); /* handleEditProcess(proc); */ }}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

    const renderProcessesMotor = () => {
    // Se o wizard está aberto, renderiza apenas ele
    if (showWizardInProcessesMotor) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Novo Processo - Motor BPMN</h1>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
              onClick={() => setShowWizardInProcessesMotor(false)}
              title="Voltar para lista de processos"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Voltar</span>
            </button>
          </div>
          <InscricaoWizardMotor
            onClose={() => {
              setShowWizardInProcessesMotor(false);
              loadProcesses();
              loadStats();
            }}
          />
        </div>
      );
    }

    // Lista de processos normal
    return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* CABEÇALHO COM AÇÕES - NOVA FUNCIONALIDADE   */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Processos de Licenciamento - Motor BPMN</h1>
        <div className="flex space-x-2 sm:space-x-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
            onClick={() => setShowWizardInProcessesMotor(true)}
            title="Criar novo processo com Motor BPMN"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Novo Processo Motor</span>
            <span className="xs:hidden">Novo</span>
          </button>
        </div>
      </div>

      <div className="glass-effect rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por empresa ou atividade..."
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="submitted">Submetida</option>
              <option value="em_analise">Em Análise</option>
              <option value="documentacao_pendente">Documentação Pendente</option>
              <option value="aprovado">Aprovada</option>
              <option value="rejeitado">Rejeitada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200 border-opacity-50">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Lista de Processos</h2>
          {loadingProcesses && (
            <div className="text-green-600 text-sm mt-2">Carregando processos...</div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocolo Interno</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número do Processo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome/Razão Social</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF/CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potencial Poluidor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProcessos.map((proc) => (
                <tr
                  key={proc.id}
                  className="hover:bg-green-50 hover:bg-opacity-50 cursor-pointer transition-all duration-200"
                  onClick={() => handleProcessClick(proc)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{proc.protocolo_interno || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.numero_processo_externo || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.tipo_pessoa || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.razao_social || proc.nome_fantasia || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.cpf || proc.cnpj || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.potencial_poluidor || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(proc.status)}`}>
                      {getStatusText(proc.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{proc.created_at ? new Date(proc.created_at).toLocaleString('pt-BR') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:underline mr-2" onClick={(e) => { e.stopPropagation(); handleProcessClick(proc); }}>Ver Detalhes</button>
                    <button className="text-green-600 hover:underline" onClick={(e) => { e.stopPropagation(); /* handleEditProcess(proc); */ }}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  };

  const renderInscricoes = () => {
    // Se o wizard está aberto, renderiza apenas ele
    if (showWizardInInscricoes) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nova Solicitação</h1>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
              onClick={() => setShowWizardInInscricoes(false)}
              title="Voltar para lista de solicitações"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Voltar</span>
            </button>
          </div>
          <InscricaoWizard />
        </div>
      );
    }

    // Lista de solicitações normal
    return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* CABEÇALHO COM AÇÕES - NOVA FUNCIONALIDADE   */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Solicitações</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
          onClick={() => setShowWizardInInscricoes(true)}
          title="Criar nova solicitação"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Nova Solicitação</span>
          <span className="xs:hidden">Nova</span>
        </button>
      </div>

      <div className="glass-effect p-3 sm:p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por empresa ou atividade..."
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="submitted">Submetida</option>
              <option value="em_analise">Em Análise</option>
              <option value="documentacao_pendente">Documentação Pendente</option>
              <option value="aprovado">Aprovada</option>
              <option value="rejeitado">Rejeitada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200 border-opacity-50">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Lista de Inscrições</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocolo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Submissão</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processes.length > 0 ? (
                processes.map((proc) => (
                  <tr
                    key={proc.id}
                    className="hover:bg-blue-50 hover:bg-opacity-50 cursor-pointer transition-all duration-200"
                    onClick={() => handleProcessClick(proc)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{proc.protocolo_interno || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{proc.razao_social || proc.nome_fantasia || proc.cpf || proc.cnpj || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {proc.tipo_pessoa || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(proc.status)}`}>
                        {getStatusText(proc.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-500">-</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proc.created_at ? new Date(proc.created_at).toLocaleDateString('pt-BR') : '-'}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
                    <p className="text-gray-500 mb-4">Não há solicitações que correspondam aos filtros selecionados.</p>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                      onClick={() => setShowWizardInInscricoes(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Criar Nova Solicitação
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'processes': return renderProcesses();
      case 'processesmotor': return renderProcessesMotor();
      case 'inscricoes': return renderInscricoes();
      // case 'form-wizard': return <FormWizard />;
      // case 'companies': return (
      //   <div className="text-center py-8 sm:py-12 px-4">
      //     <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
      //     <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Cadastro de Empresas</h2>
      //     <p className="text-sm sm:text-base text-gray-600">Módulo em desenvolvimento</p>
      //   </div>
      // );
      // case 'reports': return (
      //   <div className="text-center py-8 sm:py-12 px-4">
      //     <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
      //     <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Relatórios Gerenciais</h2>
      //     <p className="text-sm sm:text-base text-gray-600">Módulo em desenvolvimento</p>
      //   </div>
      // );
      // case 'compliance': return (
      //   <div className="text-center py-8 sm:py-12 px-4">
      //     <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
      //     <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Monitoramento de Conformidade</h2>
      //     <p className="text-sm sm:text-base text-gray-600">Módulo em desenvolvimento</p>
      //   </div>
      // );
      // case 'geo': return (
      //   <GeoVisualization
      //     processes={processes}
      //     companies={[]}
      //   />
      // );
      default:
        if (activeTab.startsWith('admin-')) {
          const adminSection = activeTab.replace('admin-', '');
          if (adminSection === 'pessoas-fisicas') {
            return <PessoasFisicas />;
          }
          if (adminSection === 'pessoas-juridicas') {
            return <PessoasJuridicas />;
          }
          return <AdminDashboard initialSection={adminSection} />;
        }
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="dark-header flex-shrink-0">
        <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
            />
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setSidebarOpen(false);
              }}
              className="hidden sm:flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <img
                src={homeIcon}
                alt="Home"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Painel</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              title="Sair"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 icon-darkgreen" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Sair</span>
            </button>

            <div className="hidden sm:block h-8 w-px bg-gray-600"></div>

            <div className="flex items-center gap-2 text-gray-300">
              <User className="w-5 h-5 icon-darkgreen" />
              <span className="text-sm font-medium">
                {getFirstName(externalUserName)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex p-3 sm:p-6">
        <div className="dashboard-container flex gap-4 lg:gap-6 w-full mx-auto px-2 sm:px-4 lg:px-8">
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={`sidebar-nav shadow-lg flex-shrink-0 w-72 sm:w-80 ${
          sidebarOpen ? 'sidebar-open' : ''
        }`}>
          <div className="flex flex-col h-[calc(100vh-80px)] sticky top-4">
            <div className="flex items-center px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between w-full">
                <div className="ml-3">
                  <p className="text-xs text-gray-500">{APP_NAME}</p>
                </div>
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                  {APP_VERSION}
                </span>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium nav-item ${
                      activeTab === item.id
                        ? 'active text-green-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <img
                      src={treeIcon}
                      alt={item.name}
                      className="w-5 h-5 flex-shrink-0 mr-3"
                    />
                    {item.name}
                  </button>
                );
              })}

              {otherNavigation.map((item) => {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium nav-item ${
                      activeTab === item.id
                        ? 'active text-green-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <img
                      src={treeIcon}
                      alt={item.name}
                      className="w-5 h-5 flex-shrink-0 mr-3"
                    />
                    {item.name}
                  </button>
                );
              })}

              <div>
                <button
                  onClick={() => setAdminExpanded(!adminExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium nav-item ${
                    activeTab.startsWith('admin')
                      ? 'active text-green-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <img
                      src={arrowIcon}
                      alt="Administração"
                      className={`w-5 h-5 flex-shrink-0 mr-3 transition-transform duration-200 ${
                        adminExpanded ? 'rotate-90' : ''
                      }`}
                    />
                    Administração
                  </div>
                </button>

                {adminExpanded && (
                  <div className="mt-1 space-y-1 pl-6 sm:pl-8">
                    <div>
                      <button
                        onClick={() => setGeneralExpanded(!generalExpanded)}
                        className={`w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          activeTab.match(/admin-(pessoas-fisicas|pessoas-juridicas)/)
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <img
                            src={arrowIcon}
                            alt="Geral"
                            className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mr-2 sm:mr-3 transition-transform duration-200 ${
                              generalExpanded ? 'rotate-90' : ''
                            }`}
                          />
                          <span className="truncate">Geral</span>
                        </div>
                      </button>

                      {generalExpanded && (
                        <div className="mt-1 space-y-1 pl-6 sm:pl-8">
                          {generalSubSections.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                setActiveTab(`admin-${subItem.id}`);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                activeTab === `admin-${subItem.id}`
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <img
                                src={submenuIcon}
                                alt=""
                                className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mr-2 sm:mr-3"
                              />
                              <span className="truncate">{subItem.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {adminDirectSections.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          setActiveTab(`admin-${subItem.id}`);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === `admin-${subItem.id}`
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <img
                          src={submenuIcon}
                          alt=""
                          className="w-5 h-5 flex-shrink-0 mr-3"
                        />
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1">
            <div className="content-area p-3 sm:p-4 lg:p-6 rounded-lg">
              {renderContent()}
            </div>
          </main>
        </div>
        </div>
      </div>

      <NewProcessModal
        isOpen={showNewProcessModal}
        onClose={() => setShowNewProcessModal(false)}
        onSubmit={handleNewProcess}
      />

      <ProcessDetailsModal
        isOpen={showProcessDetails}
        onClose={() => setShowProcessDetails(false)}
        process={selectedProcess}
        onUpdateProcess={handleUpdateProcess}
      />

      {/* Wizard do Motor BPMN (Workflow Engine) */}
      {showWizardMotor && (
        <InscricaoWizardMotor
          onClose={() => {
            setShowWizardMotor(false);
            loadProcesses();
            loadStats();
          }}
        />
      )}
    </div>
  );
}
