/**
 * 🎭 SERVIÇO DE MOCKUP
 * 
 * Fornece dados mockados para desenvolvimento quando backend ainda não está pronto
 * 
 * @version 1.0.0
 * @date 2025-11-24
 */

import mockDataCompleteRaw from '../../documentos/backend/dados_exemplo_empreendimento.json';
import mockDataFiveRaw from '../../documentos/backend/dados_teste_5_empreendimentos.json';
import { logMockup } from '../config/mockup';

// Type assertion para garantir que temos os dados corretos
const mockDataComplete: any = mockDataCompleteRaw;
const mockDataFive: any = mockDataFiveRaw;

/**
 * Gera variação aleatória de um número
 */
const randomVariation = (base: number, variationPercent: number = 20): number => {
  const variation = base * (variationPercent / 100);
  const random = Math.random() * variation * 2 - variation;
  return Math.round((base + random) * 100) / 100;
};

/**
 * Gera número aleatório entre min e max
 */
const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Seleciona item aleatório de um array
 */
const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Gera boolean aleatório
 */
const randomBoolean = (): boolean => {
  return Math.random() > 0.5;
};

/**
 * 🔢 Obtém o próximo ID sequencial para novos empreendimentos
 */
export const getNextEnterpriseId = (): number => {
  const saved = getSavedMockEnterprises();
  if (saved.length === 0) return 1;
  
  const maxId = Math.max(...saved.map((e: any) => Number(e.id) || 0));
  return maxId + 1;
};

/**
 * 📋 Retorna lista de empreendimentos mockados (6 fixos + salvos pelo usuário)
 */
export const getMockEnterpriseList = () => {
  console.log('📋 [MOCKUP] ============================================');
  console.log('📋 [MOCKUP] getMockEnterpriseList chamado');
  console.log('📋 [MOCKUP] ============================================');
  logMockup('Carregando lista de empreendimentos mockados');

  try {
    // 1. Carrega empreendimentos salvos pelo usuário
    const savedRaw = getSavedMockEnterprises();
    console.log('📋 [MOCKUP] Empreendimentos salvos (raw):', savedRaw.length);
    savedRaw.forEach((s: any, i: number) => {
      console.log(`  [${i}] ID: ${s.id}, Nome: ${s.basic_info?.nome_empreendimento || s.basic_info?.razao_social}`);
    });
    
    const savedEnterprises = savedRaw.map((saved: any) => ({
      id: saved.id,
      nome_empreendimento: saved.basic_info?.nome_empreendimento || saved.basic_info?.razao_social || 'Novo Empreendimento',
      razao_social: saved.basic_info?.razao_social || '',
      tipo_pessoa: saved.basic_info?.tipo_pessoa || 'juridica',
      cnpj_cpf: saved.basic_info?.cnpj_cpf || '',
      cidade: saved.basic_info?.cidade || '',
      estado: saved.basic_info?.estado || '',
      numero_empregados: saved.basic_info?.numero_empregados || 0,
      property: {
        id: saved.id,
        nome: saved.property?.nome || '',
        kind: saved.property?.kind || 'RURAL',
        municipio: saved.property?.municipio || '',
        uf: saved.property?.uf || '',
        area_total: saved.property?.area_total || 0,
      },
      created_at: saved.saved_at || saved.metadata?.created_at || new Date().toISOString(),
      updated_at: saved.metadata?.updated_at || new Date().toISOString(),
      status: saved.status || 'ativo',
      source: 'mockup_user'
    }));

    // 2. Carrega 6 empreendimentos fixos do JSON (sempre mostra)
    let baseEnterprises: any[] = [];
    
    if (mockDataFive && mockDataFive.empreendimentos) {
      // Pega os 5 do JSON
      const allBase = mockDataFive.empreendimentos;
      
      baseEnterprises = allBase.slice(0, 5).map((emp: any, index: number) => ({
        id: 1000 + index,
        nome_empreendimento: emp?.empreendimento?.nome_empreendimento || 'Empreendimento Mockado',
        razao_social: emp?.empreendimento?.razao_social || 'Empresa Mockada',
        tipo_pessoa: emp?.empreendimento?.tipo_pessoa || 'juridica',
        cnpj_cpf: emp?.empreendimento?.cnpj_cpf || '00000000000000',
        cidade: emp?.empreendimento?.cidade || 'Florianópolis',
        estado: emp?.empreendimento?.estado || 'SC',
        numero_empregados: emp?.empreendimento?.numero_empregados || 0,
        property: {
          id: 1000 + index,
          nome: emp?.imovel?.nome || 'Imóvel Mockado',
          kind: emp?.imovel?.kind || 'RURAL',
          municipio: emp?.imovel?.municipio || 'Florianópolis',
          uf: emp?.imovel?.uf || 'SC',
          area_total: emp?.imovel?.area_total || 0,
        },
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        source: 'mockup_base'
      }));
      
      // Adiciona 6º empreendimento extra com dados aleatórios
      baseEnterprises.push({
        id: 1005,
        nome_empreendimento: 'Indústria Têxtil Moderna Ltda',
        razao_social: 'Indústria Têxtil Moderna Ltda',
        tipo_pessoa: 'juridica',
        cnpj_cpf: '98765432100019',
        cidade: 'Blumenau',
        estado: 'SC',
        numero_empregados: 320,
        property: {
          id: 1005,
          nome: 'Galpão Industrial Têxtil',
          kind: 'URBANO',
          municipio: 'Blumenau',
          uf: 'SC',
          area_total: 8500,
        },
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        source: 'mockup_base'
      });
    }

    // 3. Combina: empreendimentos salvos aparecem no topo, base sempre aparece
    const allEnterprises = [...savedEnterprises, ...baseEnterprises];

    console.log('📋 [MOCKUP] Lista final combinada:');
    console.log(`  - Total: ${allEnterprises.length} (${savedEnterprises.length} salvos + ${baseEnterprises.length} base)`);
    allEnterprises.forEach((e: any, i: number) => {
      console.log(`  [${i}] ID: ${e.id}, Nome: ${e.nome_empreendimento}, Source: ${e.source}`);
    });
    console.log('📋 [MOCKUP] ============================================');
    
    logMockup(`${allEnterprises.length} empreendimentos mockados carregados (${savedEnterprises.length} salvos + ${baseEnterprises.length} base)`);
    return allEnterprises;
  } catch (error) {
    console.error('❌ [MOCKUP] Erro ao carregar empreendimentos mockados:', error);
    return [];
  }
};

