import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PessoasJuridicasService } from '../services/pessoasJuridicasService';
import { X, Building2, Phone, MapPin, FileText } from 'lucide-react';

interface PessoaJuridica {
  pkpessoa: number;
  fkuser: number | null;
  tipo: string | number | null;
  status: string | null;
  cpf: string | null;
  nome: string;
  datanascimento: string | null;
  naturalidade: string | null;
  nacionalidade: string | null;
  estadocivil: string | number | null;
  sexo: string | number | null;
  rg: string | null;
  orgaoemissor: string | null;
  fkestadoemissor: number | null;
  fkprofissao: number | null;
  passaporte: string | null;
  datapassaporte: string | null;
  cnpj: string | null;
  razaosocial: string | null;
  nomefantasia: string | null;
  inscricaoestadual: string | null;
  fkufinscricaoestadual: number | null;
  datainicioatividade: string | null;
  inscricaomunicipal: string | null;
  cnaefiscal: string | null;
  simplesnacional: string | null;
  crccontador: string | null;
  fknaturezajuridica: number | null;
  fkporte: number | null;
  identificacaoestrangeira: string | null;
  tipoidentificacaoestrangeira: string | null;
  telefone: string | null;
  telefonealternativo1: string | null;
  telefonealternativo2: string | null;
  email: string | null;
  emailalternativo: string | null;
  fax: string | null;
  faxalternativo: string | null;
  complemento: string | null;
  cep: string | null;
  cidade: string | null;
  provincia: string | null;
  fkmunicipio: number | null;
  fkestado: number | null;
  fkpais: number | null;
  statusregimeespecial: string | null;
  dataregimeespecial: string | null;
  periodoregimeespecial: string | null;
  periodopagamentoregimeespecial: string | null;
  fkcentroinformacao: number | null;
  datacadastro: string | null;
  dtype: number | null;
  numeroconselhoprofissional: string | null;
  fkconselhoprofissional: number | null;
  fkestadoemissorconselhoprofissional: number | null;
  caixapostal: string | null;
  endereco: string | null;
  profissao: string | null;
  situacaopessoajuridica: string | null;
  porteempresa: string | null;
  filiacaomae: string | null;
  filiacaopai: string | null;
  conjuge_id: number | null;
  matricula: string | null;
  nomepessoa: string | null;
  numeroidentificacao: string | null;
  nomerazao: string | null;
  permitirvercarscadastrante: string | null;
  cargo: string | null;
  dataultimaalteracao: string | null;
  permitirvercarrt: string | null;
}

interface PessoaJuridicaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pessoa: PessoaJuridica;
}

