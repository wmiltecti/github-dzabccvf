/**
 * enterpriseRoutes.ts
 * Rotas da API para pesquisa e gerenciamento de empreendimentos
 * 
 * IMPORTANTE: Este é um arquivo de EXEMPLO para referência.
 * Adapte para seu backend real (Node.js/Express, Python/Flask, etc.)
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Configuração do Supabase (usar variáveis de ambiente)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Middleware para verificar autenticação
 */
async function authenticate(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('[authenticate] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar autenticação'
    });
  }
}

/**
 * GET /api/v1/enterprises/search?query=xxx
 * Busca empreendimentos por CNPJ, CPF, Razão Social ou Nome Fantasia
 * Requer: Autenticação
 */
router.get('/search', authenticate, async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "query" é obrigatório e não pode estar vazio'
      });
    }

    const searchTerm = query.trim();
    const cleanedQuery = searchTerm.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Buscar em pessoas jurídicas
    const { data: pj, error: pjError } = await supabase
      .from('pessoas_juridicas')
      .select('id, cnpj as cnpj_cpf, razao_social, nome_fantasia, endereco, cidade, estado, cep, telefone, email, created_at, updated_at')
      .or(`cnpj.ilike.%${searchTerm}%,razao_social.ilike.%${searchTerm}%,nome_fantasia.ilike.%${searchTerm}%`)
      .limit(20);

    if (pjError) {
      console.error('[GET /enterprises/search] Erro ao buscar PJ:', pjError);
    }

    // Buscar em pessoas físicas
    const { data: pf, error: pfError } = await supabase
      .from('pessoas_fisicas')
      .select('id, cpf as cnpj_cpf, nome_completo, endereco, cidade, estado, cep, telefone, email, created_at, updated_at')
      .or(`cpf.ilike.%${searchTerm}%,nome_completo.ilike.%${searchTerm}%`)
      .limit(20);

    if (pfError) {
      console.error('[GET /enterprises/search] Erro ao buscar PF:', pfError);
    }

    // Combinar resultados
    const allResults = [
      ...(pj || []).map(item => ({ ...item, tipo_pessoa: 'juridica' as const })),
      ...(pf || []).map(item => ({ ...item, tipo_pessoa: 'fisica' as const }))
    ];

    // Ordenar por relevância (busca exata tem prioridade)
    const sorted = allResults.sort((a, b) => {
      const aExact = a.cnpj_cpf === cleanedQuery || 
                     a.razao_social?.toLowerCase() === searchTerm.toLowerCase() ||
                     (a as any).nome_completo?.toLowerCase() === searchTerm.toLowerCase();
      const bExact = b.cnpj_cpf === cleanedQuery || 
                     b.razao_social?.toLowerCase() === searchTerm.toLowerCase() ||
                     (b as any).nome_completo?.toLowerCase() === searchTerm.toLowerCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    if (sorted.length === 0) {
      return res.status(404).json({
        success: false,
        data: [],
        count: 0,
        message: 'Nenhum empreendimento encontrado com os critérios informados'
      });
    }

    return res.status(200).json({
      success: true,
      data: sorted,
      count: sorted.length
    });
  } catch (error: any) {
    console.error('[GET /enterprises/search] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/enterprises/:id
 * Busca um empreendimento específico por ID
 * Requer: Autenticação
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do empreendimento não fornecido'
      });
    }

    // Tentar buscar em pessoas jurídicas
    const { data: pj, error: pjError } = await supabase
      .from('pessoas_juridicas')
      .select('id, cnpj as cnpj_cpf, razao_social, nome_fantasia, endereco, cidade, estado, cep, telefone, email, created_at, updated_at')
      .eq('id', id)
      .single();

    if (!pjError && pj) {
      return res.status(200).json({
        success: true,
        data: { ...pj, tipo_pessoa: 'juridica' }
      });
    }

    // Se não encontrou em PJ, buscar em pessoas físicas
    const { data: pf, error: pfError } = await supabase
      .from('pessoas_fisicas')
      .select('id, cpf as cnpj_cpf, nome_completo, endereco, cidade, estado, cep, telefone, email, created_at, updated_at')
      .eq('id', id)
      .single();

    if (!pfError && pf) {
      return res.status(200).json({
        success: true,
        data: { ...pf, tipo_pessoa: 'fisica' }
      });
    }

    // Não encontrado em nenhuma tabela
    return res.status(404).json({
      success: false,
      message: 'Empreendimento não encontrado'
    });
  } catch (error: any) {
    console.error('[GET /enterprises/:id] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/enterprises
 * Cria um novo empreendimento (PF ou PJ)
 * Requer: Autenticação
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { tipo_pessoa, cnpj_cpf, ...otherData } = req.body;

    // Validações
    if (!tipo_pessoa || !['fisica', 'juridica'].includes(tipo_pessoa)) {
      return res.status(400).json({
        success: false,
        message: 'Campo "tipo_pessoa" é obrigatório e deve ser "fisica" ou "juridica"'
      });
    }

    if (!cnpj_cpf) {
      return res.status(400).json({
        success: false,
        message: tipo_pessoa === 'juridica' ? 'CNPJ é obrigatório' : 'CPF é obrigatório'
      });
    }

    // Determinar tabela e campo
    const tableName = tipo_pessoa === 'juridica' ? 'pessoas_juridicas' : 'pessoas_fisicas';
    const documentField = tipo_pessoa === 'juridica' ? 'cnpj' : 'cpf';

    // Verificar se já existe
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq(documentField, cnpj_cpf)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `${tipo_pessoa === 'juridica' ? 'CNPJ' : 'CPF'} já cadastrado`
      });
    }

    // Preparar dados para inserção
    const insertData = {
      [documentField]: cnpj_cpf,
      ...otherData
    };

    // Inserir
    const { data, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[POST /enterprises] Erro ao criar:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar empreendimento',
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      data: { 
        ...data, 
        cnpj_cpf, 
        tipo_pessoa 
      },
      message: 'Empreendimento criado com sucesso'
    });
  } catch (error: any) {
    console.error('[POST /enterprises] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

export default router;

/**
 * INTEGRAÇÃO NO SERVIDOR PRINCIPAL (app.ts ou server.ts):
 * 
 * import enterpriseRoutes from './routes/enterpriseRoutes';
 * app.use('/api/v1/enterprises', enterpriseRoutes);
 */
