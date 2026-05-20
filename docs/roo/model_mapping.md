# Model Mapping

| Mode | Model | Purpose |
|---|---|---|
| Sentra Smart | Claude Opus 4.7 | Balanced strategy and safe scope |
| Sentra Rush | Claude Haiku 4.5 | Fast low-risk scans |
| Sentra Deep | GPT-5.5 High | Bounded implementation |
| Sentra Oracle | GPT-5.5 High | Deep architecture review |
| Sentra Librarian | GPT-5.5 Medium | Documentation |
| Sentra Review | GPT-5.4 Medium | Independent audit |
| Sentra Search | GPT-5.4 Medium | Evidence collection |

## Orchestration Recommendation (2026)

Use **Orchestrator** as workflow coordinator, not as primary implementation mode.

Recommended orchestrator model:

| Mode | Model | Purpose |
|---|---|---|
| Orchestrator | Claude Opus 4.7 | Multi-step planning, delegation order, quality gates |

Execution chain recommendation:

1. Sentra Search
2. Sentra Smart
3. Sentra Deep
4. Sentra Review
5. Sentra Librarian

Orchestrator output should always include:

- mission ID
- approved scope and non-scope
- mode order and handoff criteria
- verification gate per phase
- rollback trigger

## Sentra Orchestrator Setup (Requested Chain)

Fixed phase chain:

1. Search
2. Plan
3. Implement
4. Review
5. Docs

Requested model allocation:

| Phase | Recommended Mode | Model |
|---|---|---|
| Search | Sentra Search | GPT 5.5 High |
| Plan | Sentra Smart | Opus 4.7 Maxthink |
| Implement | Sentra Deep | GPT 5.4 High |
| Review | Sentra Review | Opus 4.6 High |
| Docs | Sentra Librarian | GPT 5.4 Mini |

Execution note:
- Keep `sentra-orchestrator` as coordinator only.
- Delegate each phase to the mapped specialist mode above.

## Cost Control

Use expensive models only for:
- architecture decisions
- implementation
- audit before commit

Use cheaper/fast modes for:
- search
- summary
- docs draft
- initial triage
