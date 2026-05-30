import { describe, expect, it } from 'vitest'

import { loadStripSummary } from '../aggregate/summary'
import { getRepoRoot } from '../repo-root'

describe('loadStripSummary integration', () => {
  it('loads live monorepo metrics when repo root resolves', async () => {
    const root = getRepoRoot()
    expect(root.length).toBeGreaterThan(0)

    const result = await loadStripSummary()
    const data = result.data
    expect(data).toBeDefined()
    expect(data?.branch).not.toBe('—')
    expect(data?.headShort.length).toBeGreaterThan(0)
    expect(data?.nextAction.length).toBeGreaterThan(10)
    expect(data?.dirtyTotal).toBeGreaterThanOrEqual(0)
    expect(data?.activeWork.length).toBeGreaterThan(5)
    expect(data?.repoRoot).toBe(root)
  }, 15000)
})
