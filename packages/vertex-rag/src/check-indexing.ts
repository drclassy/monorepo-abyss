
import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';

import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function checkStatus() {
  console.log('--- 📊 Mengecek Status Indexing Otak AI ---');
  try {
    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GCP_LOCATION || 'us-central1';
    const corpusId = process.env.VERTEX_RAG_CORPUS_ID;

    if (!projectId || !corpusId) throw new Error("Config missing in .env");

    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    
    const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragCorpora/${corpusId}/ragFiles`;
    const response = await client.request({ url, method: 'GET' });
    const data = response.data as any;

    if (data.ragFiles) {
      const total = data.ragFiles.length;
      const active = data.ragFiles.filter((f: any) => f.state === 'ACTIVE').length;
      const pending = data.ragFiles.filter((f: any) => f.state === 'PENDING').length;
      const failed = data.ragFiles.filter((f: any) => f.state === 'ERROR' || f.state === 'FAILED').length;

      console.log(`\n📈 Progress Indexing:`);
      console.log(`   - Total File  : ${total}`);
      console.log(`   - ✅ ACTIVE   : ${active} (Siap ditanya)`);
      console.log(`   - ⏳ PENDING  : ${pending} (Sedang diproses)`);
      console.log(`   - ❌ FAILED   : ${failed}`);

      if (active > 0) {
        console.log('\n💡 HINT: Sudah ada file yang ACTIVE. Jika jawaban masih kosong, mungkin model sedang melakukan pemetaan vektor.');
      } else {
        console.log('\n⏳ Harap bersabar, Google sedang membedah buku-buku medis Anda...');
      }
    } else {
      console.log('⚠️ Belum ada file yang terdeteksi di dalam Corpus.');
    }
  } catch (error) {
    console.error('❌ Gagal cek status:', error instanceof Error ? error.message : error);
  }
}

checkStatus();
