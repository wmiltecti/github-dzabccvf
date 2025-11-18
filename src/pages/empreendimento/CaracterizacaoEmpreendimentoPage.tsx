import React, { useState, useEffect } from 'react';
import { BarChart3, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../../lib/store/empreendimento';
import Step2RecursosEnergia from '../../components/Step2RecursosEnergia';
import Step2Combustiveis from '../../components/Step2Combustiveis';
import Step3UsoAgua from '../../components/Step3UsoAgua';
import Step4Residuos from '../../components/Step4Residuos';
import Step5OutrasInfo from '../../components/Step5OutrasInfo';

interface CaracterizacaoEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

export default function CaracterizacaoEmpreendimentoPage({
  onNext,
  onPrevious
}: CaracterizacaoEmpreendimentoPageProps) {
  const { caracterizacao, setCaracterizacao } = useEmpreendimentoStore();

  const [formData, setFormData] = useState({
    uso_agua: false,
    fonte_agua: '',
    vazao_estimada: '',
    descarte_efluentes: false,
    tratamento_efluentes: '',
    geracao_residuos: false,
    tipos_residuos: '',
    destinacao_residuos: '',
    emissao_atmosferica: false,
    tipos_emissoes: '',
    controle_emissoes: '',
    geracao_ruido: false,
    nivel_ruido: '',
    horario_operacao: ''
  });

  const [recursosEnergiaData, setRecursosEnergiaData] = useState({});
  const [combustiveisData, setCombustiveisData] = useState({});
  const [usoAguaData, setUsoAguaData] = useState({});
  const [residuosData, setResiduosData] = useState({});
  const [outrasInfoData, setOutrasInfoData] = useState({});

  const [sectionsExpanded, setSectionsExpanded] = useState({
    recursosEnergia: true,
    combustiveis: true,
    usoAgua: true,
    residuos: true,
    outrasInfo: true
  });

  const toggleSection = (section: string) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const allData = {
      ...formData,
      recursosEnergia: recursosEnergiaData,
      combustiveis: combustiveisData,
      usoAgua: usoAguaData,
      residuos: residuosData,
      outrasInfo: outrasInfoData
    };

    setCaracterizacao(allData);
    onNext({ caracterizacao: allData });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Caracterização Ambiental do Empreendimento</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Informe as características ambientais e operacionais completas do empreendimento
        </p>
      </div>

      <div className="space-y-6">
        {/* Recursos e Energia */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('recursosEnergia')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">Uso de Recursos e Energia</h3>
            {sectionsExpanded.recursosEnergia ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {sectionsExpanded.recursosEnergia && (
            <div className="p-6">
              <Step2RecursosEnergia
                data={recursosEnergiaData}
                onChange={setRecursosEnergiaData}
              />
            </div>
          )}
        </div>

        {/* Combustíveis */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('combustiveis')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">Combustíveis</h3>
            {sectionsExpanded.combustiveis ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {sectionsExpanded.combustiveis && (
            <div className="p-6">
              <Step2Combustiveis
                data={combustiveisData}
                onChange={setCombustiveisData}
              />
            </div>
          )}
        </div>

        {/* Uso de Água */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('usoAgua')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">Uso de Água</h3>
            {sectionsExpanded.usoAgua ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {sectionsExpanded.usoAgua && (
            <div className="p-6">
              <Step3UsoAgua
                data={usoAguaData}
                onChange={setUsoAguaData}
              />
            </div>
          )}
        </div>

        {/* Resíduos */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('residuos')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">Gestão de Resíduos</h3>
            {sectionsExpanded.residuos ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {sectionsExpanded.residuos && (
            <div className="p-6">
              <Step4Residuos
                data={residuosData}
                onChange={setResiduosData}
              />
            </div>
          )}
        </div>

        {/* Outras Informações */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('outrasInfo')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">Outras Informações</h3>
            {sectionsExpanded.outrasInfo ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {sectionsExpanded.outrasInfo && (
            <div className="p-6">
              <Step5OutrasInfo
                data={outrasInfoData}
                onChange={setOutrasInfoData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center gap-2 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium shadow-sm"
        >
          Finalizar
          <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
