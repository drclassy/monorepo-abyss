# Logs file write/edit events to the daily session file.
$project = $env:CLAUDE_PROJECT_DIR
if (-not $project) { $project = (Get-Location).Path }

$repoRoot = git -C $project rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or -not $repoRoot) {
    [Console]::Error.WriteLine("POST TOOL LOG FAILED: Unable to determine repo root from $project")
    exit 2
}

$agentDir = Join-Path $repoRoot ".agent"
if (-not (Test-Path $agentDir)) {
    [Console]::Error.WriteLine("POST TOOL LOG FAILED: Missing .agent directory at $agentDir")
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
Add-SessionLine -Path $sessionFile -Value "## File change logged: $timestamp (PostToolUse hook)"
Write-Output "POST TOOL LOG OK: $sessionFile"
Write-Output "SSOT REMINDER: If mission state changed, update .agent/HANDOFF.md and .agent/PROGRESS.md before session stop. Use .agent/DECISIONS.md only for durable decisions or repeated mistakes."
