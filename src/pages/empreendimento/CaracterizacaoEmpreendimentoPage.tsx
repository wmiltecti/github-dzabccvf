import React, { useState } from 'react';
import { BarChart3, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../../lib/store/empreendimento';

interface CaracterizacaoEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

/**
 * Página 4: Caracterização Ambiental do Empreendimento
 */
export default function CaracterizacaoEmpreendimentoPage({ 
  onNext, 
  onPrevious 
}: CaracterizacaoEmpreendimentoPageProps) {
  const { caracterizacao, setCaracterizacao } = useEmpreendimentoStore();
  
  const [formData, setFormData] = useState({
    recursos_hidricos: caracterizacao?.recursos_hidricos || false,
    area_preservacao: caracterizacao?.area_preservacao || false,
    impacto_ambiental: caracterizacao?.impacto_ambiental || '',
    medidas_mitigadoras: caracterizacao?.medidas_mitigadoras || '',
    // Recursos Hídricos
    uso_agua: false,
    fonte_agua: '',
    vazao_estimada: '',
    descarte_efluentes: false,
    tratamento_efluentes: '',
    // Resíduos
    geracao_residuos: false,
    tipos_residuos: '',
    destinacao_residuos: '',
    // Emissões
    emissao_atmosferica: false,
    tipos_emissoes: '',
    controle_emissoes: '',
    // Ruído e Vibrações
    geracao_ruido: false,
    nivel_ruido: '',
    horario_operacao: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!formData.impacto_ambiental) {
      toast.error('Descreva os impactos ambientais do empreendimento');
      return;
    }

    // Salva no store
    setCaracterizacao(formData);
    
    onNext({ caracterizacao: formData });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Caracterização Ambiental</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Informe as características ambientais do empreendimento
        </p>
      </div>

      {/* Formulário */}
      <div className="space-y-8">
        {/* Aspectos Gerais */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Aspectos Gerais</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recursos_hidricos"
                checked={formData.recursos_hidricos}
                onChange={(e) => handleChange('recursos_hidricos', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="recursos_hidricos" className="text-sm font-medium text-gray-700">
                Utiliza recursos hídricos (rios, lagos, aquíferos)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="area_preservacao"
                checked={formData.area_preservacao}
                onChange={(e) => handleChange('area_preservacao', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="area_preservacao" className="text-sm font-medium text-gray-700">
                Localizado em área de preservação ambiental ou próximo a ela
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição dos Impactos Ambientais <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.impacto_ambiental}
                onChange={(e) => handleChange('impacto_ambiental', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Descreva os principais impactos ambientais do empreendimento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medidas Mitigadoras
              </label>
              <textarea
                value={formData.medidas_mitigadoras}
                onChange={(e) => handleChange('medidas_mitigadoras', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Descreva as medidas para reduzir/compensar os impactos..."
              />
            </div>
          </div>
        </div>

        {/* Recursos Hídricos */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recursos Hídricos</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="uso_agua"
                checked={formData.uso_agua}
                onChange={(e) => handleChange('uso_agua', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="uso_agua" className="text-sm font-medium text-gray-700">
                Utiliza água no processo produtivo
              </label>
            </div>

            {formData.uso_agua && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonte de Água
                  </label>
                  <input
                    type="text"
                    value={formData.fonte_agua}
                    onChange={(e) => handleChange('fonte_agua', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Poço artesiano, Rede pública, Rio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vazão Estimada (m³/dia)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.vazao_estimada}
                    onChange={(e) => handleChange('vazao_estimada', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 100.00"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="descarte_efluentes"
                checked={formData.descarte_efluentes}
                onChange={(e) => handleChange('descarte_efluentes', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="descarte_efluentes" className="text-sm font-medium text-gray-700">
                Gera efluentes líquidos
              </label>
            </div>

            {formData.descarte_efluentes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sistema de Tratamento de Efluentes
                </label>
                <textarea
                  value={formData.tratamento_efluentes}
                  onChange={(e) => handleChange('tratamento_efluentes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Descreva o sistema de tratamento..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Resíduos Sólidos */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Resíduos Sólidos</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="geracao_residuos"
                checked={formData.geracao_residuos}
                onChange={(e) => handleChange('geracao_residuos', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="geracao_residuos" className="text-sm font-medium text-gray-700">
                Gera resíduos sólidos
              </label>
            </div>

            {formData.geracao_residuos && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipos de Resíduos
                  </label>
                  <input
                    type="text"
                    value={formData.tipos_residuos}
                    onChange={(e) => handleChange('tipos_residuos', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Orgânicos, Plásticos, Químicos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinação dos Resíduos
                  </label>
                  <textarea
                    value={formData.destinacao_residuos}
                    onChange={(e) => handleChange('destinacao_residuos', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Descreva como os resíduos serão destinados..."
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Emissões Atmosféricas */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Emissões Atmosféricas</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="emissao_atmosferica"
                checked={formData.emissao_atmosferica}
                onChange={(e) => handleChange('emissao_atmosferica', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="emissao_atmosferica" className="text-sm font-medium text-gray-700">
                Gera emissões atmosféricas
              </label>
            </div>

            {formData.emissao_atmosferica && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipos de Emissões
                  </label>
                  <input
                    type="text"
                    value={formData.tipos_emissoes}
                    onChange={(e) => handleChange('tipos_emissoes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Poeira, Gases, Vapor..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sistema de Controle de Emissões
                  </label>
                  <textarea
                    value={formData.controle_emissoes}
                    onChange={(e) => handleChange('controle_emissoes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Descreva os sistemas de controle..."
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ruído e Vibrações */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Ruído e Vibrações</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="geracao_ruido"
                checked={formData.geracao_ruido}
                onChange={(e) => handleChange('geracao_ruido', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="geracao_ruido" className="text-sm font-medium text-gray-700">
                Gera ruído ou vibrações
              </label>
            </div>

            {formData.geracao_ruido && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível de Ruído Estimado (dB)
                  </label>
                  <input
                    type="text"
                    value={formData.nivel_ruido}
                    onChange={(e) => handleChange('nivel_ruido', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 70 dB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Operação
                  </label>
                  <input
                    type="text"
                    value={formData.horario_operacao}
                    onChange={(e) => handleChange('horario_operacao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 07:00 às 18:00"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Navegação */}
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
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
