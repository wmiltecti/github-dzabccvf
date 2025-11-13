#!/bin/sh

# Script para injetar variáveis de ambiente no build do Vite em runtime
# Isso permite que as variáveis VITE_* sejam configuradas via Docker/Portainer

set -e

# Diretório dos arquivos estáticos
HTML_DIR="/usr/share/nginx/html"

# Encontra o arquivo JS principal (geralmente index-*.js)
JS_FILES=$(find ${HTML_DIR}/assets -name "index-*.js" 2>/dev/null || true)

if [ -n "$JS_FILES" ]; then
  echo "Injetando variáveis de ambiente nos arquivos JS..."
  
  for file in $JS_FILES; do
    echo "Processando: $file"
    
    # Substitui placeholders por variáveis de ambiente
    # IMPORTANTE: Estas substituições funcionam se você usar process.env no código
    # Para Vite, as variáveis já são injetadas no build, então este passo é opcional
    
    if [ -n "$VITE_SUPABASE_URL" ]; then
      sed -i "s|VITE_SUPABASE_URL_PLACEHOLDER|$VITE_SUPABASE_URL|g" "$file" 2>/dev/null || true
    fi
    
    if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
      sed -i "s|VITE_SUPABASE_ANON_KEY_PLACEHOLDER|$VITE_SUPABASE_ANON_KEY|g" "$file" 2>/dev/null || true
    fi
    
    if [ -n "$VITE_API_BASE_URL" ]; then
      sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|$VITE_API_BASE_URL|g" "$file" 2>/dev/null || true
    fi
  done
  
  echo "Variáveis de ambiente injetadas com sucesso!"
else
  echo "Nenhum arquivo JS encontrado para injeção de variáveis."
fi

# Substitui placeholder no nginx.conf se API_PROXY_URL estiver definido
if [ -n "$API_PROXY_URL" ]; then
  sed -i "s|\${API_PROXY_URL}|$API_PROXY_URL|g" /etc/nginx/conf.d/default.conf
else
  # Remove a seção de proxy se não houver API_PROXY_URL
  sed -i '/location \/api {/,/}/d' /etc/nginx/conf.d/default.conf
fi

echo "Iniciando NGINX..."
exec "$@"
