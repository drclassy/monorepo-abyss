# Security Best Practices Report

Date: 2026-05-13
Scope: Next.js 15 / React 19 TypeScript app at `apps/corporate/ferdiiskandar`.

## Executive Summary

The repository is broadly aligned with secure defaults for a public personal website: secrets are server-side, `.env.local` is ignored, public AI endpoints validate message shape and length, dependency audit tooling exists, and global security headers are configured.

No critical vulnerability was found in pushable source. The main production risks are operational rather than code-execution issues: public AI endpoint cost abuse, trusted proxy assumptions for rate limiting, and the legacy `/api/chat` route remaining public.

One low-risk hardening change was applied during this review: the global CSP now includes `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and `frame-ancestors 'none'`.

## Scope and Evidence

Primary stack:

- Next.js App Router, React, TypeScript.
- Public JSON Route Handlers at `app/api/abby/route.ts` and `app/api/chat/route.ts`.
- Server-side AI provider calls using environment variables.
- No repo evidence of database, sessions, cookie auth, user accounts, or upload handling.

Security guidance checked:

- Next.js security headers, CSP, environment variable, and Route Handler guidance.
- React guidance for XSS escape hatches, unsafe HTML rendering, URL handling, and client-side storage.

## Critical Findings

None.

## High Findings

None.

## Medium Findings

### SBP-001: Public AI endpoint rate limiting depends on trusted forwarded headers

Severity: Medium

Evidence:

- `lib/rate-limit.ts:10-13` uses `x-forwarded-for` first and `x-real-ip` second as the client key.
- `app/api/abby/route.ts:94-104` and `app/api/chat/route.ts:37-47` apply this limiter to public POST endpoints.

Impact:

- If the production deployment allows clients to spoof these headers, a caller can rotate `x-forwarded-for` values and bypass the per-client limit, increasing provider cost and availability risk.

Recommendation:

- On Vercel or another managed edge, confirm forwarded headers are normalized by the platform.
- On custom hosting, strip inbound `x-forwarded-for` / `x-real-ip` from clients and set them only at the reverse proxy.
- For high-visibility launch, prefer platform or shared-store rate limiting instead of only in-memory process-local buckets.

### SBP-002: Legacy `/api/chat` remains public

Severity: Medium

Evidence:

- `.env.example:13-14` labels `NVIDIA_API_KEY` as legacy and only used by `/api/chat`.
- `app/api/chat/route.ts:37-155` exposes a public unauthenticated POST handler that calls NVIDIA NIM.

Impact:

- If the UI no longer uses this endpoint, it expands the provider/cost attack surface without current product benefit.

Recommendation:

- Remove the route if no longer needed.
- Otherwise, gate it behind an explicit runtime flag such as `ENABLE_LEGACY_CHAT=true` and document why it remains public.

### SBP-003: Upstream AI error bodies are logged verbatim

Severity: Medium

Evidence:

- `app/api/abby/route.ts:189-192` logs full upstream error text.
- `app/api/chat/route.ts:111-113` logs full upstream error text.

Impact:

- Provider error payloads usually do not include secrets, but they can include request details or diagnostic text. In production logs, verbose upstream bodies increase accidental data exposure risk.

Recommendation:

- Log status, provider name, request class, and a short sanitized error code/message.
- Avoid logging full upstream response bodies in production unless actively debugging.

## Low Findings

### SBP-004: CSP used a good baseline but lacked several defense-in-depth directives

Severity: Low

Evidence:

- `next.config.mjs` already had `default-src`, `img-src`, `style-src`, `script-src`, `connect-src`, and `worker-src`.
- Before this review, it did not include `object-src`, `base-uri`, `form-action`, or `frame-ancestors`.

Action taken:

- Added:
  - `object-src 'none'`
  - `base-uri 'self'`
  - `form-action 'self'`
  - `frame-ancestors 'none'`

Residual note:

- Production still uses `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'`. This is common in Next.js apps without nonce plumbing, but nonce-based CSP would be stronger if future security requirements increase.

### SBP-005: Ignored local HTML artifact uses raw `innerHTML`

Severity: Low

Evidence:

- `app/terminal-only.html` is ignored by `.gitignore:46`.
- Local scan found multiple `innerHTML` assignments in that ignored file.

Impact:

- It is not pushable under the current `.gitignore`, so it is not a repository release risk. If copied into source later, it would need review before publication.

Recommendation:

- Keep it ignored or delete it if no longer needed.
- Do not move it into tracked app/public source without replacing raw HTML construction or proving all strings are static/trusted.

## Positive Controls Observed

| Control                                             | Evidence                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| Global security headers                             | `next.config.mjs`                                                        |
| API no-store JSON headers                           | `app/api/abby/route.ts:59-65`, `app/api/chat/route.ts:15-22`             |
| Server-side secrets only                            | `app/api/abby/route.ts:30-44`, `app/api/chat/route.ts:49`                |
| Public env is non-sensitive                         | `lib/site-metadata.ts:11-12` only uses `NEXT_PUBLIC_SITE_URL`            |
| Message length validation                           | `app/api/abby/route.ts:132-148`, `app/api/chat/route.ts:72-90`           |
| Upstream timeout                                    | `app/api/abby/route.ts:169-186`, `app/api/chat/route.ts:92-109`          |
| React escapes Abby replies                          | `components/AbbyWidget.tsx:218-220` renders text in `<p>{msg.text}</p>`  |
| No tracked raw HTML sinks found in React components | `rg` found no `dangerouslySetInnerHTML` in tracked app/components source |
| No broad CORS headers found                         | `rg` found no `Access-Control-Allow-Origin` in source                    |
| Dependency audit script exists                      | `package.json` script `security:deps`                                    |

## Verification

| Command                                                | Result                        |
| ------------------------------------------------------ | ----------------------------- |
| `rg` for XSS sinks, env usage, CORS, forwarded headers | PASS WITH NOTES               |
| `git check-ignore -v app/terminal-only.html`           | PASS: ignored by `.gitignore` |
| `git status --short` before edits                      | Clean except this review work |

## Recommended Next Steps

1. Decide whether `/api/chat` should be removed, gated, or intentionally retained.
2. Confirm production deployment platform and trusted proxy header behavior.
3. Replace verbose upstream error-body logging with sanitized production logging.
4. For high-visibility launch, add platform/shared-store rate limiting for `/api/abby`.
