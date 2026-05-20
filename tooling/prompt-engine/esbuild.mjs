import { mkdir } from 'node:fs/promises'

import * as esbuild from 'esbuild'

const outdir = 'dist'

await mkdir(outdir, { recursive: true })

await esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  outfile: `${outdir}/extension.js`,
  minify: false,
  sourcemap: false,
  legalComments: 'none',
})
