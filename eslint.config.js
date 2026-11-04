import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/dist-native/**',
      '**/android/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/scripts/**',
      '**/public/**',
      '**/.cache/**',
      '**/tools/**',
      '**/scratch/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/platform/**',
      'src/lib/indexedStorage.ts',
      '**/*.test.{ts,tsx}',
    ],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message:
            'Direct localStorage is banned. Use appStorage from src/platform/storage.ts instead.',
        },
        {
          name: 'indexedDB',
          message:
            'Direct indexedDB is banned. Use src/lib/indexedStorage.ts or platform instead.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.name='window'][property.name='localStorage']",
          message:
            'Direct window.localStorage is banned. Use appStorage from src/platform/storage.ts instead.',
        },
        {
          selector:
            "MemberExpression[object.name='window'][property.name='indexedDB']",
          message:
            'Direct window.indexedDB is banned. Use src/lib/indexedStorage.ts instead.',
        },
      ],
    },
  },
  {
    files: ['qa/**/*.{ts,js,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  eslintConfigPrettier,
)
