import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  saveResiduoGrupoA,
  loadResiduosGrupoA,
  updateResiduoGrupoA,
  deleteResiduoGrupoA,
  saveResiduoGrupoB,
  loadResiduosGrupoB,
  updateResiduoGrupoB,
  deleteResiduoGrupoB,
  saveResiduoGeral,
  loadResiduosGerais,
  updateResiduoGeral,
  deleteResiduoGeral,
} from '../services/residuosService';

interface Step4ResiduosProps {
  data: any;
  onChange: (data: any) => void;
  processoId?: string | null;
}

interface ResiduoGrupo {
  id: string;
  tipo: string;
  quantidade: string;
  destino: string;
}

interface ResiduoGeral {
  id: string;
  categoria: string;
  tipo: string;
  origem: string;
  tratamento: string;
  destino: string;
  quantidade: string;
}

const tiposGrupoA = [
  'Resíduos Infectantes',
  'Culturas e Estoques de Microrganismos',
  'Resíduos de Laboratórios',
  'Bolsas de Sangue',
  'Tecidos e Órgãos',
  'Materiais Perfurocortantes',
  'Resíduos de Animais Contaminados'
];

const tiposGrupoB = [
  'Medicamentos Vencidos',
  'Resíduos Químicos Perigosos',
  'Resíduos Quimioterápicos',
  'Produtos Hormonais',
  'Antimicrobianos',
  'Reagentes de Laboratório',
  'Efluentes de Processamento de Imagens'
];

const destinosResiduos = [
  'Autoclave',
  'Incineração',
  'Aterro Sanitário',
  'Aterro Industrial',
  'Tratamento Químico',
  'Reciclagem',
  'Empresa Especializada',
  'Outro'
];

const tiposResiduosSolidos = [
  'Papel e Papelão',
  'Plástico',
  'Metal',
  'Vidro',
  'Orgânico',
  'Eletrônico',
  'Entulho',
  'Outro'
];

const tiposResiduosLiquidos = [
  'Efluente Industrial',
  'Efluente Sanitário',
  'Óleo Usado',
  'Solvente',
  'Tinta',
  'Outro'
];

const tratamentos = [
  'Não possui tratamento',
  'Tratamento Físico',
  'Tratamento Químico',
  'Tratamento Biológico',
  'Tratamento Térmico',
  'ETE',
  'Outro'
];

