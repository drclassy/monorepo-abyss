# Founder Profile Stabilization Pass One Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the current founder-profile landing page so it runs cleanly, removes trust-breaking unfinished surfaces, preserves the existing editorial identity, and is ready to grow into a multi-page site later.

**Architecture:** Keep the existing section-driven landing page, but introduce a small shared content/metadata layer so navigation, contact, footer, and document metadata all come from one route-ready source of truth. Use lightweight automated tests plus build/lint/typecheck verification to harden the baseline without over-engineering the site.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS, npm, Vitest, Testing Library, jsdom, ESLint

---

## Ownership Split

Because the user explicitly asked to split work between Codex and Claude, use this ownership map and do not overlap write sets.

- **Codex owns:** tooling, test harness, page composition, navigation, CSS stabilization, runtime verification
- **Claude owns:** shared site content, metadata, contact surface, footer, date-sensitive copy cleanup, sitemap/robots

If the folder is still not a Git repository at execution time, replace commit steps with local checkpoints. If `.git` appears before implementation starts, commit after each task with the suggested messages.

## File Structure

### Existing files to modify

- `package.json`
  Purpose: scripts and local quality tooling entrypoints
- `app/layout.tsx`
  Purpose: document shell, metadata wiring, skip-link, global semantics
- `app/page.tsx`
  Purpose: thin route entrypoint that renders a route-ready home shell
- `app/globals.css`
  Purpose: global visual system, focus states, mobile behavior, trust-safe component styling
- `components/Navbar.tsx`
  Purpose: primary navigation fed by the shared site content map
- `components/Contact.tsx`
  Purpose: trust-safe contact presentation with no dead `#` links
- `components/Expertise.tsx`
  Purpose: remove stale hard-coded date labels without changing the section’s meaning
- `components/Footer.tsx`
  Purpose: dynamic year and location text from the shared site content map

### New files to create

- `vitest.config.ts`
  Purpose: test runner configuration with jsdom and path alias support
- `eslint.config.mjs`
  Purpose: flat ESLint config for Next.js and TypeScript files
- `vitest.setup.ts`
  Purpose: Testing Library and `jest-dom` setup
- `lib/site-content.ts`
  Purpose: source of truth for identity, navigation, contact cards, footer text, and non-stale section labels
- `lib/site-metadata.ts`
  Purpose: reusable metadata builder with localhost-safe URL fallback
- `components/HomePage.tsx`
  Purpose: single composition surface for the homepage sections
- `app/sitemap.ts`
  Purpose: current-route sitemap baseline
- `app/robots.ts`
  Purpose: crawl baseline
- `tests/smoke/tooling.test.ts`
  Purpose: verify the test harness is alive
- `tests/lib/site-content.test.ts`
  Purpose: verify route-ready content integrity and no dead links
- `tests/lib/site-metadata.test.ts`
  Purpose: verify metadata and URL fallback behavior
- `tests/components/contact.test.tsx`
  Purpose: verify the contact surface never renders dead placeholders
- `tests/components/navbar.test.tsx`
  Purpose: verify the primary navigation labels and targets
- `tests/app/home-page.test.tsx`
  Purpose: verify the home shell composition and `main` landmark

## Task 1: Codex - Establish Tooling and Quality Baseline

**Files:**

- Modify: `package.json:1-22`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `tests/smoke/tooling.test.ts`
- Create during install: `package-lock.json`

- [ ] **Step 1: Update `package.json` scripts for lint, typecheck, and test**

Replace the `scripts` block in `package.json` with:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --max-warnings=0",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 2: Install the missing local quality tooling**

Run:

```bash
npm install -D eslint eslint-config-next vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected:

```text
added ... packages
found 0 vulnerabilities
```

- [ ] **Step 3: Create the Vitest config**

- [ ] **Step 3: Create the ESLint config**

Create `eslint.config.mjs`:

```js
import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [...nextVitals]

export default config
```

- [ ] **Step 4: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 4: Create the test setup file**
- [ ] **Step 5: Create the test setup file**

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 5: Create a smoke test that proves the harness is working**
- [ ] **Step 6: Create a smoke test that proves the harness is working**

Create `tests/smoke/tooling.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

