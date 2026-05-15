# sync-agent-digest.ps1
# Generates .agent/DIGEST.md — compact cross-agent context summary
# Called by session-start.ps1 at session initialization

param(
    [Parameter(Mandatory)][string]$AgentDir
)

$handoff = Get-Content "$AgentDir/HANDOFF.md" -Raw -ErrorAction SilentlyContinue
$progress = (Get-Content "$AgentDir/PROGRESS.md" -ErrorAction SilentlyContinue) |
            Select-Object -Last 30 | Out-String
$lessonsRaw = Get-Content "$AgentDir/LESSONS.md" -Raw -ErrorAction SilentlyContinue
$lessons = ($lessonsRaw -split "(?m)^## " | Where-Object { $_ -match '\S' } |
            Select-Object -Last 5 | ForEach-Object { "## $_" }) -join "`n"

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
Write-Output "DIGEST.md generated at $AgentDir/DIGEST.md"