/**
 * 💾 Retorna dados de caracterização mockados com variação aleatória
 */
export const getMockCharacterizationData = () => {
  logMockup('Gerando dados de caracterização mockados com variação aleatória');

  const baseData = mockDataComplete.estrutura_completa['5_caracterizacao'].dados;

  // Variações aleatórias nos combustíveis
  const combustiveis = baseData.combustiveis.map((comb: any) => ({
    ...comb,
    quantidade: randomVariation(comb.quantidade, 30),
  }));

  // Variações aleatórias no uso de água
  const consumoHumano = randomVariation(5.5, 40);
  const consumoOutros = randomVariation(12.3, 40);
  const usoAgua = {
    ...baseData.uso_agua,
    origens_agua: randomBoolean() 
      ? ['Rede Pública'] 
      : randomItem([
          ['Poço Artesiano'],
          ['Rio/Córrego'],
          ['Rede Pública', 'Poço Artesiano'],
        ]),
    consumo_humano: consumoHumano,
    consumo_outros_usos: consumoOutros,
    consumo_total: consumoHumano + consumoOutros,
    volume_despejo_diario: randomVariation(15.8, 30),
    tratamento_efluente: randomBoolean() ? 'Sim' : 'Não',
    tipo_tratamento: randomItem([
      'Fossa séptica + filtro',
      'ETE Compacta',
      'Sistema de tratamento biológico',
      'Nenhum',
    ]),
  };

  // Variações aleatórias nos resíduos
  const residuos = {
    ...baseData.residuos,
    gera_residuos: randomBoolean(),
    tipos_residuos: randomBoolean()
      ? ['Classe II - Não Perigosos']
      : ['Classe I - Perigosos', 'Classe II - Não Perigosos'],
    residuos_gerais: baseData.residuos.residuos_gerais.map((res: any) => ({
      ...res,
      quantidade: randomVariation(res.quantidade, 50),
    })),
    possui_plano_gerenciamento: randomBoolean(),
  };

  // Variações nas perguntas ambientais
  const perguntasAmbientais = {
    area_preservacao_permanente: randomBoolean(),
    area_reserva_legal: randomBoolean(),
    supressao_vegetacao: randomBoolean(),
    intervencao_corpo_hidrico: randomBoolean(),
    geracao_ruido: randomBoolean(),
    geracao_vibracao: randomBoolean(),
    emissao_particulados: randomBoolean(),
    emissao_gases: randomBoolean(),
    risco_acidentes: randomBoolean(),
    armazenamento_produtos_perigosos: randomBoolean(),
  };

  const informacoesAdicionais = randomItem([
    'Empreendimento com baixo impacto ambiental. Todas as medidas mitigadoras implementadas.',
    'Sistema de gestão ambiental em implementação conforme ISO 14001.',
    'Empreendimento em fase de regularização ambiental.',
    'Medidas de controle ambiental adequadas ao porte do empreendimento.',
    'Monitoramento ambiental contínuo implementado.',
  ]);

  return {
    recursos_energia: {
      ...baseData.recursos_energia,
      usa_lenha: randomBoolean(),
      possui_caldeira: randomBoolean(),
      possui_fornos: randomBoolean(),
    },
    combustiveis,
    uso_agua: usoAgua,
    residuos,
    outras_informacoes: {
      perguntas_ambientais: perguntasAmbientais,
      informacoes_adicionais: informacoesAdicionais,
    },
  };
};

