import { useState } from 'react';
import { MapPin, ArrowRight, Map } from 'lucide-react';
import { toast } from 'react-toastify';
import { useInscricaoStore } from '../../../lib/store/inscricao';
import { completeStep } from '../../../services/workflowApi';

/**
 * Página Imóvel para Workflow Engine (Motor BPMN)
 * 
 * Versão simplificada focada na integração com o motor.
 */
export default function ImovelWorkflowPage() {
  const { workflowInstanceId, currentStepId } = useInscricaoStore();
  const [loading, setLoading] = useState(false);
  const [imovel, setImovel] = useState({
    endereco: '',
    cep: '',
    municipio: '',
    estado: 'PR',
    latitude: '',
    longitude: '',
    area_m2: '',
    inscricao_municipal: ''
  });

  /**
   * Atualiza campo do formulário
   */
  const handleChange = (field: string, value: string) => {
    setImovel({ ...imovel, [field]: value });
  };

  /**
   * Preenche dados de teste
   */
  const handlePreencherTeste = () => {
    setImovel({
      endereco: 'Rua Teste, 123',
      cep: '80000-000',
      municipio: 'Curitiba',
      estado: 'PR',
      latitude: '-25.4284',
      longitude: '-49.2733',
      area_m2: '1000',
      inscricao_municipal: '12345678'
    });
    toast.success('Dados de teste preenchidos!');
  };

  /**
   * Valida formulário
   */
  const validarFormulario = (): boolean => {
    if (!imovel.endereco.trim()) {
      toast.warning('Preencha o endereço');
      return false;
    }
    if (!imovel.municipio.trim()) {
      toast.warning('Preencha o município');
      return false;
    }
    if (!imovel.area_m2 || parseFloat(imovel.area_m2) <= 0) {
      toast.warning('Preencha uma área válida');
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
      console.log('📤 Completando step Imóvel:', {
        instanceId: workflowInstanceId,
        stepId: currentStepId,
        data: { imovel }
      });

      await completeStep(workflowInstanceId, currentStepId, { imovel });

      console.log('✅ Step completado');
      toast.success('Imóvel cadastrado! Avançando...');
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
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <MapPin className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Imóvel</h2>
          <p className="text-sm text-gray-600">
            Informações do imóvel onde será realizada a atividade
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
        {/* Endereço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço *
          </label>
          <input
            type="text"
            value={imovel.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rua, número, complemento"
          />
        </div>

        {/* CEP e Município */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP
            </label>
            <input
              type="text"
              value={imovel.cep}
              onChange={(e) => handleChange('cep', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="00000-000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Município *
            </label>
            <input
              type="text"
              value={imovel.municipio}
              onChange={(e) => handleChange('municipio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome do município"
            />
          </div>
        </div>

        {/* Coordenadas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="text"
              value={imovel.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="-25.4284"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="text"
              value={imovel.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="-49.2733"
            />
          </div>
        </div>

        {/* Área e Inscrição */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área (m²) *
            </label>
            <input
              type="number"
              value={imovel.area_m2}
              onChange={(e) => handleChange('area_m2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1000"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inscrição Municipal
            </label>
            <input
              type="text"
              value={imovel.inscricao_municipal}
              onChange={(e) => handleChange('inscricao_municipal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="12345678"
            />
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs">
        <p className="font-semibold text-blue-900 mb-2">🔧 Debug Info</p>
        <p className="text-blue-700">Workflow Instance: {workflowInstanceId || 'N/A'}</p>
        <p className="text-blue-700">Current Step: {currentStepId || 'N/A'}</p>
        <p className="text-blue-700">Endereço: {imovel.endereco || '(vazio)'}</p>
        <p className="text-blue-700">Município: {imovel.municipio || '(vazio)'}</p>
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
