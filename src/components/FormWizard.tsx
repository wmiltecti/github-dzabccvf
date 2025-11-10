import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import http from '../lib/api/http';
import {
  FileText,
  Zap,
  Droplet,
  Fuel,
  Trash2,
  Info,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  Loader2,
  Wand2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useFormWizardStore } from '../store/formWizardStore';
import { saveStep, saveDraft } from '../services/formWizardService';
import { sendToBlockchain } from '../lib/utils/BlockchainUtils';
import { getUserId } from '../utils/authToken';
import { criarProcesso, upsertDadosGerais, getDadosGerais } from '../services/processosService';
import { saveConsumoAgua } from '../services/usoAguaService';
import {
  saveResiduoGrupoA,
  saveResiduoGrupoB,
  saveResiduoGeral,
  loadResiduosGrupoA,
  loadResiduosGrupoB,
  loadResiduosGerais,
} from '../services/residuosService';
import { saveOutrasInformacoes, loadOutrasInformacoes } from '../services/outrasInformacoesService';
import Step1Caracteristicas from './Step1Caracteristicas';
import Step2RecursosEnergia from './Step2RecursosEnergia';
import Step2Combustiveis from './Step2Combustiveis';
import Step3UsoAgua from './Step3UsoAgua';
import Step4Residuos from './Step4Residuos';
import Step5OutrasInfo from './Step5OutrasInfo';
import StepRevisao from './StepRevisao';

interface Step {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

const steps: Step[] = [
  {
    id: 1,
    name: 'Características do Empreendimento',
    description: 'Informações sobre o empreendimento',
    icon: FileText
  },
  {
    id: 2,
    name: 'Uso de Recursos e Energia',
    description: 'Combustíveis e fontes de energia',
    icon: Zap
  },
  {
    id: 3,
    name: 'Uso de Água',
    description: 'Consumo, origem e efluentes',
    icon: Droplet
  },
  {
    id: 4,
    name: 'Combustíveis',
    description: 'Controle de combustíveis',
    icon: Fuel
  },
  {
    id: 5,
    name: 'Resíduos',
    description: 'Gestão de resíduos',
    icon: Trash2
  },
  {
    id: 6,
    name: 'Outras Informações',
    description: 'Informações complementares',
    icon: Info
  },
  {
    id: 7,
    name: 'Revisão Final',
    description: 'Revisão e conclusão',
    icon: CheckCircle
  }
];

interface FormWizardProps {
  processoId?: string; // Processo ID passado externamente (opcional para retrocompatibilidade)
  onComplete?: () => void; // Callback quando formulário é completado
}

export default function FormWizard({ processoId: externalProcessoId, onComplete }: FormWizardProps = {}) {
  // React state local (sem persistência)
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [processoId, setProcessoId] = useState<string | null>(externalProcessoId || null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSavingToAPI, setIsSavingToAPI] = useState(false);
  const [isSavingStep2, setIsSavingStep2] = useState(false);
  const [isSavingStep3, setIsSavingStep3] = useState(false);
  const [isSavingStep5, setIsSavingStep5] = useState(false);
  const [isSavingStep6, setIsSavingStep6] = useState(false);

  // Flag para evitar criação duplicada de processo no StrictMode
  const isCreatingProcesso = useRef(false);

  const progress = (currentStep / steps.length) * 100;

  // Funções de navegação
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updateStepData = (step: number, data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [`step${step}`]: { ...prev[`step${step}`], ...data }
    }));
  };

  // Criar processo ao montar o componente (apenas se não foi passado externamente)
  useEffect(() => {
    // Se processoId foi passado como prop, usa ele e não cria novo
    if (externalProcessoId) {
      console.log('📥 [FormWizard] Usando processoId externo:', externalProcessoId);
      setProcessoId(externalProcessoId);
      return;
    }

    const initializeProcesso = async () => {
      if (processoId) return; // se já tem, sai
      
      // Evita criação duplicada no StrictMode (React executa useEffect 2x em dev)
      if (isCreatingProcesso.current) {
        console.log('🔒 [FormWizard] Já está criando processo, aguardando...');
        return;
      }

      setIsInitializing(true);
      isCreatingProcesso.current = true;
      
      try {
        const userId = getUserId();
        if (!userId) {
          toast.error('Usuário não autenticado');
          return;
        }
        const newProcessoId = await criarProcesso(userId);
        console.log('✅ Processo criado na API (id remoto):', newProcessoId);
        setProcessoId(newProcessoId);
      } catch (error: any) {
        console.error('Erro ao criar processo:', error);
        toast.error(error?.message || 'Erro ao inicializar processo');
      } finally {
        setIsInitializing(false);
        isCreatingProcesso.current = false;
      }
    };

    initializeProcesso();
  }, [externalProcessoId]); // Re-executa se processoId externo mudar

