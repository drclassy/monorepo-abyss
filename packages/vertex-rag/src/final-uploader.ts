
import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { resolveProjectId } from './internal/gcp-project';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function finalOfficialUpload() {
  console.log('--- 🚀 Vertex AI Official RAG Ingestion ---');
  
  const projectId = resolveProjectId();
  const location = process.env.GCP_LOCATION || 'us-central1';
  const corpusId = process.env.VERTEX_RAG_CORPUS_ID;

  if (!corpusId) return;

  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  const token = tokenRes.token;

  const parent = `projects/${projectId}/locations/${location}/ragCorpora/${corpusId}`;
  const baseDir = path.join(__dirname, '../../../library/medical');
  const categories = ["int", "ped", "obg", "pha", "bas", "gen"];

  // 1. Cek file yang sudah ada agar tidak duplikat
  console.log('🔍 Sinkronisasi database cloud...');
  const listUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/${parent}/ragFiles`;
  const listRes = await fetch(listUrl, { headers: { 'Authorization': `Bearer ${token}` } });
  const listData = await listRes.json() as any;
  const existingFiles = new Set(listData.ragFiles?.map((f: any) => f.displayName) || []);
  console.log(`   ✅ ${existingFiles.size} file sudah aman.`);

  for (const cat of categories) {
    const catDir = path.join(baseDir, cat);
    if (!fs.existsSync(catDir)) continue;
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.pdf'));

    console.log(`\n📂 Divisi: ${cat.toUpperCase()}`);
    for (const fileName of files) {
      if (existingFiles.has(fileName)) {
        process.stdout.write('.');
        continue;
      }

      console.log(`   ⏳ Mengirim [${fileName}]...`);
      const fullPath = path.join(catDir, fileName);
      const fileBuffer = fs.readFileSync(fullPath);
      
      const uploadUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/${parent}/ragFiles:upload`;
      const boundary = '-------AbyssBoundary' + Math.random().toString(36).substring(2);
      
      const metadata = JSON.stringify({ ragFile: { displayName: fileName } });
      let bodyParts: (string | Buffer)[] = [];
      bodyParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="rag_file"\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n`);
      bodyParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`);
      bodyParts.push(fileBuffer);
      bodyParts.push(`\r\n--${boundary}--\r\n`);

      const body = Buffer.concat(bodyParts.map(p => typeof p === 'string' ? Buffer.from(p) : p));

      try {
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`
          },
          body: body
        });

        if (res.ok) {
          console.log(`      ✅ SUCCESS`);
        } else {
          const err = await res.json() as any;
          console.error(`      ❌ FAILED: ${err.error?.message || "Format Error"}`);
        }
      } catch (e: any) {
        console.error(`      ❌ NETWORK ERROR: ${e.message}`);
      }
    }
  }
  console.log('\n🏁 OPERASI SELESAI.');
}

finalOfficialUpload();
