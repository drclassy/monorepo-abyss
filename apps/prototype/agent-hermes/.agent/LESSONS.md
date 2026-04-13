# Agent Hermes — LESSONS.md

**Last updated:** 2026-04-13

---

## Lesson 1 — Do not assume unified REST interfaces across vendor repos

**What happened:** Plan v1 assumed every vendor exposes `/health`, `/skills`, `/tasks` on HTTP.  
**Reality:** hermes-core ACP adapter speaks stdio; hindsight is Postgres; only gateway/UIs are HTTP.  
**Action taken:** Spec v2 rewrote architecture as thin-wrap over native vendor protocols.  
**Takeaway:** Always inspect vendor Dockerfile/compose/README before designing orchestration.

---

## Lesson 2 — Windows CRLF breaks Linux container entrypoints

**What happened:** Shell scripts written on Windows had `\r\n` line endings, causing Linux containers to fail with "bad interpreter" errors.  
**Fix:** Added `.gitattributes` forcing `* text=auto eol=lf` (commit `3259fe6`).  
**Takeaway:** Force LF on all shell scripts in cross-platform repos.

---

## Lesson 3 — hermes-core container has no `curl`

**What happened:** Initial healthcheck used `curl -f http://localhost:8642/health`; container failed healthcheck repeatedly.  
**Fix:** Switched to `python3 -c 'import urllib.request...'` which is always present in the Python-based image (commit `58ff354`).  
**Takeaway:** Use tools guaranteed to exist in the base image (Python stdlib > curl for Python images).

---

## Lesson 4 — Hindsight LLM client needs explicit base URL to reuse Nous Portal

**What happened:** hindsight defaulted to OpenAI endpoint and expected `OPENAI_API_KEY`.  
**Fix:** Set `HINDSIGHT_API_LLM_PROVIDER=openai`, `HINDSIGHT_API_LLM_BASE_URL=https://inference-api.nousresearch.com/v1`, and `HINDSIGHT_API_LLM_API_KEY=${NOUS_API_KEY}` so Chief's single Nous key serves both hermes-core and hindsight (commit `58ff354`).  
**Takeaway:** When vendors claim "OpenAI-compatible", verify the `BASE_URL` env var name and wire it explicitly.

---

## Lesson 5 — Mission Control is OpenClaw-native, not Hermes-native

**What happened:** Assumed mission-control could directly orchestrate hermes-core.  
**Reality:** Its gateway integration is hardcoded for OpenClaw paths/env vars.  
**Takeaway:** Document adapter gaps honestly as open items rather than pretending integration is drop-in.

---

## Lesson 6 — WSL2 memory limits silently throttle or crash heavy Docker builds

**What happened:** `mission-control` Next.js build repeatedly crashed Docker Desktop (500 Internal Server Error) or timed out after >15 minutes.  
**Reality:** `C:\Users\claud\.wslconfig` was capped at `memory=2GB` / `processors=2`. The Turbopack build exhausted VM RAM, causing the Docker engine to hang or die.  
**Fix:** Raised WSL2 limits to `memory=10GB` / `processors=4`. The same build then compiled in ~35s and completed end-to-end in ~61s without engine instability.  
**Takeaway:** On Windows + Docker Desktop + WSL2, always inspect `.wslconfig` before blaming the Dockerfile or application code for build crashes.
