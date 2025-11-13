# Etapa 1: Build da aplicação
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci --only=production=false

# Copia o restante do código
COPY . .

# Build da aplicação para produção
# As variáveis de ambiente serão injetadas via Docker/Portainer
RUN npm run build

# Etapa 2: Servidor de produção com NGINX
FROM nginx:alpine

# Copia o build da etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração customizada do NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Script para injetar variáveis de ambiente no runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Inicia o NGINX
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
