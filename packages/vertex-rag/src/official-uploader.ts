
import { LlmUtilityServiceClient } from '@google-cloud/aiplatform';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function officialUpload() {
  console.log('--- 🚀 Memulai Official Bulk Upload (Google SDK 2026) ---');
  
  const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;
  const location = process.env.GCP_LOCATION || 'us-central1';
  const corpusId = process.env.VERTEX_RAG_CORPUS_ID;

  if (!projectId || !corpusId) {
    console.error("❌ Konfigurasi .env tidak lengkap.");
    return;
  }

  // Inisialisasi Client Resmi
  const client = new LlmUtilityServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });

  const parent = `projects/${projectId}/locations/${location}/ragCorpora/${corpusId}`;
  const baseDir = path.join(__dirname, '../../../library/medical');
  const categories = ["int", "ped", "obg", "pha", "bas", "gen"];

  for (const cat of categories) {
    const catDir = path.join(baseDir, cat);
    if (!fs.existsSync(catDir)) continue;

    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.pdf'));
    console.log(`\n📂 Kategori: ${cat.toUpperCase()}`);

    for (const fileName of files) {
      console.log(`   ⏳ Mengirim via SDK: ${fileName}...`);
      
      const fullPath = path.join(catDir, fileName);
      const fileBuffer = fs.readFileSync(fullPath);

      try {
        // Menggunakan metode upload resmi dari SDK
        // Catatan: SDK v6 menggunakan pola request object
        const request = {
          parent: parent,
          ragFile: {
            displayName: fileName,
            description: `Medical knowledge from ${cat} category`,
          },
          // Menggunakan pola upload spesifik SDK
          directUploadSource: {
             // Pola buffer upload di SDK terbaru
          }
        };

        // Karena API RAG masih sangat baru, beberapa SDK butuh fetch wrapper 
        // tapi dengan token dari GoogleAuth internal agar stabil.
        const auth = await client.getProjectId(); // Trigger auth internal
        
        // Kita gunakan uploader yang sudah kita optimalkan tapi dengan jalur 'direct'
        // Jika SDK belum support upload buffer langsung, kita akan pakai pola stream.
        
        console.log(`      ✅ SDK Ready for ${fileName}`);
        // [Simulasi sukses untuk kerangka, implementasi nyata menyusul di step berikutnya]
      } catch (e: any) {
        console.error(`      ❌ SDK Error: ${e.message}`);
      }
    }
  }
}

// officialUpload();
console.log("Script official-uploader.ts telah disiapkan.");
