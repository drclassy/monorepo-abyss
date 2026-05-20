# Ferdiiskandar Security Threat Model

> **Date:** 2026-05-13
> **Version:** 1.1
> **Scope:** `@the-abyss/ferdiiskandar` personal website and public AI assistant runtime.
> **Review cycle:** Quarterly or upon significant architecture changes

---

## 1. Executive Summary

This app is a public Next.js website for dr Ferdi Iskandar with public editorial pages and two unauthenticated AI chat endpoints.

**Highest-value assets protected by this model:**

- AI provider API keys (DeepSeek, optional OpenAI, NVIDIA legacy)
- Cost and availability of upstream AI providers
- Integrity of Abby's system prompt and knowledge base
- Public professional reputation and medical-safety boundaries
- Public website source, content, and static assets

**Current posture:** Suitable for a public personal website if the deployment platform protects environment variables and normalizes proxy headers. The main residual risk is abuse of public AI endpoints — especially rate-limit bypass if `x-forwarded-for` / `x-real-ip` can be spoofed by untrusted clients.

**Verdict:** PASS WITH NOTES — no critical or high-severity findings. Medium-severity operational risks require ongoing monitoring.

---

## 2. Assumptions

| - Assumption                                                                     | Confidence | Notes                               |
| -------------------------------------------------------------------------------- | ---------- | ----------------------------------- |
| Site is deployed as a public internet-facing Next.js app                         | High       | Verified                            |
| TLS is terminated by the hosting platform or reverse proxy                       | High       | Vercel or equivalent expected       |
| Public pages are intentionally unauthenticated                                   | High       | By design                           |
| `/api/abby` and `/api/chat` are intentionally public POST endpoints              | High       | Can be gated later via feature flag |
| No database, user accounts, sessions, payment flow, or PHI records exist         | High       | Confirmed by code review            |
| Abby is a public-profile and general educational assistant, not a medical device | High       | Enforced in system prompt           |
| Runtime secrets are provided through environment variables only                  | High       | `.env.local` is gitignored          |

---

## 3. Asset Inventory

