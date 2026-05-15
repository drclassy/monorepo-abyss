# sync-agent-digest.ps1
# Generates .agent/DIGEST.md — compact cross-agent context summary
# Called by session-start.ps1 at session initialization

param(
    [Parameter(Mandatory)][string]$AgentDir
)

$handoff = Get-Content "$AgentDir/HANDOFF.md" -Raw -ErrorAction SilentlyContinue
if (-not $handoff)    { Write-Warning "sync-agent-digest: HANDOFF.md not found or empty at $AgentDir" }

$progress = (Get-Content "$AgentDir/PROGRESS.md" -ErrorAction SilentlyContinue) |
            Select-Object -Last 30 | Out-String
$progress = $progress.TrimEnd()
if (-not $progress.Trim()) { Write-Warning "sync-agent-digest: PROGRESS.md not found or empty at $AgentDir" }

$lessonsRaw = Get-Content "$AgentDir/LESSONS.md" -Raw -ErrorAction SilentlyContinue
if (-not $lessonsRaw) { Write-Warning "sync-agent-digest: LESSONS.md not found or empty at $AgentDir" }
$lessonEntries = $lessonsRaw -split "(?m)^### " | Select-Object -Skip 1 | Where-Object { $_ -match '\S' } | Select-Object -Last 5
$lessons = ($lessonEntries | ForEach-Object { "### $_" }) -join "`n"

$digest = @"
# AGENT DIGEST — Auto-generated $(Get-Date -Format 'yyyy-MM-dd HH:mm')
> File ini di-generate otomatis oleh session-start.ps1. Jangan edit manual.

## Active Plan (HANDOFF.md)
$handoff

## Current State (PROGRESS.md — 30 baris terakhir)
$progress

## Recent Lessons (LESSONS.md — 5 entry terakhir)
$lessons
"@

Set-Content "$AgentDir/DIGEST.md" $digest -Encoding UTF8
