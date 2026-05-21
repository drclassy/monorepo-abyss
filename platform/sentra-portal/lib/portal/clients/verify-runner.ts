import { spawn } from 'node:child_process'

import { getRepoRoot } from '../repo-root'
import type { PortalStatus, VerifyStatusFile } from '../types'

import { overallFromParts, writeVerifyStatus } from './verify-cache'

function run(cmd: string, args: string[], cwd: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: true })
    child.on('close', (code) => resolve(code === 0))
    child.on('error', () => resolve(false))
  })
}

function status(ok: boolean): PortalStatus {
  return ok ? 'ok' : 'critical'
}

export async function runPortalVerify(): Promise<VerifyStatusFile> {
  const fetchedAt = new Date().toISOString()
  const root = getRepoRoot()
  const portalFilter = '--filter @the-abyss/sentra-portal'

  const typecheckOk = await run('pnpm', [portalFilter, 'typecheck'], root)
  const testOk = await run('pnpm', [portalFilter, 'test'], root)

  const file: VerifyStatusFile = {
    at: fetchedAt,
    build: 'unknown',
    typecheck: status(typecheckOk),
    test: status(testOk),
    overall: overallFromParts({ typecheck: typecheckOk, test: testOk }),
  }

  await writeVerifyStatus(file)
  return file
}
