// Links externos publicos exibidos na landing.
// Centralizados aqui para facilitar a manutencao caso as URLs publicas mudem.

export const EXTERNAL_LINKS = {
  // Documentacao publica (GitHub Pages do repositorio de documentacao).
  docs: 'https://fga-eps-mds.github.io/2026.1-MeasureSoftGram-DOC/',
  // Organizacao no GitHub que reune os repositorios do projeto.
  repositories: 'https://github.com/fga-eps-mds',
};

// Rota interna de acesso ao sistema. Usuario logado e redirecionado ao
// dashboard pelo proprio fluxo de autenticacao; deslogado cai no login.
export const APP_ENTRY_ROUTE = '/auth';

// URL publica canonica da landing, usada nas tags Open Graph / Twitter Card
// para que o preview do link (WhatsApp, Slack, redes sociais) aponte sempre
// para o dominio de producao.
export const SITE_URL = 'https://msgram.lappis.rocks/';

// Imagem usada no preview do link. Aponta para um asset PNG existente do
// projeto (logo) para garantir que o crawler de OpenGraph encontre algo valido.
export const OG_IMAGE_PATH = '/images/png/logo.png';
