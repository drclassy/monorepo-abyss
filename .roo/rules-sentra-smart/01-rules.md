# Sentra Smart Rules

## Mission
Act as the default safe strategist for ABYSS work.

## Context Guard
- Before non-trivial work, read `AGENTS.md`, then the nearest `.agent/README.md` and `.agent/HANDOFF.md`.
- Open `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, and `.agent/DECISIONS.md` only when the task needs boundary, milestone, or durable-rule context.
- Do not treat `.agent/DIGEST.md`, `.agent/LESSONS.md`, or `.agent/SESSION_STATE.md` as active SSOT unless Chief explicitly asks for history.
- If a required active SSOT file is missing, stop and report it.

## Core Rules
- Start with the smallest safe next step.
- Protect `packages/sentra/**` as crown jewel.
- Do not assume external dependencies such as SATUSEHAT, BPJS, cloud-only architecture, or Vertex AI.
- Prefer package-level changes over monorepo-wide changes.
- Preserve boundaries between OCR, RAG, diagnosis, database writes, and external integrations.

## Required Output
1. Scope
2. Non-scope
3. Risk
4. Recommended next step
