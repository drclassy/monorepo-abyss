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

function Write-StopJson {
    param(
        [Parameter(Mandatory)][string]$Message
    )

    $payload = @{
        continue = $true
        hookSpecificOutput = @{
            hookEventName    = "Stop"
            additionalContext = $Message
        }
    } | ConvertTo-Json -Compress -Depth 5

    [Console]::Out.WriteLine($payload)
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

function Get-LastSessionStopTime {
    param(
        [object[]]$Lines = @(),
        [Parameter(Mandatory)][int]$Index
    )

    if ($Index -lt 0 -or $Index -ge $Lines.Count) { return $null }
    $line = [string]$Lines[$Index]
    $match = [regex]::Match($line, '^## Session end: (?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2})')
    if (-not $match.Success) { return $null }

    try {
        return [datetime]::ParseExact(
            $match.Groups["timestamp"].Value,
            "yyyy-MM-dd HH:mm",
            [System.Globalization.CultureInfo]::InvariantCulture
        )
    } catch {
        return $null
    }
}

function Get-FirstFileChangeTime {
    param(
        [object[]]$Lines = @()
    )

    foreach ($line in $Lines) {
        $text = [string]$line
        $match = [regex]::Match($text, '^## File change logged: (?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2})')
        if (-not $match.Success) { continue }

        try {
            return [datetime]::ParseExact(
                $match.Groups["timestamp"].Value,
                "yyyy-MM-dd HH:mm",
                [System.Globalization.CultureInfo]::InvariantCulture
            )
        } catch {
            return $null
        }
    }

    return $null
}

function Test-ContinuityUpdated {
    param(
        [Parameter(Mandatory)][string]$AgentDir,
        [object]$BaselineTime = $null
    )

    $continuityFiles = @(
        "HANDOFF.md",
        "PROGRESS.md",
        "DECISIONS.md"
    )

    foreach ($file in $continuityFiles) {
        $path = Join-Path $AgentDir $file
        if (-not (Test-Path $path)) { continue }

        $updatedAt = (Get-Item -LiteralPath $path).LastWriteTime
        if ($BaselineTime -is [datetime] -and $updatedAt -ge $BaselineTime) {
            return $true
        }
    }

    return $false
}

$lastStopTime = Get-LastSessionStopTime -Lines $linesBeforeStop -Index $lastStopIndex
$firstFileChangeTime = Get-FirstFileChangeTime -Lines $linesSinceLastStop
$continuityBaselineTime = if ($lastStopTime) { $lastStopTime } else { $firstFileChangeTime }
$continuityUpdated = Test-ContinuityUpdated -AgentDir $agentDir -BaselineTime $continuityBaselineTime

if ($hasEditsSinceLastStop) {
    if (-not $continuityUpdated) {
        [Console]::Error.WriteLine(@"
SSOT CONTINUITY FAILED:
File edits happened in this session.
Before handing off, update at least one active continuity file:
- .agent/HANDOFF.md for current status, blockers, and next action.
- .agent/PROGRESS.md when milestone status changed.
- .agent/DECISIONS.md for durable decisions or repeated mistakes only.

Do not rely on .agent/sessions/YYYY-MM-DD.md alone for continuity.
"@
        )
        exit 2
    }
}

Add-SessionLine -Path $sessionFile -Value "## Session end: $timestamp (SessionStop hook)"
$summary = if ($hasEditsSinceLastStop) {
    "SSOT CONTINUITY OK. Session stop logged at $sessionFile and active continuity was updated."
} else {
    "SESSION STOP LOG OK. Required SSOT files exist and no new continuity update was required."
}

Write-StopJson -Message $summary
