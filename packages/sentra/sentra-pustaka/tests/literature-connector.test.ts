import { describe, expect, it } from 'vitest'

import { ingestHarvestedLiterature } from '../src/ingestion/literature-connector'

const fakeManifest = {
  records: [
    {
      source: 'europe-pmc' as const,
      sourceId: 'PMC123',
      title: 'Hypertension Guidelines 2024',
      openAccess: true,
      publishedYear: 2024,
      status: 'downloaded' as const,
      contentPath: '/fake/PMC123.xml',
    },
    {
      source: 'pubmed' as const,
      sourceId: 'PMID456',
      title: 'Cardiac Risk Factors',
      openAccess: false,
      publishedYear: 2023,
      status: 'downloaded' as const,
      contentPath: '/fake/PMID456.xml',
    },
  ],
}

describe('ingestHarvestedLiterature', () => {
  it('auto-approves Europe PMC open-access records', async () => {
    const summary = await ingestHarvestedLiterature(fakeManifest, {
      registryDir: '/fake/registry',
      artifactsDir: '/fake/artifacts',
      autoApproveOpenAccess: true,
      trustedSources: ['europe-pmc'],
    })

    expect(summary.records_auto_approved).toBe(1)
  })

  it('marks non-open-access PubMed records as pending review', async () => {
    const summary = await ingestHarvestedLiterature(fakeManifest, {
      registryDir: '/fake/registry',
      artifactsDir: '/fake/artifacts',
      autoApproveOpenAccess: true,
      trustedSources: ['europe-pmc'],
    })

    expect(summary.records_pending_review).toBe(1)
  })

  it('respects autoApproveOpenAccess=false and routes all records to review', async () => {
    const summary = await ingestHarvestedLiterature(fakeManifest, {
      registryDir: '/fake/registry',
      artifactsDir: '/fake/artifacts',
      autoApproveOpenAccess: false,
      trustedSources: ['europe-pmc'],
    })

    expect(summary.records_auto_approved).toBe(0)
    expect(summary.records_pending_review).toBe(2)
  })
})
