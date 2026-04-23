import { VertexSearchConnector } from '../../../packages/vertex-rag/src/search-connector'

async function main(): Promise<void> {
  const query = process.argv.slice(2).join(' ').trim()

  if (!query) {
    console.log('Usage: pnpm dlx tsx tooling/scripts/rag/medical-search.ts "Aspirin"')
    process.exit(1)
  }

  const connector = new VertexSearchConnector()
  const result = await connector.search(query)

  console.log('--- Medical Knowledge Search ---')
  console.log(`query: ${result.query}`)
  console.log(`status: ${result.status}`)
  console.log(`timestamp: ${result.timestamp}`)
  console.log('')

  if (result.status === 'ERROR') {
    console.error(result.error ?? 'unknown_error')
    process.exit(2)
  }

  console.log(`answer: ${result.answer}`)
  console.log('')

  if (!result.hits.length) {
    console.log('(no hits)')
    return
  }

  for (const [i, h] of result.hits.entries()) {
    console.log(`#${i + 1} ${h.title}`)
    console.log(`uri: ${h.uri}`)
    console.log(h.snippet)
    console.log('')
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.stack ?? e.message : String(e))
  process.exit(3)
})
