import { afterEach, describe, expect, it } from 'vitest'

import { buildPageMetadata, buildSiteMetadata, getSiteUrl } from '@/lib/site-metadata'

describe('site metadata', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  it('falls back to localhost when no public site url is set', () => {
    expect(getSiteUrl()).toBe('http://localhost:3000')
  })

  it('builds about-page metadata with route-specific title and pathname', () => {
    const metadata = buildPageMetadata({
      title: 'About',
      description:
        'Professional positioning dan worldview dr. Ferdi Iskandar sebagai physician-founder yang membangun applied intelligence di sektor healthcare, education, workforce, dan digital experience.',
      pathname: '/about',
    })

    expect(metadata.title).toBe('About | dr. Ferdi Iskandar')
    expect(metadata.description).toContain('worldview')
    expect(metadata.openGraph?.url).toBe('/about')
  })

  it('preserves the founder-style homepage title', () => {
    const metadata = buildSiteMetadata()

    expect(metadata.title).toBe('dr. Ferdi Iskandar — Augmented Intelligence Architect')
    expect(String(metadata.description)).toContain('applied intelligence')
    expect(String(metadata.description)).toContain('Profil pribadi')
    expect(metadata.openGraph?.url).toBe('/')
  })
})
