# GUARD 1: Validates that required .agent/ context files exist before any session
$project = $env:CLAUDE_PROJECT_DIR
if (-not $project) { $project = (Get-Location).Path }

$repoRoot = git -C $project rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or -not $repoRoot) {
    [Console]::Error.WriteLine("GUARD 1 FAILED: Unable to determine repo root from $project")
    exit 2
}

if (-not (Test-Path "$repoRoot/AGENTS.md")) {
    [Console]::Error.WriteLine("GUARD 1 FAILED: Missing root AGENTS.md at $repoRoot/AGENTS.md")
    exit 2
}

$search = $project
$agentDir = ""
while ($true) {
    if (Test-Path "$search/.agent") { $agentDir = "$search/.agent"; break }
    if ($search -eq $repoRoot) { break }
    $parent = Split-Path $search -Parent
    if ($parent -eq $search) { break }
    $search = $parent
}
if (-not $agentDir -and (Test-Path "$repoRoot/.agent")) { $agentDir = "$repoRoot/.agent" }

if (-not $agentDir) {
    [Console]::Error.WriteLine("GUARD 1 FAILED: No .agent directory found from $project up to $repoRoot")
    exit 2
}

$missing = @()
foreach ($f in @("README.md", "CONTEXT.md", "PROGRESS.md", "HANDOFF.md", "DECISIONS.md")) {
    if (-not (Test-Path "$agentDir/$f")) { $missing += "$agentDir/$f" }
}

if ($missing.Count -gt 0) {
    [Console]::Error.WriteLine("GUARD 1 FAILED: Missing .agent files: $($missing -join ', ')")
    exit 2
}

# === GUARD 1 ENHANCEMENT: Auto-inject compact SSOT context ===
# Keep startup token use low. Print compact excerpts only; open full files on demand.
function Get-AgentExcerpt {
    param(
        [Parameter(Mandatory)][string]$Path,
        [int]$MaxChars = 1400
    )

    $text = Get-Content $Path -Raw -ErrorAction SilentlyContinue
    if (-not $text) { return "" }
    if ($text.Length -gt $MaxChars) { return $text.Substring(0, $MaxChars) + "`n...[open full file if needed]" }
    return $text.Trim()
}

$readme = Get-AgentExcerpt "$agentDir/README.md" 1000
$handoff = Get-AgentExcerpt "$agentDir/HANDOFF.md" 1800
$progress = Get-AgentExcerpt "$agentDir/PROGRESS.md" 1200

# Step 3: Build and print context — plain stdout is injected into Claude's context
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
Write-Output @"
=== GUARD 1 AUTO-INJECTED CONTEXT ($timestamp) ===
AGENTS.md = public rulebook.
.agent/ = protected operational SSOT.

Sebelum melanjutkan, wajib output:
✅ CONTEXT LOADED: [architecture state] · PROGRESS: [work state] · ACTIVE TASK: [session goal] · KNOWN RISKS: [relevant lessons]

Every agent must verify .agent/ exists, load .agent/ state before substantive repo work, and never delete/move/clean/reset/treat .agent/ as cache or junk.

## README.md
$readme

## HANDOFF.md
$handoff

## PROGRESS.md
$progress

## Required SSOT Read Pattern
1. Read `.agent/README.md`.
2. Read `.agent/HANDOFF.md`.
3. Open `.agent/CONTEXT.md` when touching repo boundaries, protected areas, or crown-jewel code.
4. Open `.agent/PROGRESS.md` when milestone state matters.
5. Search `.agent/DECISIONS.md` when a prior rule, lesson, or durable choice matters.

## Token Discipline
Do not bulk-read every `.agent/` file up front. Start with README.md and HANDOFF.md, then open only the SSOT files the task actually needs.
=== END GUARD 1 CONTEXT ===
"@
