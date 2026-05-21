// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import * as fs from 'fs'
import * as path from 'path'

import * as dotenv from 'dotenv'

import { PgVectorStore } from './storage/pgvector.store.js'
import type { MedicalCategory } from './types.js'

dotenv.config()

const LIBRARY_PATH =
  process.env.MEDICAL_LIBRARY_PATH || path.join(process.cwd(), '../../library/medical')

const CATEGORIES: MedicalCategory[] = ['gen', 'int', 'pha', 'ped', 'obg', 'bas']

const CATEGORY_LABELS: Record<MedicalCategory, string> = {
  gen: 'General Medicine',
  int: 'Internal Medicine',
  pha: 'Pharmacology',
  ped: 'Pediatrics',
  obg: 'Obstetrics/Gynecology',
  bas: 'Basic Sciences',
}

async function getStatus() {
  const store = new PgVectorStore()

  let dbStats: Record<string, number> = {}
  let dbTotal = 0
  try {
    await store.initialize()
    const stats = await store.stats()
    dbStats = stats.byCategory
    dbTotal = stats.total
  } catch {
    console.error('  [!] Cannot connect to database. Check DATABASE_URL in .env')
    process.exit(1)
  }

  // Per-file status from DB
  const fileStatus: Record<string, boolean> = {}
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const result = await pool.query(`SELECT DISTINCT source_file FROM medical_chunks`)
    for (const row of result.rows) fileStatus[row.source_file] = true
    await pool.end()
  } catch {
    // fallback: use category-level stats only
  }

  console.log('\n  SENTRA RAG ENGINE — Library Status')
  console.log('  ' + '═'.repeat(55))
  console.log(`  Library : ${LIBRARY_PATH}`)
  console.log(`  DB Total: ${dbTotal.toLocaleString()} chunks\n`)

  let grandTotal = 0
  let grandDone = 0

  for (const cat of CATEGORIES) {
    const subdir = path.join(LIBRARY_PATH, cat)
    if (!fs.existsSync(subdir)) {
      console.log(`  [${cat.toUpperCase()}] ${CATEGORY_LABELS[cat]} — directory not found`)
      continue
    }

    const allFiles = fs.readdirSync(subdir).filter((f) => f.endsWith('.pdf'))
    const doneFiles = allFiles.filter((f) => fileStatus[`library/medical/${cat}/${f}`])
    const pendingFiles = allFiles.filter((f) => !fileStatus[`library/medical/${cat}/${f}`])
    const chunks = dbStats[cat] ?? 0

    grandTotal += allFiles.length
    grandDone += doneFiles.length

    const bar =
      allFiles.length > 0
        ? `[${'█'.repeat(doneFiles.length)}${'░'.repeat(allFiles.length - doneFiles.length)}]`
        : '[empty]'

    const status =
      doneFiles.length === allFiles.length && allFiles.length > 0
        ? 'DONE  '
        : doneFiles.length > 0
          ? 'PARTIAL'
          : 'PENDING'

    console.log(`  [${cat.toUpperCase()}] ${CATEGORY_LABELS[cat]}`)
    console.log(
      `       ${bar} ${doneFiles.length}/${allFiles.length} files  |  ${chunks.toLocaleString()} chunks  |  ${status}`
    )

    if (pendingFiles.length > 0 && process.argv.includes('--detail')) {
      for (const f of pendingFiles) {
        console.log(`         - ${f.substring(0, 60)}`)
      }
    }
    console.log()
  }

  console.log('  ' + '─'.repeat(55))
  console.log(`  Total: ${grandDone}/${grandTotal} files indexed\n`)

  await store.close()
}

getStatus().catch(console.error)
