import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '**/*.md',
    '**/*.yaml',
    '**/*.yml',
  ],
  rules: {
    '@typescript-eslint/no-namespace': 'off',
    'react/no-unknown-property': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'off',
    'no-restricted-syntax': 'off',
    'no-void': 'off',
    'unicorn/prefer-number-properties': 'off',
    'ts/ban-types': 'off',
    'node/prefer-global/process': 'off',
  },
})
