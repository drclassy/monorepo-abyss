# JET-8: Logs session end to the daily audit trail.
$project = $env:CLAUDE_PROJECT_DIR
if (-not $project) { $project = (Get-Location).Path }

$repoRoot = git -C $project rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or -not $repoRoot) {
    [Console]::Error.WriteLine("SESSION STOP LOG FAILED: Unable to determine repo root from $project")
    exit 2
}

$agentDir = Join-Path $repoRoot ".agent"
if (-not (Test-Path $agentDir)) {
    [Console]::Error.WriteLine("SESSION STOP LOG FAILED: Missing .agent directory at $agentDir")
    exit 2
}

$requiredFiles = @(
    "README.md",
    "CONTEXT.md",
    "DECISIONS.md",
    "HANDOFF.md",
    "PROGRESS.md"
)
$missing = @()
foreach ($file in $requiredFiles) {
    $path = Join-Path $agentDir $file
    if (-not (Test-Path $path)) { $missing += $path }
}
if ($missing.Count -gt 0) {
    [Console]::Error.WriteLine("SESSION STOP SSOT FAILED: Missing required .agent files: $($missing -join ', ')")
    exit 2
}

$sessionsDir = Join-Path $agentDir "sessions"
if (-not (Test-Path $sessionsDir)) {
    New-Item -ItemType Directory -Path $sessionsDir -Force | Out-Null
}

function Add-SessionLine {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Value
    )

    for ($i = 0; $i -lt 5; $i++) {
        try {
            Add-Content -Path $Path -Value $Value -ErrorAction Stop
            return
        } catch {
            if ($i -eq 4) { throw }
            Start-Sleep -Milliseconds (100 * ($i + 1))
        }
    }
}

$date = (Get-Date).ToString("yyyy-MM-dd")
$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm")
$sessionFile = Join-Path $sessionsDir "$date.md"
$linesBeforeStop = @()
if (Test-Path $sessionFile) {
    $linesBeforeStop = @(Get-Content -Path $sessionFile -ErrorAction SilentlyContinue)
}
$lastStopIndex = -1
for ($i = $linesBeforeStop.Count - 1; $i -ge 0; $i--) {
    if ($linesBeforeStop[$i] -match '^## Session end:') {
        $lastStopIndex = $i
        break
    }
}
$linesSinceLastStop = if ($lastStopIndex -ge 0) {
    @($linesBeforeStop[($lastStopIndex + 1)..($linesBeforeStop.Count - 1)])
} else {
    $linesBeforeStop
}
$hasEditsSinceLastStop = @($linesSinceLastStop | Where-Object { $_ -match '^## File change logged:' }).Count -gt 0

Add-SessionLine -Path $sessionFile -Value "## Session end: $timestamp (SessionStop hook)"
Write-Output "SESSION STOP LOG OK: $sessionFile"
Write-Output "SSOT CHECK OK: Required files exist: README, CONTEXT, DECISIONS, HANDOFF, PROGRESS."

if ($hasEditsSinceLastStop) {
    Write-Output @"
SSOT CONTINUITY WARNING:
File edits happened in this session.
Before handing off, make sure:
- .agent/HANDOFF.md says what the next agent should do next.
- .agent/PROGRESS.md reflects current status.
- .agent/DECISIONS.md records durable decisions only.
- .agent/DECISIONS.md also records repeated mistakes or safety lessons.
Do not rely on .agent/sessions/YYYY-MM-DD.md alone for continuity.
"@
}
