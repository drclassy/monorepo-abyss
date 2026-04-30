import { SentraRAGEngine } from '@the-abyss/sentra-rag'

async function main(): Promise<void> {
  const query = process.argv.slice(2).join(' ').trim()

  if (!query) {
    console.log('Usage: pnpm dlx tsx tooling/scripts/rag/medical-search.ts "Aspirin"')
    process.exit(1)
  }

  const engine = new SentraRAGEngine()
  await engine.initialize()
  const result = await engine.ask(query)

  console.log('--- Medical Knowledge Search ---')
  console.log(`query: ${query}`)
  console.log(`status: ${result.status}`)
  console.log(`timestamp: ${result.timestamp}`)
  console.log('')

  if (result.status === 'ERROR') {
    console.error(result.error ?? 'unknown_error')
    process.exit(2)
  }

  console.log(`answer: ${result.answer}`)
  console.log('')

  if (!result.chunks.length) {
    console.log('(no hits)')
    await engine.close()
    return
  }

  for (const [i, h] of result.chunks.entries()) {
    console.log(`#${i + 1} ${h.sourceFile}`)
    console.log(`category: ${h.category}`)
    console.log(h.content.slice(0, 200))
    console.log('')
  }

  await engine.close()
}

main().catch((e) => {
  console.error(e instanceof Error ? e.stack ?? e.message : String(e))
  process.exit(3)
})
