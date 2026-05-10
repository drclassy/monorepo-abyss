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

  it('builds classy-news metadata with the new route pathname', () => {
    const metadata = buildPageMetadata({
      title: 'Classy News',
      description:
        'Halaman editorial khusus Classy News di dalam ferdiiskandar: signal AI, open-source watch, dan jembatan terkurasi ke notes, works, speaking, serta contact surface.',
      pathname: '/classy-news',
    })

    expect(metadata.title).toBe('Classy News | dr. Ferdi Iskandar')
    expect(String(metadata.description)).toContain('Classy News')
    expect(metadata.openGraph?.url).toBe('/classy-news')
  })

  it('preserves the founder-style homepage title', () => {
    const metadata = buildSiteMetadata()

    expect(metadata.title).toBe('dr. Ferdi Iskandar — Augmented Intelligence Architect')
    expect(String(metadata.description)).toContain('kecerdasan terapan')
    expect(String(metadata.description)).toContain('Profil pribadi')
    expect(metadata.openGraph?.url).toBe('/')
  })
})
