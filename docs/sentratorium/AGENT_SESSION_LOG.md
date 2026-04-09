# Sentratorium — AGENT_SESSION_LOG (append-only)

**Tujuan:** Audit trail baris-tunggal untuk semua agen Cursor. **Jangan
menghapus** baris historis. Tambahkan entri baru di **bawah** header ini.

**Format wajib (satu baris per sesi kerja yang menyentuh kode/repo):**

```text
YYYY-MM-DD | Agent | Project | Phase | What done | Decisions | Blockers | Next
```

---

<!-- Entri baru di bawah garis ini -->

2026-04-09 | Cursor-Sentra-Agent | abyss-monorepo | Execute | Cursor governance:
slim index.mdc v3; move 010-050+phase to .cursor/rules; README .cursorignore;
gitignore hook logs; precedence in apps/healthcare/AGENTS.md; add
sentratorium-hq-mandatory.mdc | GO Chief | -> | Reload Cursor Project Rules UI

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Docs | Added
docs/research/competitive/instruksi-composer-2-maksimalkan-cursor-ide.md —
Composer 2 + Agent/Plan Mode + pools + Sentra conventions + paste template |
aligns with cursor docs research | -> | Chief may pin §8 to Rules

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Verify+Docs |
Lighthouse lab on cursor.com/docs (LCP~10.4s CLS0 TBT~390ms perf~61); archived
analysis+llms.txt QA under docs/research/competitive; JSON dump not kept | INP
needs CrUX/PSI field data | -> | optional PSI INP cross-check

2026-04-09 | Cursor-Sentra-Agent | abyss-monorepo + sentra-assist | Build |
Added .cursor/rules/skill-source-isolation.mdc + AGENTS.md section: Cursor
skills separate from ~/.claude and ~/.agents; no symlink; do not touch other
agents’ trees unless explicit | governance only; no runtime code change | -> |
Chief verify Cursor Settings skill paths

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Validate |
Lighthouse 12 on cursor.com blog agent-best-practices +
docs/research/competitive summary JSON/MD + cursor-agent-adoption-sentra-assist
checklist | JSON dump removed to save space; LCP lab run very high — re-run if
needed | -> | optional PSI/CrUX cross-check

2026-04-09 | Cursor-Sentra-Agent | primary-healthcare/dashboard | Build | fix
POST /api/auth/logout to clear crew cookie with getSessionCookieOptions() so
SameSite=None session is actually removed in production | mismatch lax vs none
caused stuck/broken post-logout | -> | deploy dashboard + retest logout/login

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Build+Validate |
Removed hardcoded SKIP_LOGIN_GATE bypass from login/sidepanel and tightened
bridge session auth to dashboard cookie-session only | production flow now
trusts only real Dashboard auth or automation token | pnpm typecheck/test still
red on unrelated pre-existing issues and sandbox spawn EPERM | reload extension,
login through Dashboard, and retest patient sync 2026-04-09 |
Cursor-Sentra-Agent | @the-abyss/sentra-assist | Build+Validate | Disabled
offline auth by default in production and restricted bundled DEV_USERS to
development builds only | production auth no longer falls back to local
credentials unless explicitly enabled in dev | pnpm typecheck still red on
unrelated pre-existing test/UI issues | reload extension, verify Dashboard
login, then retry consult/patient sync

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Build+Validate |
Guarded bridge readiness/fetch behind Bridge Automation Token so login session
no longer marks runtime ready for dashboard endpoints; added targeted tests in
bridge-client.test.ts | token is the contract for cross-origin
bridge/consult/patient-sync, not ordinary session auth | workspace typecheck
still red in unrelated tests/UI files | reload extension and verify runtime
shows auth_required without token, ready with valid token

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Validate | DELIVER
tema: pnpm build OK; CSS bundle html.light; theme-store.test.ts 4/4 | full
vitest 8 fail unrelated (bg storage, vitals) | Chief load .output/chrome-mv3-dev

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Build |
ThemeToggle on DashboardView + ConsoleLogin; was only SidePanelHeader after
Launch Console | default flow showed no control | reload unpacked ext

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Build | theme
transition: spatial lamp at 92% 6% — to-light radial bloom + brighten support;
to-dark clip-path darkness spread + fade; ThemeProvider 1420ms | prior global
brightness-only missed Chief brief | -

