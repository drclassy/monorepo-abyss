import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { resolveProjectId } from './internal/gcp-project';

dotenv.config();

async function uploadDocument() {
  console.log('--- 🧠 Mengunggah Memori ke Vertex RAG ---');
  try {
    const projectId = resolveProjectId();
    const location = process.env.GCP_LOCATION || 'us-central1';
    const corpusId = process.env.VERTEX_RAG_CORPUS_ID;

    if (!corpusId) throw new Error("VERTEX_RAG_CORPUS_ID belum diatur di file .env");

    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    // 2. Ambil path file dari argumen
    const relativePath = process.argv[2]; // e.g., "int/int--hipertensi.pdf"
    if (!relativePath) {
      console.log(`\n💡 HINT: Anda belum menyebutkan path file.`);
      process.exit(1);
    }

    const fullPath = path.join(__dirname, '../../../library/medical', relativePath);
    if (!fs.existsSync(fullPath)) throw new Error(`File tidak ditemukan: ${fullPath}`);

    const fileName = path.basename(fullPath);
    const ext = path.extname(fileName).toLowerCase();
    const mimeType = ext === '.pdf' ? 'application/pdf' : 'text/plain';
    const fileContent = fs.readFileSync(fullPath);

    // 3. Bangun Payload Multipart/Form-Data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const metadata = JSON.stringify({ ragFile: { displayName: fileName } });
    
    let bodyParts: (string | Buffer)[] = [];
    bodyParts.push(`--${boundary}\r\n`);
    bodyParts.push(`Content-Disposition: form-data; name="rag_file"\r\n`);
    bodyParts.push(`Content-Type: application/json\r\n\r\n`);
    bodyParts.push(`${metadata}\r\n`);
    bodyParts.push(`--${boundary}\r\n`);
    bodyParts.push(`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`);
    bodyParts.push(`Content-Type: ${mimeType}\r\n\r\n`);
    bodyParts.push(fileContent);
    bodyParts.push(`\r\n--${boundary}--\r\n`);

    const body = Buffer.concat(bodyParts.map(p => typeof p === 'string' ? Buffer.from(p) : p));

    // 4. Kirim Request
    console.log(`Mengunggah [${fileName}] ke Corpus ID: ${corpusId}...\n`);
    const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragCorpora/${corpusId}/ragFiles:upload`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });

    const data = await response.json() as any;
    if (!response.ok) throw new Error(JSON.stringify(data, null, 2));

    console.log(`✅ [${fileName}] Berhasil Diunggah!`);
  } catch (error) {
    console.error('❌ Gagal mengunggah dokumen:', error instanceof Error ? error.message : error);
  }
}

uploadDocument();
