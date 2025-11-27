import React, { useState, useEffect } from 'react';
import { BarChart3, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, CheckCircle, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../../lib/store/empreendimento';
import Step2RecursosEnergia from '../../components/Step2RecursosEnergia';
import Step2Combustiveis from '../../components/Step2Combustiveis';
import Step3UsoAgua from '../../components/Step3UsoAgua';
import Step4Residuos from '../../components/Step4Residuos';
import Step5OutrasInfo from '../../components/Step5OutrasInfo';
import { shouldUseMockup, logMockup, MOCKUP_CONFIG } from '../../config/mockup';
import { 
  getMockCharacterizationData, 
  generateMockId, 
  mockDelay,
  buildEnterpriseJSON,
  saveMockEnterprise
} from '../../services/mockupService';

interface CaracterizacaoEmpreendimentoPageProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
}

export default function CaracterizacaoEmpreendimentoPage({
  onNext,
  onPrevious
}: CaracterizacaoEmpreendimentoPageProps) {
  const store = useEmpreendimentoStore();
  const { caracterizacao, setCaracterizacao } = store;

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

  // ✨ Carrega dados da caracterização quando em modo edição
  useEffect(() => {
    if (caracterizacao && Object.keys(caracterizacao).length > 0) {
      console.log('📊 [CARACTERIZAÇÃO] Carregando dados do store:', caracterizacao);
      
      if (caracterizacao.recursos_energia) {
        setRecursosEnergiaData(caracterizacao.recursos_energia);
      }
      if (caracterizacao.combustiveis) {
        setCombustiveisData(caracterizacao.combustiveis);
      }
      if (caracterizacao.uso_agua) {
        setUsoAguaData(caracterizacao.uso_agua);
      }
      if (caracterizacao.residuos) {
        setResiduosData(caracterizacao.residuos);
      }
      if (caracterizacao.outras_informacoes) {
        setOutrasInfoData(caracterizacao.outras_informacoes);
      }
    }
  }, [caracterizacao]);

  // ✅ Atualiza o store sempre que os dados dos sub-formulários mudarem
  // REMOVIDO: Pode causar loop infinito
  // Solução: Atualizar o store apenas no handleSave

  const toggleSection = (section: string) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    console.log('💾 [CARACTERIZAÇÃO] Salvando rascunho...');
    await handleSave(true);
  };

  const handleNext = async () => {
    console.log('✅ [CARACTERIZAÇÃO] Finalizando cadastro...');
    await handleSave(false);
  };

  const handleSave = async (isDraft: boolean) => {
    try {
      // 🎭 MOCKUP: Se habilitado, usa dados mockados com variação aleatória
      let dataToSave;
      
      if (shouldUseMockup('characterization')) {
        logMockup('Salvando caracterização com dados mockados (randomizados)');
        
        // Gera dados mockados com variação aleatória
        const mockData = getMockCharacterizationData();
        
        dataToSave = {
          ...formData,
          ...mockData,
          // Preserva dados do formulário se usuário preencheu algo
          recursos_energia: Object.keys(recursosEnergiaData).length > 0 ? recursosEnergiaData : mockData.recursos_energia,
          combustiveis: Object.keys(combustiveisData).length > 0 ? combustiveisData : mockData.combustiveis,
          uso_agua: Object.keys(usoAguaData).length > 0 ? usoAguaData : mockData.uso_agua,
          residuos: Object.keys(residuosData).length > 0 ? residuosData : mockData.residuos,
          outras_informacoes: Object.keys(outrasInfoData).length > 0 ? outrasInfoData : mockData.outras_informacoes,
          _mockup: true,
          _mockup_id: generateMockId()
        };
        
        // Simula delay de API
        await mockDelay(800);
      } else {
        // Modo normal: usa dados do formulário
        dataToSave = {
          ...formData,
          recursos_energia: recursosEnergiaData,
          combustiveis: combustiveisData,
          uso_agua: usoAguaData,
          residuos: residuosData,
          outras_informacoes: outrasInfoData
        };
      }

      // Atualiza caracterização no store
      setCaracterizacao(dataToSave);

      // 📦 Monta JSON completo do empreendimento
      const completeStoreData = {
        property: store.property,
        basic_info: store.dadosGerais,
        participants: store.participes,
        activities: store.atividades,
        characterization: dataToSave
      };

      console.log('📦 [CARACTERIZAÇÃO] Dados completos do store:', completeStoreData);

      // Constrói JSON no formato da API
      const enterpriseJSON = buildEnterpriseJSON(completeStoreData);
      
      console.log('📝 [CARACTERIZAÇÃO] JSON montado para API:', enterpriseJSON);

      // Detecta se é EDIÇÃO ou CRIAÇÃO
      // Se empreendimentoId no store começa com "emp_", é criação (ID temporário)
      // Se é número ou não começa com "emp_", é edição (ID real)
      const currentId = store.empreendimentoId;
      const isCreating = !currentId || String(currentId).startsWith('emp_');
      const existingId = isCreating ? null : currentId;

      console.log(`🔍 [CARACTERIZAÇÃO] Modo: ${isCreating ? 'CRIAÇÃO' : 'EDIÇÃO'} - ID: ${existingId || 'novo'}`);

      // 💾 Salva no mockup (atualiza se já existe, cria se novo)
      const savedId = saveMockEnterprise(enterpriseJSON, isDraft, existingId);
      
      toast.success(
        isDraft 
          ? `Rascunho ${isCreating ? 'salvo' : 'atualizado'} com sucesso! ID: ${savedId}` 
          : `Empreendimento ${isCreating ? 'cadastrado' : 'atualizado'} com sucesso! ID: ${savedId}`,
        { autoClose: 3000 }
      );

      console.log(`✅ [CARACTERIZAÇÃO] Empreendimento ${isCreating ? 'criado' : 'atualizado'} no mockup:`, savedId);
      console.log('📋 [CARACTERIZAÇÃO] JSON pronto para enviar à API quando disponível');

      // Prossegue apenas se não for rascunho
      if (!isDraft) {
        onNext({ 
          caracterizacao: dataToSave,
          savedId,
          enterpriseJSON,
          isCreating
        });
      }
    } catch (error: any) {
      console.error('❌ [CARACTERIZAÇÃO] Erro ao salvar:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const generateCaracterizacaoJSON = (dados: any) => {
    const jsonData = {
      recursosEnergia: {
        utilizaLenha: dados.recursos_energia?.usaLenha === 'sim',
        possuiCaldeira: dados.recursos_energia?.possuiCaldeira === 'sim',
        possuiFornos: dados.recursos_energia?.possuiFornos === 'sim',
        combustiveis: dados.recursos_energia?.combustiveis || []
      },
      combustiveis: dados.combustiveis?.combustiveis || [],
      usoAgua: {
        origens: dados.uso_agua?.origens || ['Rede Pública'],
        consumoUsoHumano: dados.uso_agua?.consumoHumano || '5.5',
        consumoOutrosUsos: dados.uso_agua?.consumoOutros || '12.3',
        volumeDespejoDiario: dados.uso_agua?.volumeDespejo || '15.8',
        destinoFinalEfluente: dados.uso_agua?.destinoFinal || 'Rede Pública de Esgoto',
        outorgas: dados.uso_agua?.outorgas || []
      },
      residuos: {
        grupoA: dados.residuos?.residuosGrupoA || [],
        grupoB: dados.residuos?.residuosGrupoB || [],
        gerais: dados.residuos?.residuosGerais || []
      },
      outrasInformacoes: {
        respostas: dados.outras_informacoes?.respostas || {},
        outrasInformacoesRelevantes: dados.outras_informacoes?.outrasInformacoes || ''
      }
    };

    const jsonCompleto = {
      metadados: {
        timestamp: new Date().toISOString(),
        versao: '2.5.2',
        branch: 'feature/working-branch',
        origem: 'botao_preencher_dados'
      },
      caracterizacao: jsonData
    };

    // Exibir no console para debug
    console.log('📦 JSON Gerado - Caracterização:', JSON.stringify(jsonCompleto, null, 2));

    // Download do arquivo JSON (desabilitado durante testes automatizados)
    const isAutomatedTest = window.location.search.includes('automated=true') || 
                           (window.navigator.webdriver === true);
    
    if (!isAutomatedTest) {
      const blob = new Blob([JSON.stringify(jsonCompleto, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `caracterizacao_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('JSON da Caracterização gerado e baixado!');
    } else {
      console.log('⚠️ Download de JSON desabilitado durante testes automatizados');
    }
  };

  const preencherDadosAutomaticamente = () => {
    const dadosExemplo = {
      recursos_energia: {
        usaLenha: 'nao',
        possuiCaldeira: 'nao',
        possuiFornos: 'nao',
        combustiveis: [{
          id: crypto.randomUUID(),
          tipoFonte: 'Óleo',
          equipamento: 'Motor 500 MW',
          quantidade: '100',
          unidade: 'm³'
        }]
      },
      combustiveis: {
        combustiveis: [{
          id: crypto.randomUUID(),
          tipoFonte: 'OLEO',
          equipamento: 'Motor 500 MW',
          quantidade: 100,
          unidade: 'KWH'
        }]
      },
      uso_agua: {
        origens: ['Rede Pública'],
        consumoHumano: '5.5',
        consumoOutros: '12.3',
        volumeDespejo: '15.8',
        destinoFinal: 'Rede Pública de Esgoto',
        outorgas: []
      },
      residuos: {
        residuosGrupoA: [{
          id: crypto.randomUUID(),
          tipo: 'Materiais Perfurocortantes',
          quantidade: '25',
          destino: 'Empresa Especializada'
        }],
        residuosGrupoB: [{
          id: crypto.randomUUID(),
          tipo: 'Medicamentos Vencidos',
          quantidade: '10',
          destino: 'Incineração'
        }],
        residuosGerais: [{
          id: crypto.randomUUID(),
          categoria: 'Sólidos',
          tipo: 'Papel e Papelão',
          origem: 'Área Administrativa',
          tratamento: 'Não possui tratamento',
          destino: 'Reciclagem',
          quantidade: '150'
        }]
      },
      outras_informacoes: {
        respostas: {
          usaRecursosNaturais: false,
          geraEfluentesLiquidos: false,
          geraEmissoesAtmosfericas: true,
          geraResiduosSolidos: false,
          geraRuidosVibracao: true,
          localizadoAreaProtegida: false,
          necessitaSupressaoVegetacao: false,
          interfereCursoAgua: true,
          armazenaSubstanciaPerigosa: false,
          possuiPlanoEmergencia: true
        },
        outrasInformacoes: 'Empreendimento possui procedimentos de segurança ambiental e trabalhista em conformidade com a legislação vigente. São realizadas auditorias periódicas e treinamentos contínuos. Medidas mitigadoras já implementadas incluem sistema de gestão de resíduos, tratamento de efluentes e controle de emissões atmosféricas.'
      }
    };

    setRecursosEnergiaData(dadosExemplo.recursos_energia);
    setCombustiveisData(dadosExemplo.combustiveis);
    setUsoAguaData(dadosExemplo.uso_agua);
    setResiduosData(dadosExemplo.residuos);
    setOutrasInfoData(dadosExemplo.outras_informacoes);

    toast.success('Dados preenchidos automaticamente! ✨');

    // Gerar JSON após preencher
    setTimeout(() => {
      generateCaracterizacaoJSON(dadosExemplo);
    }, 500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">Caracterização Ambiental do Empreendimento</h2>
          </div>
          <button
            onClick={preencherDadosAutomaticamente}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
            title="Preencher dados de exemplo para teste"
          >
            <CheckCircle className="w-4 h-4" />
            Preencher Dados
          </button>
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
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 font-medium shadow-sm"
          >
            <Save className="w-4 h-4" />
            Salvar Rascunho
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
    </div>
  );
}
