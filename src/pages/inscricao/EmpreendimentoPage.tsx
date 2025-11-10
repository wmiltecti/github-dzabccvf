import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { Building, ArrowLeft, ArrowRight, Search, AlertTriangle } from 'lucide-react';
import { X, CheckCircle } from 'lucide-react';

// Mock activities data - in real app, this would come from API
const mockActivities = [
  { id: 1, code: '1.1', name: 'Extração de areia', description: 'Extração de areia em leito de rio' },
  { id: 2, code: '1.2', name: 'Extração de cascalho', description: 'Extração de cascalho para construção' },
  { id: 3, code: '2.1', name: 'Beneficiamento de minérios', description: 'Processamento de minérios diversos' },
  { id: 4, code: '3.1', name: 'Indústria metalúrgica', description: 'Produção de peças metálicas' },
  { id: 5, code: '4.1', name: 'Indústria química', description: 'Produção de produtos químicos' }
];

export default function EmpreendimentoPage() {
  const navigate = useNavigate();
  const {
    atividadeId,
    setAtividadeId,
    isStepComplete,
    canProceedToStep,
    setCurrentStep
  } = useInscricaoStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  React.useEffect(() => {
    if (atividadeId) {
      const activity = mockActivities.find(a => a.id === atividadeId);
      setSelectedActivity(activity);
    }
  }, [atividadeId]);

  const filteredActivities = mockActivities.filter(activity =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.code.includes(searchTerm) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectActivity = (activity: any) => {
    setAtividadeId(activity.id);
    setSelectedActivity(activity);
  };

  const handleNext = () => {
    // TODO: Re-habilitar validação após aprovação de design
    // if (canProceedToStep(4)) {
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/formulario');
    } else {
      setCurrentStep(4);
    }
    // }
  };

  const handleBack = () => {
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/imovel');
    } else {
      setCurrentStep(2);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Atividade</h2>
        <p className="text-gray-600">
          Selecione a atividade principal que será desenvolvida.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, nome ou descrição da atividade..."
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Selected Activity */}
      {selectedActivity && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Building className="w-6 h-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-green-900">Atividade Selecionada</h3>
              <p className="text-green-800 mt-1">
                <span className="font-medium">{selectedActivity.code}</span> - {selectedActivity.name}
              </p>
              <p className="text-sm text-green-700 mt-2">{selectedActivity.description}</p>
            </div>
            <button
              onClick={() => {
                setAtividadeId(null);
                setSelectedActivity(null);
              }}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-3 mb-8">
        <h3 className="text-lg font-medium text-gray-900">
          Atividades Disponíveis ({filteredActivities.length})
        </h3>
        
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {filteredActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleSelectActivity(activity)}
                className={`text-left p-4 border rounded-lg transition-colors ${
                  atividadeId === activity.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {activity.code}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  </div>
                  {atividadeId === activity.id && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-gray-200 rounded-lg">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma atividade encontrada</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os termos de busca</p>
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {!atividadeId && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Atividade obrigatória</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Selecione uma atividade para continuar com o processo de licenciamento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
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
  );
}