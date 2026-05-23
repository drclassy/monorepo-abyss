import { base, boundaries } from '@the-abyss/config-eslint/base'

/** @type {import('eslint').Linter.Config[]} */
export default [{ ignores: ['docs/**', '.output/**', '**/next-env.d.ts'] }, ...base, ...boundaries]
