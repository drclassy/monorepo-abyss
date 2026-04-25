
import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config();

async function listCorpuses() {
  console.log('--- Mencari Jejak Otak Vertex RAG ---');
  try {
    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;
    if (!projectId) {
      throw new Error("GCP_PROJECT_ID belum diatur di file .env");
    }

    const location = process.env.GCP_LOCATION || 'us-central1';
    
    console.log(`Menggunakan Project: ${projectId}`);
    console.log(`Menggunakan Region: ${location}`);
    console.log('Menghubungi API Vertex AI secara langsung (REST)...\n');
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    
    const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragCorpora`;
    const response = await client.request({ url, method: 'GET' });
    const data = response.data as any;

    if (data.ragCorpora && data.ragCorpora.length > 0) {
      console.log('✅ Ditemukan Corpus:');
      data.ragCorpora.forEach((corpus: any, idx: number) => {
        console.log(`[${idx + 1}] Nama : ${corpus.displayName}`);
        console.log(`    ID   : ${corpus.name.split('/').pop()}`);
      });
      console.log('\n💡 HINT: Copy ID di atas dan masukkan ke .env sebagai VERTEX_RAG_CORPUS_ID');
    } else {
      console.log('⚠️ Tidak ada Corpus yang ditemukan. Pastikan Anda sudah membuat RAG Corpus di Vertex AI Console.');
    }
  } catch (error) {
    console.error('❌ Gagal menghubungi API:', error instanceof Error ? error.message : error);
    if ((error as any).response) console.error('Detail Error:', (error as any).response.data);
  }
}

listCorpuses();
