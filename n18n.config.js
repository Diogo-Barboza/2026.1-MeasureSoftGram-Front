import LanguageDetectorImport from 'i18next-browser-languagedetector';

// Normaliza o import entre os contextos ESM (Next runtime) e CJS (jest), onde a
// interop pode entregar o detector como `default` ou diretamente como o modulo.
const LanguageDetector = LanguageDetectorImport.default || LanguageDetectorImport;

const supportedLngs = ['en', 'pt'];

export const ni18nConfig = {
  fallbackLng: supportedLngs,
  supportedLngs,
  // Deteccao automatica do idioma na carga inicial. A ordem garante que uma
  // escolha manual previamente salva (chave 'locale_lang', usada pelo seletor
  // de idioma) tenha prioridade sobre o idioma do navegador. So quando nao ha
  // escolha salva e que o navigator e consultado, com fallback para os
  // supportedLngs. 'caches' vazio evita que o detector escreva por conta
  // propria; quem grava 'locale_lang' continua sendo o seletor de idioma.
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    lookupLocalStorage: 'locale_lang',
    caches: []
  },
  // Plugins do i18next (equivalente a i18n.use(...)). O LanguageDetector so
  // atua no cliente; no servidor o `lng` e definido explicitamente.
  use: [LanguageDetector],
  ns: [
    'translation',
    'landing',
    'home',
    'about',
    'sidebar',
    'settings',
    'releases',
    'repositories',
    'overview',
    'header',
    'lates_value_table',
    'graphic_chart'
  ],
  react: {
    useSuspense: false
  }
};
