-- ============================================
-- FIX: Garantir que todas as atividades têm is_active=true
-- Data: 2025-11-11
-- ============================================

-- 1. Ver estado atual
SELECT 
  code, 
  name, 
  is_active, 
  CASE WHEN is_active IS NULL THEN '⚠️ NULL' 
       WHEN is_active = true THEN '✅ TRUE' 
       ELSE '❌ FALSE' 
  END as status
FROM activities 
ORDER BY code;

-- 2. Atualizar todos para is_active=true
UPDATE activities 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;

-- 3. Verificar após atualização
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
  COUNT(CASE WHEN is_active IS NULL THEN 1 END) as nulos,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inativos
FROM activities;

-- 4. Listar todas ativas
SELECT code, name, is_active 
FROM activities 
WHERE is_active = true 
ORDER BY code;
