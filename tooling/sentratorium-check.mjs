#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SENTRATORIUM_LATEST = 'docs/sentratorium/latest.md'
const SENTRATORIUM_LOG = 'docs/sentratorium/AGENT_SESSION_LOG.md'
const SENTRATORIUM_FILES = new Set([SENTRATORIUM_LATEST, SENTRATORIUM_LOG])

function run(command) {
  return execSync(command, {
    cwd: resolve('.'),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function parseGitStatus() {
  const output = run('git status --porcelain')
  if (!output) return []

  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const path = line.slice(3).trim()
      return path.replace(/\\/g, '/')
    })
}

function getLastLogEntry(logFilePath) {
  const content = readFileSync(logFilePath, 'utf8')
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith('#') &&
        !line.startsWith('<!--') &&
        !line.startsWith('```') &&
        line.includes('|')
    )

  if (lines.length === 0) return null

  for (let index = lines.length - 1; index >= 0; index--) {
    const candidate = lines[index]
    const separatorCount = candidate.split('|').length - 1
    if (separatorCount >= 7) return candidate
  }

  return null
}

function assertSentratoriumFormat(logFilePath) {
  const lastEntry = getLastLogEntry(logFilePath)
  if (!lastEntry) {
    throw new Error('AGENT_SESSION_LOG.md tidak memiliki entri.')
  }

  const columns = lastEntry
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
  if (columns.length < 8) {
    throw new Error(
      'Format baris terakhir AGENT_SESSION_LOG.md tidak valid. Gunakan: YYYY-MM-DD | Agent | Project | Phase | What done | Decisions | Blockers | Next'
    )
  }
}

function main() {
  const changedPaths = parseGitStatus()
  const changedSet = new Set(changedPaths)

  const nonSentratoriumChanges = changedPaths.filter((path) => !SENTRATORIUM_FILES.has(path))
  if (nonSentratoriumChanges.length === 0) {
    console.log('No non-Sentratorium changes detected, check skipped.')
    return
  }

  const missing = [...SENTRATORIUM_FILES].filter((path) => !changedSet.has(path))
  if (missing.length > 0) {
    throw new Error(
      `Perubahan kode terdeteksi tetapi file Sentratorium belum lengkap diupdate: ${missing.join(', ')}`
    )
  }

  assertSentratoriumFormat(resolve(SENTRATORIUM_LOG))
  readFileSync(resolve(SENTRATORIUM_LATEST), 'utf8')

  console.log('Sentratorium check passed.')
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Sentratorium check failed: ${message}`)
  process.exit(1)
}
