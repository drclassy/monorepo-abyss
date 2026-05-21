# Session summary — 2026-05-01 — GitHub Actions vendor-clean stack

**Problem:** CI referenced removed `@the-abyss/iskandar-gatekeeper`; workflows duplicated setup steps; security scans mostly non-blocking; doc-only PRs skipped full CI; no reusable DAG; risk of auto-fix on fork workflow runs.

**Solution:** Added `reusable-verify.yml` with full job DAG; thin `ci.yml` with `permissions`, `concurrency`, and `turbo_team` input; verify uses `governance:agents-check` + `@sentra/bentara`; added typecheck job; split blocking vs informational security; aligned `security-scan` for `develop` PRs and TruffleHog modes; fork guard on `auto-fix`; new `maintenance.yml` and `ai-review.yml` placeholder; Node 22 on doc workflow.

**Rationale:** Single reusable source of truth for CI steps, explicit least-privilege permissions, no Google-hosted AI in Actions, healthcare-appropriate blocking audit while keeping Snyk/Trivy informational.

---

# Session summary — 2026-05-01 — QRH handbook Sentra token compliance

**Problem:** `docs/handbook/avcn-commands.html` masih memakai hardcoded warna/typography dan path font yang tidak cocok dengan isi folder handbook, sehingga tidak patuh token Sentra.

**Solution:** Redesign satu file handbook agar memuat `sentra-tokens.css`, mengganti style ke `var(--sentra-*)`, memetakan warna semantic badge/flow ke token resmi, memperbaiki `@font-face` ke file `fonts/geistmono/*` yang benar, dan menambah struktur semantik ringan (`main/section/h1/h2/th scope`).

**Rationale:** Menjaga konsistensi design governance Sentra, menghindari drift visual antar artefak docs, dan memastikan handbook tetap terbaca baik dengan baseline aksesibilitas yang lebih aman.
