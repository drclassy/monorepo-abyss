import { parseArgs } from 'node:util'

import { LiteratureHarvester } from './harvester.js'
import type { LiteratureSource } from './types.js'

function parseSources(value: string | undefined): LiteratureSource[] | undefined {
  if (!value) return undefined

  const sources = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean) as LiteratureSource[]

  return sources.length > 0 ? sources : undefined
}

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      query: { type: 'string', short: 'q' },
      limit: { type: 'string', short: 'l' },
      outDir: { type: 'string' },
      source: { type: 'string' },
      yearFrom: { type: 'string' },
      yearTo: { type: 'string' },
      openAccessOnly: { type: 'boolean', default: true },
      email: { type: 'string' },
    },
    allowPositionals: true,
  })

  const query = values.query ?? positionals.join(' ').trim()
  if (!query) {
    console.error('Usage: pnpm --filter @the-abyss/literature-harvester harvest -- --query "heart failure"')
    process.exitCode = 1
    return
  }

  const harvester = new LiteratureHarvester({
    outputDir: values.outDir,
    limit: values.limit ? Number(values.limit) : undefined,
    sources: parseSources(values.source),
    openAccessOnly: values.openAccessOnly,
    email: values.email ?? process.env.LITERATURE_CONTACT_EMAIL,
  })

  const result = await harvester.harvest(query, {
    yearFrom: values.yearFrom ? Number(values.yearFrom) : undefined,
    yearTo: values.yearTo ? Number(values.yearTo) : undefined,
  })

  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
