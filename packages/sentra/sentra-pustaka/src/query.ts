// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { SentraRAGEngine } from './engine.js'

async function main() {
  const question = process.argv.slice(2).join(' ')

  if (!question) {
    console.log('Usage: pnpm query "Apa terapi lini pertama untuk kejang demam?"')
    process.exit(1)
  }

  const engine = new SentraRAGEngine()
  await engine.initialize()

  console.log(`\nQuery: "${question}"`)
  console.log('Searching...\n')

  const result = await engine.ask(question)

  console.log(`Source: ${result.source} | Model: ${result.model}`)
  console.log('─'.repeat(60))
  console.log(result.answer)
  console.log('─'.repeat(60))

  if (result.chunks.length > 0) {
    console.log(`\nReferensi (${result.chunks.length} chunks):`)
    result.chunks.forEach((c, i) => {
      console.log(
        `  [${i + 1}] ${c.sourceFile.split('/').pop()} — ${c.headingPath.join(' > ')} (${(c.similarity * 100).toFixed(0)}%)`
      )
    })
  }

  await engine.close()
}

main().catch(console.error)
