# Founder Profile Stabilization Design

- Date: 2026-05-05
- Project: `ferdiiskandar`
- Scope: Pass one stabilization and light redesign for the personal founder website
- Status: Proposed for review

## 1. Context

This project is the beginning of a personal website for dr. Ferdi Iskandar. The current repo already has a strong editorial visual direction, but it is still early-stage and not yet ready to serve as a dependable baseline. The immediate priority is not feature expansion. The immediate priority is to make the site work well, run well, and feel credible while preserving the current visual identity.

The user explicitly wants:

- the current founder-editorial tone preserved
- a balanced founder profile, because Indonesian audiences often evaluate the person behind the work before the product itself
- current claims temporarily retained rather than aggressively pruned
- a route-ready structure that can later grow into a multi-page profile site

## 2. Current-State Summary

The current codebase is a small Next.js App Router site with a single landing page and section-based composition. The visual system is expressive and already differentiated, but the repo has several baseline weaknesses that make it unsuitable as a long-term foundation in its current form.

Observed baseline issues:

- `node_modules` is not present, so runtime health has not yet been proven
- the project is not currently in a Git repository, so design documentation can be written locally but cannot be committed yet
- metadata is minimal for a personal site with credibility goals
- contact surfaces still contain placeholder `#` links
- the global stylesheet is large and highly coupled, so visual adjustments must be done carefully
- the page is still structured like a strong draft rather than a route-ready personal site baseline

## 3. Product Goal

Pass one should produce a stable founder-profile landing page that:

- preserves the current editorial identity
- establishes runtime and build confidence
- improves trust and presentation quality
- reduces obvious unfinished surfaces
- prepares the codebase to grow into a multi-page site without reworking the entire information architecture

This pass is intentionally not a full website expansion. It is the first proper baseline.

## 4. Audience and Positioning

Primary positioning for pass one:

- the site should first build personal authority and trust
- the site should still show concrete systems thinking and product credibility
- the profile should feel like a founder with real architecture depth, not a generic portfolio and not a company product page

Content balance target:

- 60% founder authority
- 40% systems credibility

Editorial principle:

- the person leads
- the systems support
- the vision ties them together

## 5. Chosen Design Direction

Chosen redesign posture: `Preserve + Stabilize`

This means:

- no total visual reset
- no generic startup redesign
- no heavy animation or novelty-first UI work
- preserve the premium editorial character that already exists
- focus on making the current direction more coherent, more readable, more trustworthy, and more technically stable

## 6. Site Architecture

The site should remain a single landing page in pass one, but its internal structure must be prepared for later growth into multiple routes.

Target future routes:

- `/`
- `/about`
- `/systems`
- `/notes`
- `/contact`

Pass-one rule:

- only `/` must be fully realized now
- all current homepage sections should be treated as future page-ready content blocks

Landing page information structure:

1. `Hero` for positioning and immediate first impression
2. `Impact` for authority, leadership, and legitimacy
3. `Systems` for capability proof and systems credibility
4. `Thinking` for intellectual framework and differentiation
5. `Vision` for long-range narrative
6. `Notes` for thought-surface preview
7. `Contact` for official connection path

Navigation should behave as a compact future sitemap, not only a scroll helper.

## 7. Content Strategy

The site should reflect how trust is built in the intended cultural context. Visitors should quickly understand:

- who Ferdi Iskandar is
- what kind of systems and institutions he is building toward
- how his thinking differs from generic AI or healthcare branding

Pass-one content rules:

- keep current claims for now unless they are structurally damaging
- improve hierarchy, pacing, and order of presentation
- reduce any sense of unfinishedness
- keep systems language as evidence, not as noisy promotion
- avoid overstating product surfaces that are not yet part of this website baseline

## 8. Stabilization Scope for Pass One

Included in scope:

- runtime baseline setup and proof
- structure cleanup for page composition and section boundaries
- navigation and route-readiness improvements
- metadata and site-foundation improvements
- contact and CTA integrity cleanup
- responsive readability improvements
- accessibility and semantic baseline improvements
- restrained presentation cleanup to strengthen trust

Explicitly out of scope:

- full multi-page rollout
- CMS or blog engine work
- complex backend integrations
- heavy animation systems
- total copy rewrite
- aggressive claim reduction

## 9. Implementation Approach

Implementation order:

1. establish runtime health
2. stabilize structure and composition
3. fix trust-breaking surfaces
4. apply light preserve-style redesign
5. prepare route-ready structure
6. verify and harden

Execution principles:

- preserve direction, do not rewrite it
- fix weak foundations before visual polish
- optimize for future growth with minimal rework
- keep the landing page as the only required production surface for pass one

## 10. Verification Approach

Pass one should not be considered complete from source edits alone. It must be validated through actual project behavior.

Verification targets:

- dependency install success
- development server startup success
- production build success
- desktop and mobile sanity pass
- placeholder and CTA integrity pass
- semantic and accessibility baseline review

Definition of success:

- the project runs normally
- the project builds for production
- unfinished trust-breaking surfaces are removed or replaced
- the landing page feels more intentional and credible
- the structure is better prepared for future route expansion
- the current visual identity still feels recognizably like the original direction

## 11. Risks and Constraints

- the current stylesheet is large and globally coupled, so even light redesign must be precise
- route-readiness should not become premature multi-page implementation
- placeholder links and minimal metadata currently lower trust more than the design itself
- lack of Git in the current folder means local artifact creation is possible now, but commit-based checkpoints depend on repository initialization or correct repo context

## 12. Deliverable for Pass One

Pass one should leave the project with:

- a stable and verifiable landing-page baseline
- a cleaner trust-focused founder profile presentation
- preserved editorial identity
- route-ready internal structure for later multi-page evolution
- a healthier foundation for subsequent feature work

## 13. Post-Spec Next Step

After this design spec is approved, the next step is to write an implementation plan for pass one and then execute that plan directly in the repo.

- Approved
