# =============================================================================
# Fábrica de Trecos — imagem de produção
# Estágio 1 compila o site; a imagem final não carrega nada do build junto.
# =============================================================================

# ---- Estágio 1: compila o site estático ------------------------------------
FROM node:24-alpine AS construtor

WORKDIR /app

# As dependências mudam menos que o código: copiar só o manifesto primeiro
# faz o Docker reaproveitar esta camada na maioria dos builds.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Estágio 2: dependências do servidor -----------------------------------
FROM node:24-alpine AS deps-servidor

WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---- Estágio 3: imagem final -----------------------------------------------
FROM node:24-alpine AS producao

# dumb-init trata sinais direito: sem ele o Node vira PID 1 e ignora SIGTERM,
# fazendo todo `docker stop` esperar os 10s de timeout.
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production \
    PORT=3000 \
    DIR_ESTATICO=/app/dist \
    DIR_DADOS=/data

WORKDIR /app

COPY --from=deps-servidor /app/server/node_modules ./server/node_modules
COPY --chown=node:node server/ ./server/
COPY --from=construtor --chown=node:node /app/dist ./dist

# volume do token e do cache do feed
RUN mkdir -p /data && chown node:node /data
VOLUME ["/data"]

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/saude').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]
