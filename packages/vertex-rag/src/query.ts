import { VertexRAGConnector } from './connector';
import * as dotenv from 'dotenv';

import { resolveProjectId } from './internal/gcp-project';

dotenv.config({ override: true });

async function askBrain() {
  console.log('--- 🤖 Mengakses Otak Vertex RAG ---');
  
  // Mengambil argumen dari terminal sebagai pertanyaan
  const question = process.argv.slice(2).join(' ');
  
  if (!question) {
    console.log('\n💡 HINT: Anda belum memberikan pertanyaan.');
    console.log('🚀 Cara menjalankan:');
    console.log('   pnpm dlx tsx packages/vertex-rag/src/query.ts "Tuliskan pertanyaan Anda di sini"');
    process.exit(1);
  }

  try {
    // Ambil variabel environment
    const corpusId = process.env.VERTEX_RAG_CORPUS_ID || process.env.NOTEBOOK_CORPUS_ID;
    const projectId = resolveProjectId();
    const location = process.env.GCP_LOCATION || 'us-central1';

    // Inisialisasi Konektor AI
    const connector = new VertexRAGConnector({
      projectId,
      location,
      corpusId
    });

    console.log(`\n💬 Pertanyaan: "${question}"`);
    console.log('⏳ Berpikir (Mencari dari dokumen referensi)...\n');

    const response = await connector.query(question);

    if (response.status === 'SUCCESS') {
      console.log('✅ Jawaban AI:');
      console.log('──────────────────────────────────────────────────');
      console.log(response.answer);
      console.log('──────────────────────────────────────────────────');
    } else {
      console.error('❌ Terjadi kesalahan dari AI:', response.error);
    }
  } catch (error) {
    console.error('❌ Gagal menghubungi AI:', error instanceof Error ? error.message : error);
  }
}

askBrain();