describe('tooling baseline', () => {
  it('runs vitest in a browser-like environment', () => {
    const main = document.createElement('main')

    expect(main.tagName).toBe('MAIN')
  })
})
```

- [ ] **Step 6: Run the quality commands and verify the baseline**
- [ ] **Step 7: Run the quality commands and verify the baseline**

Run:

```bash
npm run test
npm run typecheck
```

Expected:

```text
PASS tests/smoke/tooling.test.ts
```

and

```text
Found 0 errors.
```

- [ ] **Step 7: Create a local checkpoint**
- [ ] **Step 8: Create a local checkpoint**

Run:

```bash
dir package-lock.json
npm run test
```

Expected:

```text
package-lock.json
```

If Git exists by this point, commit with:

```bash
git add package.json package-lock.json eslint.config.mjs vitest.config.ts vitest.setup.ts tests/smoke/tooling.test.ts
git commit -m "chore: add local quality baseline"
```

## Task 2: Claude - Introduce a Shared Site Content Source of Truth

**Files:**

- Create: `lib/site-content.ts`
- Create: `tests/lib/site-content.test.ts`

- [ ] **Step 1: Write a failing content-integrity test**

Create `tests/lib/site-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { contactCards, footerMeta, primaryNav, sectionIds, thinkingMeta } from '@/lib/site-content'

