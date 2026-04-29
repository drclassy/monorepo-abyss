
import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { resolveProjectId } from './internal/gcp-project';

dotenv.config();

async function bulkUpload() {
  console.log('--- 🚀 Memulai Bulk Upload Pengetahuan Medis (ULTRA-ROBUST 2026) ---');
  try {
    const projectId = resolveProjectId();
    const location = process.env.GCP_LOCATION || 'us-central1';
    const corpusId = process.env.VERTEX_RAG_CORPUS_ID;

    if (!corpusId) throw new Error("Config missing in .env");

    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    
    // Fungsi untuk mendapatkan token segar
    const getFreshToken = async () => {
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        return tokenResponse.token;
    };

    let accessToken = await getFreshToken();
    let fileCounter = 0;

    // 1. Ambil daftar file yang sudah ada (Auto-Resume)
    console.log('🔍 Sinkronisasi dengan Google Cloud...');
    const listUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragCorpora/${corpusId}/ragFiles`;
    const client = await auth.getClient();
    const listRes = await client.request({ url: listUrl, method: 'GET' });
    const existingFiles = new Set((listRes.data as any).ragFiles?.map((f: any) => f.displayName) || []);
    console.log(`   ✅ ${existingFiles.size} file sudah aman di cloud.\n`);

    const baseDir = path.join(__dirname, '../../../library/medical');
    const categories = ["int", "ped", "obg", "pha", "bas", "gen"];

    for (const cat of categories) {
      const catDir = path.join(baseDir, cat);
      if (!fs.existsSync(catDir)) continue;

      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.pdf'));
      console.log(`\n📂 Memproses Kategori: ${cat.toUpperCase()}`);

      for (const fileName of files) {
        if (existingFiles.has(fileName)) {
          process.stdout.write(`.`); // Titik kecil untuk file yang dilewati
          continue;
        }

        console.log(`\n   ⏳ Uploading [${fileName}]...`);
        
        // Refresh token setiap 5 file untuk jaga-jaga
        fileCounter++;
        if (fileCounter % 5 === 0) {
            console.log('      (Refreshing security token...)');
            accessToken = await getFreshToken();
        }

        const fullPath = path.join(catDir, fileName);
        const fileContent = fs.readFileSync(fullPath);
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const metadata = JSON.stringify({ ragFile: { displayName: fileName } });
        
        let bodyParts: (string | Buffer)[] = [];
        bodyParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="rag_file"\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n`);
        bodyParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`);
        bodyParts.push(fileContent);
        bodyParts.push(`\r\n--${boundary}--\r\n`);

        const body = Buffer.concat(bodyParts.map(p => typeof p === 'string' ? Buffer.from(p) : p));

        try {
          const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragCorpora/${corpusId}/ragFiles:upload`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: body,
            // @ts-ignore
            signal: AbortSignal.timeout(300000) // 5 Menit Timeout per file
          });

          if (response.ok) {
            console.log(`      ✅ BERHASIL`);
          } else {
            const err = await response.json() as any;
            console.error(`      ❌ GAGAL: ${err.error?.message || "Unknown error"}`);
          }
        } catch (e: any) {
          console.error(`      ❌ TIMEOUT/NETWORK ERROR: ${e.message}`);
        }
      }
    }

    console.log('\n\n🎉 SEMUA "BAHAN BAKU" TELAH TERKIRIM KE PABRIK GOOGLE!');
  } catch (error) {
    console.error('❌ ERROR FATAL:', error);
  }
}

bulkUpload();
