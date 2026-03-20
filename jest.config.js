const aliases = require('./settings/alias').reduce((acc, alias) => {
  acc[`^${alias.name}(.*)$`] = `<rootDir>${alias.path}$1`;
  return acc;
}, {});

module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  testRegex: '((\\.|/*.)(spec))\\.tsx?$',
  coverageDirectory: 'coverage',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest', // Adiciona suporte para arquivos TypeScript
    '^.+\\.(js|jsx|mjs|cjs)$': 'babel-jest' // Adiciona suporte para arquivos JavaScript
  },
  transformIgnorePatterns: ['/node_modules/(?!(d3-array|d3-scale|@mui/x-charts|@babel/runtime)/)'],
  moduleNameMapper: {
    ...aliases,
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock de arquivos de estilo
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js', // Mock de arquivos SVG
    '^next/image$': '<rootDir>/__mocks__/next/ImageMock.js' // Mock do next/image
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFiles: ['<rootDir>/tests/jestSetup.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testEnvironment: 'jsdom',
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
