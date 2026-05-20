# About Page First Release Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first real `/about` route as a layered authority page that extends the current founder-profile site with professional positioning, manifesto, authority signals, and a calm invitation into further conversation.

**Architecture:** Add a dedicated `/about` App Router page that composes a new `AboutPage` surface from route-specific content stored in `lib/about-content.ts`. Extend the shared metadata and navigation layers so `/about` becomes a real part of the site architecture without forcing a site-wide redesign or turning the page into a biography-heavy profile.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS, Vitest, Testing Library, ESLint

---

## Editorial Grounding

Use the user-provided executive profile as a shaping source for the `/about` page, but do not copy internal-profile language too literally.

The implemented content should emphasize:

- physician-executive positioning rooted in real healthcare operations
- accountability as architecture, not afterthought
- augmentation under human judgment, not AI authority
- institutional seriousness, governance awareness, and implementation reality
- a quiet, editorial-intellectual tone rather than promotional hero copy

The implemented content should soften or avoid:

- patent-protected or IP-protection language unless publication-ready proof is available
- extreme effort claims that read as hyperbole
- exact product-performance metrics not yet intended for public site use
- confidential or roadmap-heavy wording lifted directly from internal profile material

## Ownership Split

Keep the same collaboration model the user requested earlier.

- **Codex owns:** route architecture, shared navigation wiring, `/about` page composition, styling layer, route tests, verification
- **Claude owns:** `/about` content model, page-level metadata copy, manifesto/principles/authority wording

Do not overlap write sets unless a later checkpoint explicitly reassigns ownership.

## File Structure

### Existing files to modify

- `app/page.tsx:1-5`
  Purpose: keep the homepage entrypoint thin while staying compatible with the expanded route model
- `app/globals.css`
  Purpose: add `/about`-specific styling without disturbing the homepage baseline
- `components/Navbar.tsx:1-26`
  Purpose: update primary navigation so `/about` becomes a real route-level destination
- `components/HomePage.tsx:1-30`
  Purpose: preserve a home-specific navigation context if needed after nav expansion
- `lib/site-content.ts:1-68`
  Purpose: extend shared route and navigation data
- `lib/site-metadata.ts:1-31`
  Purpose: support page-specific metadata construction
- `tests/components/navbar.test.tsx`
  Purpose: verify route-aware primary navigation
- `tests/lib/site-metadata.test.ts`
  Purpose: verify page-specific metadata output

### New files to create

- `app/about/page.tsx`
  Purpose: real `/about` route entrypoint plus page-level metadata export
- `components/AboutPage.tsx`
  Purpose: top-level `/about` page composition
- `lib/about-content.ts`
  Purpose: source of truth for `/about` headline, manifesto, principles, authority signals, systems bridge, and closing invitation
- `tests/app/about-page.test.tsx`
  Purpose: verify `/about` renders the expected editorial sections

## Task 1: Claude - Define About Content and Page Metadata Inputs

**Files:**

- Create: `lib/about-content.ts`
- Modify: `lib/site-content.ts:1-68`
- Modify: `lib/site-metadata.ts:1-31`
- Modify: `tests/lib/site-metadata.test.ts:1-20`

- [ ] **Step 1: Write the failing metadata test for a route-specific `/about` page**

Update `tests/lib/site-metadata.test.ts` to:

```ts
import { afterEach, describe, expect, it } from 'vitest'
import { buildPageMetadata, getSiteUrl } from '@/lib/site-metadata'

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
        'Professional positioning and worldview of dr. Ferdi Iskandar as a physician-founder and clinical intelligence builder.',
      pathname: '/about',
    })

    expect(metadata.title).toBe('About | dr. Ferdi Iskandar')
    expect(metadata.description).toContain('Professional positioning')
    expect(metadata.openGraph?.url).toBe('/about')
  })
})
```

- [ ] **Step 2: Run the test to verify the new helper signature does not exist yet**

Run:

```bash
npm run test -- tests/lib/site-metadata.test.ts
```

Expected:

```text
FAIL ... buildPageMetadata is not defined
```

- [ ] **Step 3: Create the `/about` content source of truth**

Create `lib/about-content.ts`:

