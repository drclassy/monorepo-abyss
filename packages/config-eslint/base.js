import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import importX from 'eslint-plugin-import-x'

/** @type {import('eslint').Linter.Config[]} */
export const base = [
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    plugins: {
      'import-x': importX,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'error',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**', '**/.turbo/**', '**/coverage/**'],
  },
]

/** Domain boundary rules — prevents cross-domain imports */
export const boundaries = [
  {
    files: ['apps/healthcare/**/*.ts', 'apps/healthcare/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/apps/academic/**'], message: 'Healthcare cannot import from Academic domain.' },
            { group: ['**/apps/incubator/**'], message: 'Healthcare cannot import from Incubator domain.' },
            { group: ['**/apps/internal/**'], message: 'Healthcare cannot import from Internal domain.' },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/academic/**/*.ts', 'apps/academic/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/apps/healthcare/**'], message: 'Academic cannot import from Healthcare domain.' },
            { group: ['**/apps/incubator/**'], message: 'Academic cannot import from Incubator domain.' },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/incubator/**/*.ts', 'apps/incubator/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/apps/healthcare/**'], message: 'Incubator cannot import from Healthcare domain.' },
          ],
        },
      ],
    },
  },
]
