import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import * as dotenv from 'dotenv'
import { GoogleAuth } from 'google-auth-library'

import { resolveProjectId } from './internal/gcp-project'

dotenv.config()

interface RagCorpusRecord {
  name: string
  displayName?: string
}

interface RagCorporaResponse {
  ragCorpora: RagCorpusRecord[]
}

interface GoogleRequestClient {
  request(input: { url: string; method: 'GET' | 'POST' | 'PATCH'; data?: unknown }): Promise<{
    data: unknown
  }>
}

export function parseRagCorporaResponse(data: unknown): RagCorporaResponse {
  if (typeof data !== 'object' || data === null || !('ragCorpora' in data)) {
    throw new Error('Vertex RAG response did not include ragCorpora')
  }

  const ragCorpora = (data as { ragCorpora?: unknown }).ragCorpora
  if (!Array.isArray(ragCorpora)) {
    throw new Error('Vertex RAG response ragCorpora is not an array')
  }

  const parsedCorpora = ragCorpora.map((corpus) => {
    if (typeof corpus !== 'object' || corpus === null || typeof (corpus as { name?: unknown }).name !== 'string') {
      throw new Error('Vertex RAG response contains an invalid corpus record')
    }

    const record = corpus as { name: string; displayName?: unknown }
    return {
      name: record.name,
      displayName: typeof record.displayName === 'string' ? record.displayName : undefined,
    }
  })

  return { ragCorpora: parsedCorpora }
}

export function shouldIgnoreRagConfigError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return (
    error.message.includes('already configured') ||
    error.message.includes('ALREADY_EXISTS') ||
    error.message.includes('409')
  )
}

export function extractCorpusId(corpus: RagCorpusRecord): string {
  const corpusId = corpus.name.split('/').pop()

  if (!corpusId) {
    throw new Error(`Vertex RAG corpus name is missing a terminal ID: ${corpus.name}`)
  }

  return corpusId
}

async function listRagCorpora(
  client: GoogleRequestClient,
  url: string
): Promise<RagCorporaResponse> {
  const response = await client.request({ url, method: 'GET' })
  return parseRagCorporaResponse(response.data)
}

async function autoFix() {
  console.log('--- 🛠️ Memulai Perbaikan Otomatis (Auto-Heal) ---')
  try {
    const projectId = resolveProjectId()
    const location = process.env.GCP_LOCATION || 'us-central1'

    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
    const client = await auth.getClient()

    console.log('🔍 Mencari Corpus ID yang sebenarnya di Google Cloud...')
    const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragCorpora`
    let data = await listRagCorpora(client, url)

    if (!data.ragCorpora || data.ragCorpora.length === 0) {
      console.log('⚠️ Otak AI belum ada di GCP. Saya (sistem) akan membuatkannya untuk Anda...')

      try {
        const configUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragEngineConfig`
        await client.request({ url: configUrl, method: 'PATCH', data: { ragManagedDbConfig: { serverless: {} } } })
      } catch (error) {
        if (!shouldIgnoreRagConfigError(error)) {
          throw new Error(
            `Failed to configure Vertex RAG managed DB before corpus creation: ${
              error instanceof Error ? error.name : 'UnknownError'
            }`
          )
        }

        console.warn('ℹ️ Konfigurasi RAG managed DB sudah aktif. Lanjut membuat corpus...')
      }

      await client.request({ 
        url, 
        method: 'POST',
        data: { displayName: "Sentra Hybrid Brain", description: "Knowledge Base untuk Sentra AI Vertex RAG" }
      })

      console.log('⏳ Sedang dirakit oleh Google. Saya akan menunggu sampai selesai memproses (bisa sampai 1 menit)...')

      let found = false
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 4000))
        data = await listRagCorpora(client, url)

        if (data.ragCorpora && data.ragCorpora.length > 0) {
          found = true
          break
        }
      }

      if (!found) throw new Error("\n❌ Waktu habis. Pembuatan dari sisi Google terlalu lama. Tolong jalankan ulang skrip auto-fix ini.")
    }

    // Ambil Corpus pertama yang tersedia
    const realCorpus = data.ragCorpora[0]
    const realCorpusId = extractCorpusId(realCorpus)
    console.log(`✅ Corpus Asli Ditemukan!`)
    console.log(`   Nama : ${realCorpus.displayName || 'Sentra Hybrid Brain'}`)
    console.log(`   ID   : ${realCorpusId} (Ini yang didapat langsung dari server Google)`)

    // Update file .env secara otomatis
    const envPath = path.join(__dirname, '../../../.env')
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8')

      if (envContent.includes('VERTEX_RAG_CORPUS_ID=')) envContent = envContent.replace(/VERTEX_RAG_CORPUS_ID=.*/g, `VERTEX_RAG_CORPUS_ID="${realCorpusId}"`)
      else envContent += `\nVERTEX_RAG_CORPUS_ID="${realCorpusId}"\n`

      if (envContent.includes('NOTEBOOK_CORPUS_ID=')) envContent = envContent.replace(/NOTEBOOK_CORPUS_ID=.*/g, `NOTEBOOK_CORPUS_ID="${realCorpusId}"`)

      fs.writeFileSync(envPath, envContent)
      console.log('✅ File .env berhasil diperbarui secara otomatis!')
    }

    console.log('\n🎉 PERBAIKAN SELESAI! Silakan jalankan upload-document lalu query kembali.')
  } catch (error) {
    console.error('❌ Gagal melakukan auto-fix:', error instanceof Error ? error.message : error)
  }
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  autoFix()
}
