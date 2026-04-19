import fs from 'fs-extra';
import path from 'path';
import pdf from 'pdf-parse';
import { VectorStore } from '../store';

const PDF_DIR = 'D:/Devop/abyss-monorepo/repository/medical-raw';
const CHUNK_SIZE = 1000; // Karakter per potongan
const CHUNK_OVERLAP = 200; // Tumpang tindih agar konteks tidak hilang

async function processPdf(filePath: string) {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.substring(i, i + size));
  }
  return chunks;
}

async function startIngestion() {
  const store = new VectorStore({ provider: 'memory' }); // Config placeholder
  const files = await fs.readdir(PDF_DIR);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));

  console.log(`Menemukan ${pdfFiles.length} file PDF medis...`);

  for (const file of pdfFiles) {
    console.log(`🚀 Memproses: ${file}`);
    const fullPath = path.join(PDF_DIR, file);
    
    try {
      const rawText = await processPdf(fullPath);
      const chunks = chunkText(rawText, CHUNK_SIZE, CHUNK_OVERLAP);
      
      console.log(`   - Ekstraksi selesai. Dihasilkan ${chunks.length} potongan (chunks).`);

      for (let i = 0; i < chunks.length; i++) {
        process.stdout.write(`   - Ingesting chunk ${i+1}/${chunks.length}... \r`);
        await store.upsert(chunks[i], {
          source: file,
          page: Math.floor(i / 5) + 1, // Estimasi halaman
          category: 'Medical Knowledge'
        });
        
        // Jeda 200ms agar API Vertex/Gemini tidak overload
        await new Promise(r => setTimeout(r, 200));
      }
      console.log(`\n✅ Selesai memproses: ${file}\n`);
    } catch (err) {
      console.error(`❌ Gagal memproses ${file}:`, err);
    }
  }
}

startIngestion().catch(console.error);
