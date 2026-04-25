/**
 * Copyright 2026 Google LLC
 * 
 * Sentra AI Hybrid Brain - Vertex AI Search Infrastructure Initializer
 * Managed by Jen (Sentra Adjutant)
 */

import { DataStoreServiceClient } from '@google-cloud/discoveryengine';
import * as dotenv from 'dotenv';

dotenv.config();

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID || 'sentra-healthcare-solution';
const LOCATION = 'global'; // Discovery Engine default
const COLLECTION_ID = 'default_collection';
const DATA_STORE_ID = process.env.VERTEX_SEARCH_DATASTORE_ID || 'medical-knowledge-base';

async function initializeInfrastructure() {
    console.log('--- 🛠️  Memulai Inisialisasi Infrastruktur Vertex AI Search ---');
    const client = new DataStoreServiceClient();

    try {
        const parent = `projects/${PROJECT_ID}/locations/${LOCATION}/collections/${COLLECTION_ID}`;
        
        console.log(`⏳ Mengecek Data Store: ${DATA_STORE_ID}...`);
        
        // Coba buat Data Store
        const response = await client.createDataStore({
            parent,
            dataStoreId: DATA_STORE_ID,
            dataStore: {
                displayName: 'Sentra Medical Knowledge Base',
                industryVertical: 'GENERIC',
                contentConfig: 'CONTENT_REQUIRED',
                solutionTypes: [1, 2], // Menggunakan enum value jika string literal ditolak
            }
        });

        // SDK 2026: createDataStore return LROperation langsung
        const operation = response[0];
        console.log('⏳ Menunggu operasi pembuatan selesai...');
        await (operation as any).promise();
        
        console.log(`✅ BERHASIL! Data Store "${DATA_STORE_ID}" sekarang AKTIF.`);
        console.log(`🔗 Silakan cek di: https://console.cloud.google.com/gen-app-builder/data-stores`);
        
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log(`ℹ️  Data Store "${DATA_STORE_ID}" sudah ada. Melanjutkan ke aktivasi...`);
        } else {
            console.error('❌ Gagal inisialisasi:', error.message);
            console.log('\n💡 TIPS: Pastikan API "Discovery Engine" sudah di-enable di Console GCP.');
        }
    }
}

initializeInfrastructure();
