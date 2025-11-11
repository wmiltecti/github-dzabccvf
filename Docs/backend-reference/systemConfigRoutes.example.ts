/**
 * systemConfigRoutes.ts
 * Rotas da API para gerenciamento de configurações do sistema
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
 * Extrai e valida o token JWT do header Authorization
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

    // Anexa o usuário ao request para uso posterior
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
 * Middleware para verificar se o usuário é admin
 */
function requireAdmin(req: Request, res: Response, next: Function) {
  const user = (req as any).user;
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role;

  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem realizar esta operação.'
    });
  }

  next();
}

/**
 * GET /api/v1/system-config
 * Busca todas as configurações ativas do sistema
 * Requer: Autenticação
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('system_configurations')
      .select('*')
      .eq('is_active', true)
      .order('config_key', { ascending: true });

    if (error) {
      console.error('[GET /system-config] Erro Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar configurações do sistema',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('[GET /system-config] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/system-config/:key
 * Busca uma configuração específica por chave
 * Requer: Autenticação
 */
router.get('/:key', authenticate, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Chave de configuração não fornecida'
      });
    }

    const { data, error } = await supabase
      .from('system_configurations')
      .select('*')
      .eq('config_key', key)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: `Configuração '${key}' não encontrada`
        });
      }

      console.error(`[GET /system-config/${key}] Erro Supabase:`, error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar configuração',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('[GET /system-config/:key] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/system-config/:key
 * Atualiza o valor de uma configuração específica
 * Requer: Autenticação + Permissão de Admin
 */
router.put('/:key', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { config_value } = req.body;

    // Validações
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Chave de configuração não fornecida'
      });
    }

    if (typeof config_value !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Valor da configuração deve ser booleano (true/false)'
      });
    }

    // Buscar configuração existente
    const { data: existingConfig, error: fetchError } = await supabase
      .from('system_configurations')
      .select('*')
      .eq('config_key', key)
      .eq('is_active', true)
      .single();

    if (fetchError || !existingConfig) {
      return res.status(404).json({
        success: false,
        message: `Configuração '${key}' não encontrada`
      });
    }

    // Atualizar configuração
    const { data: updatedConfig, error: updateError } = await supabase
      .from('system_configurations')
      .update({ 
        config_value,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', key)
      .select()
      .single();

    if (updateError) {
      console.error(`[PUT /system-config/${key}] Erro ao atualizar:`, updateError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar configuração',
        error: updateError.message
      });
    }

    // Log da ação (opcional - pode adicionar tabela de auditoria)
    console.log(`[AUDIT] Admin ${(req as any).user.email} atualizou config '${key}' para ${config_value}`);

    return res.status(200).json({
      success: true,
      data: updatedConfig,
      message: `Configuração '${key}' atualizada com sucesso`
    });
  } catch (error: any) {
    console.error('[PUT /system-config/:key] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/system-config
 * Cria uma nova configuração (apenas para referência - normalmente não usado em produção)
 * Requer: Autenticação + Permissão de Admin
 */
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { config_key, config_value, config_description } = req.body;

    // Validações
    if (!config_key || typeof config_value !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: config_key (string), config_value (boolean)'
      });
    }

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('system_configurations')
      .select('config_key')
      .eq('config_key', config_key)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Configuração '${config_key}' já existe`
      });
    }

    // Inserir nova configuração
    const { data, error } = await supabase
      .from('system_configurations')
      .insert({
        config_key,
        config_value,
        config_description: config_description || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /system-config] Erro ao criar:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar configuração',
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      data: data,
      message: 'Configuração criada com sucesso'
    });
  } catch (error: any) {
    console.error('[POST /system-config] Erro:', error);
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
 * import systemConfigRoutes from './routes/systemConfigRoutes';
 * app.use('/api/v1/system-config', systemConfigRoutes);
 */
