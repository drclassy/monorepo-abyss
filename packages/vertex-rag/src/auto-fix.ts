import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { resolveProjectId } from './internal/gcp-project';

dotenv.config();

async function autoFix() {
  console.log('--- 🛠️ Memulai Perbaikan Otomatis (Auto-Heal) ---');
  try {
    const projectId = resolveProjectId();
    const location = process.env.GCP_LOCATION || 'us-central1';

    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();

    console.log('🔍 Mencari Corpus ID yang sebenarnya di Google Cloud...');
    const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragCorpora`;
    let response = await client.request({ url, method: 'GET' }).catch(() => ({ data: {} }));
    let data = response.data as any;

    if (!data.ragCorpora || data.ragCorpora.length === 0) {
      console.log('⚠️ Otak AI belum ada di GCP. Saya (sistem) akan membuatkannya untuk Anda...');
      
      try {
        const configUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragEngineConfig`;
        await client.request({ url: configUrl, method: 'PATCH', data: { ragManagedDbConfig: { serverless: {} } } });
      } catch(e) { /* ignore */ }

      await client.request({ 
        url, 
        method: 'POST',
        data: { displayName: "Sentra Hybrid Brain", description: "Knowledge Base untuk Sentra AI Vertex RAG" }
      });

      console.log('⏳ Sedang dirakit oleh Google. Saya akan menunggu sampai selesai memproses (bisa sampai 1 menit)...');

      let found = false;
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 4000)); // Tunggu 4 detik tiap iterasi
        response = await client.request({ url, method: 'GET' }).catch(() => ({ data: {} }));
        data = response.data as any;
        
        if (data.ragCorpora && data.ragCorpora.length > 0) {
          found = true;
          break;
        }
      }
      
      if (!found) throw new Error("\n❌ Waktu habis. Pembuatan dari sisi Google terlalu lama. Tolong jalankan ulang skrip auto-fix ini.");
    }

    // Ambil Corpus pertama yang tersedia
    const realCorpus = data.ragCorpora[0];
    const realCorpusId = realCorpus.name.split('/').pop();
    console.log(`✅ Corpus Asli Ditemukan!`);
    console.log(`   Nama : ${realCorpus.displayName || 'Sentra Hybrid Brain'}`);
    console.log(`   ID   : ${realCorpusId} (Ini yang didapat langsung dari server Google)`);

    // Update file .env secara otomatis
    const envPath = path.join(__dirname, '../../../.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      if (envContent.includes('VERTEX_RAG_CORPUS_ID=')) envContent = envContent.replace(/VERTEX_RAG_CORPUS_ID=.*/g, `VERTEX_RAG_CORPUS_ID="${realCorpusId}"`);
      else envContent += `\nVERTEX_RAG_CORPUS_ID="${realCorpusId}"\n`;

      if (envContent.includes('NOTEBOOK_CORPUS_ID=')) envContent = envContent.replace(/NOTEBOOK_CORPUS_ID=.*/g, `NOTEBOOK_CORPUS_ID="${realCorpusId}"`);
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ File .env berhasil diperbarui secara otomatis!');
    }

    console.log('\n🎉 PERBAIKAN SELESAI! Silakan jalankan upload-document lalu query kembali.');
  } catch (error) {
    console.error('❌ Gagal melakukan auto-fix:', error instanceof Error ? error.message : error);
  }
}

autoFix();
