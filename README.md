# 2026-1 MeasureSoftGram Frontend

Frontend repository of MeasureSoftGram application in 2026.1.

## Badges
<!--
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=bugs)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=coverage)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![codecov](https://codecov.io/gh/fga-eps-mds/2023-1-MeasureSoftGram-Front/branch/develop/graph/badge.svg?token=A76GCxS118)](https://codecov.io/gh/fga-eps-mds/2023-1-MeasureSoftGram-Front)

<br>

<img src="https://codecov.io/gh/fga-eps-mds/2023-1-MeasureSoftGram-Front/branch/develop/graphs/sunburst.svg?token=A76GCxS118" width="128"/>
 -->
 🚧 Work in Progress 🚧

## Requirements
### Local development (without Docker)
- Node.js `20.x`
- `corepack` enabled
- `pnpm` `10.x`
### Development with Docker
- Docker
- Docker Compose v.2
---

## Environment configuration
Create the `.env` file at the root of the project:
```bash
cp .env.example .env
```

Make sure to set the URL for your backend API.

## Running with Docker (recommended)

### 1) Subir Containers

```bash
docker compose up --build
```

Aplicação disponível em http://localhost:3000

### 2) Parar containers

```bash
docker compose down
```

### 3) Scripts Úteis

- Rodar linter:
```bash
make lint
```
- Rodar testes:
```bash
make test
```

- Rodar testes no modo CI:
```bash
make ci-test
```

- Build de Produção
```bash
make build
make start
```

- Comandos personalizados
```bash
make pnpm SCRIPT=<script> [ARGS="..."]
```
permite executar qualquer script do `package.json` dentro do container, passando argumentos adicionais se desejado.

Exemplo:
```bash
make pnpm SCRIPT=build
```
ou
```bash
make pnpm SCRIPT=test ARGS="src/pages"
```


## Rodar localmente (sem Docker)

Primeiramente garanta que está utilizando a versão 20 do Node. Ferramentas para gerenciamento de versões Node como `nvm` e `n` podem ser úteis.

### 1) Ativar pnpm

```bash
corepack enable
corepack prepare pnpm@10.15.0 --activate
pnpm -v
```

### 2) Instalar dependências

```bash
pnpm install
```

### 3) Subir o projeto

```bash
pnpm dev
```
Aplicação disponível em: http://localhost:3000

### 4) Scripts úteis

- Rodar linter:
```bash
pnpm lint
```
- Rodar testes:
```bash
pnpm test
```
- Rodar testes no modo CI:
```bash
pnpm run ci:test
```

- Build de produção:
```bash
pnpm build
pnpm start
```


## Troubleshooting

### Erro de versão do Node com pnpm
Se aparecer algo como: This version of pnpm requires at least Node.js v18.12

Garanta que você está usando Node 20:
```bash
node -v
v20.20.2
```

### Erro de permissão no `.next` (`EACCES`)
Se aparecer erro ao rodar pnpm dev:
```bash
sudo chown -R $USER:$USER .next node_modules .pnpm-store
chmod -R u+rwX .next
rm -rf .next
pnpm dev
```
> Evite rodar comandos de node/pnpm com sudo dentro do projeto.
