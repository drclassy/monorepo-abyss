
import * as fs from 'fs';
import * as path from 'path';

const vaultDir = path.join(__dirname, '../../../library/medical-raw');
const registryPath = path.join(__dirname, '../../../library/medical_registry.json');

const categories = {
  int: ['hipertensi', 'jantung', 'gerd', 'dispepsia', 'diare', 'internal', 'medicine', 'diagnosis', 'treatment', 'hypertension', 'emergensi'],
  ped: ['anak', 'pediatric', 'pediatri', 'neonatology', 'bayi', 'batuk', 'pedoman-anak', 'neonatology'],
  obg: ['obgyn', 'obstetri', 'ginekologi', 'kandungan', 'ibu', 'antenatal', 'persalinan', 'nifas', 'preeklamsia', 'kpd-pogi', 'obstetrics', 'gynecology'],
  pha: ['farmakologi', 'pharmacology', 'obat', 'pharmacy', 'interactions', 'doen', 'formularium', 'drug', 'adverse'],
  bas: ['anatomi', 'prometheus', 'atlas', 'basic', 'term', 'loinc', 'diagnosis', 'anatomy', 'ecg', 'ecg-success'],
  gen: ['pedoman', 'panduan', 'puskesmas', 'kesehatan', 'profil', 'kanker', 'katarak', 'otitis', 'tonsilitis', 'thalasemia', 'dermatology', 'psychiatry']
};

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, '')       // Hapus karakter non-word
    .replace(/\-\-+/g, '-')         // Ganti ganda - dengan tunggal -
    .replace(/^-+/, '')             // Hapus - di awal
    .replace(/-+$/, '');            // Hapus - di akhir
}

function getCategory(fileName: string) {
  const name = fileName.toLowerCase();
  for (const [code, keywords] of Object.entries(categories)) {
    if (keywords.some(k => name.includes(k))) return code;
  }
  return 'gen'; // Default ke general
}

async function organize() {
  console.log('--- 🧹 Memulai Operasi Pembersihan & Kategorisasi ---');
  
  if (!fs.existsSync(vaultDir)) {
    console.error('❌ Folder medical-raw tidak ditemukan!');
    return;
  }

  const files = fs.readdirSync(vaultDir).filter(f => f.endsWith('.pdf'));
  const registry: any[] = [];

  files.forEach(oldName => {
    const category = getCategory(oldName);
    const cleanName = slugify(oldName.replace('.pdf', ''));
    const newName = `${category}--${cleanName}.pdf`;
    
    const oldPath = path.join(vaultDir, oldName);
    const newPath = path.join(vaultDir, newName);

    try {
      fs.renameSync(oldPath, newPath);
      registry.push({
        original_name: oldName,
        clean_name: newName,
        category: category,
        path: `library/medical-raw/${newName}`
      });
      console.log(`✅ ${oldName.substring(0, 30)}... -> ${newName}`);
    } catch (e) {
      console.error(`❌ Gagal rename ${oldName}:`, e);
    }
  });

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`\n🎉 SELESAI! ${files.length} file telah dikategorikan.`);
  console.log(`📂 Database Index: library/medical_registry.json`);
}

organize();
