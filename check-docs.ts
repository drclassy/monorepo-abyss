const requiredEnv = [
  'VERTEX_SEARCH_DATASTORE_ID',
  'GOOGLE_LOCATION',
]

const optionalEnv = [
  'GCP_PROJECT_ID',
  'GOOGLE_PROJECT_ID',
  'GCP_LOCATION',
  'VERTEX_RAG_CORPUS_ID',
]

function main(): void {
  console.log('--- Sentra / Vertex RAG: Env Check ---')

  let missing = 0

  for (const k of requiredEnv) {
    const v = process.env[k]
    if (!v) {
      console.log(`[MISSING] ${k}`)
      missing++
    } else {
      console.log(`[OK]      ${k}=${String(v).substring(0, 60)}`)
    }
  }

  for (const k of optionalEnv) {
    const v = process.env[k]
    if (!v) {
      console.log(`[WARN]    ${k} (unset)`)
    } else {
      console.log(`[OK]      ${k}=${String(v).substring(0, 60)}`)
    }
  }

  if (missing) {
    console.log('')
    console.log('Set env vars lalu ulangi.')
    process.exit(1)
  }

  console.log('')
  console.log('Env terlihat siap.')
}

main()
