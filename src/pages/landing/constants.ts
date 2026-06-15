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
