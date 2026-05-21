import fs from 'node:fs/promises'
import path from 'node:path'

import { resolveRepoDataFile } from '../safe-path'
import type { PortalStatus, VerifyStatusFile } from '../types'

const VERIFY_REL = '.agent/reports/portal-verify-status.json'

export async function readVerifyStatus(): Promise<VerifyStatusFile | null> {
  try {
    const raw = await fs.readFile(resolveRepoDataFile(VERIFY_REL), 'utf8')
    return JSON.parse(raw) as VerifyStatusFile
  } catch {
    return null
  }
}

export async function writeVerifyStatus(file: VerifyStatusFile): Promise<void> {
  const target = resolveRepoDataFile(VERIFY_REL)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, `${JSON.stringify(file, null, 2)}\n`, 'utf8')
}

export function overallFromParts(parts: { typecheck: boolean; test: boolean }): PortalStatus {
  if (parts.typecheck && parts.test) return 'ok'
  if (!parts.typecheck && !parts.test) return 'critical'
  return 'warn'
}
