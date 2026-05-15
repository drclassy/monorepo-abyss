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
foreach ($f in @("CONTEXT.md", "PROGRESS.md", "HANDOFF.md", "LESSONS.md", "DECISIONS.md")) {
    if (-not (Test-Path "$agentDir/$f")) { $missing += "$agentDir/$f" }
}

if ($missing.Count -gt 0) {
    [Console]::Error.WriteLine("GUARD 1 FAILED: Missing .agent files: $($missing -join ', ')")
    exit 2
}

# === GUARD 1 ENHANCEMENT: Auto-inject critical context into Claude session ===
# SessionStart hook stdout is injected directly into Claude's context window.

# Step 1: Generate fresh cross-agent DIGEST.md
$digestScript = "$agentDir/scripts/sync-agent-digest.ps1"
if (Test-Path $digestScript) {
    & powershell -NoProfile -NonInteractive -File $digestScript -AgentDir $agentDir 2>$null
}

# Step 2: Read critical files (token-optimized: ~1,400 tokens total)
$handoff  = Get-Content "$agentDir/HANDOFF.md" -Raw -ErrorAction SilentlyContinue
$progress = Get-Content "$agentDir/PROGRESS.md" -Raw -ErrorAction SilentlyContinue

$lessonsRaw = Get-Content "$agentDir/LESSONS.md" -Raw -ErrorAction SilentlyContinue
$lessonEntries = $lessonsRaw -split "(?m)^### " | Where-Object { $_ -match '\S' } | Select-Object -Last 5
$lessons = ($lessonEntries | ForEach-Object { "### $_" }) -join "`n"

# Step 3: Build and print context — plain stdout is injected into Claude's context
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
Write-Output @"
=== GUARD 1 AUTO-INJECTED CONTEXT ($timestamp) ===
Sebelum melanjutkan, wajib output:
✅ CONTEXT LOADED: [architecture state] · PROGRESS: [work state] · ACTIVE TASK: [session goal] · KNOWN RISKS: [relevant lessons]

## HANDOFF.md (Active Plan)
$handoff

## PROGRESS.md (Current State)
$progress

## LESSONS.md (5 Entry Terbaru)
$lessons
=== END GUARD 1 CONTEXT ===
"@
