import { mkdir } from 'node:fs/promises'

import * as esbuild from 'esbuild'

const outdir = 'dist'

await mkdir(outdir, { recursive: true })

await esbuild.build({
  entryPoints: [
    'src/extension.ts',
    'src/core/audit.ts',
    'src/core/composer.ts',
    'src/core/context.ts',
    'src/webview/prompt-engine-view.ts',
  ],
  bundle: true,
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  outdir,
  outbase: 'src',
  minify: false,
  sourcemap: false,
  legalComments: 'none',
})
