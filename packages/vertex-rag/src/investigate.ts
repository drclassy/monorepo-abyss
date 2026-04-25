
import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function investigate() {
  console.log('=== Vertex RAG Deep Investigation ===');
  
  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION || 'us-central1';
  const opId = '8141089386918838272'; // ID resi terakhir

  if (!projectId) {
    console.error('❌ Error: GCP_PROJECT_ID tidak ditemukan di .env');
    return;
  }

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();

  // 1. Cek Status Operasi Terakhir
  console.log(`\n1. Mengecek Status Operasi: ${opId}...`);
  try {
    const opUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/operations/${opId}`;
    const opRes = await client.request({ url: opUrl });
    console.log('   Status Operasi:', JSON.stringify(opRes.data, null, 2));
    
    if ((opRes.data as any).error) {
        console.error('   🚨 GOOGLE RETURNED ERROR:', (opRes.data as any).error.message);
    }
  } catch (e: any) {
    console.error('   ❌ Gagal mengambil status operasi:', e.message);
  }

  // 2. List Semua Corpus di Region Tersebut
  console.log(`\n2. Melisting semua Corpus di ${location}...`);
  try {
    const listUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/ragCorpora`;
    const listRes = await client.request({ url: listUrl });
    const data = listRes.data as any;
    if (data.ragCorpora) {
        console.log(`   ✅ Ditemukan ${data.ragCorpora.length} Corpus!`);
        data.ragCorpora.forEach((c: any) => console.log(`      - ${c.displayName} (ID: ${c.name.split('/').pop()})`));
    } else {
        console.log('   ⚠️ Tidak ada Corpus ditemukan.');
    }
  } catch (e: any) {
    console.error('   ❌ Gagal listing corpus:', e.message);
  }

  console.log('\n=== Investigation Complete ===');
}

investigate();