export default function PessoaJuridicaDetailsModal({
  isOpen,
  onClose,
  pessoa: pessoaInicial
}: PessoaJuridicaDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('dados-empresa');
  const [pessoa, setPessoa] = useState<PessoaJuridica | null>(pessoaInicial);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showingInitialData, setShowingInitialData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPessoa(pessoaInicial);
      setErrorMessage(null);
      setShowingInitialData(false);

      if (pessoaInicial?.cnpj) {
        loadPessoaDetails();
      } else {
        setShowingInitialData(true);
        setErrorMessage('CNPJ não disponível. Exibindo dados básicos.');
      }
    }
  }, [isOpen, pessoaInicial?.pkpessoa]);

  const loadPessoaDetails = async () => {
    if (!pessoaInicial?.cnpj) {
      setShowingInitialData(true);
      setErrorMessage('CNPJ não disponível. Exibindo dados básicos.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await PessoasJuridicasService.getPessoaByCnpj(pessoaInicial.cnpj);
      setPessoa(data);
      setShowingInitialData(false);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes da pessoa jurídica:', error);
      const errorMsg = error?.message || 'Erro ao carregar dados detalhados';
      setErrorMessage(errorMsg);
      setPessoa(pessoaInicial);
      setShowingInitialData(true);
      toast.warning(`${errorMsg}. Exibindo dados básicos disponíveis.`);
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (cep: string | null) => {
    if (!cep) return '';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '';
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return date;
    }
  };

  const getEstadoUF = (fkestado: number | null) => {
    if (!fkestado) return '';
    const estados: { [key: number]: string } = {
      1: 'AC', 2: 'AL', 3: 'AP', 4: 'AM', 5: 'BA',
      6: 'CE', 7: 'DF', 8: 'ES', 9: 'GO', 10: 'MA',
      11: 'MT', 12: 'MS', 13: 'MG', 14: 'PA', 15: 'PB',
      16: 'PR', 17: 'PE', 18: 'PI', 19: 'RJ', 20: 'RN',
      21: 'RS', 22: 'RO', 23: 'RR', 24: 'SC', 25: 'SP',
      26: 'SE', 27: 'TO'
    };
    return estados[fkestado] || '';
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'dados-empresa', name: 'Dados da Empresa', icon: Building2 },
    { id: 'contato', name: 'Contato', icon: Phone },
    { id: 'endereco', name: 'Endereço', icon: MapPin },
    { id: 'documentacao', name: 'Documentação', icon: FileText }
  ];

  const renderDadosEmpresa = () => {
    if (!pessoa) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
            <p className="text-lg font-semibold text-gray-900">{pessoa.razaosocial || pessoa.nome || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
            <p className="text-gray-900">{pessoa.nomefantasia || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
            <p className="text-gray-900">{formatCNPJ(pessoa.cnpj)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
            <p className="text-gray-900">{pessoa.inscricaoestadual || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UF Inscrição Estadual</label>
            <p className="text-gray-900">{getEstadoUF(pessoa.fkufinscricaoestadual)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal</label>
            <p className="text-gray-900">{pessoa.inscricaomunicipal || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início das Atividades</label>
            <p className="text-gray-900">{formatDate(pessoa.datainicioatividade)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNAE Fiscal</label>
            <p className="text-gray-900">{pessoa.cnaefiscal || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Simples Nacional</label>
            <p className="text-gray-900">{pessoa.simplesnacional || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CRC Contador</label>
            <p className="text-gray-900">{pessoa.crccontador || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Natureza Jurídica</label>
            <p className="text-gray-900">{pessoa.fknaturezajuridica || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
            <p className="text-gray-900">{pessoa.fkporte || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Porte Empresa</label>
            <p className="text-gray-900">{pessoa.porteempresa || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Situação</label>
            <p className="text-gray-900">{pessoa.situacaopessoajuridica || ''}</p>
          </div>

          {pessoa.identificacaoestrangeira && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identificação Estrangeira</label>
                <p className="text-gray-900">{pessoa.identificacaoestrangeira}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Identificação Estrangeira</label>
                <p className="text-gray-900">{pessoa.tipoidentificacaoestrangeira || ''}</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderContato = () => {
    if (!pessoa) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="inline w-4 h-4 mr-1" />
              Telefone Principal
            </label>
            <p className="text-gray-900">{formatPhone(pessoa.telefone)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="inline w-4 h-4 mr-1" />
              Telefone Alternativo 1
            </label>
            <p className="text-gray-900">{formatPhone(pessoa.telefonealternativo1)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="inline w-4 h-4 mr-1" />
              Telefone Alternativo 2
            </label>
            <p className="text-gray-900">{formatPhone(pessoa.telefonealternativo2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Principal</label>
            <p className="text-gray-900">{pessoa.email || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Alternativo</label>
            <p className="text-gray-900">{pessoa.emailalternativo || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
            <p className="text-gray-900">{formatPhone(pessoa.fax)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fax Alternativo</label>
            <p className="text-gray-900">{formatPhone(pessoa.faxalternativo)}</p>
          </div>

          {pessoa.caixapostal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caixa Postal</label>
              <p className="text-gray-900">{pessoa.caixapostal}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEndereco = () => {
    if (!pessoa) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <p className="text-gray-900">{pessoa.endereco || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
            <p className="text-gray-900">{pessoa.complemento || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
            <p className="text-gray-900">{formatCEP(pessoa.cep)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade/Município</label>
            <p className="text-gray-900">{pessoa.cidade || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado/UF</label>
            <p className="text-gray-900">{getEstadoUF(pessoa.fkestado)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <p className="text-gray-900">{pessoa.fkpais || ''}</p>
          </div>

          {pessoa.provincia && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Província</label>
              <p className="text-gray-900">{pessoa.provincia}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDocumentacao = () => {
    if (!pessoa) return null;

    const getStatusColor = (status: string | null) => {
      if (!status) return 'bg-gray-100 text-gray-800';
      const s = String(status).toLowerCase();
      if (s === 'ativo' || s === 'active' || s === '2') return 'bg-green-100 text-green-800';
      if (s === 'inativo' || s === 'inactive' || s === '0') return 'bg-red-100 text-red-800';
      return 'bg-blue-100 text-blue-800';
    };

    const getStatusText = (status: string | null) => {
      if (!status) return '';
      const s = String(status).toLowerCase();
      if (s === '2' || s === 'ativo' || s === 'active') return 'Ativo';
      if (s === '0' || s === 'inativo' || s === 'inactive') return 'Inativo';
      return status;
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Cadastro</label>
            <p className="text-gray-900">{formatDate(pessoa.datacadastro)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Última Alteração</label>
            <p className="text-gray-900">{formatDate(pessoa.dataultimaalteracao)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <p className="text-gray-900">{pessoa.tipo || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(pessoa.status)}`}>
              {getStatusText(pessoa.status)}
            </span>
          </div>

          {pessoa.statusregimeespecial && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Regime Especial</label>
                <p className="text-gray-900">{pessoa.statusregimeespecial}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Regime Especial</label>
                <p className="text-gray-900">{formatDate(pessoa.dataregimeespecial)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período Regime Especial</label>
                <p className="text-gray-900">{pessoa.periodoregimeespecial || ''}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período Pagamento Regime Especial</label>
                <p className="text-gray-900">{pessoa.periodopagamentoregimeespecial || ''}</p>
              </div>
            </>
          )}

          {pessoa.fkcentroinformacao && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Informação</label>
              <p className="text-gray-900">{pessoa.fkcentroinformacao}</p>
            </div>
          )}

          {pessoa.dtype && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">D-Type</label>
              <p className="text-gray-900">{pessoa.dtype}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">DETALHES PESSOA JURÍDICA</h2>
            <p className="text-sm text-gray-500">
              {pessoa?.razaosocial || pessoa?.nome || 'Carregando...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {errorMessage && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-yellow-800">{errorMessage}</p>
                  {showingInitialData && (
                    <button
                      onClick={loadPessoaDetails}
                      className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-900"
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-4 text-gray-600">Carregando dados detalhados...</p>
            </div>
          ) : !pessoa ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <p className="text-red-800 font-semibold mb-2">Erro ao carregar dados</p>
                <p className="text-red-600 text-sm mb-4">Não foi possível carregar os dados da pessoa jurídica</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dados-empresa' && renderDadosEmpresa()}
              {activeTab === 'contato' && renderContato()}
              {activeTab === 'endereco' && renderEndereco()}
              {activeTab === 'documentacao' && renderDocumentacao()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
