# Version Manifest — 2026-04-12

Pinned references for all 14 vendored repos in the Hermes Maximus flagship stack.
Update this manifest whenever a submodule is bumped. `scripts/verify_versions.py`
(added in Phase 6) will check that submodule SHAs match.

| Repo | Pinned Ref | Commit SHA | Date | Category |
|------|-----------|-----------|------|----------|
| NousResearch/hermes-agent | v2026.4.8 | 86960cdb | 2026-04-08 | core |
| builderz-labs/mission-control | v2.0.1 | 8517d5e8 | 2026-03-18 | ui |
| outsourc-e/hermes-workspace | v1.0.0 | 2e69f58f | 2026-04-10 | ui |
| vectorize-io/hindsight | v0.5.0 | c5091d29 | 2026-04-08 | memory |
| wondelai/skills | main | 4d322538 | 2026-04-05 | skills |
| robbyczgw-cla/hermes-web-search-plus | v1.3.0 | 8789257f | 2026-03-17 | plugin |
| 42-evey/evey-bridge-plugin | main | 663b240c | 2026-03-22 | plugin |
| Cranot/super-hermes | master | ba6b1cd3 | 2026-03-15 | meta |
| Yonkoo11/hermes-dojo | master | 9bea2018 | 2026-03-15 | meta |
| Ridwannurudeen/hermes-council | master | 913c6922 | 2026-03-18 | meta |
| NousResearch/hermes-agent-self-evolution | main | 4693c8f0 | 2026-03-29 | meta |
| Romanescu11/hermes-skill-factory | master | ca38242c | 2026-03-18 | skills |
| Lethe044/hermes-skill-marketplace | main | 10754a22 | 2026-03-14 | skills |
| mudrii/hermes-agent-docs | docs-v2026.4.6 | 209c3425 | 2026-04-05 | docs |

## Discovery method

- Release tag preferred → tag fallback → default branch HEAD SHA
- Probed via `gh api repos/<owner>/<repo>/...` on 2026-04-12
- Commit SHA is 8-char prefix of full commit hash
- Date is author commit date (YYYY-MM-DD)

## Category breakdown

- **core:** 1 (hermes-agent)
- **ui:** 2 (mission-control, workspace)
- **memory:** 1 (hindsight)
- **skills:** 3 (wondelai/skills, skill-factory, skill-marketplace)
- **plugin:** 2 (web-search-plus, evey-bridge)
- **meta:** 4 (super-hermes, dojo, council, self-evolution)
- **docs:** 1 (hermes-agent-docs)

## Missing repos

None — all 14 repos found on GitHub.

## Notes

- 7 repos publish release tags; 7 are pinned to default branch HEAD (main/master). Those
  branch-pinned repos should be bumped with intent — `git submodule update --remote` will
  pull newer commits, and this manifest must be updated to match.
- `NousResearch/hermes-agent` uses a date-based release tag scheme (`v2026.4.8` = April 8).
- `mudrii/hermes-agent-docs` uses a `docs-v*` tag prefix.