/**
 * 🎲 Gera ID único mockado
 */
export const generateMockId = (): number => {
  return Date.now() + randomBetween(1, 1000);
};

/**
 * 📄 Retorna dados completos de um empreendimento mockado por ID
 * Busca primeiro nos empreendimentos salvos, depois no JSON base
 */
export const getMockEnterpriseById = (id: string | number): any => {
  console.log('🔍 [MOCKUP] getMockEnterpriseById chamado com ID:', id, 'Tipo:', typeof id);
  logMockup(`Carregando dados completos do empreendimento ${id}`);
  
  // Converte o ID para número para comparação consistente
  const numericId = Number(id);
  
  // 1. SEMPRE busca primeiro nos salvos (localStorage) - pode ter sido editado
  const savedEnterprises = getSavedMockEnterprises();
  console.log('📦 [MOCKUP] Empreendimentos salvos disponíveis:', savedEnterprises.length);
  console.log('📋 [MOCKUP] IDs salvos:', savedEnterprises.map((e: any) => e.id));
  
  const savedEnterprise = savedEnterprises.find((e: any) => {
    const match = Number(e.id) === numericId;
    console.log(`🔍 [MOCKUP] Comparando ${e.id} === ${numericId} ? ${match}`);
    return match;
  });
  
  if (savedEnterprise) {
    console.log('✅ [MOCKUP] Empreendimento encontrado nos salvos (editado):', savedEnterprise);
    console.log('📦 [MOCKUP] Property:', savedEnterprise.property);
    console.log('📦 [MOCKUP] Basic Info:', savedEnterprise.basic_info);
    console.log('📦 [MOCKUP] Participants:', savedEnterprise.participants);
    console.log('📦 [MOCKUP] Activities:', savedEnterprise.activities);
    console.log('📦 [MOCKUP] Characterization:', savedEnterprise.characterization);
    
    // Retorna no formato esperado pelo wizard
    const result = {
      property: savedEnterprise.property || {},
      basic_info: savedEnterprise.basic_info || {},
      participants: savedEnterprise.participants || [],
      activities: savedEnterprise.activities || [],
      characterization: savedEnterprise.characterization || {},
    };
    
    console.log('✅ [MOCKUP] Retornando dados formatados (editados):', result);
    return result;
  }
  
  // 2. Se NÃO encontrou nos salvos E o ID é >= 1000 (empreendimento base), usa dados do JSON
  if (numericId >= 1000 && numericId <= 1005) {
    console.log('📋 [MOCKUP] ID entre 1000-1005, usando dados base do JSON');
    
    const index = numericId - 1000;
    
    // Se for ID 1000-1004, usa dados do mockDataFive
    if (index < 5 && mockDataFive && mockDataFive.empreendimentos && mockDataFive.empreendimentos[index]) {
      const empData = mockDataFive.empreendimentos[index];
      console.log('📦 [MOCKUP] Carregando dados do mockDataFive, índice:', index);
      console.log('📦 [MOCKUP] Dados encontrados:', empData);
      
      return {
        property: {
          kind: empData.imovel?.kind || 'RURAL',
          nome: empData.imovel?.nome || '',
          car_codigo: empData.imovel?.car_codigo || null,
          situacao_car: empData.imovel?.situacao_car || null,
          municipio: empData.imovel?.municipio || '',
          uf: empData.imovel?.uf || '',
          area_total: empData.imovel?.area_total || 0,
          unidade_area: empData.imovel?.unidade_area || 'ha',
          coordenadas: empData.imovel?.coordenadas || {
            latitude: 0,
            longitude: 0,
            sistema_referencia: 'SIRGAS 2000'
          }
        },
        basic_info: {
          tipo_pessoa: empData.empreendimento?.tipo_pessoa || 'juridica',
          cnpj_cpf: empData.empreendimento?.cnpj_cpf || '',
          razao_social: empData.empreendimento?.razao_social || '',
          nome_fantasia: empData.empreendimento?.nome_fantasia || '',
          nome_empreendimento: empData.empreendimento?.nome_empreendimento || empData.empreendimento?.razao_social || '',
          numero_empregados: empData.empreendimento?.numero_empregados || 0,
          descricao: empData.empreendimento?.descricao || '',
          endereco: empData.empreendimento?.endereco || '',
          cidade: empData.empreendimento?.cidade || '',
          estado: empData.empreendimento?.estado || '',
          cep: empData.empreendimento?.cep || null,
          telefone: empData.empreendimento?.telefone || '',
          email: empData.empreendimento?.email || ''
        },
        participants: empData.participes || [],
        activities: empData.atividades || [],
        characterization: empData.caracterizacao || mockDataComplete.estrutura_completa['5_caracterizacao'].dados,
      };
    }
    
    // Se for ID 1005 (6º empreendimento extra), usa dados base com variação
    if (numericId === 1005) {
      const baseData = mockDataComplete.estrutura_completa;
      return {
        property: {
          ...baseData['1_imovel'].dados,
          nome: 'Galpão Industrial Têxtil',
          kind: 'URBANO',
          municipio: 'Blumenau',
          uf: 'SC',
          area_total: 8500,
        },
        basic_info: {
          ...baseData['2_empreendimento'].dados,
          nome_empreendimento: 'Indústria Têxtil Moderna',
          razao_social: 'Indústria Têxtil Moderna Ltda',
          cidade: 'Blumenau',
          estado: 'SC',
          numero_empregados: 320,
        },
        participants: baseData['3_participes'].dados.participants,
        activities: baseData['4_atividades'].dados.activities,
        characterization: baseData['5_caracterizacao'].dados,
      };
    }
  }
  
  // 3. Não encontrou em nenhum lugar
  console.warn('⚠️ [MOCKUP] Empreendimento não encontrado:', id);
  return null;
};

