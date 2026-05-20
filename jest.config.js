const nextJest = require('next/jest');

// Carrega o ambiente do Next.js (lê next.config.js e arquivos .env)
const createJestConfig = nextJest({
  dir: './',
});

const aliases = require('./settings/alias').reduce((acc, alias) => {
  acc[`^${alias.name}(.*)$`] = `<rootDir>${alias.path}$1`;
  return acc;
}, {});

/** @type {import('jest').Config} */
const customJestConfig = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/styles.ts',
    '!<rootDir>/src/**/index.{ts,tsx}', 
    '!<rootDir>/src/**/*.page.{ts,tsx}',
    '!<rootDir>/src/**/*.next.{ts,tsx}',
    '!<rootDir>/src/shared/services/subCharacteristics.ts'
  ],
  testRegex: '((\\.|/*.)(spec))\\.tsx?$',

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    'styles\\.(ts|tsx)$',
    '/Theme/',
    'index\\.(page\\.)?(ts|tsx)$'
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'html', 'json'],

  testEnvironment: 'jest-environment-jsdom',

  // Carrega os arquivos de setup
  setupFiles: ['<rootDir>/tests/jestSetup.ts'],

  // Mais tipos de expect para testes
  setupFilesAfterEnv: ['@testing-library/jest-dom'],

  // Mapeia os aliases para os caminhos dos arquivos
  moduleNameMapper: {
    ...aliases,
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^next/image$': '<rootDir>/__mocks__/next/ImageMock.js'
  },

  reporters: [
    'default',
    [
      'jest-sonar',
      {
        outputDirectory: '.',
        outputName: 'coverage.xml'
      }
    ]
  ]
};

// Exporta a configuração combinando o padrão do Next com a configuração customizada
module.exports = createJestConfig(customJestConfig);