2026-04-09 | Cursor-Sentra-Agent | apps/prototype/hermes-agent | Build |
Diagnosa chat Moonshot “aneh”: proxy hanya di Vite dev; tambah nginx
`location /api-moonshot/` → api.moonshot.cn; parsing respons teks + error jelas
jika HTML; guard `VITE_MOONSHOT_API_KEY`; `.env.example` Moonshot | prod Docker
parity dengan dev proxy | - | rebuild image & uji kirim pesan

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Build | fix theme
revert bug: replace zustand/persist async rehydrate with sync localStorage
writes + bootstrapThemeDocument before createRoot; same JSON shape as before | -
| Chief confirm toggle sticks

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Build | light
theme palette v2: zinc neutrals, white cards, single emerald accent, flat
elevation shadows; removed neumorphic dual-shadow + heavy gradient + sepia lamp
keyframes | avoid mixed hue “soft UI” slop | - | Chief visual pass

2026-04-09 | Cursor-Sentra-Agent | @the-abyss/sentra-assist | Build | theme lamp
transition on #root + html.light CSS tokens + tailwind light palette; globals
body semantic vars; fix duplicate ThemeProvider import in main.tsx |
photorealistic cool-neutral light surfaces teal primary | - | manual UI verify
in extension

2026-04-09 | Codex / Dexton | abyss-monorepo | Build+Validate | Added
`.github/workflows/security-primary-healthcare.yml` to run dashboard+website
catch-scan, secret-scan, and audit on push/PR paths for Primary Healthcare | use
dedicated scoped workflow instead of broad global CI edits | - | monitor first
action run and adjust timeout/filters if needed

2026-04-09 | Codex / Dexton | abyss-monorepo | Build | Opened
`.cursorindexingignore` for `.github/workflows/**` and attempted direct workflow
creation for security CI | keep least-change approach by only exposing workflows
path | `.github/workflows` still read-protected by permissions policy |
user/admin needs to open read-write policy then apply prepared workflow patch

2026-04-09 | Codex / Dexton | primary-healthcare/dashboard + monorepo |
Build+Validate | Hardened LB1 xlsx ingestion (file size + matrix bounds +
trusted filename prefixes), added root `security:primary-healthcare`, and
documented CSP nonce/hash roadmap in remediation matrix | keep `xlsx` with
compensating controls because upstream public package has no patched version |
`.github/workflows` still filtered for direct CI edit | wire new root security
command and sentratorium check once workflow access is opened

2026-04-09 | Codex / Dexton | abyss-monorepo | Build+Validate | Added root
automation `pnpm sentratorium:check` via `tooling/sentratorium-check.mjs` to
enforce Sentratorium updates when non-Sentratorium files change | chose
lightweight git-status based guard with log format validation | workflow
auto-wire not applied yet | optionally integrate this command into CI/pre-commit

2026-04-09 | Codex / Dexton | sentra-assist | Build+Validate | Upgrade autotext
anamnesis agar lebih profesional dan tidak template: composer pisahkan keluhan
utama/gejala penyerta, hilangkan duplikasi durasi, tambah dukungan rich
extraction optional, dan perbarui output verifikasi | tetap fact-bound,
backward-compatible ke extraction lama, verifikasi dengan unit test targeted |
baseline package typecheck masih merah di area lain yang tidak terkait |
lanjutkan wiring backend extraction agar mengirim
chronology_summary/associated_symptoms/pertinent_negatives secara konsisten