// Carregar dados existentes quando o processo já existe
useEffect(() => {
  const loadDadosGerais = async () => {
    if (processoId) {
      try {
        console.log('🔍 [FormWizard] Carregando dados gerais existentes para processo:', processoId);
        const dadosExistentes = await getDadosGerais(processoId);
        
        if (dadosExistentes) {
          console.log('📥 [FormWizard] Dados gerais carregados:', dadosExistentes);
          
          // Converter dados da API para o formato do formulário
          const dadosFormulario: any = {
            tipoPessoa: dadosExistentes.tipo_pessoa,
            cpf: dadosExistentes.cpf,
            cnpj: dadosExistentes.cnpj,
            razaoSocial: dadosExistentes.razao_social,
            nomeFantasia: dadosExistentes.nome_fantasia,
            area: dadosExistentes.area_total,
            porte: dadosExistentes.porte,
            potencialPoluidor: dadosExistentes.potencial_poluidor,
            cnaeCodigo: dadosExistentes.cnae_codigo,
            cnaeDescricao: dadosExistentes.cnae_descricao,
            numeroEmpregados: dadosExistentes.numero_empregados,
            horarioInicio: dadosExistentes.horario_funcionamento_inicio,
            horarioFim: dadosExistentes.horario_funcionamento_fim,
            descricaoResumo: dadosExistentes.descricao_resumo,
            emailContato: dadosExistentes.contato_email,
            telefoneContato: dadosExistentes.contato_telefone,
            numeroProcessoExterno: dadosExistentes.numero_processo_externo,
            possuiLicencaAnterior: dadosExistentes.possui_licenca_anterior === true ? 'sim' : 
                                    dadosExistentes.possui_licenca_anterior === false ? 'nao' : '',
          };

          // Se possui licença anterior, adicionar dados da licença
          if (dadosExistentes.possui_licenca_anterior && 
              (dadosExistentes.tipo_licenca_anterior || dadosExistentes.numero_licenca_anterior)) {
            dadosFormulario.licencaAnterior = {
              tipo: dadosExistentes.tipo_licenca_anterior || '',
              numero: dadosExistentes.numero_licenca_anterior || '',
              ano: dadosExistentes.ano_emissao_licenca ? String(dadosExistentes.ano_emissao_licenca) : '',
              validade: dadosExistentes.validade_licenca || '',
            };
          }

          // Atualizar formData com os dados carregados
          updateStepData(1, dadosFormulario);

          console.log('✅ [FormWizard] Dados do formulário carregados no estado:', dadosFormulario);
        } else {
          console.log('ℹ️ [FormWizard] Nenhum dado existente encontrado para este processo');
        }
      } catch (error: any) {
        console.error('❌ [FormWizard] Erro ao carregar dados gerais:', error);
      }
    }
  };

  loadDadosGerais();
}, [processoId]);

