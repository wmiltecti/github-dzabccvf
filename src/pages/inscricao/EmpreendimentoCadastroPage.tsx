import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Trash2, User, ArrowLeft, ArrowRight, AlertTriangle, Search, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { searchPessoas, SearchPessoaResult } from '../../lib/api/people';
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import { useInscricaoStore } from '../../lib/store/inscricao';
import http from '../../lib/api/http';
import ConfirmDialog from '../../components/ConfirmDialog';

interface ResponsavelEmpreendimento {
  id: string;
  pessoa_id: number;
  pessoa_nome: string;
  pessoa_cpf_cnpj: string;
  pessoa_email?: string;
  papel: 'Requerente' | 'Procurador/Designado/Representante Legal' | 'Responsável Técnico';
}

interface EmpreendimentoData {
  nome: string;
  situacao: 'Não iniciado' | 'Em instalação' | 'Em funcionamento' | '';
  numero_empregados: number | null;
  horario_inicio: string;
  horario_fim: string;
  responsaveis: ResponsavelEmpreendimento[];
}

type ModalStep = 'search' | 'select-role';

export default function EmpreendimentoCadastroPage() {
  const navigate = useNavigate();
  const { processoId } = useInscricaoContext();
  const { setCurrentStep } = useInscricaoStore();

  const [formData, setFormData] = useState<EmpreendimentoData>({
    nome: '',
    situacao: '',
    numero_empregados: null,
    horario_inicio: '',
    horario_fim: '',
    responsaveis: []
  });

  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchPessoaResult[]>([]);
  const [selectedPessoa, setSelectedPessoa] = useState<SearchPessoaResult | null>(null);
  const [selectedPapel, setSelectedPapel] = useState<ResponsavelEmpreendimento['papel'] | ''>('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [responsavelToDelete, setResponsavelToDelete] = useState<ResponsavelEmpreendimento | null>(null);

  useEffect(() => {
    if (processoId) {
      loadEmpreendimentoData();
    }
  }, [processoId]);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      setError(null);

      try {
        const result = await searchPessoas(searchTerm);
        if (result.error) {
          setError(result.error.message);
          setSearchResults([]);
        } else {
          setSearchResults(result.data || []);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar pessoas');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadEmpreendimentoData = async () => {
    if (!processoId) return;

    setLoading(true);
    try {
      const response = await http.get(`/processos/${processoId}/empreendimento`);
      if (response.data) {
        setFormData(response.data);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Erro ao carregar dados do empreendimento:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!processoId) {
      toast.error('Processo não inicializado');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await http.put(`/processos/${processoId}/empreendimento`, formData);
      toast.success('Empreendimento salvo com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar empreendimento:', err);
      toast.error(err.message || 'Erro ao salvar empreendimento');
    } finally {
      setSaving(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      toast.error('Nome do empreendimento é obrigatório');
      return false;
    }

    if (!formData.situacao) {
      toast.error('Situação do empreendimento é obrigatória');
      return false;
    }

    if (formData.horario_inicio && formData.horario_fim) {
      if (formData.horario_fim <= formData.horario_inicio) {
        toast.error('Horário final deve ser posterior ao horário inicial');
        return false;
      }
    }

    const requerenteCount = formData.responsaveis.filter(r => r.papel === 'Requerente').length;
    if (requerenteCount === 0) {
      toast.error('É necessário adicionar pelo menos um Requerente');
      return false;
    }
    if (requerenteCount > 1) {
      toast.error('Apenas um Requerente pode ser adicionado');
      return false;
    }

    return true;
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setModalStep('search');
    setSearchTerm('');
    setSearchResults([]);
    setSelectedPessoa(null);
    setSelectedPapel('');
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalStep('search');
    setSearchTerm('');
    setSearchResults([]);
    setSelectedPessoa(null);
    setSelectedPapel('');
    setError(null);
  };

  const handleSelectPessoa = (pessoa: SearchPessoaResult) => {
    setSelectedPessoa(pessoa);
    setSelectedPapel('Requerente');
    setModalStep('select-role');
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleBackToSearch = () => {
    setModalStep('search');
    setSelectedPessoa(null);
    setSelectedPapel('');
  };

  const handleAddResponsavel = () => {
    if (!selectedPessoa || !selectedPapel) {
      setError('Selecione uma pessoa e um papel');
      return;
    }

    const requerenteExists = formData.responsaveis.some(r => r.papel === 'Requerente');
    if (selectedPapel === 'Requerente' && requerenteExists) {
      setError('Apenas um Requerente pode ser adicionado por empreendimento');
      return;
    }

    const jaAdicionado = formData.responsaveis.some(r => r.pessoa_id === selectedPessoa.pkpessoa);
    if (jaAdicionado) {
      setError('Esta pessoa já foi adicionada ao empreendimento');
      return;
    }

    const novoResponsavel: ResponsavelEmpreendimento = {
      id: crypto.randomUUID(),
      pessoa_id: selectedPessoa.pkpessoa,
      pessoa_nome: selectedPessoa.nome || selectedPessoa.razaosocial || '',
      pessoa_cpf_cnpj: selectedPessoa.cpf || selectedPessoa.cnpj || '',
      pessoa_email: selectedPessoa.email,
      papel: selectedPapel
    };

    setFormData(prev => ({
      ...prev,
      responsaveis: [...prev.responsaveis, novoResponsavel]
    }));

    toast.success(`${novoResponsavel.pessoa_nome} adicionado como ${selectedPapel}`);
    handleCloseModal();
  };

  const handleRemoveResponsavel = (responsavel: ResponsavelEmpreendimento) => {
    setResponsavelToDelete(responsavel);
    setShowConfirmDelete(true);
  };

  const confirmRemoveResponsavel = () => {
    if (!responsavelToDelete) return;

    setFormData(prev => ({
      ...prev,
      responsaveis: prev.responsaveis.filter(r => r.id !== responsavelToDelete.id)
    }));

    toast.success('Responsável removido com sucesso');
    setShowConfirmDelete(false);
    setResponsavelToDelete(null);
  };

  const getPapelBadgeColor = (papel: ResponsavelEmpreendimento['papel']) => {
    switch (papel) {
      case 'Requerente':
        return 'bg-blue-100 text-blue-800';
      case 'Procurador/Designado/Representante Legal':
        return 'bg-yellow-100 text-yellow-800';
      case 'Responsável Técnico':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNext = () => {
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/formulario');
    } else {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/imovel');
    } else {
      setCurrentStep(2);
    }
  };

  const hasRequerente = formData.responsaveis.some(r => r.papel === 'Requerente');

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro de Empreendimento</h2>
        <p className="text-gray-600">
          Preencha as informações sobre o empreendimento e seus responsáveis.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Empreendimento</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Empreendimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Digite o nome do empreendimento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Situação <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.situacao}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    situacao: e.target.value as EmpreendimentoData['situacao']
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Selecione...</option>
                  <option value="Não iniciado">Não iniciado</option>
                  <option value="Em instalação">Em instalação</option>
                  <option value="Em funcionamento">Em funcionamento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nº de Empregados Previstos ou Existentes
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numero_empregados || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    numero_empregados: e.target.value ? parseInt(e.target.value) : null
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Funcionamento - Início
                </label>
                <input
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario_inicio: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Funcionamento - Fim
                </label>
                <input
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario_fim: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Responsáveis</h3>
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Responsável
              </button>
            </div>

            <div className="space-y-3">
              {formData.responsaveis.map((responsavel) => (
                <div key={responsavel.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{responsavel.pessoa_nome}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPapelBadgeColor(responsavel.papel)}`}>
                            {responsavel.papel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{responsavel.pessoa_cpf_cnpj}</p>
                        {responsavel.pessoa_email && (
                          <p className="text-sm text-gray-500">{responsavel.pessoa_email}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveResponsavel(responsavel)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {formData.responsaveis.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Nenhum responsável adicionado</h4>
                  <p className="text-sm text-gray-500">Adicione pelo menos um requerente</p>
                </div>
              )}
            </div>

            {!hasRequerente && formData.responsaveis.length > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Requerente obrigatório</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      É necessário adicionar exatamente um responsável com o papel de "Requerente".
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar: Imóvel
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              Próximo: Formulário
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Responsável</h3>
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
                      Buscar Pessoa Cadastrada
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por CPF, CNPJ ou Nome..."
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        autoFocus
                      />
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
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
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Documento</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nome</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {searchResults.map((pessoa) => (
                              <tr key={pessoa.pkpessoa} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {pessoa.cpf || pessoa.cnpj || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {pessoa.nome || pessoa.razaosocial || '-'}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleSelectPessoa(pessoa)}
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
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 mb-4">Nenhuma pessoa encontrada</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 mb-2">Pessoa não encontrada?</p>
                        <button
                          onClick={() => {
                            handleCloseModal();
                            navigate('/pessoas-fisicas');
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                          Cadastrar Nova Pessoa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalStep === 'select-role' && selectedPessoa && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pessoa Selecionada:
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {selectedPessoa.nome || selectedPessoa.razaosocial}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedPessoa.cpf || selectedPessoa.cnpj}
                          </p>
                          {selectedPessoa.email && (
                            <p className="text-sm text-gray-500">{selectedPessoa.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Papel no Empreendimento <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedPapel}
                      onChange={(e) => setSelectedPapel(e.target.value as ResponsavelEmpreendimento['papel'])}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="Requerente">Requerente</option>
                      <option value="Procurador/Designado/Representante Legal">Procurador/Designado/Representante Legal</option>
                      <option value="Responsável Técnico">Responsável Técnico</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Apenas um Requerente pode ser adicionado por empreendimento
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={handleBackToSearch}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleAddResponsavel}
                      disabled={!selectedPapel || selectedPapel.trim() === ''}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setResponsavelToDelete(null);
        }}
        onConfirm={confirmRemoveResponsavel}
        title="Remover Responsável"
        message={`Deseja realmente remover ${responsavelToDelete?.pessoa_nome || 'este responsável'}?`}
        confirmText="Remover"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
