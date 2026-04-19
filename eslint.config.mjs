import { base, boundaries } from '@the-abyss/config-eslint/base'

/** @type {import('eslint').Linter.Config[]} */
export default [{ ignores: ['docs/**', '.output/**'] }, ...base, ...boundaries]
