/**
 * Copyright 2026 Google LLC
 *
 * Sentra AI Hybrid Brain - Public Data Ingestion Script (OpenFDA & PubMed)
 * Managed by Jen (Sentra Adjutant)
 */

import * as dotenv from 'dotenv';
import axios from 'axios';

import { resolveProjectId } from './internal/gcp-project';

dotenv.config();

const PROJECT_ID = resolveProjectId();
const LOCATION = process.env.GCP_LOCATION || 'global';
const DATA_STORE_ID = process.env.VERTEX_SEARCH_DATASTORE_ID || 'medical-knowledge-base';

async function ingestOpenFDA(drugName: string = 'aspirin') {
    console.log(`[Jen] Fetching OpenFDA data for: ${drugName}...`);
    try {
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=brand_name:${drugName}&limit=1`);
        const data = response.data.results[0];
        
        console.log(`✅ Berhasil mengambil data OpenFDA untuk ${data.openfda?.brand_name ? data.openfda.brand_name[0] : drugName}`);
        return data;
    } catch (error) {
        console.warn(`⚠️ Warning: Gagal mengambil data OpenFDA untuk ${drugName}. Mencoba generic name...`);
        try {
            const response = await axios.get(`https://api.fda.gov/drug/label.json?search=generic_name:${drugName}&limit=1`);
            const data = response.data.results[0];
            console.log(`✅ Berhasil mengambil data OpenFDA (Generic) untuk ${drugName}`);
            return data;
        } catch (e) {
            console.error('❌ Gagal total mengambil data OpenFDA:', drugName);
        }
    }
}

async function startIngestionPipeline() {
    console.log('--- 🚀 Memulai Pipeline Ingesti Pengetahuan Medis ---');
    console.log(`[Jen] Target GCP project: ${PROJECT_ID} | location: ${LOCATION} | data store: ${DATA_STORE_ID}`);
    
    const drug = process.argv[2] || 'Aspirin';
    
    // 1. Ingest sample dari OpenFDA
    const openFdaData = await ingestOpenFDA(drug);
    if (openFdaData) {
        console.log(`📄 Sample OpenFDA siap diproses untuk ${drug}.`);
    }
    
    // 2. Petunjuk untuk PubMed (karena PubMed biasanya dalam format XML/Bulk)
    console.log('\n💡 TIPS: Untuk PubMed Central, disarankan menggunakan Dump GCS.');
    console.log('🔗 URL Source: https://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_bulk/');
    
    console.log('\n📝 LANGKAH EKSEKUSI:');
    console.log('1. Buat Bucket GCS: `gsutil mb gs://sentra-medical-vault`');
    console.log('2. Download PubMed Dump ke Local / Cloud Shell.');
    console.log('3. Upload ke GCS: `gsutil -m cp -r ./pubmed_dump gs://sentra-medical-vault/`');
    console.log('4. Jalankan Import di Vertex AI Search (Discovery Engine) menggunakan path GCS tersebut.');

    console.log('\n✅ Pipeline Inisialisasi Selesai.');
}

if (require.main === module) {
    startIngestionPipeline();
}
