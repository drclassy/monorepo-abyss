# PORTAL design protocol

**Chief rule (2026-05-21):** After **NO**, agent rebuilds from zero and presents
**10 designs** (not 1) for Chief to pick. Chief answers **yes** on one pick,
then agent builds that in Next.js.

**Approved build:** v17 — tabs + focus pane (`mission-control-v17.html` →
`mission-control-dashboard.tsx`).

## Pick gallery

Open `design-preview/gallery/round-2/index.html` (current round) in a browser.

**Round 1** (retired): `gallery/01-…` through `10-…` and v1–v17 singles —
rejected.

**Round 2** (2026-05-21): `gallery/round-2/01-kanban.html` … `10-blueprint.html`
— 10 completely different paradigms.

| #   | File                            | Pattern                |
| --- | ------------------------------- | ---------------------- |
| 01  | `gallery/01-content-v4.html`    | content.tsx 4-row      |
| 02  | `gallery/02-ecosystem.html`     | 3 cards + 2 columns    |
| 03  | `gallery/03-terminal.html`      | CLI terminal rows      |
| 04  | `gallery/04-health-list.html`   | Light progress bars    |
| 05  | `gallery/05-tab-focus.html`     | **Built in app (v17)** |
| 06  | `gallery/06-snap-scroll.html`   | Vertical snap slides   |
| 07  | `gallery/07-command-strip.html` | 6-segment strip        |
| 08  | `gallery/08-master-detail.html` | Light nav + overview   |
| 09  | `gallery/09-status-table.html`  | Workspace + table      |
| 10  | `gallery/10-radial-hub.html`    | Hub + 6 satellites     |

Legacy singles: `mission-control-v1.html` … `mission-control-v17.html`.
