import { useState } from 'react';
import { FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useInscricaoStore } from '../../../lib/store/inscricao';
import { completeStep } from '../../../services/workflowApi';

/**
 * Página Formulário para Workflow Engine (Motor BPMN)
 * 
 * Versão simplificada focada na integração com o motor.
 * Esta página pode ter sub-processos (Aba 1-6 do formulário completo).
 */
export default function FormularioWorkflowPage() {
  const { workflowInstanceId, currentStepId } = useInscricaoStore();
  const [loading, setLoading] = useState(false);
  const [formulario, setFormulario] = useState({
    tipo_licenca: '',
    atividade_principal: '',
    possui_recursos_hidricos: false,
    possui_area_preservacao: false,
    possui_residuos_perigosos: false,
    observacoes: '',
    // Campos simplificados das abas
    aba1_caracteristicas: '',
    aba2_recursos_energia: '',
    aba3_uso_agua: '',
    aba4_residuos: '',
    aba5_outras_info: ''
  });

  /**
   * Atualiza campo
   */
  const handleChange = (field: string, value: any) => {
    setFormulario({ ...formulario, [field]: value });
  };

  /**
   * Preenche dados de teste
   */
  const handlePreencherTeste = () => {
    setFormulario({
      tipo_licenca: 'LP',
      atividade_principal: 'Indústria de transformação - atividade de teste',
      possui_recursos_hidricos: true,
      possui_area_preservacao: false,
      possui_residuos_perigosos: true,
      observacoes: 'Observações gerais sobre o licenciamento para testes',
      aba1_caracteristicas: 'Características técnicas preenchidas para teste',
      aba2_recursos_energia: 'Consumo de energia elétrica estimado em 1000 kWh/mês',
      aba3_uso_agua: 'Captação de água superficial estimada em 10m³/dia',
      aba4_residuos: 'Geração de resíduos classe I e II em pequena quantidade',
      aba5_outras_info: 'Informações complementares adicionais'
    });
    toast.success('Dados de teste preenchidos!');
  };

  /**
   * Valida formulário
   */
  const validarFormulario = (): boolean => {
    if (!formulario.tipo_licenca) {
      toast.warning('Selecione o tipo de licença');
      return false;
    }
    if (!formulario.atividade_principal.trim()) {
      toast.warning('Descreva a atividade principal');
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
      console.log('📤 Completando step Formulário:', {
        instanceId: workflowInstanceId,
        stepId: currentStepId,
        data: { formulario }
      });

      await completeStep(workflowInstanceId, currentStepId, { formulario });

      console.log('✅ Step completado');
      toast.success('Formulário salvo! Finalizando workflow...');
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
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formulário de Licenciamento</h2>
          <p className="text-sm text-gray-600">
            Informações técnicas detalhadas (versão simplificada para testes)
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
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Seção 1: Dados Gerais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Dados Gerais
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Licença *
              </label>
              <select
                value={formulario.tipo_licenca}
                onChange={(e) => handleChange('tipo_licenca', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="LP">Licença Prévia (LP)</option>
                <option value="LI">Licença de Instalação (LI)</option>
                <option value="LO">Licença de Operação (LO)</option>
                <option value="LAC">Licença Ambiental por Compromisso (LAC)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Atividade Principal *
            </label>
            <textarea
              value={formulario.atividade_principal}
              onChange={(e) => handleChange('atividade_principal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Descrição da atividade principal a ser licenciada"
            />
          </div>
        </div>

        {/* Seção 2: Checkboxes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Características</h3>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formulario.possui_recursos_hidricos}
                onChange={(e) => handleChange('possui_recursos_hidricos', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Utiliza recursos hídricos</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formulario.possui_area_preservacao}
                onChange={(e) => handleChange('possui_area_preservacao', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Possui área de preservação permanente</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formulario.possui_residuos_perigosos}
                onChange={(e) => handleChange('possui_residuos_perigosos', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Gera resíduos perigosos</span>
            </label>
          </div>
        </div>

        {/* Seção 3: Abas Simplificadas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informações Técnicas (Simplificado)</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📋 Aba 1 - Características
            </label>
            <input
              type="text"
              value={formulario.aba1_caracteristicas}
              onChange={(e) => handleChange('aba1_caracteristicas', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Resumo das características"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ⚡ Aba 2 - Recursos/Energia
            </label>
            <input
              type="text"
              value={formulario.aba2_recursos_energia}
              onChange={(e) => handleChange('aba2_recursos_energia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Consumo de energia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💧 Aba 3 - Uso da Água
            </label>
            <input
              type="text"
              value={formulario.aba3_uso_agua}
              onChange={(e) => handleChange('aba3_uso_agua', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Captação e consumo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🗑️ Aba 4 - Resíduos
            </label>
            <input
              type="text"
              value={formulario.aba4_residuos}
              onChange={(e) => handleChange('aba4_residuos', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Geração e destinação"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 Aba 5 - Outras Informações
            </label>
            <input
              type="text"
              value={formulario.aba5_outras_info}
              onChange={(e) => handleChange('aba5_outras_info', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Informações complementares"
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações Gerais
          </label>
          <textarea
            value={formulario.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Observações adicionais sobre o licenciamento"
          />
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs">
        <p className="font-semibold text-blue-900 mb-2">🔧 Debug Info</p>
        <p className="text-blue-700">Workflow Instance: {workflowInstanceId || 'N/A'}</p>
        <p className="text-blue-700">Current Step: {currentStepId || 'N/A'}</p>
        <p className="text-blue-700">Tipo Licença: {formulario.tipo_licenca || '(vazio)'}</p>
        <p className="text-blue-700">Recursos Hídricos: {formulario.possui_recursos_hidricos ? 'Sim' : 'Não'}</p>
      </div>

      {/* Botão Finalizar */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            <>
              Finalizar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