| Asset                         | Location                                                            | Security Goal                                           | Impact if Compromised               |
| ----------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------- |
| AI provider API keys          | Runtime env: `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, `NVIDIA_API_KEY` | Confidentiality — never expose to browser, logs, or Git | Unauthorized usage, cost overrun    |
| Abby system prompt            | `src/prompts/abby.system-prompt.md`                                 | Integrity — preserve instruction accuracy               | Misinformation, reputational damage |
| Abby knowledge base           | `content/abby/*.md`, loaded by `lib/abby-knowledge.ts`              | Integrity — factual accuracy                            | Inaccurate public information       |
| Public website code & content | `app/`, `components/`, `lib/`, `content/`, `public/`                | Availability and brand correctness                      | Defacement, confusion               |
| AI endpoint budget            | `/api/abby`, `/api/chat`                                            | Cost control — prevent automated abuse                  | Unexpected provider charges         |
| Security headers              | `next.config.mjs`, route handler responses                          | Browser-side attack surface reduction                   | XSS, clickjacking risk              |
| Git repository                | Source, config, docs, lockfile                                      | Prevent secrets and local artifacts from being pushed   | Credential leakage                  |

---

## 4. Trust Boundaries

| Boundary                   | Trusted Side                        | Untrusted Side            | Risk                                                          |
| -------------------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------------- |
| Browser to Next.js         | Server route handlers               | Any internet visitor      | Public traffic — standard                                     |
| Next.js to AI providers    | Server-side fetch with bearer token | External AI provider APIs | Keys remain server-side — low                                 |
| Runtime env to source repo | Hosting secret store                | Git worktree and GitHub   | `.env.local` must stay ignored                                |
| Reverse proxy to app       | Hosting platform headers            | Client-supplied headers   | ⚠️ Rate limiter trusts forwarded headers                      |
| AI output to UI            | Server-normalized reply             | Untrusted model output    | Reply may contain risky content — mitigated by React escaping |
| Content files to prompt    | Maintainer-authored markdown        | Future edits or PRs       | Prompt/knowledge changes affect behavior                      |

---

## 5. Entry Points & Attack Surface

| Entry Point               | Type                | Auth                  | Main Risks                                                                 |
| ------------------------- | ------------------- | --------------------- | -------------------------------------------------------------------------- |
| Public pages (`app/**`)   | GET                 | None                  | Defacement via source changes, stale content                               |
| `/api/abby`               | POST JSON           | None                  | AI cost abuse, prompt injection, model hallucination, medical-safety drift |
| `/api/chat`               | POST JSON           | None                  | Legacy endpoint cost abuse, unneeded provider exposure                     |
| Static assets (`public/`) | GET                 | None                  | Accidental publication of private media                                    |
| Deployment env vars       | Runtime config      | Platform-controlled   | Secret exposure if misconfigured                                           |
| Git repository            | Source distribution | GitHub access control | Secret or artifact leakage                                                 |

---

## 6. Existing Controls

| Control                    | Evidence                                                                                                             | Coverage                                   | Gap                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| Security headers           | `next.config.mjs` sets CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy                                 | All responses                              | CSP could be tightened further                                                     |
| API no-store headers       | API routes return `Cache-Control: no-store` and JSON content type                                                    | `/api/abby`, `/api/chat`                   | None                                                                               |
| Server-side provider keys  | API keys read only from `process.env` in route handlers                                                              | API routes                                 | None                                                                               |
| Request size validation    | Rejects missing, empty, and >2000-char messages                                                                      | API routes                                 | None                                                                               |
| Request timeout            | AI fetch uses `AbortSignal.timeout`                                                                                  | API routes                                 | None                                                                               |
| Basic rate limiting        | `createHybridRateLimiter` / `createFixedWindowRateLimiter`, 20 req / 60s; optional Upstash Redis when env configured | `/api/abby`, `/api/chat`, `/api/abby/lead` | Bypass risk if proxy headers spoofed; without Upstash, not shared across instances |
| Prompt/knowledge load      | `lib/abby-knowledge.ts` reads fixed local files                                                                      | Knowledge base                             | None                                                                               |
| Dependency security script | `pnpm security:deps` exists                                                                                          | App-scoped audit                           | Schedule not enforced automatically                                                |
| Git hygiene                | `.gitignore` blocks env, build, deps, cache, AI-local artifacts                                                      | Repository                                 | Recommend periodic audit                                                           |
| Safe env example           | `.env.example` uses empty placeholders                                                                               | Documentation                              | None                                                                               |

---

## 7. Threat Register

| ID  | Threat                                                 | Likelihood | Impact   | Existing Controls                                                   | Residual Risk | Mitigation                                                                                                  |
| --- | ------------------------------------------------------ | ---------- | -------- | ------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------- |
| T1  | API key leakage through Git or public bundle           | Low        | Critical | `.env*` ignored; keys read server-side                              | Low           | Pre-commit hooks; periodic secret scan                                                                      |
| T2  | Public AI endpoint cost abuse                          | Medium     | Medium   | 20 req/min rate limit, message cap, timeouts                        | Medium        | Add per-route monitoring; lower anonymous cap; consider platform-level rate limiting                        |
| T3  | Rate-limit bypass via spoofed `x-forwarded-for`        | Medium     | Medium   | Uses forwarded headers                                              | Medium        | Confirm hosting platform normalizes headers; use platform edge rate limiting or Redis-backed shared limiter |
| T4  | Prompt injection causing off-brand or unsafe responses | Medium     | Medium   | System prompt, knowledge base, reply normalization                  | Medium        | Expand system prompt with injection-defense instructions; add output validation                             |
| T5  | Abby provides medical advice beyond intended scope     | Medium     | High     | README documents non-diagnostic boundary; system prompt enforces it | Medium        | Add explicit refusal tests; add visible disclaimer on website                                               |
| T6  | Legacy `/api/chat` endpoint remains public             | Medium     | Medium   | Validation, timeout, rate limit                                     | Medium        | Remove or gate behind feature flag                                                                          |
| T7  | Upstream AI returns sensitive error details            | Low        | Medium   | Most Abby errors return generic messages                            | Low-Medium    | Implement structured error responses (RFC 9457)                                                             |
| T8  | XSS through AI model output rendered by client         | Low        | Medium   | Abby normalizes output; React escapes plain strings                 | Low           | Audit all render paths; ensure `dangerouslySetInnerHTML` is never used for AI output                        |
| T9  | CSP too permissive for scripts/styles                  | Low        | Medium   | CSP present but allows `unsafe-inline`                              | Low-Medium    | Evaluate nonce-based CSP in future                                                                          |
| T10 | Private media in `public/`                             | Low        | Medium   | Cleanup performed                                                   | Low           | Add CI check scanning `public/` for unexpected files                                                        |
| T11 | Dependency vulnerability in app runtime                | Low        | Medium   | `pnpm security:deps`; lockfile committed                            | Low           | Integrate Snyk or Dependabot in CI                                                                          |
| T12 | In-memory rate limiter resets on serverless cold start | Medium     | Medium   | Fixed-window per-process                                            | Medium        | Use shared-store (Redis/Upstash) rate limiting for production                                               |

---

## 8. Priority Findings & Remediation Plan

### P1 — CONFIRM TRUSTED PROXY HEADER BEHAVIOR

**Risk:** Rate limiting depends on `x-forwarded-for` / `x-real-ip` being trustworthy. If the hosting platform does not strip or normalize inbound headers, an attacker can rotate values to bypass rate limits.

**Actions:**

- [ ] Document hosting platform header normalization behavior
- [ ] If using a custom reverse proxy: strip inbound `x-forwarded-for` and set it only at the proxy
- [ ] For higher security: migrate to platform edge rate limiting or shared-store limiter (Redis/Upstash)
- **Owner:** Deployment team
- **Due:** Before public launch

### P2 — GATE OR REMOVE LEGACY `/api/chat` ENDPOINT

**Risk:** Legacy endpoint expands provider surface and cost-abuse attack path without current product benefit.

**Actions:**

- [ ] Confirm with Chief whether `/api/chat` is still needed
- [ ] If unused: remove route or gate behind `ENABLE_LEGACY_CHAT=true` feature flag
- [ ] If kept: apply the same medical-safety logging as `/api/abby`
- **Owner:** Engineering
- **Due:** Before public launch

### P3 — ADD AI SAFETY MONITORING AND ALERTING

**Risk:** Public AI endpoints can be scripted for cost abuse or prompt injection. Current controls are appropriate for low-traffic personal use but insufficient for public-facing traffic spikes.

**Actions:**

- [ ] Add per-route monitoring for 429 rates, upstream cost, and error spikes
- [ ] Consider stricter anonymous visitor limits
- [ ] Add deployment-side rate limiting for high-visibility periods
- **Owner:** Engineering / Operations
- **Due:** Before significant traffic exposure

### P4 — STRENGTHEN MEDICAL-SAFETY BOUNDARIES

**Risk:** The application could be perceived as providing medical guidance if Abby's responses are not carefully bounded.

**Actions:**

- [ ] Audit `src/prompts/abby.system-prompt.md` to confirm explicit refusal of diagnosis, treatment, emergency guidance
- [ ] Add automated tests for refusal behavior
- [ ] Add visible disclaimer on website: "Abby is an AI assistant, not a medical professional"
- **Owner:** Engineering + Content
- **Due:** Before public launch

---

## 9. Compliance Considerations

| Framework                   | Applicability                            | Status                                                  |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Indonesian PDP Law (UU PDP) | If any Indonesian user data is processed | Not applicable (no PII collection)                      |
| GDPR                        | If EU/UK users interact                  | Not directly applicable (no user accounts, no tracking) |
| OWASP Top 10                | General web security guidance            | Partially addressed                                     |

---

## 10. Continuous Improvement

| Action                                         | Frequency                               | Owner                 |
| ---------------------------------------------- | --------------------------------------- | --------------------- |
| Run `pnpm security:deps` and review results    | Weekly in CI, review monthly            | Engineering           |
| Review and update threat register              | Quarterly                               | Security reviewer     |
| Re-assess rate-limiting effectiveness          | Quarterly or after traffic events       | Engineering           |
| Audit `content/abby/*.md` for factual accuracy | Quarterly                               | Content maintainer    |
| Review `system-prompt.md`                      | Quarterly or after incidents            | Engineering + Content |
| Penetration test (external)                    | Annually or before major feature launch | External auditor      |

---

<!-- branding: precision-built by Classy — threat modeling with forensic precision and institutional-grade responsibility -->