describe('site content', () => {
  it('defines unique section ids for the homepage architecture', () => {
    const ids = sectionIds.map((section) => section.id)

    expect(ids).toEqual([
      'top',
      'impact',
      'portfolio',
      'expertise',
      'intelligence',
      'vision',
      'field-notes',
      'contact',
    ])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('exposes trust-safe navigation and contact targets', () => {
    expect(primaryNav.every((item) => item.href.startsWith('#'))).toBe(true)
    expect(contactCards.some((card) => card.href === '#')).toBe(false)
  })

  it('removes stale hard-coded time labels from the thinking surface', () => {
    expect(thinkingMeta.editionLabel).toBe('Current Edition')
    expect(thinkingMeta.lastUpdatedLabel).toBe('Currently evolving')
  })

  it('uses a dynamic footer year', () => {
    expect(footerMeta.year).toBe(new Date().getFullYear())
  })
})
```

- [ ] **Step 2: Run the new test to confirm it fails because the file does not exist yet**

Run:

```bash
npm run test -- tests/lib/site-content.test.ts
```

Expected:

```text
FAIL ... Cannot find module '@/lib/site-content'
```

- [ ] **Step 3: Implement the shared site content map**

Create `lib/site-content.ts`:

```ts
export const siteIdentity = {
  name: 'dr. Ferdi Iskandar',
  shortName: 'Ferdi Iskandar',
  tagline: 'Clinical Intelligence / Indonesia',
  headline: 'Augmented Intelligence Architect',
  location: 'Kota Kediri, Jawa Timur, Indonesia',
}

export const sectionIds = [
  { id: 'top', label: 'Top' },
  { id: 'impact', label: 'Impact' },
  { id: 'portfolio', label: 'Systems' },
  { id: 'expertise', label: 'Thinking' },
  { id: 'intelligence', label: 'Brief' },
  { id: 'vision', label: 'Vision' },
  { id: 'field-notes', label: 'Notes' },
  { id: 'contact', label: 'Contact' },
] as const

export const primaryNav = [
  { label: 'Impact', href: '#impact' },
  { label: 'Systems', href: '#portfolio' },
  { label: 'Thinking', href: '#expertise' },
  { label: 'Brief', href: '#intelligence' },
  { label: 'Vision', href: '#vision' },
  { label: 'Contact', href: '#contact' },
] as const

export const futureRoutes = [
  { label: 'About', href: '/about' },
  { label: 'Systems', href: '/systems' },
  { label: 'Notes', href: '/notes' },
  { label: 'Contact', href: '/contact' },
] as const

export const contactCards = [
  {
    label: 'Sentra Healthcare AI',
    value: 'Official collaboration channel',
    description: 'Founder and healthcare AI partnership surface.',
    href: null,
  },
  {
    label: 'Melinda DHAI',
    value: 'Strategic institution-facing coordination',
    description: 'Use when the conversation is about transformation and implementation direction.',
    href: null,
  },
  {
    label: 'Direct Contact',
    value: 'Details shared through official coordination',
    description: 'No dead links until the preferred public channel is confirmed.',
    href: null,
  },
] as const

export const thinkingMeta = {
  sectionLabel: 'Clinical Intelligence',
  editionLabel: 'Current Edition',
  notesLabel: 'Founder Notes / Current',
  lastUpdatedLabel: 'Currently evolving',
} as const

export const footerMeta = {
  year: new Date().getFullYear(),
  location: siteIdentity.location,
  organization: 'Sentra Healthcare Artificial Intelligence',
} as const
```

- [ ] **Step 4: Run the test again and verify it passes**

Run:

```bash
npm run test -- tests/lib/site-content.test.ts
```

Expected:

```text
PASS tests/lib/site-content.test.ts
```

- [ ] **Step 5: Create a local checkpoint**

Run:

```bash
npm run test -- tests/lib/site-content.test.ts
```

If Git exists by this point, commit with:

```bash
git add lib/site-content.ts tests/lib/site-content.test.ts
git commit -m "feat: add route-ready site content map"
```

## Task 3: Claude - Wire Metadata, Contact Integrity, and Non-Stale Founder Surfaces

**Files:**

- Create: `lib/site-metadata.ts`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `tests/lib/site-metadata.test.ts`
- Create: `tests/components/contact.test.tsx`
- Modify: `app/layout.tsx:1-48`
- Modify: `components/Contact.tsx:1-33`
- Modify: `components/Expertise.tsx:1-146`
- Modify: `components/Footer.tsx:1-8`

- [ ] **Step 1: Write failing tests for metadata fallback and contact integrity**

Create `tests/lib/site-metadata.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest'
import { buildSiteMetadata, getSiteUrl } from '@/lib/site-metadata'

describe('site metadata', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  it('falls back to localhost when no public site url is set', () => {
    expect(getSiteUrl()).toBe('http://localhost:3000')
  })

  it('builds metadata with the founder title and open graph data', () => {
    const metadata = buildSiteMetadata()

    expect(metadata.title).toBe('dr. Ferdi Iskandar — Augmented Intelligence Architect')
    expect(metadata.openGraph?.locale).toBe('id_ID')
    expect(metadata.openGraph?.type).toBe('website')
  })
})
```

Create `tests/components/contact.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import Contact from '@/components/Contact'

describe('Contact', () => {
  it('never renders dead placeholder links', () => {
    render(<Contact />)

    expect(
      screen.queryByRole('link', { name: /contact sentra healthcare ai/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/official collaboration channel/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail before implementation**

Run:

```bash
npm run test -- tests/lib/site-metadata.test.ts tests/components/contact.test.tsx
```

Expected:

```text
FAIL ... Cannot find module '@/lib/site-metadata'
```

and/or

```text
FAIL ... renders dead placeholder links
```

- [ ] **Step 3: Create the reusable metadata helper**

Create `lib/site-metadata.ts`:

```ts
import type { Metadata } from 'next'

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export function buildSiteMetadata(): Metadata {
  const title = 'dr. Ferdi Iskandar — Augmented Intelligence Architect'
  const description =
    'Profil pribadi dr. Ferdi Iskandar — founder profile on clinical intelligence, human-AI collaboration, and healthcare systems transformation in Indonesia.'

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      title,
      description,
      url: '/',
      siteName: 'Ferdi Iskandar',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
```

- [ ] **Step 4: Update the root layout to use the shared metadata and add a skip link**

Replace `app/layout.tsx` with:

```tsx
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { buildSiteMetadata } from '@/lib/site-metadata'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = buildSiteMetadata()

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fragment+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="fi-skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Add sitemap and robots baselines for the single live route**

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
```

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
```

- [ ] **Step 6: Replace dead contact links with trust-safe non-link cards**

Replace `components/Contact.tsx` with:

```tsx
import { contactCards } from '@/lib/site-content'

export default function Contact() {
  return (
    <section className="fi-contact fi-section" id="contact">
      <div>
        <div className="fi-kicker">Connect</div>
        <h2>Let&apos;s build what healthcare actually needs.</h2>
        <p>
          Untuk kolaborasi strategis, pengembangan produk healthcare AI, atau diskusi tentang
          clinical intelligence infrastructure, gunakan jalur koordinasi resmi yang ditampilkan pada
          permukaan ini.
        </p>
      </div>
      <aside className="fi-contact-card" aria-label="Official contact surfaces">
        {contactCards.map((card) => (
          <div className="fi-contact-card-item" key={card.label}>
            <strong>{card.label}</strong>
            <span>{card.value}</span>
            <p>{card.description}</p>
          </div>
        ))}
      </aside>
    </section>
  )
}
```

- [ ] **Step 7: Remove stale hard-coded time labels from the thinking and footer surfaces**

Update the top and bottom metadata copy in `components/Expertise.tsx`:

```tsx
import { thinkingMeta } from '@/lib/site-content'

// inside the component
<header aria-label="The Thinking Stack editorial header" className="fi-thinking-masthead">
  <div className="fi-thinking-masthead-left">{thinkingMeta.sectionLabel}</div>
  <div className="fi-thinking-masthead-center">{thinkingMeta.editionLabel}</div>
  <div className="fi-thinking-masthead-right">{thinkingMeta.notesLabel}</div>
</header>

// inside the footnotes section
<div>
  <strong>Last Updated</strong>
  <span>{thinkingMeta.lastUpdatedLabel}</span>
</div>
```

Replace `components/Footer.tsx` with:

```tsx
import { footerMeta, siteIdentity } from '@/lib/site-content'

export default function Footer() {
  return (
    <footer className="fi-shell fi-footer">
      <span>
        © {footerMeta.year} {siteIdentity.name} · {footerMeta.organization}
      </span>
      <span>{footerMeta.location}</span>
    </footer>
  )
}
```

- [ ] **Step 8: Re-run the focused tests and verify they pass**

Run:

```bash
npm run test -- tests/lib/site-metadata.test.ts tests/components/contact.test.tsx
```

Expected:

```text
PASS tests/lib/site-metadata.test.ts
PASS tests/components/contact.test.tsx
```

- [ ] **Step 9: Create a local checkpoint**

If Git exists by this point, commit with:

```bash
git add lib/site-metadata.ts app/layout.tsx app/sitemap.ts app/robots.ts components/Contact.tsx components/Expertise.tsx components/Footer.tsx tests/lib/site-metadata.test.ts tests/components/contact.test.tsx
git commit -m "feat: harden metadata and trust surfaces"
```

## Task 4: Codex - Create a Route-Ready Home Shell and Navigation Surface

**Files:**

- Create: `components/HomePage.tsx`
- Create: `tests/components/navbar.test.tsx`
- Create: `tests/app/home-page.test.tsx`
- Modify: `app/page.tsx:1-29`
- Modify: `components/Navbar.tsx:1-26`

- [ ] **Step 1: Write failing tests for the home shell and navbar**

Create `tests/components/navbar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

describe('Navbar', () => {
  it('renders the route-ready primary navigation', () => {
    render(<Navbar />)

    expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Impact' })).toHaveAttribute('href', '#impact')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact')
  })
})
```

Create `tests/app/home-page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import HomePage from '@/components/HomePage'

describe('HomePage', () => {
  it('renders a main landmark with the founder sections', () => {
    render(<HomePage />)

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByRole('link', { name: /back to top/i })).toHaveAttribute('href', '#top')
    expect(
      screen.getByRole('heading', { name: /human care, augmented by intelligence/i }),
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to confirm they fail before implementation**

Run:

```bash
npm run test -- tests/components/navbar.test.tsx tests/app/home-page.test.tsx
```

Expected:

```text
FAIL ... Cannot find module '@/components/HomePage'
```

or

```text
FAIL ... unable to find navigation label
```

- [ ] **Step 3: Create the home shell composition component**

Create `components/HomePage.tsx`:

```tsx
import Contact from '@/components/Contact'
import Expertise from '@/components/Expertise'
import FieldNotes from '@/components/FieldNotes'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Impact from '@/components/Impact'
import Intelligence from '@/components/Intelligence'
import Navbar from '@/components/Navbar'
import Portfolio from '@/components/Portfolio'
import Vision from '@/components/Vision'

export default function HomePage() {
  return (
    <div id="ferdi-editorial-site">
      <div id="top" aria-hidden="true" />
      <Navbar />
      <main className="fi-shell" id="main-content">
        <Hero />
        <Impact />
        <Portfolio />
        <Expertise />
        <Intelligence />
        <Vision />
        <FieldNotes />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 4: Thin down the route entrypoint**

Replace `app/page.tsx` with:

```tsx
import HomePage from '@/components/HomePage'

export default function Page() {
  return <HomePage />
}
```

- [ ] **Step 5: Update the navbar to read from the shared site content map**

Replace `components/Navbar.tsx` with:

```tsx
import Link from 'next/link'
import { primaryNav, siteIdentity } from '@/lib/site-content'

export default function Navbar() {
  return (
    <nav aria-label="Primary navigation" className="fi-nav">
      <div className="fi-shell fi-nav-inner">
        <Link aria-label="Back to top" className="fi-brand" href="#top">
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

- [ ] **Step 6: Run the focused UI tests and verify they pass**

Run:

```bash
npm run test -- tests/components/navbar.test.tsx tests/app/home-page.test.tsx
```

Expected:

```text
PASS tests/components/navbar.test.tsx
PASS tests/app/home-page.test.tsx
```

- [ ] **Step 7: Create a local checkpoint**

If Git exists by this point, commit with:

```bash
git add components/HomePage.tsx app/page.tsx components/Navbar.tsx tests/components/navbar.test.tsx tests/app/home-page.test.tsx
git commit -m "feat: add route-ready homepage shell"
```

## Task 5: Codex - Stabilize CSS, Mobile Behavior, and Final Verification

**Files:**

- Modify: `app/globals.css`

- [ ] **Step 1: Add skip-link and focus-visible styles near the top of `app/globals.css`**

Insert this block after the `body` rule:

```css
.fi-skip-link {
  position: absolute;
  left: 20px;
  top: -48px;
  z-index: 120;
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--fi-ink);
  color: var(--fi-white);
  text-decoration: none;
  transition: top 0.2s ease;
}

.fi-skip-link:focus {
  top: 20px;
}

a:focus-visible,
button:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid var(--fi-gold);
  outline-offset: 3px;
}
```

- [ ] **Step 2: Improve the contact card styles so the non-link cards look intentional**

Add this block near the existing `.fi-contact-card` rules:

```css
.fi-contact-card {
  display: grid;
  gap: 0;
}

.fi-contact-card-item {
  padding: 0 0 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--fi-line);
}

.fi-contact-card-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: 0;
}

.fi-contact-card-item strong {
  display: block;
  font-size: 14px;
  font-weight: 760;
  color: var(--fi-ink);
}

.fi-contact-card-item span {
  display: block;
  margin-top: 8px;
  color: var(--fi-blue-2);
  font-size: 13px;
  font-weight: 680;
}

.fi-contact-card-item p {
  margin-top: 10px;
  color: var(--fi-muted);
  font-size: 13px;
  line-height: 1.5;
}
```

- [ ] **Step 3: Tighten the mobile navigation and section rhythm without changing the design direction**

Adjust the responsive blocks to include:

```css
@media (max-width: 1080px) {
  .fi-nav-inner {
    grid-template-columns: 1fr;
  }

  .fi-nav-links {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .fi-nav-links::-webkit-scrollbar {
    display: none;
  }
}

@media (max-width: 760px) {
  .fi-shell {
    padding: 0 18px;
  }

  .fi-section {
    padding: clamp(64px, 12vw, 92px) 0;
  }

  .fi-contact {
    min-height: auto;
  }
}
```

- [ ] **Step 4: Run the full automated verification suite**

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

- [ ] **Step 5: Run the app locally and do a manual sanity check**

Run:

```bash
npm run dev
```

Then manually verify:

- homepage loads at `http://localhost:3000`
- skip link appears on keyboard focus
- nav anchors move to the expected sections
- contact surface has no dead placeholder links
- mobile width does not break the hero, navbar, portfolio, or contact sections

- [ ] **Step 6: Create the final local checkpoint**

If Git exists by this point, commit with:

```bash
git add app/globals.css
git commit -m "style: stabilize founder profile baseline"
```

## Spec Coverage Check

- Runtime and build confidence: covered by Task 1 and Task 5
- Route-ready structure: covered by Task 2 and Task 4
- Metadata and site foundation: covered by Task 3
- Contact and CTA integrity: covered by Task 3 and Task 5
- Responsive and readability pass: covered by Task 5
- Accessibility and semantics baseline: covered by Task 3 and Task 5
- Preserve-style redesign: covered by Task 4 and Task 5

No spec gaps remain for pass one.

## Execution Notes

- Do not add multi-page routes yet.
- Do not add CMS, blog plumbing, or backend form submission in this pass.
- Do not remove the core editorial identity.
- Keep shared data in `lib/site-content.ts` small and route-ready.
- Only put the current live route in the sitemap until real pages exist.

## Handoff Mode

This plan is already split by ownership:

- **Codex:** Task 1, Task 4, Task 5
- **Claude:** Task 2, Task 3
