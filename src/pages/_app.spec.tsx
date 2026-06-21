import React from 'react';
import { render } from '@testing-library/react';

/**
 * Prova da correcao da deteccao de idioma no _app.
 *
 * Bug original: o _app chamava useSyncLanguage(savedLocale ?? undefined). O
 * useSyncLanguage do ni18n faz `if (i18n.language !== language)
 * changeLanguage(language)`. Como i18n.language nunca e undefined, passar
 * undefined (quando NAO ha 'locale_lang' salvo) disparava
 * changeLanguage(undefined) em todo ciclo, sobrescrevendo o LanguageDetector do
 * navegador.
 *
 * Correcao: sincronizar so quando ha um valor salvo valido. Sem escolha salva,
 * o LanguageDetector (n18n.config.js) decide pelo navegador e nada chama
 * changeLanguage.
 */

// changeLanguage compartilhado entre o mock e as assercoes. O idioma atual e
// controlavel para simular o que o LanguageDetector ja resolveu pelo navegador.
const changeLanguage = jest.fn();
let currentLanguage = 'en'; // idioma "detectado pelo navegador" por default

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      get language() {
        return currentLanguage;
      },
      changeLanguage,
    },
  }),
}));

// appWithI18Next so envolve o app com o I18nextProvider; aqui ele e passthrough
// para exercitar a logica de sincronizacao de idioma do proprio MyApp.
jest.mock('ni18n', () => ({
  appWithI18Next: (App: React.ComponentType<any>) => App,
}));

// Providers pesados (auth com timers, contexts, theme) viram passthrough: o que
// importa neste teste e o efeito de sincronizacao de idioma, nao a arvore.
// Cada factory devolve o proprio passthrough (jest.mock e hoisted acima das
// declaracoes de modulo) e retorna children direto para nao criar fragmentos
// de filho unico.
jest.mock('@components/Theme', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => children as React.ReactElement,
}));
jest.mock('@components/snackbar', () => ({
  __esModule: true,
  SnackbarProvider: ({ children }: { children?: React.ReactNode }) => children as React.ReactElement,
}));
jest.mock('@contexts/Auth', () => ({
  __esModule: true,
  AuthProvider: ({ children }: { children?: React.ReactNode }) => children as React.ReactElement,
}));
jest.mock('@contexts/OrganizationProvider', () => ({
  __esModule: true,
  OrganizationProvider: ({ children }: { children?: React.ReactNode }) => children as React.ReactElement,
}));
jest.mock('@contexts/RepositoryProvider', () => ({
  __esModule: true,
  RepositoryProvider: ({ children }: { children?: React.ReactNode }) => children as React.ReactElement,
}));
jest.mock('@contexts/ProductProvider', () => ({
  __esModule: true,
  ProductProvider: ({ children }: { children?: React.ReactNode }) => children as React.ReactElement,
}));
jest.mock('react-toastify', () => ({ __esModule: true, ToastContainer: () => null }));
jest.mock('react-toastify/dist/ReactToastify.css', () => ({}), { virtual: true });
jest.mock('react-loader-spinner', () => ({ __esModule: true, RotatingLines: () => null }));

// O _app assina router.events (routeChangeStart/Complete, beforeHistoryChange).
// O mock global do jestSetup nao expoe `events`, entao fornecemos um aqui.
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    query: {},
    asPath: '/',
    pathname: '/',
  }),
}));

// eslint-disable-next-line import/first, global-require
import MyApp from './_app.next';

const renderApp = () => {
  const Component: any = () => <div data-testid="page">page</div>;
  Component.getLayout = (page: React.ReactElement) => page;
  return render(<MyApp Component={Component} pageProps={{}} router={{} as any} />);
};

describe('_app: deteccao vs escolha manual de idioma', () => {
  beforeEach(() => {
    changeLanguage.mockClear();
    currentLanguage = 'en';
    window.localStorage.clear();
  });

  it('sem locale_lang salvo, NAO chama changeLanguage(undefined) e o idioma do navegador prevalece', () => {
    // localStorage vazio => savedLocale === null
    renderApp();

    // O bug fazia changeLanguage(undefined) rodar aqui. Agora nao deve haver
    // chamada nenhuma: o LanguageDetector mantem o idioma do navegador ('en').
    expect(changeLanguage).not.toHaveBeenCalled();
    expect(changeLanguage).not.toHaveBeenCalledWith(undefined);
    expect(currentLanguage).toBe('en');
  });

  it('com locale_lang salvo e diferente do atual, a escolha manual prevalece', () => {
    currentLanguage = 'en'; // navegador resolveu 'en'
    window.localStorage.setItem('locale_lang', 'pt'); // usuario escolheu 'pt'

    renderApp();

    expect(changeLanguage).toHaveBeenCalledTimes(1);
    expect(changeLanguage).toHaveBeenCalledWith('pt');
  });

  it('com locale_lang salvo igual ao idioma atual, nao redispara changeLanguage', () => {
    currentLanguage = 'pt';
    window.localStorage.setItem('locale_lang', 'pt');

    renderApp();

    expect(changeLanguage).not.toHaveBeenCalled();
  });
});
