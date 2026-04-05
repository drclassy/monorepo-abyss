import { base } from './base.js'

/** @type {import('eslint').Linter.Config[]} */
export const node = [
  ...base,
  {
    rules: {
      'no-console': 'off',
    },
  },
]