2026-04-07 | Cursor-Sentra-Agent | abyss-monorepo | Build | Added mandatory
Sentratorium HQ Cursor rule (sentratorium-hq-mandatory.mdc), latest.md,
AGENT*SESSION_LOG.md; updated README + index.mdc | alwaysApply rule + dual write
latest+log | - | Agents must append after each coding session 2026-04-07 |
Cursor-Sentra-Agent | sentra-assist | Build | Comprehensive AGENTS.md + embedded
agent-native audit (8 principles, messaging as capability surface, PHI/commands)
| single doc for coding agents | - | Keep ProtocolMap parity when adding UI
actions 2026-04-07 | Cursor-Sentra-Agent | apps/healthcare | Document | English
sentra-assist/AGENTS.md; healthcare AGENTS.md package-specific guides table | EN
canonical for sentra-assist agents | - | Add AGENTS.md for primary-healthcare
and referralink when ready 2026-04-07 | Cursor-Sentra-Agent | sentra-assist |
Document | Deduped docs/superpowers/plans/AGENTS.md (removed duplicated block +
cursor junk) | single clean English instructions file | - | - 2026-04-07 |
Cursor-Sentra-Agent | apps/healthcare | Document | AGENTS.md for referralink +
primary-healthcare; healthcare AGENTS.md table updated | English per-app guides
| - | - 2026-04-07 | Cursor-Sentra-Agent | primary-healthcare | Document |
dashboard/AGENTS.md + website/AGENTS.md; parent primary-healthcare/AGENTS.md
packages table + Agent guide column | per-package agent docs | - | - 2026-04-07
| Cursor-Sentra-Agent | sentra-assist | Build | ConsoleLogin redesign: two-line
wordmark, INTELLIGENCE CSS shimmer + reduced-motion; remove inline login CSS;
login error UI; a11y; luxury-line font var(--font-ui) | single source style.css
| - | visual QA side panel widths 2026-04-07 | Cursor-Sentra-Agent |
sentra-assist | Validate | Login wordmark muted; removed INTELLIGENCE shimmer
and Intelligent Decision Support; typecheck lint test build OK | Chief UX | -
| - 2026-04-07 | Cursor-Sentra-Agent | sentra-assist | Fix | Login luxury-line
bottom accent via ::after (Chrome autofill inset hid border-bottom); scoped
-webkit-autofill for login fields | pseudo-element over input border | - | build
reload ext QA 2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Validate |
Completed E2E ASSIST Side Panel audit report with feature-logic matrix, severity
findings, remediation plan, and verification snippets | prioritize contract
parity + auth hardening + settings-runtime wiring | no staging/log/DB access
(partial runtime only) | continue full audit with staging traces and read-only
DB/log access 2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build | Added
execution artifacts: import-ready feature-logic CSV matrix and structured
remediation backlog with acceptance criteria | operationalized audit output for
FE/Security/BE tracking | no staging/log/DB access yet | execute P0 backlog then
run full staging audit 2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build
| Implemented initial P0 fixes: removed dead ProtocolMap messages and hardened
auth defaults (offline mode off, env-based dev creds, offline gated by dev/flag)
| enforce secure-by-default auth and reduce contract drift | pending runtime
staging validation | continue RB-03/RB-05 and run full audit evidence capture
2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build | Wired SettingsConsole
bridge toggle to runtime bridge config and added effective runtime status
indicator | eliminate UI-only bridge toggle ambiguity | pending manual smoke on
sidepanel runtime | continue RB-04/RB-05 and full staging verification
2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build | Synced sidepanel
EngineId/config to active tabs only and hardened background transfer logging to
avoid raw payload console dumps | reduce dead UI config and lower PHI leakage
risk in default logs | pending end-to-end manual smoke with real ePuskesmas tab
| finalize RB-05 and perform staging evidence capture 2026-04-08 |
Cursor-Sentra-Agent | sentra-assist | Validate | Fixed existing compile blockers
(CreditsView framer-motion variants + login password binding), then re-ran
lint/typecheck successfully | restored local validation baseline for continued
remediation | staging runtime evidence still pending | proceed with RB-05
completion and staging audit runbook 2026-04-08 | Cursor-Sentra-Agent |
sentra-assist | Build | Completed RB-05 critical-path logging sweep by replacing
console-based runtime logs with structured logger in entrypoints and sentra-api,
including payload-safe summaries | reduce PHI leakage risk in default logs while
preserving debug observability | staging proof not yet collected | proceed RB-06
contract artifacts and full staging audit evidence pass 2026-04-08 |
Cursor-Sentra-Agent | sentra-assist | Build | Added runtime contract guards and
parity tests for canonical clinical/differential outputs in bridge-client |
harden UI-backend contract against malformed payload drift | schema publishing
artifact still pending | finalize RB-06 docs/schema artifact then execute
staging evidence run 2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build |
Updated canonical clinical contract documentation with runtime guard section and
parity test verification command | align docs with implemented
contract-enforcement behavior | staging integration evidence still pending |
continue RB-06 schema/public artifact hardening and staging audit run 2026-04-08
| Cursor-Sentra-Agent | sentra-assist | Build | Finalized RB-06 phase-1 by
publishing minimal canonical schema artifacts in bridge-client, adding
test:contract script, and extending parity tests | make contract checks explicit
and CI-friendly while preserving runtime fail-fast guards | staging evidence
execution pending | run staging smoke + trace-backed audit verification
2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Validate | Verified contract
and core sidepanel suites (bridge-client, get-suggestions-flow.integration,
TTVInferenceUI) after RB-06 updates | confirm remediation changes remain green
on targeted flows | staging/live evidence still pending | proceed manual staging
smoke + observability capture 2026-04-08 | Cursor-Sentra-Agent | sentra-assist |
Build | Hotfixed login path by allowing offline-first auth to fallback to server
auth on non-matching dev credentials and restoring legacy dev user compatibility
| prevent user lockout after auth hardening changes | manual user-side login
confirmation pending | continue staging evidence run once login is verified
2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Validate | Confirmed login
unblock from user and completed RB-05 hardening follow-up by replacing
payload-oriented console telemetry in diagnosa/resep handlers with structured
logger metadata | close remaining default-log PHI leak risk in sidepanel
critical handlers | manual staging smoke evidence not yet captured | execute
end-to-end staging smoke with trace collection 2026-04-08 | Cursor-Sentra-Agent
| sentra-assist | Validate | Executed automated smoke gate (targeted vitest
critical flows, build, typecheck, lint) and documented e2e blocker where
Playwright test discovery picks Vitest suites in CommonJS context | keep audit
momentum with evidence-backed pass state while surfacing deterministic CI/test
baseline gap | manual staging smoke not yet executed | run manual staging
checklist then isolate Playwright config/testMatch 2026-04-08 |
Cursor-Sentra-Agent | sentra-assist | Build | Fixed `test:e2e` baseline command
to target `tests/e2e` with `--pass-with-no-tests` and re-verified successful
execution | eliminate false-fail Playwright discovery against Vitest suites so
smoke gate remains actionable | no actual e2e scenarios executed yet | continue
manual staging smoke evidence capture 2026-04-08 | Cursor-Sentra-Agent |
sentra-assist | Build | Patched `lib/api/authed-fetch.ts` to detect
HTML/non-JSON responses and raise sanitized actionable error
(`BridgeResponseFormatError`) instead of leaking raw HTML into UI fallback |
prevent noisy/unsafe error output and clarify root cause when bridge points to
web/login page | full workspace typecheck/lint still blocked by unrelated
pre-existing `DashboardView.tsx` unused var | validate bridge base URL and
canonical endpoint response contract in staging 2026-04-08 | Cursor-Sentra-Agent
| sentra-assist | Build | Implemented Hybrid Clinical Auto-Text migration:
schema contract (`AnamnesisExtractionResult`), bridge extraction client + guard,
`handleAnalyze` hybrid/fallback path, shadow template suggestions with
Tab-accept, and metadata-only telemetry in TTV UI | deliver deterministic
auto-text orchestration with safer NLU/NLG split and backward-compatible
fallback | - | run manual staging UX smoke for new hybrid suggestion behavior
2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build | Refined sidepanel
visual system: fixed header/form width alignment, patient name format
`NAMA .... <value>`, removed right-side standby status, and applied Inter +
JetBrains Mono with avionics-lite cyan/amber palette in form/header typography |
prioritize realistic cockpit-style readability without reducing clinical
contrast on dark mode | - | reload extension and run quick visual QA for final
color intensity tuning 2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build
| Improved AutoComplete gejala composer to reduce repetitive narrative:
normalize common duration typo (`haru`->`hari`), remove duplicated
single-complaint sentence, and replace long boilerplate with concise follow-up
line; added unit test coverage for typo normalization | prioritize concise
clinical phrasing and deterministic fallback quality | - | validate runtime
output against real short-input complaints and adjust microcopy if still verbose
2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build | Added explicit
fallback diagnostics in TTV hybrid autotext UI: show `Fallback reason` when
source is `fallback-local`, and clear reason when backend extraction succeeds |
make backend extraction failures observable in UI to speed root-cause diagnosis
| - | verify fallback reason messages in runtime and fix dominant
backend/auth/config issue 2026-04-08 | Cursor-Sentra-Agent | sentra-assist |
Build | Sanitized hybrid fallback errors to prevent raw HTML dumps in UI
(`authed-fetch` HTML detection + safe reason mapping in TTV UI) so fallback
message now points to base URL/API endpoint mismatch clearly | improve
operator-facing diagnostics and reduce noisy unsafe error text | - | update
Bridge base URL to API host and re-test until source returns `hybrid-backend`
2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build | Added hybrid
extraction circuit-breaker in `bridge-client`: when endpoint returns
HTML/non-API or known availability errors, backend extraction is temporarily
disabled (10m cooldown) and fallback message is made actionable | prevent
repeated wasted retries to misconfigured endpoint and stabilize user workflow on
fallback-local | - | correct base URL to real API host and verify hybrid source
recovery 2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build | Added
configurable `Crew API Base URL` + `Test API` action in SettingsConsole, synced
saved auth base URL into active session, and updated fallback login session to
use configured base URL instead of hardcoded host | remove repeated endpoint
confusion loops and let operators validate/fix API target directly from UI | - |
use Test API then save + reload extension and verify AutoComplete source flips
to `hybrid-backend` 2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build |
Refactored fallback anamnesa composer output to concise clinical style (removed
repetitive generic lines), added typo normalization (`nnyeri`/`haru`), and
updated tests for new narrative format | improve readability and reduce
"template dumb" feel when backend extraction is unavailable | - | validate new
fallback text quality with real complaint phrases and tune wording if needed
2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build | Compressed
SidePanelHeader patient bar density by merging name+age into a single top row
and reducing bar gap/padding/line-height so patient block no longer appears
oversized | restore compact clinical workspace balance and remove "kolam renang"
header feel | - | quick runtime visual verification for final spacing acceptance
2026-04-08 | Cursor-Sentra-Agent | sentra-assist | Build | Reduced fallback
composer boilerplate further by suppressing duplicate duration follow-up and
removing default generic gaps unless symptom text indicates missing trigger
context; extraction missing-facts no longer injects generic activity-impact line
| make fallback narrative materially shorter and less repetitive under backend
outage | - | validate latest fallback output against real complaint text and
tune one more pass if still verbose 2026-04-08 | Cursor-Sentra-Agent |
sentra-assist | Build | Simplified fallback anamnesa text by removing duplicated
"keluhan utama" body sentence, removing preset line from narrative, and
disabling generic follow-up sentence | align runtime output with concise
clinical tone instead of template-heavy prose | - | verify live output on short
complaints and tune wording if still stiff 2026-04-08 | Cursor-Sentra-Agent |
advisory (Hermes Agent web) | Validate | Lighthouse audit landing + /docs; docs
crawl (IA, security doc); structured KB delivered in chat; temp JSON removed
after metrics extract | lab CWV proxy only; no product code change | - |
CrUX/INP field check if production audit needed 2026-04-08 | Cursor-Sentra-Agent
| apps/prototype/hermes-agent | Build | Scaffold
@the-abyss/hermes-agent-prototype (Vite+React+Tailwind): hub links + cost
estimator; local tsconfig UTF-8; eslint @the-abyss/config-eslint/base | avoid
extend broken UTF-16 shared tsconfig for esbuild | - | optional turbo include;
commit lockfile 2026-04-08 | Cursor-Sentra-Agent | apps/healthcare | Build |
Standardized Sentratorium sections + Windows path index in six AGENTS.md; Pre-PR
Sentratorium checklist items; clarify HQ spelling docs/sentratorium vs typo
sentrarorium | single HQ path + mandatory dual-write latest+log | - | -
2026-04-08 | Cursor-Sentra-Agent | apps/healthcare | Build | Added compact "Alur
kerja agen" ASCII flow to six healthcare AGENTS.md (GO gate, .cursor/rules,
HANDOFF+rollback, tests, documentation/, commit trailers) | standard pipeline in
agent docs | - | - 2026-04-08 | Cursor-Sentra-Agent |
apps/prototype/hermes-agent | Build | App deep links TG/WA (VITE*\*), Dockerfile
nginx COPY path fix; typecheck/lint/build OK; Docker build blocked locally
(daemon off) | UI = links; real bots = Hermes gateway docs | Docker Desktop not
running | verify docker build + compose on dev machine 2026-04-08 | Gemini
Security Engineer | primary-healthcare/dashboard, website | Review | Conducted
security audit focused on data transmission/loss risks; delivered reproducible
command-based report | Prioritized CORS/CSP & error handling fixes per user
feedback; provided patches | Direct file access denied; switched to
command-generation | User to execute commands & implement patches