```ts
export const aboutHero = {
  eyebrow: 'About / Professional Positioning',
  title: 'Professional positioning, shaped by clinical reality and system responsibility.',
  thesis:
    'dr. Ferdi Iskandar works at the intersection of clinical judgment, healthcare leadership, and accountable systems architecture.',
  context:
    'This page is not a chronology. It is a structured view of the professional role, operating worldview, and institutional posture behind the systems being built.',
} as const

export const aboutPositioning = [
  'Physician-executive working from clinical and operational reality rather than abstraction.',
  'Founder building healthcare intelligence with institutional seriousness and governance awareness.',
  'Systems architect shaping technology as an extension of human judgment, not a substitute for it.',
  'Clinical intelligence builder focused on accountable, context-aware infrastructure.',
  'Strategic transformation thinker translating pressure, complexity, and responsibility into operational direction.',
] as const

export const aboutManifesto = [
  'Healthcare technology should not compete with human care for attention. Its role is to clarify signal, reduce friction, and make difficult judgment more legible.',
  'Intelligence becomes valuable in healthcare only when it remains accountable to people, institutions, and consequences. Capability without responsibility is not enough.',
  'Systems should be designed for the conditions that actually exist: uneven infrastructure, operational pressure, and the need for trust across clinical teams.',
  'The highest form of technical ambition is not spectacle. It is quiet reliability under real institutional responsibility.',
] as const

export const aboutPrinciples = [
  {
    title: 'Clarity over noise',
    body: 'Technology should reduce cognitive burden, not add a new layer of distraction.',
  },
  {
    title: 'Judgment stays human',
    body: 'Systems may assist, structure, and surface signal, but professional judgment must remain visible and intact.',
  },
  {
    title: 'Accountability is part of design',
    body: 'Trust is built through auditability, restraint, and operational honesty, not through output volume alone.',
  },
  {
    title: 'Architecture must fit reality',
    body: 'Useful systems respect actual institutional conditions instead of assuming ideal environments.',
  },
] as const

export const aboutAuthoritySignals = [
  'Founder leadership grounded in healthcare transformation, not detached product theater.',
  'Healthcare executive experience shaped under sustained institutional responsibility and crisis pressure.',
  'Civil-law and medical-malpractice literacy informing how governance and accountability are designed.',
  'System-building direction shaped around clinical intelligence, workflow clarity, and implementation reality.',
  'Institution-facing mindset that treats trust, safety, and coordination as design responsibilities.',
] as const

export const aboutSystemsBridge = {
  title: 'From positioning to systems',
  body: 'The worldview on this page is not separate from the systems work. It is the operating logic behind how intelligence layers, care infrastructure, and route-ready product surfaces are designed.',
  href: '/systems',
  fallbackHref: '/#portfolio',
  label: 'Explore systems thinking',
} as const

export const aboutClosing = {
  title: 'If this way of thinking is relevant, the next step is conversation.',
  body: 'The purpose of this page is not to impress through volume, but to make the professional posture behind the work understandable. If that posture aligns with your institution, collaboration, or strategic agenda, the next step is a clear and grounded conversation.',
  href: '/contact',
  fallbackHref: '/#contact',
  label: 'Open a conversation',
} as const
```

- [ ] **Step 4: Editorial self-check before closeout**

Confirm the content draft follows these rules before handing it to route implementation:

- positioning-first, not biography-first
- manifesto remains public-safe and not overly internal
- authority signals imply credibility without turning into a CV wall
- no unverified patent, metric, or exaggerated-intensity claims are introduced

- [ ] **Step 5: Extend shared route data to include `/about` in the live architecture**

Update `lib/site-content.ts` to:

```ts
export const primaryNav = [
  { label: 'About', href: '/about' },
  { label: 'Impact', href: '/#impact' },
  { label: 'Systems', href: '/#portfolio' },
  { label: 'Thinking', href: '/#expertise' },
  { label: 'Brief', href: '/#intelligence' },
  { label: 'Vision', href: '/#vision' },
  { label: 'Contact', href: '/#contact' },
] as const

export const futureRoutes = [
  { label: 'About', href: '/about' },
  { label: 'Systems', href: '/systems' },
  { label: 'Notes', href: '/notes' },
  { label: 'Contact', href: '/contact' },
] as const
```

- [ ] **Step 6: Replace the one-size-fits-all metadata helper with a page-aware builder**

Replace `lib/site-metadata.ts` with:

```ts
import type { Metadata } from 'next'
import { siteIdentity } from '@/lib/site-content'

type PageMetadataInput = {
  title: string
  description: string
  pathname: string
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export function buildPageMetadata({ title, description, pathname }: PageMetadataInput): Metadata {
  const siteTitle = `${title} | ${siteIdentity.name}`

  return {
    title: siteTitle,
    description,
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      title: siteTitle,
      description,
      url: pathname,
      siteName: siteIdentity.shortName,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description,
    },
  }
}

export function buildSiteMetadata(): Metadata {
  return buildPageMetadata({
    title: siteIdentity.name,
    description:
      'Profil pribadi dr. Ferdi Iskandar — founder profile on clinical intelligence, human-AI collaboration, and healthcare systems transformation in Indonesia.',
    pathname: '/',
  })
}
```

- [ ] **Step 6: Re-run the focused metadata test**

Run:

```bash
npm run test -- tests/lib/site-metadata.test.ts
```

Expected:

```text
PASS tests/lib/site-metadata.test.ts
```

- [ ] **Step 7: Commit the content-and-metadata layer**

```bash
git add lib/about-content.ts lib/site-content.ts lib/site-metadata.ts tests/lib/site-metadata.test.ts
git commit -m "feat: define about page content model"
```

## Task 2: Codex - Add the `/about` Route and Route-Level Tests

**Files:**

- Create: `app/about/page.tsx`
- Create: `components/AboutPage.tsx`
- Create: `tests/app/about-page.test.tsx`
- Modify: `components/Navbar.tsx:1-26`
- Modify: `tests/components/navbar.test.tsx:1-18`

- [ ] **Step 1: Write failing tests for the new route composition and nav**

Create `tests/app/about-page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import AboutPage from '@/components/AboutPage'

describe('AboutPage', () => {
  it('renders the layered authority structure', () => {
    render(<AboutPage />)

    expect(
      screen.getByRole('heading', {
        name: /professional positioning, guided by a clear worldview/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /operating principles/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open a conversation/i })).toHaveAttribute(
      'href',
      '/#contact',
    )
  })
})
```

Update `tests/components/navbar.test.tsx` to:

```tsx
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

describe('Navbar', () => {
  it('renders the route-aware primary navigation', () => {
    render(<Navbar />)

    expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Impact' })).toHaveAttribute('href', '/#impact')
  })
})
```

- [ ] **Step 2: Run the focused tests and verify they fail before route implementation**

Run:

```bash
npm run test -- tests/components/navbar.test.tsx tests/app/about-page.test.tsx
```

Expected:

```text
FAIL ... Cannot find module '@/components/AboutPage'
```

- [ ] **Step 3: Create the top-level `/about` route entrypoint**

Create `app/about/page.tsx`:

```tsx
import type { Metadata } from 'next'
import AboutPage from '@/components/AboutPage'
import { buildPageMetadata } from '@/lib/site-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'About',
  description:
    'Professional positioning and worldview of dr. Ferdi Iskandar as a physician-founder and clinical intelligence builder.',
  pathname: '/about',
})

export default function Page() {
  return <AboutPage />
}
```

- [ ] **Step 4: Create the `AboutPage` composition**

Create `components/AboutPage.tsx`:

```tsx
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import {
  aboutAuthoritySignals,
  aboutClosing,
  aboutHero,
  aboutManifesto,
  aboutPositioning,
  aboutPrinciples,
  aboutSystemsBridge,
} from '@/lib/about-content'

export default function AboutPage() {
  return (
    <div className="fi-page fi-page-about" id="about-page">
      <Navbar />
      <main className="fi-shell fi-about-shell" id="main-content">
        <section className="fi-about-hero">
          <p className="fi-eyebrow">{aboutHero.eyebrow}</p>
          <h1>{aboutHero.title}</h1>
          <p className="fi-about-thesis">{aboutHero.thesis}</p>
          <p className="fi-about-context">{aboutHero.context}</p>
        </section>

        <section className="fi-about-section" aria-labelledby="about-positioning-title">
          <div className="fi-about-section-head">
            <span className="fi-kicker">Professional Positioning</span>
            <h2 id="about-positioning-title">A physician-founder building clarity, not noise.</h2>
          </div>
          <div className="fi-about-list">
            {aboutPositioning.map((item) => (
              <article className="fi-about-card" key={item}>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fi-about-section" aria-labelledby="about-manifesto-title">
          <div className="fi-about-section-head">
            <span className="fi-kicker">Worldview</span>
            <h2 id="about-manifesto-title">
              Technology should strengthen judgment, not compete with it.
            </h2>
          </div>
          <div className="fi-about-manifesto">
            {aboutManifesto.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="fi-about-section" aria-labelledby="about-principles-title">
          <div className="fi-about-section-head">
            <span className="fi-kicker">Operating Logic</span>
            <h2 id="about-principles-title">Operating principles</h2>
          </div>
          <div className="fi-about-principles">
            {aboutPrinciples.map((principle) => (
              <article className="fi-about-principle" key={principle.title}>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fi-about-section" aria-labelledby="about-authority-title">
          <div className="fi-about-section-head">
            <span className="fi-kicker">Authority Signals</span>
            <h2 id="about-authority-title">Credibility shaped by real systems intent.</h2>
          </div>
          <div className="fi-about-authority">
            {aboutAuthoritySignals.map((signal) => (
              <p key={signal}>{signal}</p>
            ))}
          </div>
        </section>

        <section className="fi-about-section fi-about-bridge" aria-labelledby="about-bridge-title">
          <span className="fi-kicker">Systems Bridge</span>
          <h2 id="about-bridge-title">{aboutSystemsBridge.title}</h2>
          <p>{aboutSystemsBridge.body}</p>
          <Link className="fi-button secondary" href={aboutSystemsBridge.fallbackHref}>
            {aboutSystemsBridge.label}
          </Link>
        </section>

        <section className="fi-about-section fi-about-close" aria-labelledby="about-close-title">
          <span className="fi-kicker">Invitation</span>
          <h2 id="about-close-title">{aboutClosing.title}</h2>
          <p>{aboutClosing.body}</p>
          <Link className="fi-button" href={aboutClosing.fallbackHref}>
            {aboutClosing.label}
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 5: Keep the navbar route-aware using the shared nav map**

Replace `components/Navbar.tsx` with:

```tsx
import Link from 'next/link'
import { primaryNav, siteIdentity } from '@/lib/site-content'

