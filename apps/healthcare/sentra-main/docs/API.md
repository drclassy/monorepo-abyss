# API & Integrations Reference — Sentra AI (sentra-main)

_Architected and built by Claudesy — Sentra Healthcare Solutions © 2025–2026_

---

## No Backend API Routes

`sentra-main` has no `app/api/` directory. It is a static marketing site — there are no server-side handlers that accept external requests.

---

## Pages (Next.js App Router Routes)

All routes are statically rendered at build time.

| Method | Route | File | Description |
|--------|-------|------|-------------|
| `GET` | `/` | `app/page.tsx` | Landing page — 14 sections |
| `GET` | `/story` | `app/story/page.tsx` | Company story, team profiles, founding narrative |
| `GET` | `/insights` | `app/insights/page.tsx` | Article index listing |
| `GET` | `/insights/:slug` | `app/insights/[slug]/page.tsx` | Article detail — resolved from `data.ts` |
| `GET` | `/privacy` | `app/privacy/page.tsx` | Privacy policy (Bahasa Indonesia) |
| `GET` | `/terms` | `app/terms/page.tsx` | Terms of service |
| `GET` | `/sitemap.xml` | `app/sitemap.ts` | XML sitemap — 8 routes, auto-generated |
| `GET` | `/robots.txt` | `app/robots.ts` | Robots exclusion — auto-generated |
| `GET` | `/llms.txt` | `public/llms.txt` | Plain-text summary for LLM crawlers |
| `GET` | `/google22238cc24e0d1002.html` | `app/google22238cc24e0d1002.html` | Google Search Console domain verification |

---

## Sitemap Routes

Defined in `app/sitemap.ts`:

| URL | `changeFrequency` | `priority` |
|-----|------------------|-----------|
| `https://sentrahai.com` | `weekly` | 1.0 |
| `https://sentrahai.com/story` | `monthly` | 0.8 |
| `https://sentrahai.com/insights` | `weekly` | 0.8 |
| `https://sentrahai.com/insights/ai-diagnosis-klinis-indonesia` | `monthly` | 0.7 |
| `https://sentrahai.com/insights/clinical-decision-support-vs-emr` | `monthly` | 0.7 |
| `https://sentrahai.com/insights/keselamatan-pasien-era-digital-health` | `monthly` | 0.7 |
| `https://sentrahai.com/privacy` | `yearly` | 0.3 |
| `https://sentrahai.com/terms` | `yearly` | 0.3 |

When a new article is added to `app/insights/data.ts`, add its URL to `app/sitemap.ts` manually.

---

## External Resource Dependencies

### Build-time
| Resource | Provider | Used by |
|----------|---------|---------|
| Plus Jakarta Sans font | `fonts.googleapis.com` | `app/layout.tsx` via `next/font/google` |
| Inter font | `fonts.googleapis.com` | `app/layout.tsx` via `next/font/google` |
| Caveat font (handwriting) | `fonts.googleapis.com` | `components/Hero.tsx` phase quote text |

Fonts are downloaded and self-hosted by Next.js at build time — no runtime dependency on Google Fonts CDN.

### Runtime (Next.js `remotePatterns`)
| Domain | Used by | Configured in |
|--------|---------|--------------|
| `framerusercontent.com` | Product/showcase images | `next.config.mjs` |
| `images.unsplash.com` | Illustration images | `next.config.mjs` |

Any image from an unlisted domain will be blocked by `next/image` at build time.

---

## Article Data API (internal)

Articles are served from a TypeScript module — not an HTTP endpoint.

```typescript
// app/insights/data.ts

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;          // "YYYY-MM-DD"
  readTime: string;      // "N menit"
  category: string;
  content: string;       // Markdown-like string
}

export const articles: Article[] = [ /* ... */ ];

// Look up article by slug
export function getArticle(slug: string): Article | undefined

// Format date for display
export function formatDate(dateStr: string): string  // → "DD MMMM YYYY" (id-ID locale)
```

Usage:
```typescript
// In app/insights/[slug]/page.tsx
import { getArticle } from "../data";
const article = getArticle(params.slug);
if (!article) notFound();
```

---

## Navigation Constants (internal)

```typescript
// lib/site-links.ts
export const siteLinks = {
  home:     "#top",
  about:    "#about",
  contact:  "#contact",
  insights: "/insights",
  services: "#services",
  audrey:   "#audrey",
  privacy:  "/privacy",
  terms:    "/terms",
  story:    "/story",
  faq:      "#faq",
} as const;
```

---

_Architected and built by Claudesy — Sentra Healthcare Solutions © 2025–2026_
