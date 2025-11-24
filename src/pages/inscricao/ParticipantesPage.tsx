import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, User, Building, FileText, ArrowRight, AlertTriangle, X, Search, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import { searchPessoas, SearchPessoaResult } from '../../lib/api/people';
import {
  addParticipanteProcesso,
  getParticipantesProcesso,
  removeParticipanteProcesso,
  ParticipanteProcessoResponse
} from '../../lib/api/processos';
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import { useInscricaoStore } from '../../lib/store/inscricao';
import ConfirmDialog from '../../components/ConfirmDialog';
import { completeStep } from '../../services/workflowApi';

type ModalStep = 'search' | 'select-role';
type PapelType = 'Requerente' | 'Procurador' | 'Responsável Técnico';

export default function ParticipantesPage() {
  const navigate = useNavigate();
  const { 
    processoId, 
    workflowInstanceId, 
    currentStepId, 
    currentStepKey 
  } = useInscricaoContext();
  const { 
    isStepComplete, 
    setParticipants, 
    setCurrentStep,
    setCurrentStepFromEngine 
  } = useInscricaoStore();

  const [participantes, setParticipantes] = useState<ParticipanteProcessoResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchPessoaResult[]>([]);
  const [selectedPessoa, setSelectedPessoa] = useState<SearchPessoaResult | null>(null);
  const [selectedPapel, setSelectedPapel] = useState<PapelType | ''>('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [participanteToDelete, setParticipanteToDelete] = useState<ParticipanteProcessoResponse | null>(null);

  // Função simples sem useCallback para evitar loops
  const loadParticipantes = async () => {
    if (!processoId) return;

    try {
      const data = await getParticipantesProcesso(processoId);
      setParticipantes(data);
      
      // Atualiza o store Zustand para validação do botão "Próximo"
      const participantesForStore = data.map(p => ({
        id: p.id,
        type: (p.pessoa_tipo === 0 || p.pessoa_tipo === 1) ? 'PF' : 'PJ' as 'PF' | 'PJ',
        role: p.papel === 'Requerente' ? 'REQUERENTE' : 
              p.papel === 'Procurador' ? 'PROCURADOR' : 
              'RESP_TECNICO' as 'REQUERENTE' | 'PROCURADOR' | 'RESP_TECNICO',
        cpf: p.pessoa_tipo === 0 ? p.pessoa_cpf_cnpj : undefined,
        cnpj: p.pessoa_tipo !== 0 ? p.pessoa_cpf_cnpj : undefined,
        nome: p.pessoa_tipo === 0 ? p.pessoa_nome : undefined,
        razao_social: p.pessoa_tipo !== 0 ? p.pessoa_nome : undefined,
        email: p.pessoa_email || '',
        celular: p.pessoa_telefone || ''
      }));
      setParticipants(participantesForStore);
    } catch (err: any) {
      console.error('Erro ao carregar participantes:', err);
    }
  };

  // Carrega participantes quando processoId estiver disponível
  useEffect(() => {
    if (processoId) {
      loadParticipantes();
    }
  }, [processoId]); // Só re-executa se processoId mudar de valor

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
    setSelectedPapel('Requerente'); // Pré-seleciona "Requerente"
    setModalStep('select-role');
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleBackToSearch = () => {
    setModalStep('search');
    setSelectedPessoa(null);
    setSelectedPapel('');
  };

  const handleAddParticipante = async () => {
    const trimmedPapel = selectedPapel?.trim();

    console.log('🔷 handleAddParticipante - Iniciando', {
      selectedPessoa,
      selectedPapel,
      trimmedPapel,
      selectedPapelType: typeof selectedPapel,
      selectedPapelLength: selectedPapel?.length,
      processoId,
      processoIdType: typeof processoId,
      pessoaId: selectedPessoa?.pkpessoa
    });

    if (!selectedPessoa) {
      console.error('🔷 handleAddParticipante - Pessoa não selecionada');
      setError('Por favor, selecione uma pessoa.');
      return;
    }

    if (!trimmedPapel || trimmedPapel === '') {
      console.error('🔷 handleAddParticipante - Papel não selecionado:', {
        selectedPapel,
        trimmedPapel,
        isEmpty: trimmedPapel === ''
      });
      setError('Por favor, selecione um papel para o participante.');
      return;
    }

    if (!processoId) {
      console.error('🔷 handleAddParticipante - ProcessId não disponível');
      setError('Processo não inicializado. Por favor, aguarde ou recarregue a página.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔷 handleAddParticipante - Chamando API:', {
        processoId: processoId,
        payload: {
          pessoa_id: selectedPessoa.pkpessoa,
          papel: trimmedPapel
        }
      });

      await addParticipanteProcesso(processoId, {
        pessoa_id: selectedPessoa.pkpessoa,
        papel: trimmedPapel as PapelType
      });

      console.log('🔷 handleAddParticipante - Sucesso! Recarregando lista...');

      const nomeParticipante = selectedPessoa.nome || selectedPessoa.razaosocial;
      const mensagem = `${nomeParticipante} adicionado como ${trimmedPapel}`;

      console.log('🔔 Exibindo toast:', mensagem);
      toast.success(mensagem, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      await loadParticipantes();
      handleCloseModal();
    } catch (err: any) {
      console.error('🔷 handleAddParticipante - Erro:', err);
      setError(err.message || 'Erro ao adicionar participante');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipante = (participante: ParticipanteProcessoResponse) => {
    setParticipanteToDelete(participante);
    setShowConfirmDelete(true);
  };

  const confirmRemoveParticipante = async () => {
    if (!processoId || !participanteToDelete) return;

    try {
      await removeParticipanteProcesso(processoId, participanteToDelete.id);
      await loadParticipantes();

      console.log('🔔 Exibindo toast: Participante removido');
      toast.success('Participante removido com sucesso', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err: any) {
      console.log('🔔 Exibindo toast de erro:', err.message);
      toast.error(err.message || 'Erro ao remover participante', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setShowConfirmDelete(false);
      setParticipanteToDelete(null);
    }
  };

  const handleNext = async () => {
    // 1. Validar step
    if (!isStepComplete(1)) {
      toast.error('Adicione pelo menos um requerente antes de continuar');
      return;
    }

    // 2. Verificar se workflow está inicializado
    if (!workflowInstanceId || !currentStepId) {
      console.warn('⚠️ Workflow não inicializado, usando modo manual');
      // Modo manual: avançar para step 3 (Licença Solicitada)
      setCurrentStep(3);
      toast.success('Avançando para Licença Solicitada');
      return;
    }

    try {
      // 3. Completar step atual no workflow engine
      console.log('🔧 Completando step no workflow:', {
        instanceId: workflowInstanceId,
        stepId: currentStepId,
        stepKey: currentStepKey
      });

      const response = await completeStep(workflowInstanceId, currentStepId, {
        totalParticipantes: participantes.length,
        hasRequerente: participantes.some(p => p.papel === 'Requerente')
      });

      console.log('✅ Step completado:', response);

      // 4. Verificar se workflow finalizou
      if (response.status === 'FINISHED' || !response.nextStep) {
        toast.success('Processo finalizado!');
        navigate('/inscricao/revisao');
        return;
      }

      // 5. Atualizar contexto com próximo step
      setCurrentStepFromEngine(response.nextStep.id, response.nextStep.key);

      // 6. Navegar para próxima rota definida pelo backend
      console.log('🧭 Navegando para:', response.nextStep.path);
      navigate(response.nextStep.path);

      toast.success(`Avançando para: ${response.nextStep.label}`);
    } catch (error: any) {
      console.error('❌ Erro ao completar step:', error);
      console.warn('⚠️ Workflow engine não disponível, usando modo manual');
      // Fallback: modo manual
      setCurrentStep(3);
      toast.success('Avançando para Licença Solicitada');
    }
  };

  const getParticipantIcon = (papel: string) => {
    switch (papel) {
      case 'Requerente':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'Procurador':
        return <FileText className="w-5 h-5 text-yellow-600" />;
      case 'Responsável Técnico':
        return <Building className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTipoIcon = (tipo: number) => {
    switch (tipo) {
      case 1:
        return <User className="w-4 h-4" />;
      case 2:
        return <Building className="w-4 h-4" />;
      case 3:
        return <Globe className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getTipoLabel = (tipo: number) => {
    switch (tipo) {
      case 1:
        return 'Pessoa Física';
      case 2:
        return 'Pessoa Jurídica';
      case 3:
        return 'Pessoa Estrangeira';
      default:
        return 'Desconhecido';
    }
  };

  const getPapelBadgeColor = (papel: string) => {
    switch (papel) {
      case 'Requerente':
        return 'bg-blue-100 text-blue-800';
      case 'Procurador':
        return 'bg-yellow-100 text-yellow-800';
      case 'Responsável Técnico':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasRequerente = participantes.some(p => p.papel === 'Requerente');

  // Mostra loading enquanto aguarda processoId (simples, sem timeout)
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Partícipes do Empreendimento</h2>
        <p className="text-gray-600">
          Adicione o requerente, procurador e responsável técnico do empreendimento.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {participantes.map((participante) => (
          <div key={participante.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getParticipantIcon(participante.papel)}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{participante.pessoa_nome}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPapelBadgeColor(participante.papel)}`}>
                      {participante.papel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{participante.pessoa_cpf_cnpj}</p>
                  {participante.pessoa_email && (
                    <p className="text-sm text-gray-500">{participante.pessoa_email}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemoveParticipante(participante)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {participantes.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum participante adicionado</h3>
            <p className="text-gray-500 mb-4">Adicione pelo menos um requerente para continuar</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <button
          onClick={handleOpenModal}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adicionar Participante
        </button>
      </div>

      {!hasRequerente && participantes.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Requerente obrigatório</h4>
              <p className="text-sm text-yellow-800 mt-1">
                É necessário adicionar pelo menos um participante com o papel de "Requerente" para continuar.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!isStepComplete(1)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Participante</h3>
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
                    <div className="flex gap-2">
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
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Documento</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nome</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {searchResults.map((pessoa) => (
                              <tr key={pessoa.pkpessoa} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    {getTipoIcon(pessoa.tipo)}
                                    <span className="text-xs">{getTipoLabel(pessoa.tipo).split(' ')[1]}</span>
                                  </div>
                                </td>
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
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
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
                        {getTipoIcon(selectedPessoa.tipo)}
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
                          {selectedPessoa.telefone && (
                            <p className="text-sm text-gray-500">{selectedPessoa.telefone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Papel no Processo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedPapel}
                      onChange={(e) => setSelectedPapel(e.target.value as PapelType)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="Requerente">Requerente</option>
                      <option value="Procurador">Procurador</option>
                      <option value="Responsável Técnico">Responsável Técnico</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Opções: Requerente, Procurador, Responsável Técnico
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
                      onClick={handleAddParticipante}
                      disabled={!selectedPapel || selectedPapel.trim() === '' || loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adicionando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Adicionar
                        </>
                      )}
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
          setParticipanteToDelete(null);
        }}
        onConfirm={confirmRemoveParticipante}
        title="Remover Participante"
        message={`Deseja realmente remover ${participanteToDelete?.pessoa_nome || 'este participante'}?`}
        confirmText="Remover"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