// Carregar dados de Outras Informações quando o processo já existe
useEffect(() => {
  const loadOutrasInfo = async () => {
    if (processoId) {
      try {
        console.log('🔍 [FormWizard] Carregando outras informações para processo:', processoId);
        const dadosExistentes = await loadOutrasInformacoes(processoId);

        if (dadosExistentes) {
          console.log('📥 [FormWizard] Outras informações carregadas:', dadosExistentes);
          updateStepData(6, dadosExistentes);
          console.log('✅ [FormWizard] Dados da Aba 6 carregados no estado');
        } else {
          console.log('ℹ️ [FormWizard] Nenhum dado de outras informações encontrado para este processo');
        }
      } catch (error: any) {
        console.error('❌ [FormWizard] Erro ao carregar outras informações:', error);
      }
    }
  };

  loadOutrasInfo();
}, [processoId]);


  const handleNext = async () => {
    if (currentStep === 1 && processoId) {
      try {
        await saveStepToAPI();
        nextStep();
      } catch (error) {
        console.error('Erro ao salvar etapa 1:', error);
      }
    } else if (currentStep === 2 && processoId) {
      try {
        await saveStep2ToAPI();
        nextStep();
      } catch (error) {
        console.error('Erro ao salvar etapa 2:', error);
      }
    } else if (currentStep === 3 && processoId) {
      try {
        await saveStep3ToAPI();
        nextStep();
      } catch (error) {
        console.error('Erro ao salvar etapa 3:', error);
      }
    } else if (currentStep === 5 && processoId) {
      try {
        await saveStep5ToAPI();
        nextStep();
      } catch (error) {
        console.error('Erro ao salvar etapa 5:', error);
      }
    } else if (currentStep === 6 && processoId) {
      try {
        await saveStep6ToAPI();
        nextStep();
      } catch (error) {
        console.error('Erro ao salvar etapa 6:', error);
      }
    } else if (currentStep < steps.length) {
      nextStep();
    }
  };

  const handleBack = () => {
    previousStep();
  };

  const onlyDigits = (s?: string) => (s ?? "").replace(/\D/g, "");

