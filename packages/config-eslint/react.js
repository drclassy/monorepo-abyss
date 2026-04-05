import { base } from './base.js'

/** @type {import('eslint').Linter.Config[]} */
export const react = [
  ...base,
  {
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
