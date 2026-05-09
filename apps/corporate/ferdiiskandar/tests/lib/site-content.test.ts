import {
  contactCards,
  footerMeta,
  primaryNav,
  sectionIds,
  siteIdentity,
  socialLinks,
  thinkingMeta,
} from '@/lib/site-content'

describe('site content', () => {
  it('defines the current homepage reading order', () => {
    expect(sectionIds).toEqual([
      { id: 'top', label: 'Top' },
      { id: 'impact', label: 'Impact' },
      { id: 'expertise', label: 'Thinking' },
      { id: 'sentra-sim', label: 'Simulation' },
      { id: 'portfolio', label: 'Systems' },
      { id: 'story-sentra', label: 'Story' },
      { id: 'contact', label: 'Contact' },
    ])
  })

  it('uses route-based navigation for the current public surfaces', () => {
    expect(primaryNav).toEqual([
      { label: 'About', href: '/about' },
      { label: 'Works', href: '/works' },
      { label: 'Notes', href: '/notes' },
      { label: 'Speaking', href: '/speaking' },
      { label: 'CV', href: '/cv' },
      { label: 'Contact', href: '/#contact' },
    ])
  })

  it('keeps contact cards intentionally non-clickable while public links stay direct', () => {
    expect(contactCards.every((card) => card.href === null)).toBe(true)
    expect(socialLinks).toHaveLength(6)
    expect(
      socialLinks.every(
        (link) => link.href.startsWith('https://') || link.href.startsWith('mailto:'),
      ),
    ).toBe(true)
  })

  it('keeps the current founder identity metadata stable', () => {
    expect(siteIdentity.headline).toBe('Augmented Intelligence Architect')
    expect(thinkingMeta.editionLabel).toBe('Current Edition')
    expect(footerMeta.year).toBe(new Date().getFullYear())
  })
})
