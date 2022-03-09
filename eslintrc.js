module.exports = {
  env: {
    // browser: true,
    es6: true,
    node: true
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    semi: 0,
    // 'prettier/prettier': 2,
    // '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }]
  }
}
