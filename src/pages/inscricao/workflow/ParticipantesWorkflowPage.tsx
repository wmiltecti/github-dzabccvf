import { useState } from 'react';
import { Users, ArrowRight, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useInscricaoStore } from '../../../lib/store/inscricao';
import { completeStep } from '../../../services/workflowApi';

/**
 * Página Participantes para Workflow Engine (Motor BPMN)
 * 
 * Versão simplificada focada na integração com o motor.
 * Para adicionar participantes completos, use a página original.
 */
export default function ParticipantesWorkflowPage() {
  const { workflowInstanceId, currentStepId } = useInscricaoStore();
  const [loading, setLoading] = useState(false);
  const [participantes, setParticipantes] = useState<any[]>([]);

  /**
   * Adiciona participante de teste (simplificado)
   */
  const handleAddParticipante = () => {
    const novoParticipante = {
      id: Date.now().toString(),
      tipo: 'PF',
      papel: 'REQUERENTE',
      nome: 'Participante Teste',
      cpf: '00000000000',
      email: 'teste@example.com'
    };

    setParticipantes([...participantes, novoParticipante]);
    toast.success('Participante adicionado!');
  };

  /**
   * Remove participante
   */
  const handleRemoveParticipante = (id: string) => {
    setParticipantes(participantes.filter(p => p.id !== id));
    toast.info('Participante removido');
  };

  /**
   * Completa step e avança para próximo
   */
  const handleNext = async () => {
    if (participantes.length === 0) {
      toast.warning('Adicione pelo menos um participante');
      return;
    }

    if (!workflowInstanceId || !currentStepId) {
      toast.error('Workflow não inicializado');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Completando step Participantes:', {
        instanceId: workflowInstanceId,
        stepId: currentStepId,
        data: { participantes }
      });

      // Chama backend para completar step
      const response = await completeStep(workflowInstanceId, currentStepId, {
        participantes
      });

      console.log('✅ Step completado:', response);

      // Backend atualiza o store automaticamente via InscricaoWizardMotor
      toast.success('Participantes salvos! Avançando...');
    } catch (error: any) {
      console.error('❌ Erro ao completar step:', error);
      toast.error('Erro ao avançar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Participantes</h2>
          <p className="text-sm text-gray-600">
            Adicione os participantes do processo (simplificado para testes)
          </p>
        </div>
      </div>

      {/* Lista de Participantes */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Participantes Adicionados ({participantes.length})
          </h3>
          <button
            onClick={handleAddParticipante}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Teste
          </button>
        </div>

        {participantes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum participante adicionado</p>
            <p className="text-sm">Clique em "Adicionar Teste" para começar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {participantes.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{p.nome}</p>
                  <p className="text-sm text-gray-600">
                    {p.papel} - {p.tipo} - {p.cpf}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveParticipante(p.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs">
        <p className="font-semibold text-blue-900 mb-2">🔧 Debug Info</p>
        <p className="text-blue-700">Workflow Instance: {workflowInstanceId || 'N/A'}</p>
        <p className="text-blue-700">Current Step: {currentStepId || 'N/A'}</p>
        <p className="text-blue-700">Participantes: {participantes.length}</p>
      </div>

      {/* Botão Próximo */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={loading || participantes.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            <>
              Próximo
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
