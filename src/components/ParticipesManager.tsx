import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, User, Building, FileText, AlertTriangle, X, Search, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import { searchPessoas, SearchPessoaResult } from '../lib/api/people';
import ConfirmDialog from './ConfirmDialog';

type ModalStep = 'search' | 'select-role';
type PapelType = 'Requerente' | 'Procurador' | 'Responsável Técnico';

export interface Participe {
  id: string;
  pessoa_id: number;
  pessoa_nome: string;
  pessoa_cpf_cnpj: string;
  pessoa_tipo: number;
  papel: PapelType;
  pessoa_email?: string;
  pessoa_telefone?: string;
}

interface ParticipesManagerProps {
  participes: Participe[];
  onAdd: (participe: Participe) => Promise<void>;
  onRemove: (participeId: string) => Promise<void>;
  showNextButton?: boolean;
  onNext?: () => void;
  nextButtonLabel?: string;
  nextButtonDisabled?: boolean;
}

export default function ParticipesManager({
  participes,
  onAdd,
  onRemove,
  showNextButton = false,
  onNext,
  nextButtonLabel = 'Próximo',
  nextButtonDisabled = false
}: ParticipesManagerProps) {
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
  const [participeToDelete, setParticipeToDelete] = useState<Participe | null>(null);

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

  const handleAddParticipe = async () => {
    const trimmedPapel = selectedPapel?.trim();

    if (!selectedPessoa) {
      setError('Por favor, selecione uma pessoa.');
      return;
    }

    if (!trimmedPapel || trimmedPapel === '') {
      setError('Por favor, selecione um papel para o participante.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newParticipe: Participe = {
        id: `temp_${Date.now()}`,
        pessoa_id: selectedPessoa.pkpessoa,
        pessoa_nome: selectedPessoa.nome || selectedPessoa.razaosocial || '',
        pessoa_cpf_cnpj: selectedPessoa.cpf || selectedPessoa.cnpj || '',
        pessoa_tipo: selectedPessoa.tipo,
        papel: trimmedPapel as PapelType,
        pessoa_email: selectedPessoa.email,
        pessoa_telefone: selectedPessoa.telefone
      };

      await onAdd(newParticipe);

      const nomeParticipante = selectedPessoa.nome || selectedPessoa.razaosocial;
      toast.success(`${nomeParticipante} adicionado como ${trimmedPapel}`);

      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar participante');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipe = (participe: Participe) => {
    setParticipeToDelete(participe);
    setShowConfirmDelete(true);
  };

  const confirmRemoveParticipe = async () => {
    if (!participeToDelete) return;

    try {
      await onRemove(participeToDelete.id);
      toast.success('Participante removido com sucesso');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover participante');
    } finally {
      setShowConfirmDelete(false);
      setParticipeToDelete(null);
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

  const hasRequerente = participes.some(p => p.papel === 'Requerente');

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Partícipes</h3>
        <p className="text-sm text-gray-600">
          Adicione o requerente, procurador e responsável técnico do empreendimento.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {participes.map((participe) => (
          <div key={participe.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getParticipantIcon(participe.papel)}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{participe.pessoa_nome}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPapelBadgeColor(participe.papel)}`}>
                      {participe.papel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{participe.pessoa_cpf_cnpj}</p>
                  {participe.pessoa_email && (
                    <p className="text-sm text-gray-500">{participe.pessoa_email}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemoveParticipe(participe)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {participes.length === 0 && (
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

      {!hasRequerente && participes.length > 0 && (
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

      {showNextButton && onNext && (
        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={nextButtonDisabled}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {nextButtonLabel}
          </button>
        </div>
      )}

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
                      <p className="text-gray-600">Nenhuma pessoa encontrada</p>
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
                      Papel no Empreendimento <span className="text-red-500">*</span>
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
                      onClick={handleAddParticipe}
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
          setParticipeToDelete(null);
        }}
        onConfirm={confirmRemoveParticipe}
        title="Remover Participante"
        message={`Deseja realmente remover ${participeToDelete?.pessoa_nome || 'este participante'}?`}
        confirmText="Remover"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
