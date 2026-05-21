# sync-agent-digest.ps1
# Generates .agent/reports/digest/latest.md — compact cross-agent context summary.
# Kept as an optional helper. It is not an active root SSOT file.

param(
    [Parameter(Mandatory)][string]$AgentDir
)

function Get-AgentExcerpt {
    param(
        [Parameter(Mandatory)][string]$Path,
        [int]$MaxLines = 40,
        [int]$MaxChars = 1200
    )

    if (-not (Test-Path $Path)) { return "" }
    $lines = Get-Content $Path -ErrorAction SilentlyContinue |
        Where-Object { $_.Trim().Length -gt 0 } |
        Select-Object -First $MaxLines
    $excerpt = ($lines -join "`n").TrimEnd()
    if ($excerpt.Length -gt $MaxChars) { $excerpt = $excerpt.Substring(0, $MaxChars) + "`n...[open full file if needed]" }
    return $excerpt
}

$readme = Get-AgentExcerpt "$AgentDir/README.md" 25 900
if (-not $readme) { Write-Warning "sync-agent-digest: README.md not found or empty at $AgentDir" }

$handoff = Get-AgentExcerpt "$AgentDir/HANDOFF.md" 35 1500
if (-not $handoff) { Write-Warning "sync-agent-digest: HANDOFF.md not found or empty at $AgentDir" }

$progress = Get-AgentExcerpt "$AgentDir/PROGRESS.md" 30 1000
if (-not $progress) { Write-Warning "sync-agent-digest: PROGRESS.md not found or empty at $AgentDir" }

$decisions = Get-AgentExcerpt "$AgentDir/DECISIONS.md" 35 1200
if (-not $decisions) { Write-Warning "sync-agent-digest: DECISIONS.md not found or empty at $AgentDir" }

$digest = @"
# AGENT DIGEST - Auto-generated $(Get-Date -Format 'yyyy-MM-dd HH:mm')
> Compact helper summary. Generated under reports; not active SSOT.

## SSOT File Standard
- `CONTEXT.md` = stable repo context and boundaries.
- `HANDOFF.md` = active continuity file for the next agent.
- `PROGRESS.md` = current status and milestones.
- `DECISIONS.md` = durable decisions and lessons; append only.
- `README.md` = map and usage rule.

## Mandatory Startup Contract
Every agent must verify `.agent/` exists before substantive repo work.

- `AGENTS.md` = public rulebook.
- `.agent/` = operational SSOT for continuity, guardrails, handoff records, operational memory, and workflow state.
- Read `README.md` and `HANDOFF.md` first, then `CONTEXT.md`, `PROGRESS.md`, and `DECISIONS.md` as needed.
- Do not delete, move, clean, reset, ignore, or treat `.agent/` as cache/junk.
- Do not replace `.agent/` with `AGENTS.md`.

## Detail-On-Demand Rule
Open full SSOT files only when needed:
- Need map/rules: `README.md`
- Need repo boundaries: `CONTEXT.md`
- Need next action: `HANDOFF.md`
- Need current status: `PROGRESS.md`
- Need prior decisions or lessons: search `DECISIONS.md`

## README Excerpt
$readme

## Active Handoff Excerpt
$handoff

## Current Progress Excerpt
$progress

## Decisions And Lessons Excerpt
$decisions
"@
$digestDir = Join-Path $AgentDir "reports/digest"
New-Item -ItemType Directory -Path $digestDir -Force | Out-Null
Set-Content (Join-Path $digestDir "latest.md") $digest -Encoding UTF8
