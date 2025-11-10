import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Search, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { searchPessoas, SearchPessoaResult } from '../../lib/api/people';

interface ResponsavelEmpreendimento {
  id?: string;
  pessoa_id: number;
  pessoa_nome: string;
  pessoa_cpf_cnpj: string;
  pessoa_email?: string;
  papel: 'Requerente' | 'Procurador/Designado/Representante Legal' | 'Responsável Técnico';
}

interface EmpreendimentoFormData {
  id?: number;
  nome: string;
  situacao: 'Não iniciado' | 'Em instalação' | 'Em funcionamento' | '';
  numero_empregados: number | null;
  horario_inicio: string;
  horario_fim: string;
  responsaveis: ResponsavelEmpreendimento[];
}

interface EmpreendimentoFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  item: any | null;
  onSave: () => void;
}

type ModalStep = 'search' | 'select-role';

export default function EmpreendimentoForm({ isOpen, onClose, title, item, onSave }: EmpreendimentoFormProps) {
  const [formData, setFormData] = useState<EmpreendimentoFormData>({
    nome: '',
    situacao: '',
    numero_empregados: null,
    horario_inicio: '',
    horario_fim: '',
    responsaveis: []
  });

  const [showResponsavelModal, setShowResponsavelModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchPessoaResult[]>([]);
  const [selectedPessoa, setSelectedPessoa] = useState<SearchPessoaResult | null>(null);
  const [selectedPapel, setSelectedPapel] = useState<ResponsavelEmpreendimento['papel'] | ''>('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      loadEmpreendimentoData(item.id);
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, item]);

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

  const loadEmpreendimentoData = async (id: number) => {
    setLoading(true);
    try {
      const { data: emp, error: empError } = await supabase
        .from('empreendimentos')
        .select('*')
        .eq('id', id)
        .single();

      if (empError) throw empError;

      const { data: resp, error: respError } = await supabase
        .from('empreendimento_responsaveis')
        .select(`
          id,
          pessoa_id,
          papel,
          pessoa:pessoa!inner(
            pkpessoa,
            nome,
            razaosocial,
            cpf,
            cnpj,
            email
          )
        `)
        .eq('empreendimento_id', id);

      if (respError) throw respError;

      const responsaveis = resp?.map((r: any) => ({
        id: r.id.toString(),
        pessoa_id: r.pessoa_id,
        pessoa_nome: r.pessoa.nome || r.pessoa.razaosocial,
        pessoa_cpf_cnpj: r.pessoa.cpf || r.pessoa.cnpj,
        pessoa_email: r.pessoa.email,
        papel: r.papel
      })) || [];

      setFormData({
        id: emp.id,
        nome: emp.nome,
        situacao: emp.situacao,
        numero_empregados: emp.numero_empregados,
        horario_inicio: emp.horario_inicio || '',
        horario_fim: emp.horario_fim || '',
        responsaveis
      });
    } catch (err: any) {
      console.error('Erro ao carregar empreendimento:', err);
      toast.error('Erro ao carregar dados do empreendimento');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      situacao: '',
      numero_empregados: null,
      horario_inicio: '',
      horario_fim: '',
      responsaveis: []
    });
    setError(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      let empreendimentoId = formData.id;

      if (empreendimentoId) {
        const { error: updateError } = await supabase
          .from('empreendimentos')
          .update({
            nome: formData.nome,
            situacao: formData.situacao,
            numero_empregados: formData.numero_empregados,
            horario_inicio: formData.horario_inicio || null,
            horario_fim: formData.horario_fim || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', empreendimentoId);

        if (updateError) throw updateError;
      } else {
        const { data: newEmp, error: insertError } = await supabase
          .from('empreendimentos')
          .insert({
            nome: formData.nome,
            situacao: formData.situacao,
            numero_empregados: formData.numero_empregados,
            horario_inicio: formData.horario_inicio || null,
            horario_fim: formData.horario_fim || null
          })
          .select()
          .single();

        if (insertError) throw insertError;
        empreendimentoId = newEmp.id;
      }

      await supabase
        .from('empreendimento_responsaveis')
        .delete()
        .eq('empreendimento_id', empreendimentoId);

      if (formData.responsaveis.length > 0) {
        const responsaveisToInsert = formData.responsaveis.map(r => ({
          empreendimento_id: empreendimentoId,
          pessoa_id: r.pessoa_id,
          papel: r.papel
        }));

        const { error: respError } = await supabase
          .from('empreendimento_responsaveis')
          .insert(responsaveisToInsert);

        if (respError) throw respError;
      }

      toast.success(`Empreendimento ${formData.id ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar empreendimento:', err);
      toast.error(err.message || 'Erro ao salvar empreendimento');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResponsavelModal = () => {
    setShowResponsavelModal(true);
    setModalStep('search');
    setSearchTerm('');
    setSearchResults([]);
    setSelectedPessoa(null);
    setSelectedPapel('');
    setError(null);
  };

  const handleCloseResponsavelModal = () => {
    setShowResponsavelModal(false);
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
    handleCloseResponsavelModal();
  };

  const handleRemoveResponsavel = (responsavel: ResponsavelEmpreendimento) => {
    setFormData(prev => ({
      ...prev,
      responsaveis: prev.responsaveis.filter(r =>
        r.id ? r.id !== responsavel.id : r.pessoa_id !== responsavel.pessoa_id
      )
    }));
    toast.success('Responsável removido');
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {loading && !formData.id ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando dados...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
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
                        required
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
                          situacao: e.target.value as EmpreendimentoFormData['situacao']
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="Não iniciado">Não iniciado</option>
                        <option value="Em instalação">Em instalação</option>
                        <option value="Em funcionamento">Em funcionamento</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nº de Empregados
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
                        Horário de Início
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
                        Horário de Fim
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

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Responsáveis</h3>
                    <button
                      type="button"
                      onClick={handleOpenResponsavelModal}
                      className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.responsaveis.map((responsavel, index) => (
                      <div key={responsavel.id || index} className="border border-gray-200 rounded-lg p-4 bg-white">
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
                            type="button"
                            onClick={() => handleRemoveResponsavel(responsavel)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {formData.responsaveis.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                        <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Nenhum responsável adicionado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
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
          </form>
        </div>
      </div>

      {showResponsavelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Responsável</h3>
              <button
                onClick={handleCloseResponsavelModal}
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
                      Buscar Pessoa
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
                                  type="button"
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
                      <h4 className="font-medium text-gray-900">
                        {selectedPessoa.nome || selectedPessoa.razaosocial}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedPessoa.cpf || selectedPessoa.cnpj}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Papel <span className="text-red-500">*</span>
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
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleBackToSearch}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddResponsavel}
                      disabled={!selectedPapel}
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
    </>
  );
}
