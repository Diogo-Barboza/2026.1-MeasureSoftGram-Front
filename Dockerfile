# syntax=docker/dockerfile:1

# =============================================================================
# Dockerfile de PRODUCAO (multistage) - MeasureSoftGram Front (Next.js 12)
# -----------------------------------------------------------------------------
# Stages:
#   base    -> imagem comum (Node 20 alpine + corepack/pnpm)
#   deps    -> instala TODAS as dependencias (necessarias pro build)
#   builder -> roda `pnpm build` (next build), com SERVICE_URL inlined
#   runner  -> runtime enxuto que roda `next start` com deps de producao
#
# IMPORTANTE - SERVICE_URL e BUILD-TIME, NAO RUNTIME:
#   next.config.js expoe SERVICE_URL via bloco `env:` e o codigo cliente
#   (src/shared/services/api.ts) le `process.env.SERVICE_URL`. O Next.js
#   INLINA esse valor no bundle do browser DURANTE O BUILD. Logo, a URL da API
#   e fixada na imagem no momento do `pnpm build` e NAO pode ser trocada em
#   runtime sem rebuildar. Por isso SERVICE_URL entra como build-arg (ARG/ENV
#   no stage builder). Trocar a URL exige nova build da imagem.
#   ignoreBuildErrors:true (next.config.js) e proposital: erros de TS antigos
#   nao bloqueiam o build de producao - mantido como esta.
# =============================================================================

# ---- base ----
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
# package.json declara packageManager pnpm@9.0.0 -> corepack resolve a versao
RUN corepack enable
WORKDIR /app

# ---- deps ----
# Instala todas as dependencias (dev + prod) - necessarias pro `next build`.
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- builder ----
# Roda o build de producao. SERVICE_URL e demais envs publicos sao inlined aqui.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# build-args inlined no bundle (build-time). Default aponta pro /api atras do
# proxy. Sobrescreva via --build-arg no CI conforme o ambiente.
ARG SERVICE_URL=https://msgram.lappis.rocks/api
ARG LOGIN_REDIRECT_URL
ARG GITHUB_CLIENT_ID
ENV SERVICE_URL=$SERVICE_URL
ENV LOGIN_REDIRECT_URL=$LOGIN_REDIRECT_URL
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ---- prod-deps ----
# node_modules apenas de producao, pra imagem final enxuta.
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---- runner ----
# Runtime: serve a app com `next start` (sem output:standalone; o projeto nao
# usa SSR/getServerSideProps, mas next start cobre rotas dinamicas e assets).
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# usuario nao-root
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -G nodejs -S nextjs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder  /app/.next ./.next
COPY --from=builder  /app/public ./public
COPY --from=builder  /app/package.json ./package.json
COPY --from=builder  /app/next.config.js ./next.config.js

USER nextjs

EXPOSE 3000

# next start (package.json:9 -> "start": "next start")
CMD ["pnpm", "start"]
