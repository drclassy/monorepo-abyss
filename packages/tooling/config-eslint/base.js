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
    ignores: [
      '**/dist/**',
      '**/docs/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/.output/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
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
            {
              group: ['**/apps/academic/**'],
              message: 'Healthcare cannot import from Academic domain.',
            },
            {
              group: ['**/apps/incubator/**'],
              message: 'Healthcare cannot import from Incubator domain.',
            },
            {
              group: ['**/apps/internal/**'],
              message: 'Healthcare cannot import from Internal domain.',
            },
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
            {
              group: ['**/apps/healthcare/**'],
              message: 'Academic cannot import from Healthcare domain.',
            },
            {
              group: ['**/apps/incubator/**'],
              message: 'Academic cannot import from Incubator domain.',
            },
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
            {
              group: ['**/apps/healthcare/**'],
              message: 'Incubator cannot import from Healthcare domain.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'packages/shared/**/*.ts',
      'packages/shared/**/*.tsx',
      'packages/shared/**/*.js',
      'packages/shared/**/*.mjs',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@sentra/*',
                '@the-abyss/database',
                '@the-abyss/langflow-client',
                '@the-abyss/document-ingestion',
                '@the-abyss/literature-harvester',
                '@the-abyss/clinical-references',
                'apps/*',
                '@/apps/*',
                '**/apps/**',
              ],
              message:
                'Shared packages may depend only on shared primitives, not sentra/platform/clinical packages or apps.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'packages/platform/**/*.ts',
      'packages/platform/**/*.tsx',
      'packages/platform/**/*.js',
      'packages/platform/**/*.mjs',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@sentra/*', 'apps/*', '@/apps/*', '**/apps/**'],
              message: 'Platform packages must not import sentra crown-jewel packages or apps.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'packages/clinical/**/*.ts',
      'packages/clinical/**/*.tsx',
      'packages/clinical/**/*.js',
      'packages/clinical/**/*.mjs',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@sentra/*', 'apps/*', '@/apps/*', '**/apps/**'],
              message:
                'Clinical substrate packages must not import sentra crown-jewel packages or apps.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'packages/sentra/**/*.ts',
      'packages/sentra/**/*.tsx',
      'packages/sentra/**/*.js',
      'packages/sentra/**/*.mjs',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['apps/*', '@/apps/*', '**/apps/**'],
              message: 'Sentra crown-jewel packages must not import apps.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'packages/platform/**/*.ts',
      'packages/platform/**/*.tsx',
      'packages/clinical/**/*.ts',
      'packages/clinical/**/*.tsx',
      'packages/sentra/**/*.ts',
      'packages/sentra/**/*.tsx',
      'apps/**/*.ts',
      'apps/**/*.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@the-abyss/config-eslint', '@the-abyss/config-typescript'],
              message: 'Runtime packages and apps must not import tooling packages.',
            },
          ],
        },
      ],
    },
  },
]
