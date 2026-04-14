# DECISIONS.md — sentra-main
<!-- Append-only. NEVER delete or edit existing entries. -->

---

### [2026-03-16] Migrate to Next.js 16 + Tailwind v4
**Context:** Performance improvements and latest ecosystem alignment
**Decision:** Next.js 16 with Turbopack available; Tailwind v4 with @tailwindcss/postcss
**Rejected alternatives:** Stay on Next.js 15, keep Tailwind v3
**Rationale:** Turbopack speeds up dev iteration; Tailwind v4 CSS-first config aligns with modern workflow
**Consequences:** Some React 18 legacy libs may have compat issues; CI memory usage higher with Turbopack

### [2026-04-10] Establish .agent/ memory protocol
**Context:** Context loss between agent sessions
**Decision:** .agent/ with 5 files + sessions/
**Consequences:** Agent reads .agent/ at every session start

---
<!-- Agent: append new decisions below this line -->
