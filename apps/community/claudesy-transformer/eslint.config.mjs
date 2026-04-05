import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'website/**',
      'extension/**',
      'coverage/**',
      'dist/**',
      'tsconfig.tsbuildinfo',
    ],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]
