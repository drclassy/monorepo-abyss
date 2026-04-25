import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config();

async function createCorpus() {
  console.log('--- Menciptakan Jejak Otak Vertex RAG Baru ---');
  try {
    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GCP_LOCATION || 'us-central1';
    
    if (!projectId) throw new Error("GCP_PROJECT_ID belum diatur di file .env");

    console.log(`Membangun Corpus di Project: ${projectId} (${location})...`);
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();

    console.log('\n🔧 Mengalihkan RAG Engine ke Mode Serverless (menghindari limitasi Spanner)...');
    try {
      const configUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragEngineConfig`;
      await client.request({
        url: configUrl,
        method: 'PATCH',
        data: {
          ragManagedDbConfig: {
            serverless: {}
          }
        }
      });
      console.log('✅ Mode Serverless berhasil diaktifkan!\n');
    } catch (configError) {
      console.warn('⚠️ Peringatan: Gagal mengubah ke mode Serverless (melanjutkan proses pembuatan).');
      if ((configError as any).response) console.warn(JSON.stringify((configError as any).response.data));
    }
    
    const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragCorpora`;
    const response = await client.request({ 
      url, 
      method: 'POST',
      data: {
        displayName: "Sentra Hybrid Brain",
        description: "Knowledge Base untuk Sentra AI Vertex RAG"
      }
    });
    
    const data = response.data as any;
    console.log('⏳ Perintah pembuatan Corpus telah dikirim ke Google Cloud!');
    console.log(`[+] ID Resi (Operation) : ${data.name.split('/').pop()}`);
    console.log('\n💡 HINT: Karena pembuatan butuh beberapa detik di background,');
    console.log('   harap gunakan script detective.ts untuk mendapatkan ID Corpus aslinya.');
  } catch (error) {
    console.error('❌ Gagal membuat Corpus:', error instanceof Error ? error.message : error);
    if ((error as any).response) console.error('Detail Error:', JSON.stringify((error as any).response.data, null, 2));
  }
}

createCorpus();