/**
 * ⏱️ Simula delay de API (opcional)
 */
export const mockDelay = async (ms: number = 500): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, ms));
};

// ==================================================
// 💾 SISTEMA DE PERSISTÊNCIA DE EMPREENDIMENTOS
// ==================================================

// Lista em memória de empreendimentos (simula banco de dados)
let mockEnterprisesList: any[] = [];

/**
 * 📝 Monta o JSON completo do empreendimento a partir do store
 * Formato igual ao usado nos testes E2E e esperado pelo backend
 */
export const buildEnterpriseJSON = (storeData: any): any => {
  console.log('🔧 [BUILD JSON] buildEnterpriseJSON chamado');
  console.log('🔧 [BUILD JSON] storeData recebido:', storeData);
  
  const {
    property,
    basic_info,
    participants,
    activities,
    characterization
  } = storeData;

  console.log('🔧 [BUILD JSON] Extraído do storeData:');
  console.log('  - property:', property);
  console.log('  - basic_info:', basic_info);
  console.log('  - participants:', participants);
  console.log('  - activities:', activities);
  console.log('  - characterization:', characterization);

  const json = {
    // 1. Dados do Imóvel
    property: {
      kind: property?.kind || 'RURAL',
      nome: property?.nome || '',
      car_codigo: property?.car_codigo || null,
      situacao_car: property?.situacao_car || null,
      municipio: property?.municipio || '',
      uf: property?.uf || '',
      area_total: property?.area_total || 0,
      unidade_area: property?.unidade_area || 'ha',
      coordenadas: {
        latitude: property?.coordenadas?.latitude || 0,
        longitude: property?.coordenadas?.longitude || 0,
        sistema_referencia: property?.coordenadas?.sistema_referencia || 'SIRGAS 2000'
      },
      endereco_completo: property?.endereco_completo || '',
      matricula: property?.matricula || null,
      bairro: property?.bairro || null,
      cep: property?.cep || null
    },

    // 2. Dados Básicos do Empreendimento
    basic_info: {
      tipo_pessoa: basic_info?.tipo_pessoa || 'juridica',
      cnpj_cpf: basic_info?.cnpj_cpf || '',
      razao_social: basic_info?.razao_social || '',
      nome_fantasia: basic_info?.nome_fantasia || '',
      nome_empreendimento: basic_info?.nome_empreendimento || basic_info?.razao_social || '',
      numero_empregados: basic_info?.numero_empregados || 0,
      descricao: basic_info?.descricao || '',
      endereco: basic_info?.endereco || '',
      cidade: basic_info?.cidade || '',
      estado: basic_info?.estado || '',
      cep: basic_info?.cep || null,
      telefone: basic_info?.telefone || '',
      email: basic_info?.email || ''
    },

    // 3. Partícipes
    participants: (participants || []).map((p: any) => ({
      pessoa_id: p.pessoa_id || null,
      pessoa_nome: p.pessoa_nome || p.nome || '',
      pessoa_cpf_cnpj: p.pessoa_cpf_cnpj || p.cpf_cnpj || '',
      tipo_pessoa: p.tipo_pessoa || 'fisica',
      papel: p.papel || '',
      telefone: p.telefone || '',
      email: p.email || '',
      principal: p.principal || false,
      crea: p.crea || null
    })),

    // 4. Atividades
    activities: (activities || []).map((a: any) => ({
      activity_id: a.activity_id || a.id,
      activity_code: a.activity_code || a.codigo,
      activity_name: a.activity_name || a.nome,
      cnae_codigo: a.cnae_codigo || '',
      cnae_descricao: a.cnae_descricao || '',
      quantidade: a.quantidade || 0,
      unidade_id: a.unidade_id || null,
      unidade_nome: a.unidade_nome || '',
      unidade_sigla: a.unidade_sigla || '',
      area_ocupada: a.area_ocupada || 0,
      area_unidade: a.area_unidade || 'm²',
      porte: a.porte || '',
      porte_id: a.porte_id || null,
      porte_descricao: a.porte_descricao || '',
      principal: a.principal || false,
      observacoes: a.observacoes || null
    })),

    // 5. Caracterização
    characterization: {
      recursos_energia: {
        usa_lenha: characterization?.recursos_energia?.usa_lenha || false,
        possui_caldeira: characterization?.recursos_energia?.possui_caldeira || false,
        possui_fornos: characterization?.recursos_energia?.possui_fornos || false,
        observacoes: characterization?.recursos_energia?.observacoes || null
      },
      combustiveis: characterization?.combustiveis || [],
      uso_agua: {
        origens_agua: characterization?.uso_agua?.origens_agua || [],
        consumo_humano: characterization?.uso_agua?.consumo_humano || 0,
        consumo_humano_unidade: characterization?.uso_agua?.consumo_humano_unidade || 'm³/dia',
        consumo_outros_usos: characterization?.uso_agua?.consumo_outros_usos || 0,
        consumo_outros_usos_unidade: characterization?.uso_agua?.consumo_outros_usos_unidade || 'm³/dia',
        consumo_total: characterization?.uso_agua?.consumo_total || 0,
        volume_despejo_diario: characterization?.uso_agua?.volume_despejo_diario || 0,
        volume_despejo_unidade: characterization?.uso_agua?.volume_despejo_unidade || 'm³/dia',
        destino_efluente: characterization?.uso_agua?.destino_efluente || '',
        tratamento_efluente: characterization?.uso_agua?.tratamento_efluente || '',
        tipo_tratamento: characterization?.uso_agua?.tipo_tratamento || '',
        observacoes: characterization?.uso_agua?.observacoes || null
      },
      residuos: {
        gera_residuos: characterization?.residuos?.gera_residuos || false,
        tipos_residuos: characterization?.residuos?.tipos_residuos || [],
        residuos_grupo_a: characterization?.residuos?.residuos_grupo_a || [],
        residuos_grupo_b: characterization?.residuos?.residuos_grupo_b || [],
        residuos_gerais: characterization?.residuos?.residuos_gerais || [],
        possui_plano_gerenciamento: characterization?.residuos?.possui_plano_gerenciamento || false,
        observacoes: characterization?.residuos?.observacoes || null
      },
      outras_informacoes: {
        perguntas_ambientais: characterization?.outras_informacoes?.perguntas_ambientais || {},
        informacoes_adicionais: characterization?.outras_informacoes?.informacoes_adicionais || ''
      }
    },

    // Metadados
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: 'mockup',
      ready_for_api: true
    }
  };

  console.log('🔧 [BUILD JSON] JSON construído:', json);
  console.log('🔧 [BUILD JSON] basic_info final:', json.basic_info);
  
  return json;
};

