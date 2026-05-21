import fs from 'node:fs/promises'
import path from 'node:path'

import { parseRagPhaseNotes } from '../parsers/handoff'
import { getRepoRoot } from '../repo-root'
import { resolveAgentFile, resolveRepoDataFile } from '../safe-path'

const EVAL_RUNS_REL = 'packages/sentra/sentra-pustaka/data/retrieval-evaluation/runs'
const REGISTRY_REL = 'packages/sentra/sentra-pustaka/data/knowledge-registry/registry.json'

interface RegistryFile {
  entries?: Array<{ registry_status?: string }>
}

interface EvalSummary {
  retrieval_eval_run_id: string
  status: string
  aadi_readiness: string
  passed_queries: number
  total_queries: number
  avg_similarity: number
  completed_at: string
  write_mode: string
}

interface QualityReport {
  approval_rate: number
  traceability_completeness: number
  readiness_reason: string
  aadi_readiness: string
}

export async function loadRagMetrics() {
  const registryPath = resolveRepoDataFile(REGISTRY_REL)
  let registryTotal = 0
  let registryApproved = 0
  let registryPending = 0

  try {
    const raw = await fs.readFile(registryPath, 'utf8')
    const registry = JSON.parse(raw) as RegistryFile
    const entries = registry.entries ?? []
    registryTotal = entries.length
    registryApproved = entries.filter((e) => e.registry_status === 'approved_for_embedding').length
    registryPending = entries.filter((e) => e.registry_status !== 'approved_for_embedding').length
  } catch {
    // registry optional for display
  }

  const runsDir = path.join(getRepoRoot(), EVAL_RUNS_REL.replace(/\//g, path.sep))
  let latestEval: EvalSummary | null = null
  let quality: QualityReport | null = null

  try {
    const runFolders = await fs.readdir(runsDir, { withFileTypes: true })
    const dirs = runFolders.filter((d) => d.isDirectory()).map((d) => d.name)
    dirs.sort().reverse()

    for (const dir of dirs) {
      const summaryPath = path.join(runsDir, dir, 'retrieval-eval-summary.json')
      try {
        const summaryRaw = await fs.readFile(summaryPath, 'utf8')
        latestEval = JSON.parse(summaryRaw) as EvalSummary
        const qualityPath = path.join(runsDir, dir, 'evidence-quality-report.json')
        try {
          const qualityRaw = await fs.readFile(qualityPath, 'utf8')
          quality = JSON.parse(qualityRaw) as QualityReport
        } catch {
          quality = null
        }
        break
      } catch {
        continue
      }
    }
  } catch {
    // no eval runs yet
  }

  let phaseNotes = [
    'Phase 1 pipeline hardening: embedding batch + circuit breaker',
    'Phase 2: Recall@K / MRR eval metrics',
    'Phase 3: literature auto-pipeline',
  ]

  try {
    const handoff = await fs.readFile(resolveAgentFile('.agent/HANDOFF.md'), 'utf8')
    const parsed = parseRagPhaseNotes(handoff)
    if (parsed.length > 0) phaseNotes = parsed
  } catch {
    // keep defaults
  }

  return {
    registryTotal,
    registryApproved,
    registryPending,
    latestEval,
    quality,
    evalRunsDir: EVAL_RUNS_REL,
    phaseNotes,
  }
}
