import React, { useState, useEffect } from 'react';
import { Activity, ArrowRight, ArrowLeft, Plus, Trash2, Search, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../../lib/store/empreendimento';
import { AdminService, Activity as ActivityType } from '../../services/adminService';

interface AtividadesEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

interface SelectedActivity {
  activityId: string;
  code: number;
  name: string;
  description?: string;
  enterpriseSize?: string;
  pollutionPotential?: string;
  quantidade?: string;
  unidade?: string;
  area_ocupada?: string;
}

export default function AtividadesEmpreendimentoPage({
  onNext,
  onPrevious
}: AtividadesEmpreendimentoPageProps) {
  const { atividades, setAtividades, dadosGerais, setDadosGerais } = useEmpreendimentoStore();

  const [availableActivities, setAvailableActivities] = useState<ActivityType[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityType[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showActivitySelector, setShowActivitySelector] = useState(false);

  useEffect(() => {
    loadActivities();
    loadSavedActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [searchTerm, availableActivities]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const activities = await AdminService.getActivities(false);
      setAvailableActivities(activities);
      setFilteredActivities(activities);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades cadastradas');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedActivities = () => {
    if (atividades && atividades.length > 0) {
      const mapped = atividades.map(a => ({
        activityId: a.id?.toString() || '',
        code: 0,
        name: a.nome || '',
        description: a.descricao,
        enterpriseSize: '',
        pollutionPotential: '',
        quantidade: (a as any).quantidade || '',
        unidade: (a as any).unidade || '',
        area_ocupada: (a as any).area_ocupada || ''
      }));
      setSelectedActivities(mapped);
    }
  };

  const filterActivities = () => {
    if (!searchTerm.trim()) {
      setFilteredActivities(availableActivities);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = availableActivities.filter(activity =>
      activity.name.toLowerCase().includes(term) ||
      activity.code.toString().includes(term) ||
      activity.description?.toLowerCase().includes(term)
    );
    setFilteredActivities(filtered);
  };

  const handleSelectActivity = (activity: ActivityType) => {
    const alreadySelected = selectedActivities.some(a => a.activityId === activity.id);

    if (alreadySelected) {
      toast.info('Esta atividade já foi selecionada');
      return;
    }

    const newActivity: SelectedActivity = {
      activityId: activity.id,
      code: activity.code,
      name: activity.name,
      description: activity.description,
      enterpriseSize: activity.enterprise_sizes?.name,
      pollutionPotential: activity.pollution_potentials?.name,
      quantidade: '',
      unidade: activity.measurement_unit || '',
      area_ocupada: ''
    };

    setSelectedActivities([...selectedActivities, newActivity]);
    toast.success(`Atividade "${activity.name}" adicionada`);
    setShowActivitySelector(false);
    setSearchTerm('');
  };

  const handleRemoveActivity = (index: number) => {
    const activity = selectedActivities[index];
    setSelectedActivities(selectedActivities.filter((_, i) => i !== index));
    toast.info(`Atividade "${activity.name}" removida`);
  };

  const handleUpdateActivityData = (index: number, field: string, value: string) => {
    const updated = [...selectedActivities];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedActivities(updated);
  };

  const handleNext = () => {
    if (selectedActivities.length === 0) {
      toast.error('Adicione pelo menos uma atividade');
      return;
    }

    const atividadesSemPorte = selectedActivities.filter(a => !a.enterpriseSize);
    if (atividadesSemPorte.length > 0) {
      toast.error('Existem atividades sem porte definido. Entre em contato com o administrador para configurar o porte das atividades.');
      return;
    }

    const atividadesForStore = selectedActivities.map(a => ({
      id: parseInt(a.activityId),
      nome: a.name,
      tipo: a.enterpriseSize || 'Não definido',
      descricao: a.description || '',
      quantidade: a.quantidade,
      unidade: a.unidade,
      area_ocupada: a.area_ocupada
    }));

    setAtividades(atividadesForStore);

    onNext({ atividades: atividadesForStore });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Atividades do Empreendimento</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Selecione as atividades que serão desenvolvidas no empreendimento. O porte de cada atividade é definido automaticamente.
        </p>
      </div>

      {!showActivitySelector && (
        <button
          onClick={() => setShowActivitySelector(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Atividade do Sistema
        </button>
      )}

      {showActivitySelector && (
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Selecionar Atividade Cadastrada</h3>
            <button
              onClick={() => {
                setShowActivitySelector(false);
                setSearchTerm('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou código da atividade..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando atividades...</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma atividade encontrada</p>
                </div>
              ) : (
                filteredActivities.map((activity) => {
                  const isSelected = selectedActivities.some(a => a.activityId === activity.id);

                  return (
                    <div
                      key={activity.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                      onClick={() => !isSelected && handleSelectActivity(activity)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                              Cód. {activity.code}
                            </span>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mt-2">{activity.name}</h4>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            {activity.enterprise_sizes && (
                              <span>Porte: {activity.enterprise_sizes.name}</span>
                            )}
                            {activity.pollution_potentials && (
                              <span>Potencial Poluidor: {activity.pollution_potentials.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {selectedActivities.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">
            Atividades Selecionadas ({selectedActivities.length})
          </h3>

          {selectedActivities.map((activity, index) => {
            const getPorteColor = (porte?: string) => {
              if (!porte) return 'bg-gray-100 text-gray-700 border-gray-300';
              const porteLower = porte.toLowerCase();
              if (porteLower.includes('micro') || porteLower.includes('pequeno')) return 'bg-green-100 text-green-700 border-green-300';
              if (porteLower.includes('médio') || porteLower.includes('medio')) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
              if (porteLower.includes('grande')) return 'bg-orange-100 text-orange-700 border-orange-300';
              if (porteLower.includes('excepcional')) return 'bg-red-100 text-red-700 border-red-300';
              return 'bg-blue-100 text-blue-700 border-blue-300';
            };

            const getPotencialColor = (potencial?: string) => {
              if (!potencial) return 'bg-gray-100 text-gray-700 border-gray-300';
              const potencialLower = potencial.toLowerCase();
              if (potencialLower.includes('baixo')) return 'bg-green-100 text-green-700 border-green-300';
              if (potencialLower.includes('médio') || potencialLower.includes('medio')) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
              if (potencialLower.includes('alto')) return 'bg-red-100 text-red-700 border-red-300';
              return 'bg-gray-100 text-gray-700 border-gray-300';
            };

            return (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                      Cód. {activity.code}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800">{activity.name}</h4>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Porte do Empreendimento
                      </label>
                      <div className={`px-3 py-2 border rounded-lg text-sm font-medium ${getPorteColor(activity.enterpriseSize)}`}>
                        {activity.enterpriseSize || (
                          <span className="text-red-600 flex items-center gap-1">
                            <span>⚠️</span>
                            Não definido
                          </span>
                        )}
                      </div>
                    </div>
                    {activity.pollutionPotential && (
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Potencial Poluidor
                        </label>
                        <div className={`px-3 py-2 border rounded-lg text-sm font-medium ${getPotencialColor(activity.pollutionPotential)}`}>
                          {activity.pollutionPotential}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveActivity(index)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Remover atividade"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Unidade de Medida
                  </label>
                  <input
                    type="text"
                    value={activity.unidade || ''}
                    onChange={(e) => handleUpdateActivityData(index, 'unidade', e.target.value)}
                    readOnly={!!activity.unidade}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${
                      activity.unidade
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed text-gray-600'
                        : 'border-gray-300 focus:ring-2 focus:ring-green-500'
                    }`}
                    placeholder={activity.unidade ? "Pré-definida pela atividade" : "Ex: ton/mês"}
                    title={activity.unidade ? "Esta unidade foi definida no cadastro da atividade" : "Informe a unidade de medida"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {activity.unidade ? `Quantidade (${activity.unidade})` : 'Quantidade'}
                  </label>
                  <input
                    type="number"
                    value={activity.quantidade || ''}
                    onChange={(e) => handleUpdateActivityData(index, 'quantidade', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={activity.unidade ? "Ex: 100" : "Informe a quantidade"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Área Ocupada (m²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={activity.area_ocupada || ''}
                    onChange={(e) => handleUpdateActivityData(index, 'area_ocupada', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 500.00"
                  />
                </div>
              </div>
            </div>
          );})}
        </div>
      )}

      {selectedActivities.length === 0 && !showActivitySelector && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Nenhuma atividade selecionada</p>
          <p className="text-sm text-gray-500 mt-1">
            Clique em "Adicionar Atividade do Sistema" para começar
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={selectedActivities.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