/**
 * 💾 Salva empreendimento no mockup (rascunho ou final)
 * Se já existe (modo edição), atualiza. Se não existe (modo criação), adiciona.
 * @param enterpriseData - Dados do empreendimento
 * @param isDraft - Se é rascunho ou final
 * @param existingId - ID existente (modo edição) ou null (modo criação)
 * @returns ID do empreendimento (existente ou novo gerado)
 */
export const saveMockEnterprise = (
  enterpriseData: any, 
  isDraft: boolean = false,
  existingId: string | number | null = null
): number => {
  // Se existingId fornecido, é EDIÇÃO. Se não, é CRIAÇÃO
  const isEdit = existingId !== null;
  const id = isEdit ? Number(existingId) : getNextEnterpriseId();
  
  const enterprise = {
    id,
    ...enterpriseData,
    status: isDraft ? 'rascunho' : 'ativo',
    saved_at: new Date().toISOString(),
    mode: isEdit ? 'edit' : 'create'
  };

  if (isEdit) {
    logMockup(`Atualizando empreendimento ${id} no mockup (${isDraft ? 'rascunho' : 'final'})`);
    
    // Remove da memória o antigo
    const index = mockEnterprisesList.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEnterprisesList.splice(index, 1);
    }
    
    // Adiciona o atualizado
    mockEnterprisesList.push(enterprise);
    
    // Atualiza no localStorage
    try {
      const stored = localStorage.getItem('mockup_enterprises');
      let list = stored ? JSON.parse(stored) : [];
      
      console.log(`📝 [MOCKUP] Modo EDIÇÃO - ID ${id} (tipo: ${typeof id})`);
      console.log(`📝 [MOCKUP] Lista ANTES:`, list.map((e: any) => `ID: ${e.id} (tipo: ${typeof e.id})`));
      
      // Remove o antigo - compara como número
      const listBefore = list.length;
      list = list.filter((e: any) => {
        const currentId = Number(e.id);
        const targetId = Number(id);
        const shouldKeep = currentId !== targetId;
        console.log(`  🔍 Comparando ${e.id} (${currentId}) !== ${id} (${targetId})? ${shouldKeep ? 'MANTER' : 'REMOVER'}`);
        return shouldKeep;
      });
      
      console.log(`📝 [MOCKUP] Removidos: ${listBefore - list.length} registros`);
      console.log(`📝 [MOCKUP] Lista DEPOIS de remover:`, list.map((e: any) => e.id));
      
      // Adiciona o atualizado
      list.push(enterprise);
      
      console.log(`📝 [MOCKUP] Lista FINAL:`, list.map((e: any) => e.id));
      
      // Remove duplicados antes de salvar (mantém apenas o último de cada ID)
      const uniqueMap = new Map();
      list.forEach((emp: any) => {
        uniqueMap.set(Number(emp.id), emp);
      });
      const uniqueList = Array.from(uniqueMap.values());
      
      if (uniqueList.length < list.length) {
        console.warn(`⚠️ [MOCKUP] Removidos ${list.length - uniqueList.length} duplicados antes de salvar`);
      }
      
      console.log(`📝 [MOCKUP] Salvando ${uniqueList.length} empreendimentos únicos no localStorage`);
      
      localStorage.setItem('mockup_enterprises', JSON.stringify(uniqueList));
      logMockup('✅ Empreendimento atualizado no localStorage com sucesso!');
    } catch (error) {
      console.error('❌ [MOCKUP] Erro ao atualizar no localStorage:', error);
      console.error('❌ [MOCKUP] Stack:', error);
    }
  } else {
    logMockup(`Criando novo empreendimento ${id} no mockup (${isDraft ? 'rascunho' : 'final'})`);
    console.log('📝 [MOCKUP] Modo CRIAÇÃO - Novo ID:', id, 'Tipo:', typeof id);
    
    // Adiciona à lista em memória
    mockEnterprisesList.push(enterprise);

    // Salva no localStorage
    try {
      const stored = localStorage.getItem('mockup_enterprises');
      const list = stored ? JSON.parse(stored) : [];
      
      console.log('📝 [MOCKUP] Lista ANTES de adicionar:', list.map((e: any) => `ID: ${e.id}`));
      
      list.push(enterprise);
      
      console.log('📝 [MOCKUP] Lista DEPOIS de adicionar:', list.map((e: any) => `ID: ${e.id}`));
      
      // Remove duplicados antes de salvar (mantém apenas o último de cada ID)
      const uniqueMap = new Map();
      list.forEach((emp: any) => {
        uniqueMap.set(Number(emp.id), emp);
      });
      const uniqueList = Array.from(uniqueMap.values());
      
      if (uniqueList.length < list.length) {
        console.warn(`⚠️ [MOCKUP] Removidos ${list.length - uniqueList.length} duplicados antes de salvar`);
      }
      
      console.log('📝 [MOCKUP] Lista FINAL (unique):', uniqueList.map((e: any) => `ID: ${e.id}`));
      console.log('📝 [MOCKUP] Salvando no localStorage:', uniqueList.length, 'empreendimentos');
      
      localStorage.setItem('mockup_enterprises', JSON.stringify(uniqueList));
      logMockup('✅ Novo empreendimento salvo no localStorage');
      
      // Verifica o que foi salvo
      const verification = localStorage.getItem('mockup_enterprises');
      const verificationParsed = verification ? JSON.parse(verification) : [];
      console.log('📝 [MOCKUP] Verificação - Salvos no localStorage:', verificationParsed.length);
      console.log('📝 [MOCKUP] Verificação - IDs:', verificationParsed.map((e: any) => e.id));
    } catch (error) {
      console.error('❌ [MOCKUP] Erro ao salvar no localStorage:', error);
      console.error('❌ [MOCKUP] Stack:', error);
    }
  }

  console.log(`📦 [MOCKUP] Empreendimento ${isEdit ? 'atualizado' : 'criado'}:`, JSON.stringify(enterprise, null, 2));
  console.log('📦 [MOCKUP] JSON pronto para API:', JSON.stringify(enterpriseData, null, 2));

  return id;
};

