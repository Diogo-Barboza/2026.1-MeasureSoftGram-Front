# Estágio 1: Instalação de dependências
FROM node:18-alpine AS deps
# Adicionado para compatibilidade de algumas libs nativas no Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src

# Copia apenas os arquivos de pacotes para aproveitar o cache de camadas
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Estágio 2: Build da aplicação
FROM node:18-alpine AS builder
WORKDIR /usr/src

COPY --from=deps /usr/src/node_modules ./node_modules
COPY . .

# Desabilita telemetria do Next.js (comum nesse projeto)
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Estágio 3: Runner (Imagem final leve)
FROM node:18-alpine AS runner
WORKDIR /usr/src

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Segurança: Rodar como usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /usr/src/public ./public
COPY --from=builder /usr/src/package.json ./package.json

# Copia o build e as dependências instaladas
COPY --from=builder --chown=nextjs:nodejs /usr/src/.next ./.next
COPY --from=builder /usr/src/node_modules ./node_modules

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