export default function Navbar() {
  return (
    <nav aria-label="Primary navigation" className="fi-nav">
      <div className="fi-shell fi-nav-inner">
        <Link aria-label="Back to homepage" className="fi-brand" href="/">
          <span className="fi-mark">FI</span>
          <span className="fi-brand-text">
            <strong>{siteIdentity.name}</strong>
            <span>{siteIdentity.tagline}</span>
          </span>
        </Link>
        <div className="fi-nav-links">
          {primaryNav.map((item) => (
            <Link href={item.href} key={item.label}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="fi-nav-meta">Sentra Healthcare AI · Melinda DHAI</div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 6: Re-run the focused route tests**

Run:

```bash
npm run test -- tests/components/navbar.test.tsx tests/app/about-page.test.tsx
```

Expected:

```text
PASS tests/components/navbar.test.tsx
PASS tests/app/about-page.test.tsx
```

- [ ] **Step 7: Commit the route architecture**

```bash
git add app/about/page.tsx components/AboutPage.tsx components/Navbar.tsx tests/app/about-page.test.tsx tests/components/navbar.test.tsx
git commit -m "feat: add about page route"
```

## Task 3: Codex - Add the About-Specific Editorial Styling Layer

**Files:**

- Modify: `app/globals.css`

- [ ] **Step 1: Add a route-scoped `/about` styling block**

Append this block near the end of `app/globals.css`:

```css
/* ============ BLOCK 5: ABOUT PAGE ============ */
#about-page.fi-page-about {
  background:
    radial-gradient(circle at 16% 8%, rgba(23, 61, 103, 0.08), transparent 26rem), var(--fi-paper);
}

#about-page .fi-about-shell {
  display: grid;
  gap: clamp(56px, 7vw, 96px);
  padding-top: clamp(56px, 8vw, 110px);
  padding-bottom: clamp(56px, 8vw, 110px);
}

#about-page .fi-about-hero h1,
#about-page .fi-about-section h2 {
  font-family: Georgia, serif;
  letter-spacing: -0.06em;
  color: var(--fi-ink);
}

#about-page .fi-about-hero h1 {
  max-width: 12ch;
  font-size: clamp(56px, 9vw, 120px);
  line-height: 0.92;
}

#about-page .fi-about-thesis {
  max-width: 820px;
  margin-top: 18px;
  color: var(--fi-blue-2);
  font-size: clamp(22px, 2.1vw, 34px);
  line-height: 1.18;
  letter-spacing: -0.04em;
}

#about-page .fi-about-context {
  max-width: 760px;
  margin-top: 20px;
  color: var(--fi-muted);
  font-size: 17px;
  line-height: 1.65;
}

#about-page .fi-about-section {
  display: grid;
  gap: 28px;
  padding-top: 36px;
  border-top: 1px solid var(--fi-line);
}

#about-page .fi-about-section-head {
  display: grid;
  gap: 12px;
  max-width: 860px;
}

#about-page .fi-about-section-head h2 {
  font-size: clamp(38px, 5vw, 74px);
  line-height: 0.96;
}

#about-page .fi-about-list,
#about-page .fi-about-principles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

#about-page .fi-about-card,
#about-page .fi-about-principle {
  padding: 24px;
  border: 1px solid var(--fi-line);
  background: rgba(255, 253, 248, 0.72);
  border-radius: 24px;
}

#about-page .fi-about-card p,
#about-page .fi-about-principle p,
#about-page .fi-about-authority p,
#about-page .fi-about-bridge p,
#about-page .fi-about-close p {
  color: var(--fi-muted);
  font-size: 16px;
  line-height: 1.68;
}

#about-page .fi-about-manifesto {
  display: grid;
  gap: 18px;
  max-width: 900px;
}

#about-page .fi-about-manifesto p {
  color: var(--fi-blue-2);
  font-family: Georgia, serif;
  font-size: clamp(21px, 2vw, 30px);
  line-height: 1.35;
  letter-spacing: -0.03em;
}

#about-page .fi-about-principle h3 {
  margin-bottom: 12px;
  font-size: 20px;
  letter-spacing: -0.03em;
  color: var(--fi-ink);
}

#about-page .fi-about-authority {
  display: grid;
  gap: 14px;
  max-width: 920px;
  padding-left: 24px;
  border-left: 2px solid var(--fi-gold);
}

#about-page .fi-about-bridge,
#about-page .fi-about-close {
  max-width: 920px;
}

#about-page .fi-about-close {
  padding-bottom: 10px;
}

@media (max-width: 900px) {
  #about-page .fi-about-list,
  #about-page .fi-about-principles {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Verify the stylesheet still passes lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected:

```text
0 problems
Compiled successfully
```

- [ ] **Step 3: Commit the styling layer**

```bash
git add app/globals.css
git commit -m "style: add about page editorial layer"
```

## Task 4: Codex - Run Full Verification and Protect the Baseline

**Files:**

- Modify if needed after verification: only files already listed above

- [ ] **Step 1: Run the full automated suite**

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected:

```text
0 problems
Found 0 errors
all tests passed
Compiled successfully
```

- [ ] **Step 2: Run the local app and verify route behavior**

Run:

```bash
npm run dev
```

Then verify manually:

- `/` still loads normally
- `/about` loads normally
- navbar on `/about` includes `About`, `Impact`, `Systems`, `Thinking`, `Brief`, `Vision`, `Contact`
- `About` brand link returns to `/`
- `/about` reads as a focused editorial page rather than a duplicate homepage section
- CTA links on `/about` route toward `/#portfolio` and `/#contact`

- [ ] **Step 3: Verify requirements against the approved spec**

Checklist:

- professional positioning is explicit near the top
- manifesto/worldview is the intellectual center
- operating principles are structured and concrete
- authority signals are present but not CV-heavy
- closing invitation supports a balanced outcome
- route expansion starts the multi-page architecture without redesigning the whole site

- [ ] **Step 4: Final commit**

```bash
git add app/about/page.tsx app/globals.css components/AboutPage.tsx components/Navbar.tsx lib/about-content.ts lib/site-content.ts lib/site-metadata.ts tests/app/about-page.test.tsx tests/components/navbar.test.tsx tests/lib/site-metadata.test.ts
git commit -m "feat: release the first about page"
```

## Spec Coverage Check

- real `/about` route: covered by Task 2
- shared navigation update: covered by Task 1 and Task 2
- approved section structure: covered by Task 1 and Task 2
- about-specific styling layer: covered by Task 3
- route-specific metadata: covered by Task 1 and Task 2
- route-level testing: covered by Task 2 and Task 4
- build and navigation verification: covered by Task 3 and Task 4

No spec gaps remain.

## Execution Notes

- Do not turn `/about` into a biography timeline in this release.
- Do not introduce `/systems`, `/notes`, or `/contact` as real pages in this plan.
- Reuse the existing homepage visual language; avoid route-wide invention that forces a redesign.
- Prefer fallback links to existing homepage anchors until those future routes become real.