/**
 * 📋 Retorna lista completa de empreendimentos salvos (memória + localStorage)
 */
export const getSavedMockEnterprises = (): any[] => {
  // Carrega do localStorage se existir
  try {
    const stored = localStorage.getItem('mockup_enterprises');
    if (stored) {
      const list = JSON.parse(stored);
      logMockup(`${list.length} empreendimentos carregados do localStorage`);
      
      // Debug: mostra estrutura dos dados salvos
      console.log('📊 [MOCKUP] Estrutura dos empreendimentos salvos:');
      list.forEach((emp: any, index: number) => {
        console.log(`  [${index}] ID: ${emp.id}`);
        console.log(`      - basic_info.nome_empreendimento: ${emp.basic_info?.nome_empreendimento}`);
        console.log(`      - basic_info.razao_social: ${emp.basic_info?.razao_social}`);
        console.log(`      - property.nome: ${emp.property?.nome}`);
        console.log(`      - participants: ${emp.participants?.length || 0} itens`);
        console.log(`      - activities: ${emp.activities?.length || 0} itens`);
      });
      
      return list;
    }
  } catch (error) {
    console.warn('⚠️ [MOCKUP] Erro ao carregar do localStorage:', error);
  }

  return mockEnterprisesList;
};

/**
 * 🗑️ Limpa todos os empreendimentos salvos no mockup
 */
export const clearMockEnterprises = (): void => {
  mockEnterprisesList = [];
  localStorage.removeItem('mockup_enterprises');
  logMockup('Todos os empreendimentos mockados foram limpos');
};
