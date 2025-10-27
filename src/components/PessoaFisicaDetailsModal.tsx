import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PessoasFisicasService } from '../services/pessoasFisicasService';
import { X, User, Phone, MapPin, FileText } from 'lucide-react';

interface PessoaFisica {
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
  numeroconselhoprofissional: string | null;
  fkconselhoprofissional: number | null;
  endereco: string | null;
  profissao: string | null;
  filiacaomae: string | null;
  filiacaopai: string | null;
  conjuge_id: number | null;
  matricula: string | null;
  cargo: string | null;
  dataultimaalteracao: string | null;
}

interface PessoaFisicaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pessoa: PessoaFisica;
}

export default function PessoaFisicaDetailsModal({
  isOpen,
  onClose,
  pessoa: pessoaInicial
}: PessoaFisicaDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('dados-pessoais');
  const [pessoa, setPessoa] = useState<PessoaFisica | null>(pessoaInicial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && pessoaInicial?.cpf) {
      loadPessoaDetails();
    }
  }, [isOpen, pessoaInicial]);

  const loadPessoaDetails = async () => {
    if (!pessoaInicial?.cpf) {
      toast.error('CPF não encontrado para buscar detalhes');
      return;
    }

    try {
      setLoading(true);
      const data = await PessoasFisicasService.getPessoaByCpf(pessoaInicial.cpf);
      setPessoa(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes da pessoa:', error);
      toast.error('Erro ao carregar dados da pessoa física');
      setPessoa(pessoaInicial);
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

  const getEstadoCivilText = (estadoCivil: string | number | null) => {
    if (estadoCivil === null || estadoCivil === undefined) return '';

    const estadoCivilStr = String(estadoCivil);
    const estados: { [key: string]: string } = {
      'solteiro': 'Solteiro(a)',
      'casado': 'Casado(a)',
      'divorciado': 'Divorciado(a)',
      'viuvo': 'Viúvo(a)',
      'separado': 'Separado(a)',
    };
    return estados[estadoCivilStr.toLowerCase()] || estadoCivilStr;
  };

  const getSexoText = (sexo: string | number | null) => {
    if (sexo === null || sexo === undefined) return '';

    const sexoStr = String(sexo);
    const sexos: { [key: string]: string } = {
      '0': 'Masculino',
      '1': 'Feminino',
      'M': 'Masculino',
      'F': 'Feminino',
      'masculino': 'Masculino',
      'feminino': 'Feminino',
    };
    return sexos[sexoStr] || sexoStr;
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'dados-pessoais', name: 'Dados Pessoais', icon: User },
    { id: 'contato', name: 'Contato', icon: Phone },
    { id: 'endereco', name: 'Endereço', icon: MapPin },
    { id: 'documentacao', name: 'Documentação', icon: FileText }
  ];

  const renderDadosPessoais = () => {
    if (!pessoa) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <p className="text-lg font-semibold text-gray-900">{pessoa.nome || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <p className="text-gray-900">{formatCPF(pessoa.cpf)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
            <p className="text-gray-900">{pessoa.rg || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Órgão Emissor</label>
            <p className="text-gray-900">{pessoa.orgaoemissor || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Emissor</label>
            <p className="text-gray-900">{pessoa.fkestadoemissor || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
            <p className="text-gray-900">{pessoa.profissao || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número Conselho Profissional</label>
            <p className="text-gray-900">{pessoa.numeroconselhoprofissional || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conselho Profissional</label>
            <p className="text-gray-900">{pessoa.fkconselhoprofissional || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
            <p className="text-gray-900">{getSexoText(pessoa.sexo)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
            <p className="text-gray-900">{getEstadoCivilText(pessoa.estadocivil)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
            <p className="text-gray-900">{formatDate(pessoa.datanascimento)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Naturalidade</label>
            <p className="text-gray-900">{pessoa.naturalidade || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
            <p className="text-gray-900">{pessoa.nacionalidade || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filiação Mãe</label>
            <p className="text-gray-900">{pessoa.filiacaomae || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filiação Pai</label>
            <p className="text-gray-900">{pessoa.filiacaopai || ''}</p>
          </div>

          {pessoa.conjuge_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cônjuge</label>
              <p className="text-gray-900">ID: {pessoa.conjuge_id}</p>
            </div>
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
            <p className="text-gray-900">{pessoa.fkestado || ''}</p>
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
      const s = status.toLowerCase();
      if (s === 'ativo' || s === 'active') return 'bg-green-100 text-green-800';
      if (s === 'inativo' || s === 'inactive') return 'bg-red-100 text-red-800';
      return 'bg-blue-100 text-blue-800';
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passaporte</label>
            <p className="text-gray-900">{pessoa.passaporte || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do Passaporte</label>
            <p className="text-gray-900">{formatDate(pessoa.datapassaporte)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
            <p className="text-gray-900">{pessoa.matricula || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <p className="text-gray-900">{pessoa.cargo || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <p className="text-gray-900">{pessoa.tipo || ''}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(pessoa.status)}`}>
              {pessoa.status || ''}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Última Alteração</label>
            <p className="text-gray-900">{formatDate(pessoa.dataultimaalteracao)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">DETALHES PESSOA FÍSICA</h2>
            <p className="text-sm text-gray-500">
              {pessoa?.nome || 'Carregando...'}
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-4 text-gray-600">Carregando dados...</p>
            </div>
          ) : !pessoa ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Erro ao carregar dados da pessoa física</p>
            </div>
          ) : (
            <>
              {activeTab === 'dados-pessoais' && renderDadosPessoais()}
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