export default function Step4Residuos({ data, onChange, processoId }: Step4ResiduosProps) {
  const [isAddingGrupoA, setIsAddingGrupoA] = useState(false);
  const [isAddingGrupoB, setIsAddingGrupoB] = useState(false);
  const [isAddingGeral, setIsAddingGeral] = useState(false);

  const [editingGrupoAId, setEditingGrupoAId] = useState<string | null>(null);
  const [editingGrupoBId, setEditingGrupoBId] = useState<string | null>(null);
  const [editingGeralId, setEditingGeralId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingGrupoA, setIsSavingGrupoA] = useState(false);
  const [isSavingGrupoB, setIsSavingGrupoB] = useState(false);
  const [isSavingGeral, setIsSavingGeral] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; tipo: string; grupo: 'A' | 'B' | 'GERAL' } | null>(null);

  const [currentGrupoA, setCurrentGrupoA] = useState<ResiduoGrupo>({
    id: '',
    tipo: '',
    quantidade: '',
    destino: ''
  });

  const [currentGrupoB, setCurrentGrupoB] = useState<ResiduoGrupo>({
    id: '',
    tipo: '',
    quantidade: '',
    destino: ''
  });

  const [currentGeral, setCurrentGeral] = useState<ResiduoGeral>({
    id: '',
    categoria: '',
    tipo: '',
    origem: '',
    tratamento: '',
    destino: '',
    quantidade: ''
  });

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  useEffect(() => {
    if (processoId) {
      loadAllResiduos();
    }
  }, [processoId]);

  const loadAllResiduos = async () => {
    if (!processoId) return;

    setIsLoading(true);
    try {
      const [grupoA, grupoB, gerais] = await Promise.all([
        loadResiduosGrupoA(processoId),
        loadResiduosGrupoB(processoId),
        loadResiduosGerais(processoId),
      ]);

      handleChange('residuosGrupoA', grupoA);
      handleChange('residuosGrupoB', grupoB);
      handleChange('residuosGerais', gerais);
    } catch (error: any) {
      console.error('Erro ao carregar resíduos:', error);
      toast.warning('Não foi possível carregar resíduos existentes. Você pode adicionar novos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGrupoA = async () => {
    if (!currentGrupoA.tipo || !currentGrupoA.quantidade || !currentGrupoA.destino) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!processoId) {
      toast.error('Processo não identificado. Recarregue a página.');
      return;
    }

    setIsSavingGrupoA(true);
    const residuosGrupoA = data?.residuosGrupoA || [];

    try {
      if (editingGrupoAId) {
        const updated = await updateResiduoGrupoA(editingGrupoAId, currentGrupoA, processoId);
        const updatedList = residuosGrupoA.map((r: ResiduoGrupo) =>
          r.id === editingGrupoAId ? { ...currentGrupoA, id: updated.id } : r
        );
        handleChange('residuosGrupoA', updatedList);
        toast.success('Resíduo Grupo A atualizado com sucesso!');
        setEditingGrupoAId(null);
      } else {
        const saved = await saveResiduoGrupoA(processoId, currentGrupoA);
        const newResiduo = {
          id: saved.id,
          tipo: saved.tipo,
          quantidade: saved.quantidade.toString(),
          destino: saved.destino,
        };
        handleChange('residuosGrupoA', [...residuosGrupoA, newResiduo]);
        toast.success('Resíduo Grupo A adicionado com sucesso!');
      }

      setCurrentGrupoA({ id: '', tipo: '', quantidade: '', destino: '' });
      setIsAddingGrupoA(false);
    } catch (error: any) {
      console.error('Erro ao salvar Grupo A:', error);
      toast.error(error.message || 'Erro ao salvar resíduo');
    } finally {
      setIsSavingGrupoA(false);
    }
  };

  const handleEditGrupoA = (residuo: ResiduoGrupo) => {
    setCurrentGrupoA(residuo);
    setEditingGrupoAId(residuo.id);
    setIsAddingGrupoA(true);
  };

  const handleDeleteGrupoA = (residuo: ResiduoGrupo) => {
    setShowDeleteModal({ id: residuo.id, tipo: residuo.tipo, grupo: 'A' });
  };

  const handleCancelGrupoA = () => {
    setCurrentGrupoA({ id: '', tipo: '', quantidade: '', destino: '' });
    setIsAddingGrupoA(false);
    setEditingGrupoAId(null);
  };

  const handleAddGrupoB = async () => {
    if (!currentGrupoB.tipo || !currentGrupoB.quantidade || !currentGrupoB.destino) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!processoId) {
      toast.error('Processo não identificado. Recarregue a página.');
      return;
    }

    setIsSavingGrupoB(true);
    const residuosGrupoB = data?.residuosGrupoB || [];

    try {
      if (editingGrupoBId) {
        const updated = await updateResiduoGrupoB(editingGrupoBId, currentGrupoB, processoId);
        const updatedList = residuosGrupoB.map((r: ResiduoGrupo) =>
          r.id === editingGrupoBId ? { ...currentGrupoB, id: updated.id } : r
        );
        handleChange('residuosGrupoB', updatedList);
        toast.success('Resíduo Grupo B atualizado com sucesso!');
        setEditingGrupoBId(null);
      } else {
        const saved = await saveResiduoGrupoB(processoId, currentGrupoB);
        const newResiduo = {
          id: saved.id,
          tipo: saved.tipo,
          quantidade: saved.quantidade.toString(),
          destino: saved.destino,
        };
        handleChange('residuosGrupoB', [...residuosGrupoB, newResiduo]);
        toast.success('Resíduo Grupo B adicionado com sucesso!');
      }

      setCurrentGrupoB({ id: '', tipo: '', quantidade: '', destino: '' });
      setIsAddingGrupoB(false);
    } catch (error: any) {
      console.error('Erro ao salvar Grupo B:', error);
      toast.error(error.message || 'Erro ao salvar resíduo');
    } finally {
      setIsSavingGrupoB(false);
    }
  };

  const handleEditGrupoB = (residuo: ResiduoGrupo) => {
    setCurrentGrupoB(residuo);
    setEditingGrupoBId(residuo.id);
    setIsAddingGrupoB(true);
  };

  const handleDeleteGrupoB = (residuo: ResiduoGrupo) => {
    setShowDeleteModal({ id: residuo.id, tipo: residuo.tipo, grupo: 'B' });
  };

  const handleCancelGrupoB = () => {
    setCurrentGrupoB({ id: '', tipo: '', quantidade: '', destino: '' });
    setIsAddingGrupoB(false);
    setEditingGrupoBId(null);
  };

  const handleAddGeral = async () => {
    if (!currentGeral.categoria || !currentGeral.tipo || !currentGeral.destino || !currentGeral.quantidade) {
      toast.error('Preencha todos os campos obrigatórios (Categoria, Tipo, Destino e Quantidade)');
      return;
    }

    if (!processoId) {
      toast.error('Processo não identificado. Recarregue a página.');
      return;
    }

    setIsSavingGeral(true);
    const residuosGerais = data?.residuosGerais || [];

    try {
      if (editingGeralId) {
        const updated = await updateResiduoGeral(editingGeralId, currentGeral, processoId);
        const updatedList = residuosGerais.map((r: ResiduoGeral) =>
          r.id === editingGeralId ? {
            id: updated.id,
            categoria: updated.categoria,
            tipo: updated.tipo,
            origem: updated.origem || '',
            quantidade: updated.quantidade.toString(),
            tratamento: updated.tratamento || '',
            destino: updated.destino,
          } : r
        );
        handleChange('residuosGerais', updatedList);
        toast.success('Resíduo geral atualizado com sucesso!');
        setEditingGeralId(null);
      } else {
        const saved = await saveResiduoGeral(processoId, currentGeral);
        const newResiduo = {
          id: saved.id,
          categoria: saved.categoria,
          tipo: saved.tipo,
          origem: saved.origem || '',
          quantidade: saved.quantidade.toString(),
          tratamento: saved.tratamento || '',
          destino: saved.destino,
        };
        handleChange('residuosGerais', [...residuosGerais, newResiduo]);
        toast.success('Resíduo geral adicionado com sucesso!');
      }

      setCurrentGeral({
        id: '',
        categoria: '',
        tipo: '',
        origem: '',
        tratamento: '',
        destino: '',
        quantidade: ''
      });
      setIsAddingGeral(false);
    } catch (error: any) {
      console.error('Erro ao salvar resíduo geral:', error);
      toast.error(error.message || 'Erro ao salvar resíduo');
    } finally {
      setIsSavingGeral(false);
    }
  };

  const handleEditGeral = (residuo: ResiduoGeral) => {
    setCurrentGeral(residuo);
    setEditingGeralId(residuo.id);
    setIsAddingGeral(true);
  };

  const handleDeleteGeral = (residuo: ResiduoGeral) => {
    setShowDeleteModal({ id: residuo.id, tipo: residuo.tipo, grupo: 'GERAL' });
  };

  const confirmarExclusao = async () => {
    if (!showDeleteModal) return;

    setIsDeletingId(showDeleteModal.id);
    try {
      if (showDeleteModal.grupo === 'A') {
        await deleteResiduoGrupoA(showDeleteModal.id);
        const residuosGrupoA = data?.residuosGrupoA || [];
        handleChange('residuosGrupoA', residuosGrupoA.filter((r: ResiduoGrupo) => r.id !== showDeleteModal.id));
        toast.success('Resíduo Grupo A excluído com sucesso!');
      } else if (showDeleteModal.grupo === 'B') {
        await deleteResiduoGrupoB(showDeleteModal.id);
        const residuosGrupoB = data?.residuosGrupoB || [];
        handleChange('residuosGrupoB', residuosGrupoB.filter((r: ResiduoGrupo) => r.id !== showDeleteModal.id));
        toast.success('Resíduo Grupo B excluído com sucesso!');
      } else {
        await deleteResiduoGeral(showDeleteModal.id);
        const residuosGerais = data?.residuosGerais || [];
        handleChange('residuosGerais', residuosGerais.filter((r: ResiduoGeral) => r.id !== showDeleteModal.id));
        toast.success('Resíduo geral excluído com sucesso!');
      }
      setShowDeleteModal(null);
    } catch (error: any) {
      console.error('Erro ao excluir resíduo:', error);
      toast.error(error.message || 'Erro ao excluir resíduo');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCancelGeral = () => {
    setCurrentGeral({
      id: '',
      categoria: '',
      tipo: '',
      origem: '',
      tratamento: '',
      destino: '',
      quantidade: ''
    });
    setIsAddingGeral(false);
    setEditingGeralId(null);
  };

  const getTiposPorCategoria = () => {
    if (currentGeral.categoria === 'Sólidos') {
      return tiposResiduosSolidos;
    } else if (currentGeral.categoria === 'Líquidos') {
      return tiposResiduosLiquidos;
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-shrink-0">
          <Trash2 className="w-6 h-6 text-red-600 mt-1" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Resíduos</h2>
      </div>

      {/* Loading Inicial */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Carregando resíduos...</span>
        </div>
      )}

      {/* Grupo A - Resíduos Infectantes */}
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Grupo A - Resíduos Infectantes</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                Resíduos com possível presença de agentes biológicos que podem apresentar risco de infecção.
              </div>
            </div>
          </div>

          {!isAddingGrupoA && (
            <button
              onClick={() => setIsAddingGrupoA(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        {isAddingGrupoA && (
          <div className="mb-4 p-4 bg-white border border-red-300 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGrupoA.tipo}
                  onChange={(e) => setCurrentGrupoA({ ...currentGrupoA, tipo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {tiposGrupoA.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade (kg/mês) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentGrupoA.quantidade}
                  onChange={(e) => setCurrentGrupoA({ ...currentGrupoA, quantidade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGrupoA.destino}
                  onChange={(e) => setCurrentGrupoA({ ...currentGrupoA, destino: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {destinosResiduos.map(destino => (
                    <option key={destino} value={destino}>{destino}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelGrupoA}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGrupoA}
                disabled={isSavingGrupoA}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingGrupoA && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingGrupoAId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {data?.residuosGrupoA && data.residuosGrupoA.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Destino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.residuosGrupoA.map((residuo: ResiduoGrupo) => (
                  <tr key={residuo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.quantidade} kg/mês</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.destino}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGrupoA(residuo)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGrupoA(residuo)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            <Trash2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum resíduo do Grupo A cadastrado</p>
          </div>
        )}
      </div>

      {/* Grupo B - Resíduos Químicos */}
      <div className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Grupo B - Resíduos Químicos</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                Resíduos contendo substâncias químicas que podem apresentar risco à saúde pública ou ao meio ambiente.
              </div>
            </div>
          </div>

          {!isAddingGrupoB && (
            <button
              onClick={() => setIsAddingGrupoB(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        {isAddingGrupoB && (
          <div className="mb-4 p-4 bg-white border border-yellow-300 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGrupoB.tipo}
                  onChange={(e) => setCurrentGrupoB({ ...currentGrupoB, tipo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {tiposGrupoB.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade (kg/mês) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentGrupoB.quantidade}
                  onChange={(e) => setCurrentGrupoB({ ...currentGrupoB, quantidade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGrupoB.destino}
                  onChange={(e) => setCurrentGrupoB({ ...currentGrupoB, destino: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {destinosResiduos.map(destino => (
                    <option key={destino} value={destino}>{destino}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelGrupoB}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGrupoB}
                disabled={isSavingGrupoB}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingGrupoB && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingGrupoBId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {data?.residuosGrupoB && data.residuosGrupoB.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Destino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.residuosGrupoB.map((residuo: ResiduoGrupo) => (
                  <tr key={residuo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.quantidade} kg/mês</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.destino}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGrupoB(residuo)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGrupoB(residuo)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            <Trash2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum resíduo do Grupo B cadastrado</p>
          </div>
        )}
      </div>

      {/* Resíduos Gerais */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Resíduos Gerais</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                Resíduos sólidos e líquidos gerados nas atividades do empreendimento.
              </div>
            </div>
          </div>

          {!isAddingGeral && (
            <button
              onClick={() => setIsAddingGeral(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        {isAddingGeral && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-300 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGeral.categoria}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, categoria: e.target.value, tipo: '' })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Sólidos">Sólidos</option>
                  <option value="Líquidos">Líquidos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGeral.tipo}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, tipo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!currentGeral.categoria}
                >
                  <option value="">Selecione a categoria primeiro...</option>
                  {getTiposPorCategoria().map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Origem
                </label>
                <input
                  type="text"
                  value={currentGeral.origem}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, origem: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Setor de produção"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tratamento
                </label>
                <select
                  value={currentGeral.tratamento}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, tratamento: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {tratamentos.map(trat => (
                    <option key={trat} value={trat}>{trat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentGeral.destino}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, destino: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {destinosResiduos.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade (kg/mês) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentGeral.quantidade}
                  onChange={(e) => setCurrentGeral({ ...currentGeral, quantidade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelGeral}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGeral}
                disabled={isSavingGeral}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingGeral && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingGeralId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {data?.residuosGerais && data.residuosGerais.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Origem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tratamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Destino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.residuosGerais.map((residuo: ResiduoGeral) => (
                  <tr key={residuo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.categoria}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.origem}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.tratamento}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.destino}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{residuo.quantidade} kg/mês</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGeral(residuo)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGeral(residuo)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trash2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum resíduo geral cadastrado</p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600">Deseja realmente remover este resíduo?</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Tipo:</span> {showDeleteModal.tipo}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={isDeletingId !== null}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={isDeletingId !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeletingId && <Loader2 className="w-4 h-4 animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">Informação</h3>
            <p className="text-sm text-gray-600 mt-1">
              Cadastre todos os resíduos gerados pelo empreendimento. Grupo A são resíduos infectantes,
              Grupo B são resíduos químicos, e os Resíduos Gerais incluem sólidos e líquidos comuns.
              Os campos Origem e Tratamento em Resíduos Gerais são opcionais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