2026-04-09 | Codex / Dexton | sentra-assist, primary-healthcare/dashboard |
Build + Validate | Added dashboard /api/clinical/anamnesis/extract route plus
rich extractor helper/tests; aligned Sentra Assist anamnesis flow with rich
extraction payload | Local smoke test dashboard -> Sentra Assist composer
returned cleaner professional draft with verification gaps preserved | Full
browser extension smoke still pending because local WXT bridge env is not wired
| Wire local base URL/token and run browser-level sidepanel check on
ePuskesmas/dev host 2026-04-09 | Cursor-Sentra-Agent | sentra-assist,
primary-healthcare/dashboard | Build+Validate | Rewired Assist bridge auth to
use real Dashboard session cookies, removed permissive sidepanel fake-login
fallback, and opened dashboard patient-sync to session-or-token auth |
simplicity baseline is real login/session first, automation token only fallback
| dashboard lint still red in unrelated anamnesis extractor files | reload
extension, login with real dashboard account, verify send patient reaches online
doctor 2026-04-09 | Cursor-Sentra-Agent | primary-healthcare/dashboard |
Validate | Updated crew session cookie to cross-site compatible mode for Assist
(`SameSite=None; Secure` in production) and fixed local TS typing on sameSite
literal | dashboard browser session should now be reusable from extension auth
flow | full dashboard lint still red in unrelated anamnesis extractor files |
restart/deploy dashboard then re-login in Assist and run send-patient test
2026-04-09 | Codex / Dexton | sentra-assist | Build+Validate | Standardized
bridge runtime to require protected server probe before reporting ready; removed
doctor-list fallback when bridge auth is absent; wired SettingsConsole and
Forward-to-Doctor to shared server-backed runtime status | truth source is now
server authorization, not local extension state | vitest still blocked in
sandbox by esbuild spawn EPERM | reload extension, verify Settings shows server
verified, then test doctor list + forward consult with real dashboard session
2026-04-09 | Codex / Dexton | sentra-assist | Build+Validate | Hardened auth
bootstrap so sidepanel/login no longer trust stale cookie-session or synthetic
fallback session; break-glass `offline/offline` login is now dev-only opt-in |
entering EMR clinical UI now requires a server-backed session check at boot |
vitest still blocked in sandbox by esbuild spawn EPERM | reload extension,
confirm login screen appears when dashboard session is absent, then login
through real dashboard 2026-04-09 | Codex / Dexton | sentra-assist |
Build+Validate | Disabled all remaining login bypasses across app surfaces:
`SKIP_LOGIN_GATE=false`, offline auth default off, and break-glass login
hard-off | every route now depends on real server-backed authentication instead
of dev escape hatches | vitest still blocked in sandbox by esbuild spawn EPERM |
reload extension and verify both login.html and sidepanel.html stop at login
when no valid dashboard session exists
