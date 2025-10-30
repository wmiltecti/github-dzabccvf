import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProcessService } from '../services/processService';
import NewProcessModal from '../components/NewProcessModal';
import ProcessDetailsModal from '../components/ProcessDetailsModal';
import AdminDashboard from '../components/admin/AdminDashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  User
} from 'lucide-react';
import GeoVisualization from '../components/geo/GeoVisualization';
import FormWizard from '../components/FormWizard';
import PessoasFisicas from './PessoasFisicas';
import PessoasJuridicas from './PessoasJuridicas';
import treeIcon from '/src/assets/tree_icon_menu.svg';
import arrowIcon from '/src/assets/arrow.svg';
import submenuIcon from '/src/assets/files_7281182-1759864502693-files_7281182-1759864312235-tree_icon_menu.svg';
import homeIcon from '/src/assets/icon_home.svg';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userMetadata, signOut, loading, isConfigured, isSupabaseReady } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [geralExpanded, setGeralExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewProcessModal, setShowNewProcessModal] = useState(false);
  const [showProcessDetails, setShowProcessDetails] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [processes, setProcesses] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [externalUserName, setExternalUserName] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    analysis: 0,
    approved: 0,
    rejected: 0
  });

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

  const getFirstName = (fullName: string | null): string => {
    if (!fullName) return 'Usuário';
    const firstName = fullName.trim().split(' ')[0];
    return firstName || 'Usuário';
  };

  const loadProcesses = React.useCallback(async () => {
    try {
      const data = await ProcessService.getProcesses({
        status: filterStatus,
        search: searchTerm
      });
      setProcesses(data);
    } catch (error) {
      console.error('Error loading processes:', error);
      setProcesses([]);
    }
  }, [filterStatus, searchTerm]);

  const loadStats = React.useCallback(async () => {
    try {
      const statsData = await ProcessService.getProcessStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        total: 0,
        pending: 0,
        analysis: 0,
        approved: 0,
        rejected: 0
      });
    }
  }, []);

  React.useEffect(() => {
    if (user && isConfigured && isSupabaseReady) {
      loadProcesses();
      loadStats();
    }
  }, [user, isConfigured, isSupabaseReady, loadProcesses, loadStats]);

  const handleNewProcess = async (processData: any) => {
    try {
      await ProcessService.createProcess(processData);
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
      await ProcessService.updateProcess(processId, updates);
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

  const filteredLicenses = processes.filter(license => {
    const matchesSearch = license.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.activity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || license.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'inscricoes', name: 'Inscrições', icon: FileCheck }
  ];

  const geralSubSections = [
    { id: 'pessoas-fisicas', name: 'Pessoas Físicas' },
    { id: 'pessoas-juridicas', name: 'Pessoas Jurídicas' }
  ];

  const otherNavigation = [
    { id: 'processes', name: 'Processos', icon: FileText },
    { id: 'form-wizard', name: 'Formulário', icon: FileText },
    { id: 'companies', name: 'Empresas', icon: Building2 },
    { id: 'reports', name: 'Relatórios', icon: BarChart3 },
    { id: 'compliance', name: 'Conformidade', icon: Shield },
    { id: 'geo', name: 'Visualização Geo', icon: MapPin }
  ];

  const adminSubSections = [
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

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* CABEÇALHO COM AÇÕES - NOVA FUNCIONALIDADE   */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Painel de Controle</h1>
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg opacity-50 cursor-not-allowed"
            onClick={() => toast.info('Funcionalidade de inscrição em desenvolvimento')}
            title="Funcionalidade em desenvolvimento"
            disabled
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Nova Inscrição</span>
            <span className="xs:hidden">Inscrição</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="stat-card p-4 sm:p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total de Processos</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="stat-card p-4 sm:p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="stat-card p-4 sm:p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Em Análise</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.analysis}</p>
            </div>
          </div>
        </div>

        <div className="stat-card p-4 sm:p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Aprovadas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="stat-card p-4 sm:p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Rejeitadas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200 border-opacity-50">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Atividade Recente</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {processes.slice(0, 3).map((license) => (
              <div
                key={license.id}
                className="flex items-center space-x-4 p-4 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 cursor-pointer transition-all duration-200 hover:transform hover:scale-[1.02]"
                onClick={() => handleProcessClick(license)}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{license.companies?.name}</p>
                  <p className="text-sm text-gray-500">{getLicenseTypeName(license.license_type)} - {license.activity}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(license.status)}`}>
                    {getStatusText(license.status)}
                  </span>
                </div>
              </div>
            ))}
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg opacity-50 cursor-not-allowed"
            onClick={() => toast.info('Funcionalidade de inscrição em desenvolvimento')}
            title="Funcionalidade em desenvolvimento"
            disabled
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Nova Inscrição</span>
            <span className="xs:hidden">Inscrição</span>
          </button>
        </div>
      </div>

      <div className="glass-effect p-3 sm:p-4 rounded-lg">
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analista</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLicenses.map((license) => (
                <tr
                  key={license.id}
                  className="hover:bg-green-50 hover:bg-opacity-50 cursor-pointer transition-all duration-200"
                  onClick={() => handleProcessClick(license)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{license.protocol_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{license.companies?.name}</div>
                    <div className="text-sm text-gray-500">{license.activity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {getLicenseTypeName(license.license_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(license.status)}`}>
                      {getStatusText(license.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${license.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{license.progress || 0}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {license.analyst_name || 'Não atribuído'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{license.expected_date ? new Date(license.expected_date).toLocaleDateString('pt-BR') : 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      {license.expected_date ? Math.ceil((new Date(license.expected_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} dias
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInscricoes = () => (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* CABEÇALHO COM AÇÕES - NOVA FUNCIONALIDADE   */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inscrições</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
          onClick={() => navigate('/inscricao/participantes')}
          title="Criar nova inscrição"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Nova Inscrição</span>
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
              {processes.filter(license => license.created_via === 'inscription').map((license) => (
                <tr
                  key={license.id}
                  className="hover:bg-blue-50 hover:bg-opacity-50 cursor-pointer transition-all duration-200"
                  onClick={() => handleProcessClick(license)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{license.protocol_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{license.companies?.name}</div>
                    <div className="text-sm text-gray-500">{license.activity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {getLicenseTypeName(license.license_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(license.status)}`}>
                      {getStatusText(license.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${license.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{license.progress || 0}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{license.submit_date ? new Date(license.submit_date).toLocaleDateString('pt-BR') : 'N/A'}</div>
                  </td>
                </tr>
              ))}
              {processes.filter(license => license.created_via === 'inscription').length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma inscrição encontrada</h3>
                    <p className="text-gray-500 mb-4">Não há inscrições que correspondam aos filtros selecionados.</p>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                      onClick={() => toast.info('Funcionalidade de inscrição em desenvolvimento')}
                    >
                      <Plus className="w-4 h-4" />
                      Criar Nova Inscrição
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'processes': return renderProcesses();
      case 'inscricoes': return renderInscricoes();
      case 'form-wizard': return <FormWizard />;
      case 'companies': return (
        <div className="text-center py-8 sm:py-12 px-4">
          <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Cadastro de Empresas</h2>
          <p className="text-sm sm:text-base text-gray-600">Módulo em desenvolvimento</p>
        </div>
      );
      case 'reports': return (
        <div className="text-center py-8 sm:py-12 px-4">
          <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Relatórios Gerenciais</h2>
          <p className="text-sm sm:text-base text-gray-600">Módulo em desenvolvimento</p>
        </div>
      );
      case 'compliance': return (
        <div className="text-center py-8 sm:py-12 px-4">
          <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Monitoramento de Conformidade</h2>
          <p className="text-sm sm:text-base text-gray-600">Módulo em desenvolvimento</p>
        </div>
      );
      case 'geo': return (
        <GeoVisualization
          processes={processes}
          companies={[]}
        />
      );
      case 'geral-pessoas-fisicas': return <PessoasFisicas />;
      case 'geral-pessoas-juridicas': return <PessoasJuridicas />;
      default:
        if (activeTab.startsWith('admin-')) {
          const adminSection = activeTab.replace('admin-', '');
          return <AdminDashboard initialSection={adminSection} />;
        }
        return renderDashboard();
    }
  };

  return (
    <div className="h-screen flex flex-col">
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
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Sair</span>
            </button>

            <div className="hidden sm:block h-8 w-px bg-gray-600"></div>

            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-300" />
              <span className="text-base font-medium text-white">
                {getFirstName(externalUserName)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-3 sm:p-6">
        <div className="dashboard-container flex gap-4 lg:gap-6 w-full mx-auto px-2 sm:px-4 lg:px-8">
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={`sidebar-nav shadow-lg flex-shrink-0 w-72 sm:w-80 z-50 ${
          sidebarOpen ? '' : 'lg:block hidden'
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-xs text-gray-500">Licenciamento Ambiental - Integracao</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isRoute) {
                        toast.info('Funcionalidade de inscrição em desenvolvimento');
                      } else {
                        setActiveTab(item.id);
                      }
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
                  onClick={() => setGeralExpanded(!geralExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium nav-item ${
                    activeTab.startsWith('geral')
                      ? 'active text-green-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <img
                      src={arrowIcon}
                      alt="Geral"
                      className={`w-5 h-5 flex-shrink-0 mr-3 transition-transform duration-200 ${
                        geralExpanded ? 'rotate-90' : ''
                      }`}
                    />
                    Geral
                  </div>
                </button>

                {geralExpanded && (
                  <div className="mt-1 space-y-1 pl-8 max-h-64 overflow-y-auto">
                    {geralSubSections.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          setActiveTab(`geral-${subItem.id}`);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === `geral-${subItem.id}`
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
                  <div className="mt-1 space-y-1 pl-8 max-h-64 overflow-y-auto">
                    {adminSubSections.map((subItem) => (
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

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <main className="flex-1 overflow-auto">
            <div className="content-area p-3 sm:p-4 lg:p-6 h-full rounded-lg">
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
