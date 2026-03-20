module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource: '@emotion/react'
        }
      }
    ]
  ],

  plugins: [
    ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
    ['styled-components', { ssr: true }],
    '@emotion/babel-plugin'
  ]
};
