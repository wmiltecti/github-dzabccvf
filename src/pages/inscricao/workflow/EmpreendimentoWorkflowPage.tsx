import { useState } from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useInscricaoStore } from '../../../lib/store/inscricao';
import { completeStep } from '../../../services/workflowApi';

/**
 * Página Empreendimento para Workflow Engine (Motor BPMN)
 * 
 * Versão simplificada focada na integração com o motor.
 */
export default function EmpreendimentoWorkflowPage() {
  const { workflowInstanceId, currentStepId } = useInscricaoStore();
  const [loading, setLoading] = useState(false);
  const [empreendimento, setEmpreendimento] = useState({
    nome: '',
    descricao: '',
    cnae: '',
    porte: '',
    numero_funcionarios: '',
    area_construida_m2: '',
    investimento_total: '',
    atividades: ''
  });

  /**
   * Atualiza campo
   */
  const handleChange = (field: string, value: string) => {
    setEmpreendimento({ ...empreendimento, [field]: value });
  };

  /**
   * Preenche dados de teste
   */
  const handlePreencherTeste = () => {
    setEmpreendimento({
      nome: 'Empreendimento Teste LTDA',
      descricao: 'Descrição simplificada do empreendimento para testes do workflow',
      cnae: '4711-3/01',
      porte: 'MEDIO',
      numero_funcionarios: '50',
      area_construida_m2: '500',
      investimento_total: '1000000',
      atividades: 'Atividades de teste relacionadas ao licenciamento ambiental'
    });
    toast.success('Dados de teste preenchidos!');
  };

  /**
   * Valida formulário
   */
  const validarFormulario = (): boolean => {
    if (!empreendimento.nome.trim()) {
      toast.warning('Preencha o nome do empreendimento');
      return false;
    }
    if (!empreendimento.descricao.trim()) {
      toast.warning('Preencha a descrição');
      return false;
    }
    if (!empreendimento.porte) {
      toast.warning('Selecione o porte');
      return false;
    }
    return true;
  };

  /**
   * Completa step e avança
   */
  const handleNext = async () => {
    if (!validarFormulario()) return;

    if (!workflowInstanceId || !currentStepId) {
      toast.error('Workflow não inicializado');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Completando step Empreendimento:', {
        instanceId: workflowInstanceId,
        stepId: currentStepId,
        data: { empreendimento }
      });

      await completeStep(workflowInstanceId, currentStepId, { empreendimento });

      console.log('✅ Step completado');
      toast.success('Empreendimento cadastrado! Avançando...');
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
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Empreendimento</h2>
          <p className="text-sm text-gray-600">
            Informações sobre o empreendimento a ser licenciado
          </p>
        </div>
      </div>

      {/* Botão Teste */}
      <div className="flex justify-end">
        <button
          onClick={handlePreencherTeste}
          className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          📝 Preencher Teste
        </button>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Empreendimento *
          </label>
          <input
            type="text"
            value={empreendimento.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nome fantasia ou razão social"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição *
          </label>
          <textarea
            value={empreendimento.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Descrição detalhada do empreendimento"
          />
        </div>

        {/* CNAE e Porte */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNAE
            </label>
            <input
              type="text"
              value={empreendimento.cnae}
              onChange={(e) => handleChange('cnae', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0000-0/00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porte *
            </label>
            <select
              value={empreendimento.porte}
              onChange={(e) => handleChange('porte', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="MICRO">Micro</option>
              <option value="PEQUENO">Pequeno</option>
              <option value="MEDIO">Médio</option>
              <option value="GRANDE">Grande</option>
            </select>
          </div>
        </div>

        {/* Funcionários e Área */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Funcionários
            </label>
            <input
              type="number"
              value={empreendimento.numero_funcionarios}
              onChange={(e) => handleChange('numero_funcionarios', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área Construída (m²)
            </label>
            <input
              type="number"
              value={empreendimento.area_construida_m2}
              onChange={(e) => handleChange('area_construida_m2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        {/* Investimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Investimento Total (R$)
          </label>
          <input
            type="number"
            value={empreendimento.investimento_total}
            onChange={(e) => handleChange('investimento_total', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            min="0"
          />
        </div>

        {/* Atividades */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Atividades Desenvolvidas
          </label>
          <textarea
            value={empreendimento.atividades}
            onChange={(e) => handleChange('atividades', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Descrição das atividades"
          />
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs">
        <p className="font-semibold text-blue-900 mb-2">🔧 Debug Info</p>
        <p className="text-blue-700">Workflow Instance: {workflowInstanceId || 'N/A'}</p>
        <p className="text-blue-700">Current Step: {currentStepId || 'N/A'}</p>
        <p className="text-blue-700">Nome: {empreendimento.nome || '(vazio)'}</p>
        <p className="text-blue-700">Porte: {empreendimento.porte || '(vazio)'}</p>
      </div>

      {/* Botão Próximo */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={loading}
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