const saveStepToAPI = async () => {
  if (currentStep !== 1 || !processoId) return;

  setIsSavingToAPI(true);
  try {
    const d = formData.step1 || {};

    const payload: any = {
      tipo_pessoa: d.tipoPessoa ?? "PF",
      cpf: d.cpf ?? "",
      cnpj: d.cnpj ?? "",
      razao_social: d.razaoSocial ?? "",
      nome_fantasia: d.nomeFantasia ?? "",
      area_total: d.area ? parseFloat(d.area) : null,
      porte: d.porte ?? "",
      potencial_poluidor: String(d.potencialPoluidor ?? "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase(),
      cnae_codigo: d.cnaeCodigo ?? "",
      cnae_descricao: d.cnaeDescricao ?? "",
      numero_empregados: d.numeroEmpregados ? parseInt(d.numeroEmpregados) : null,
      horario_funcionamento_inicio: d.horarioInicio ?? "",
      horario_funcionamento_fim: d.horarioFim ?? "",
      descricao_resumo: d.descricaoResumo ?? "",
      contato_email: d.emailContato ?? d.email ?? "",
      contato_telefone: d.telefoneContato ?? "",
      numero_processo_externo: d.numeroProcessoExterno ?? "",
      possui_licenca_anterior: d.possuiLicencaAnterior === 'sim' ? true : 
                                d.possuiLicencaAnterior === 'nao' ? false : null,
    };

    // Se possui licença anterior, adicionar dados da licença
    if (d.licencaAnterior && d.possuiLicencaAnterior === 'sim') {
      payload.tipo_licenca_anterior = d.licencaAnterior.tipo ?? "";
      payload.numero_licenca_anterior = d.licencaAnterior.numero ?? "";
      payload.ano_emissao_licenca = d.licencaAnterior.ano ? parseInt(d.licencaAnterior.ano) : null;
      payload.validade_licenca = d.licencaAnterior.validade ?? "";
    }

    // Validação de e-mail
    const isValidEmail = (s?: string) =>
      !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

    const rawEmail = (payload?.contato_email ?? "").toString().trim();
    payload.contato_email = isValidEmail(rawEmail)
      ? rawEmail
      : `inicio.de.cadastro.${processoId}@example.org`;

    console.log("🔎 Payload final de dados-gerais (já com e-mail válido):", payload);

    await upsertDadosGerais(processoId, payload);

    toast.success("Dados gerais salvos com sucesso!");
  } catch (error: any) {
    console.error("Erro ao salvar dados gerais:", error);
    toast.error(error?.message || "Erro ao salvar dados gerais");
    throw error;
  } finally {
    setIsSavingToAPI(false);
  }
}; 

// Salvar dados da Aba 3 - Uso de Água
const saveStep3ToAPI = async () => {
  if (currentStep !== 3 || !processoId) return;

  setIsSavingStep3(true);
  try {
    const d = formData.step3 || {};

    console.log('💧 [FormWizard] Salvando dados de Uso de Água...');
    console.log('📊 Dados do formulário:', d);

    await saveConsumoAgua(processoId, d);

    console.log('✅ Aba 3 salva com sucesso');
    toast.success('Dados de Uso de Água salvos com sucesso!');
  } catch (error: any) {
    console.error('❌ Erro ao salvar Aba 3:', error);
    toast.error(error?.message || 'Erro ao salvar dados da Aba 3. Verifique os campos e tente novamente.');
    throw error;
  } finally {
    setIsSavingStep3(false);
  }
};

// Helper para verificar se um ID é temporário (gerado com crypto.randomUUID)
const isTemporaryId = (id: string): boolean => {
  // UUIDs temporários têm 36 caracteres (formato: 8-4-4-4-12)
  // IDs da API geralmente são números ou têm formato diferente
  return id.length === 36 && id.includes('-');
};

// Salvar dados da Aba 5 - Resíduos
const saveStep5ToAPI = async () => {
  if (currentStep !== 5 || !processoId) return;

  setIsSavingStep5(true);
  const d = formData.step5 || {};

  try {
    console.log('🗑️ [FormWizard] Salvando resíduos...');

    let savedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Salvar Resíduos Grupo A (apenas os novos)
    const residuosGrupoA = (d.residuosGrupoA || []).filter((r: any) =>
      !r.id || isTemporaryId(r.id)
    );
    console.log(`📊 Grupo A: ${residuosGrupoA.length} novos resíduos para salvar`);

    for (const residuo of residuosGrupoA) {
      try {
        await saveResiduoGrupoA(processoId, residuo);
        savedCount++;
      } catch (error: any) {
        console.error('❌ Erro ao salvar Grupo A:', error);
        failedCount++;
        errors.push(`Grupo A (${residuo.tipo}): ${error.message}`);
      }
    }

    // Salvar Resíduos Grupo B (apenas os novos)
    const residuosGrupoB = (d.residuosGrupoB || []).filter((r: any) =>
      !r.id || isTemporaryId(r.id)
    );
    console.log(`📊 Grupo B: ${residuosGrupoB.length} novos resíduos para salvar`);

    for (const residuo of residuosGrupoB) {
      try {
        await saveResiduoGrupoB(processoId, residuo);
        savedCount++;
      } catch (error: any) {
        console.error('❌ Erro ao salvar Grupo B:', error);
        failedCount++;
        errors.push(`Grupo B (${residuo.tipo}): ${error.message}`);
      }
    }

    // Salvar Resíduos Gerais (apenas os novos)
    const residuosGerais = (d.residuosGerais || []).filter((r: any) =>
      !r.id || isTemporaryId(r.id)
    );
    console.log(`📊 Resíduos Gerais: ${residuosGerais.length} novos resíduos para salvar`);

    for (const residuo of residuosGerais) {
      try {
        await saveResiduoGeral(processoId, residuo);
        savedCount++;
      } catch (error: any) {
        console.error('❌ Erro ao salvar resíduo geral:', error);
        failedCount++;
        errors.push(`Geral (${residuo.tipo}): ${error.message}`);
      }
    }

    // Recarregar resíduos da API após salvar
    console.log('🔄 Recarregando resíduos da API...');
    const [grupoA, grupoB, gerais] = await Promise.all([
      loadResiduosGrupoA(processoId),
      loadResiduosGrupoB(processoId),
      loadResiduosGerais(processoId),
    ]);

    // Atualizar estado com dados recarregados
    updateStepData(5, {
      residuosGrupoA: grupoA,
      residuosGrupoB: grupoB,
      residuosGerais: gerais,
    });

    // Mostrar resultado
    if (savedCount > 0 && failedCount === 0) {
      console.log(`✅ ${savedCount} resíduos salvos com sucesso`);
      toast.success(`${savedCount} resíduo(s) salvo(s) com sucesso!`);
    } else if (savedCount > 0 && failedCount > 0) {
      console.warn(`⚠️ ${savedCount} salvos, ${failedCount} falharam`);
      toast.warning(`${savedCount} resíduo(s) salvo(s), mas ${failedCount} falharam. Verifique os erros.`);
      console.error('Erros:', errors);
    } else if (failedCount > 0) {
      console.error(`❌ Todos os ${failedCount} resíduos falharam`);
      toast.error(`Erro ao salvar resíduos. Verifique os dados e tente novamente.`);
      console.error('Erros:', errors);
      throw new Error('Falha ao salvar resíduos');
    } else {
      console.log('ℹ️ Nenhum resíduo novo para salvar');
      toast.info('Nenhum resíduo novo para salvar');
    }
  } catch (error: any) {
    console.error('❌ Erro ao salvar Aba 5:', error);
    toast.error(error?.message || 'Erro ao salvar resíduos. Verifique os campos e tente novamente.');
    throw error;
  } finally {
    setIsSavingStep5(false);
  }
};

// Salvar dados da Aba 6 - Outras Informações
const saveStep6ToAPI = async () => {
  if (currentStep !== 6 || !processoId) return;

  setIsSavingStep6(true);
  try {
    const d = formData.step6 || {};

    console.log('ℹ️ [FormWizard] Salvando outras informações...');
    console.log('📊 Dados do formulário:', d);

    await saveOutrasInformacoes(processoId, d);

    console.log('✅ Aba 6 salva com sucesso');
    toast.success('Outras Informações salvas com sucesso!');
  } catch (error: any) {
    console.error('❌ Erro ao salvar Aba 6:', error);
    toast.error(error?.message || 'Erro ao salvar outras informações. Verifique os campos e tente novamente.');
    throw error;
  } finally {
    setIsSavingStep6(false);
  }
};

// Salvar dados da Aba 2 - Uso de Recursos e Energia
const saveStep2ToAPI = async () => {
  if (currentStep !== 2 || !processoId) return;

  setIsSavingStep2(true);
  try {
    const d = formData.step2 || {};

    // Converter combustíveis do formato do formulário para o formato da API
    const combustiveisEnergia = (d.combustiveis || []).map((c: any) => ({
      tipo_fonte: c.tipoFonte || "",
      equipamento: c.equipamento || "",
      quantidade: c.quantidade ? parseFloat(c.quantidade) : 0,
      unidade: c.unidade || "m³"
    }));

    const payload = {
      processo_id: processoId,
      usa_lenha: d.usaLenha === 'sim',
      quantidade_lenha_m3: d.lenhaQuantidade ? parseFloat(d.lenhaQuantidade) : null,
      num_ceprof: d.lenhaCeprof || null,
      possui_caldeira: d.possuiCaldeira === 'sim',
      altura_chamine_metros: d.caldeiraAlturaChamine ? parseFloat(d.caldeiraAlturaChamine) : null,
      possui_fornos: d.possuiFornos === 'sim',
      sistema_captacao: d.fornosSistemaCaptacao || null,
      combustiveis_energia: combustiveisEnergia
    };

    console.log("🔎 Payload da Aba 2 - Uso de Recursos e Energia:", payload);

    const response = await http.post('/uso-recursos-energia', payload);

    console.log('✅ Aba 2 salva com sucesso:', response.data);
    
    toast.success("Dados de Recursos e Energia salvos com sucesso!");
  } catch (error: any) {
    console.error("❌ Erro ao salvar Aba 2:", error);
    toast.error(error?.message || "Erro ao salvar dados da Aba 2. Verifique os campos e tente novamente.");
    throw error;
  } finally {
    setIsSavingStep2(false);
  }
};



  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveMessage('Salvando rascunho...');

    if (currentStep === 1 && processoId) {
      try {
        await saveStepToAPI();
      } catch (error) {
        setIsSaving(false);
        setSaveMessage('Erro ao salvar rascunho');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
    }

    if (currentStep === 2 && processoId) {
      try {
        await saveStep2ToAPI();
      } catch (error) {
        setIsSaving(false);
        setSaveMessage('Erro ao salvar rascunho');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
    }

    if (currentStep === 3 && processoId) {
      try {
        await saveStep3ToAPI();
      } catch (error) {
        setIsSaving(false);
        setSaveMessage('Erro ao salvar rascunho');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
    }

    if (currentStep === 5 && processoId) {
      try {
        await saveStep5ToAPI();
      } catch (error) {
        setIsSaving(false);
        setSaveMessage('Erro ao salvar rascunho');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
    }

    if (currentStep === 6 && processoId) {
      try {
        await saveStep6ToAPI();
      } catch (error) {
        setIsSaving(false);
        setSaveMessage('Erro ao salvar rascunho');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
    }

    // Apenas salva na API (sem localStorage)
    setIsSaving(false);
    setSaveMessage('Dados salvos na API!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleStepDataChange = (data: any) => {
    updateStepData(currentStep, data);
  };

  const handleFillMockData = () => {
    const mockData = getMockDataForStep(currentStep);
    updateStepData(currentStep, mockData);
    setSaveMessage('Dados de exemplo preenchidos!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const getMockDataForStep = (step: number) => {
    switch (step) {
      case 1:
        return {
          area: '5000',
          porte: 'Médio Porte',
          potencialPoluidor: 'Médio',
          cnaeCodigo: '1011-2/01',
          cnaeDescricao: 'Frigorífico - abate de bovinos',
          possuiLicencaAnterior: 'sim',
          licencaTipo: 'LO',
          licencaNumero: '12345/2023',
          licencaAno: '2023',
          licencaValidade: '2025-12-31',
          numeroEmpregados: '150',
          horarioInicio: '07:00',
          horarioFim: '17:00'
        };
      case 2:
        return {
          usaLenha: 'sim',
          lenhaQuantidade: '250',
          lenhaCeprof: 'CEPROF-12345',
          possuiCaldeira: 'sim',
          caldeiraAlturaChamine: '15',
          possuiFornos: 'sim',
          fornosSistemaCaptacao: 'Sistema de filtros ciclônicos com lavadores de gases',
          combustiveis: [
            {
              id: '1',
              tipoFonte: 'Lenha',
              equipamento: 'Caldeira Principal',
              quantidade: '250',
              unidade: 'm³'
            },
            {
              id: '2',
              tipoFonte: 'Gás Natural',
              equipamento: 'Forno Industrial 1',
              quantidade: '500',
              unidade: 'm³'
            },
            {
              id: '3',
              tipoFonte: 'Eletricidade',
              equipamento: 'Linha de Produção',
              quantidade: '2.5',
              unidade: 'MW'
            }
          ]
        };
      case 3:
        return {
          origens: ['Rede Pública', 'Poço Artesiano'],
          consumoHumano: '50',
          consumoOutros: '150',
          volumeDespejo: '180',
          destinoFinal: 'Corpo Receptor',
          outorgas: [
            {
              id: '1',
              tipo: 'Captação Subterrânea',
              numero: 'OUT-987654/2023',
              validade: '2026-12-31',
              vazao: '100'
            },
            {
              id: '2',
              tipo: 'Lançamento de Efluentes',
              numero: 'OUT-123456/2023',
              validade: '2027-06-30',
              vazao: '180'
            }
          ]
        };
      case 4:
        return {
          combustiveis: [
            {
              id: crypto.randomUUID(),
              tipoFonte: 'ENERGIA_ELETRICA',
              equipamento: 'Motor Principal 500 MW',
              quantidade: 1200.5,
              unidade: 'MWH'
            },
            {
              id: crypto.randomUUID(),
              tipoFonte: 'GLP',
              equipamento: 'Caldeira Auxiliar',
              quantidade: 350.0,
              unidade: 'KG'
            },
            {
              id: crypto.randomUUID(),
              tipoFonte: 'OLEO',
              equipamento: 'Gerador de Emergência',
              quantidade: 500.75,
              unidade: 'KG'
            }
          ]
        };
      case 5:
        return {
          residuosGrupoA: [
            {
              id: '1',
              tipo: 'Resíduos Infectantes',
              quantidade: '150',
              destino: 'Autoclave'
            },
            {
              id: '2',
              tipo: 'Materiais Perfurocortantes',
              quantidade: '50',
              destino: 'Incineração'
            }
          ],
          residuosGrupoB: [
            {
              id: '1',
              tipo: 'Medicamentos Vencidos',
              quantidade: '80',
              destino: 'Empresa Especializada'
            }
          ],
          residuosGerais: [
            {
              id: '1',
              categoria: 'Sólidos',
              tipo: 'Papel e Papelão',
              origem: 'Área administrativa',
              tratamento: 'Não possui tratamento',
              destino: 'Reciclagem',
              quantidade: '300'
            },
            {
              id: '2',
              categoria: 'Líquidos',
              tipo: 'Efluente Industrial',
              origem: 'Setor de produção',
              tratamento: 'ETE',
              destino: 'Corpo Receptor',
              quantidade: '500'
            }
          ]
        };
      case 6:
        return {
          respostas: {
            usaRecursosNaturais: true,
            geraEfluentesLiquidos: true,
            geraEmissoesAtmosfericas: true,
            geraResiduosSolidos: true,
            geraRuidosVibracao: false,
            localizadoAreaProtegida: false,
            necessitaSupressaoVegetacao: false,
            interfereCursoAgua: false,
            armazenaSubstanciaPerigosa: true,
            possuiPlanoEmergencia: true
          },
          outrasInformacoes:
            'O empreendimento já possui certificação ISO 14001 e realiza auditorias ambientais anuais. Todas as medidas de controle ambiental estão implementadas e em operação conforme legislação vigente.'
        };
      case 7:
        return {
          observacoes:
            'Todos os procedimentos ambientais estão em conformidade com a legislação vigente. A empresa mantém certificações atualizadas e realiza auditorias periódicas.'
        };
      default:
        return {};
    }
  };

  const renderStepContent = () => {
    const stepKey = `step${currentStep}` as keyof typeof formData;
    const data = formData[stepKey];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && <Step1Caracteristicas data={data} onChange={handleStepDataChange} unidadeMedida="m²" />}
          {currentStep === 2 && <Step2RecursosEnergia data={data} onChange={handleStepDataChange} />}
          {currentStep === 3 && <Step3UsoAgua data={data} onChange={handleStepDataChange} processoId={processoId} />}
          {currentStep === 4 && <Step2Combustiveis data={data} onChange={handleStepDataChange} />}
          {currentStep === 5 && <Step4Residuos data={data} onChange={handleStepDataChange} processoId={processoId} />}
          {currentStep === 6 && <Step5OutrasInfo data={data} onChange={handleStepDataChange} />}
          {currentStep === 7 && (
            <StepRevisao
              formData={formData}
              processoId={processoId}
              onNavigateToStep={setCurrentStep}
              onFinish={() => {
                console.log('✅ [FormWizard] Formulário completado');
                // Se há callback onComplete, chama ele
                if (onComplete) {
                  onComplete();
                } else {
                  // Comportamento padrão: volta para step 1
                  setCurrentStep(1);
                }
              }}
              saveStepToAPI={saveStepToAPI}
              saveStep2ToAPI={saveStep2ToAPI}
              saveStep3ToAPI={saveStep3ToAPI}
              saveStep5ToAPI={saveStep5ToAPI}
              saveStep6ToAPI={saveStep6ToAPI}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="w-full mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="flex flex-col gap-2 mb-2">
            {/* Title and Actions Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 truncate">Formulário</h1>
                <p className="text-[9px] sm:text-xs text-gray-500">
                  Etapa {currentStep} de {steps.length}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {/* Desktop buttons with text */}
                <button
                  onClick={handleFillMockData}
                  className="hidden md:flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Preencher</span>
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving || isInitializing || isSavingToAPI || isSavingStep2 || isSavingStep3 || isSavingStep5 || isSavingStep6}
                  className="hidden md:flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {isSaving || isSavingToAPI || isSavingStep2 || isSavingStep3 || isSavingStep5 || isSavingStep6 ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden lg:inline">Salvar</span>
                </button>

                {/* Mobile buttons - Icon only */}
                <button
                  onClick={handleFillMockData}
                  className="md:hidden p-1.5 sm:p-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors touch-manipulation"
                  title="Preencher dados de exemplo"
                >
                  <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving || isInitializing || isSavingToAPI || isSavingStep2 || isSavingStep3 || isSavingStep5 || isSavingStep6}
                  className="md:hidden p-1.5 sm:p-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 touch-manipulation"
                  title="Salvar rascunho"
                >
                  {isSaving || isSavingToAPI || isSavingStep2 || isSavingStep3 || isSavingStep5 || isSavingStep6 ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Process ID - Only on larger screens */}
            {processoId && (
              <div className="hidden sm:block text-[9px] sm:text-[10px] text-gray-400 font-mono truncate">
                ID: {processoId}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-600 mb-1">
              <span>Progresso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <motion.div
                className="h-full bg-green-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Save Message */}
          <AnimatePresence>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-[10px] sm:text-xs text-center text-green-600 font-medium py-1"
              >
                {saveMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Steps Navigation - Horizontal Scroll (Mobile to XL) */}
          <div className="mt-2 overflow-x-auto scrollbar-hide -mx-2 sm:-mx-4 lg:-mx-6">
            <div className="flex items-center gap-0.5 sm:gap-1 min-w-max px-2 sm:px-4 lg:px-6 pb-1">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <React.Fragment key={step.id}>
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(step.id)}
                      className="flex flex-col items-center gap-0.5 sm:gap-1 flex-shrink-0 touch-manipulation cursor-pointer"
                    >
                      <div
                        className={`
                          w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all
                          ${
                            isCompleted
                              ? 'bg-green-600 border-green-600 text-white'
                              : isActive
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-400'
                          }
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        ) : (
                          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        )}
                      </div>
                      <span className={`text-[8px] sm:text-[9px] text-center max-w-[36px] sm:max-w-[42px] leading-tight ${
                        isActive ? 'text-blue-600 font-medium' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step.name.split(' ')[0]}
                      </span>
                    </motion.div>
                    {idx < steps.length - 1 && (
                      <div className="flex items-center justify-center flex-shrink-0 px-0.5 sm:px-1">
                        <span className="text-xs sm:text-sm font-bold" style={{ color: isCompleted ? 'green' : 'lightgray' }}>➤</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < steps.length && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </motion.button>

            <div className="hidden sm:block text-xs sm:text-sm text-gray-600 text-center order-1 sm:order-2">
              Etapa {currentStep} de {steps.length}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={isInitializing || isSavingToAPI || isSavingStep2 || isSavingStep3 || isSavingStep5 || isSavingStep6}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation order-1 sm:order-3"
            >
              {isSavingToAPI || isSavingStep2 || isSavingStep3 || isSavingStep5 || isSavingStep6 ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Salvando...</span>
                  <span className="sm:hidden">Salvar</span>
                </>
              ) : (
                <>
                  Avançar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

// (Os componentes StepXContent extras do arquivo original foram mantidos abaixo, sem alterações funcionais)
function Step1Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
        <input
          type="text"
          value={data?.nome || ''}
          onChange={(e) => onChange({ ...data, nome: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Digite seu nome completo"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={data?.email || ''}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="seu@email.com"
        />
      </div>
    </div>
  );
}

function Step2Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Recurso
        </label>
        <select
          value={data?.tipoRecurso || ''}
          onChange={(e) => onChange({ ...data, tipoRecurso: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione...</option>
          <option value="solar">Energia Solar</option>
          <option value="eolica">Energia Eólica</option>
          <option value="hidreletrica">Hidrelétrica</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consumo Mensal (kWh)
        </label>
        <input
          type="number"
          value={data?.consumo || ''}
          onChange={(e) => onChange({ ...data, consumo: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function Step3Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fonte de Água
        </label>
        <select
          value={data?.fonteAgua || ''}
          onChange={(e) => onChange({ ...data, fonteAgua: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione...</option>
          <option value="rede">Rede Pública</option>
          <option value="poco">Poço Artesiano</option>
          <option value="captacao">Captação Superficial</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consumo Mensal (m³)
        </label>
        <input
          type="number"
          value={data?.consumoAgua || ''}
          onChange={(e) => onChange({ ...data, consumoAgua: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function Step4Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={data?.utilizaCombustivel || false}
            onChange={(e) => onChange({ ...data, utilizaCombustivel: e.target.checked })}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Utiliza combustíveis
          </span>
        </label>
      </div>
      {data?.utilizaCombustivel && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Combustível
          </label>
          <select
            value={data?.tipoCombustivel || ''}
            onChange={(e) => onChange({ ...data, tipoCombustivel: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecione...</option>
            <option value="gasolina">Gasolina</option>
            <option value="diesel">Diesel</option>
            <option value="etanol">Etanol</option>
          </select>
        </div>
      )}
    </div>
  );
}

function Step5Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Volume de Resíduos (kg/mês)
        </label>
        <input
          type="number"
          value={data?.volumeResiduos || ''}
          onChange={(e) => onChange({ ...data, volumeResiduos: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Destinação
        </label>
        <textarea
          value={data?.destinacao || ''}
          onChange={(e) => onChange({ ...data, destinacao: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Descreva a destinação dos resíduos..."
        />
      </div>
    </div>
  );
}

function Step6Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações Finais
        </label>
        <textarea
          value={data?.observacoes || ''}
          onChange={(e) => onChange({ ...data, observacoes: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Informações adicionais..."
        />
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Formulário Completo</h3>
            <p className="text-sm text-green-700 mt-1">
              Você completou todas as etapas. Clique em "Salvar Rascunho" para salvar ou
              revise as informações anteriores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
