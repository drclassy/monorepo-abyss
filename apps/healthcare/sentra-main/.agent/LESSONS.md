# LESSONS.md — sentra-main
<!-- Append-only. Agent MUST read before starting any work. -->

---

### [2026-04-10] Wrong .agent/ structure scaffolded
**Mistake:** Created memory/, rules/, workflows/, status.md instead of correct 5-file structure
**New rule:** .agent/ = CONTEXT.md, PROGRESS.md, HANDOFF.md, LESSONS.md, DECISIONS.md, sessions/ only
**Trigger:** Any .agent/ initialization

### [2026-04-10] Core module contaminated with specific business logic
**Mistake:** Business-domain-specific logic added directly to app/core/ or lib/orchestrator/
**New rule:** Core modules must remain generic and modular. Domain-specific logic belongs in domain apps, not in sentra-main core layer.
**Trigger:** Any code added to app/core/ or lib/orchestrator/

### [2026-04-10] Tailwind v3 syntax introduced in v4 project
**Mistake:** Used Tailwind v3 class syntax or config patterns in a v4 project
**New rule:** sentra-main uses Tailwind v4 with @tailwindcss/postcss. Never use v3 config patterns (tailwind.config.js, theme.extend, etc.)
**Trigger:** Any styling work in this project

---
<!-- Agent: append new lessons below this line -->
