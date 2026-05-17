# sync-agent-ssot.ps1
# Sentra Agent SSOT: one-button daily continuity refresh.
# Model reads and summarizes. Script protects structure and writes files.

param(
    [string]$Model = "granite4.1:3b",
    [string]$RepoRoot = "",
    [int]$MaxSessionChars = 3000,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Resolve-RepoRoot {
    param([string]$Candidate)

    if ($Candidate) { return (Resolve-Path -LiteralPath $Candidate).Path }
    $scriptDir = Split-Path -Parent $PSCommandPath
    $root = git -C $scriptDir rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0 -and $root) { return $root.Trim() }
    throw "Unable to resolve repo root from $scriptDir"
}

function Read-CompactFile {
    param(
        [Parameter(Mandatory)][string]$Path,
        [int]$MaxChars = 3000
    )

    if (-not (Test-Path -LiteralPath $Path)) { return "[missing: $Path]" }
    $text = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
    if (-not $text) { return "[empty: $Path]" }
    if ($text.Length -gt $MaxChars) {
        return $text.Substring(0, $MaxChars) + "`n...[truncated]"
    }
    return $text
}

function Estimate-Tokens {
    param([AllowNull()][string]$Text)
    if (-not $Text) { return 0 }
    return [Math]::Ceiling($Text.Length / 4)
}

function Get-LatestSessionPath {
    param([string]$SessionsDir)

    $today = Join-Path $SessionsDir "$(Get-Date -Format 'yyyy-MM-dd').md"
    if (Test-Path -LiteralPath $today) { return $today }

    $latest = Get-ChildItem -LiteralPath $SessionsDir -Filter "*.md" -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if ($latest) { return $latest.FullName }
    return ""
}

function Test-AgentRootShape {
    param([string]$AgentDir)

    $allowedFiles = @("README.md", "CONTEXT.md", "HANDOFF.md", "DECISIONS.md", "PROGRESS.md")
    $allowedDirs = @("reports", "sessions", "archive")
    $bad = @()

    foreach ($entry in Get-ChildItem -LiteralPath $AgentDir -Force) {
        if ($entry.PSIsContainer) {
            if ($allowedDirs -notcontains $entry.Name) { $bad += $entry.Name }
        } elseif ($allowedFiles -notcontains $entry.Name) {
            $bad += $entry.Name
        }
    }

    return $bad
}

function Invoke-OllamaJson {
    param(
        [Parameter(Mandatory)][string]$Model,
        [Parameter(Mandatory)][string]$Prompt
    )

    $body = @{
        model = $Model
        prompt = $Prompt
        stream = $false
        format = "json"
        options = @{
            temperature = 0
            top_p = 0.7
            num_ctx = 4096
        }
    } | ConvertTo-Json -Depth 8

    try {
        return Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:11434/api/generate" -Body $body -ContentType "application/json" -TimeoutSec 600
    } catch {
        throw "Ollama API call failed. Make sure Ollama is running. $($_.Exception.Message)"
    }
}

function Convert-ToStringArray {
    param($Value)
    if ($null -eq $Value) { return @() }
    if ($Value -is [string]) {
        if (-not $Value.Trim()) { return @() }
        return @($Value.Trim())
    }
    return @($Value | ForEach-Object { "$_".Trim() } | Where-Object { $_ })
}

function Format-Bullets {
    param(
        [string[]]$Items,
        [string]$Fallback = "No new notes."
    )

    if (-not $Items -or $Items.Count -eq 0) { return "- $Fallback" }
    return ($Items | ForEach-Object { "- $_" }) -join "`n"
}

function Convert-KnownEnglish {
    param([AllowNull()][string]$Text)

    if (-not $Text) { return $Text }
    $value = $Text
    $value = $value -replace "Proses konversi \.agent ke SSOT telah dilakukan", ".agent conversion to SSOT was completed"
    $value = $value -replace "Melanjutkan review terhadap auth\.ts dan tes di sentra-nada sebelum mengimplementasikannya", "Continue reviewing auth.ts and sentra-nada tests before implementation"
    $value = $value -replace "Terjadi perubahan pada file auth\.ts di sentra-bentara dan tes di sentra-nada yang sedang dalam proses review\.", "Changes were made to auth.ts in sentra-bentara and tests in sentra-nada, which are currently under review."
    $value = $value -replace "Terdapat perubahan pada file auth\.ts di sentra-bentara dan tes di sentra-nada yang sedang dalam proses review\.", "Changes were made to auth.ts in sentra-bentara and tests in sentra-nada, which are currently under review."
    $value = $value -replace "Tidak ada risiko baru yang jelas dari session\.", "No new risk is clear from the session."
    $value = $value -replace "Belum ada risiko yang terdeteksi dari perubahan ini", "No new risk is clear from this change."
    return $value
}

$repo = Resolve-RepoRoot $RepoRoot
$agentDir = Join-Path $repo ".agent"
if (-not (Test-Path -LiteralPath $agentDir)) { throw "Missing .agent directory at $agentDir" }

$badRoot = Test-AgentRootShape -AgentDir $agentDir
if ($badRoot.Count -gt 0) { throw ".agent root has non-standard entries: $($badRoot -join ', ')" }

$required = @("README.md", "CONTEXT.md", "HANDOFF.md", "PROGRESS.md", "DECISIONS.md")
$missing = @()
foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath (Join-Path $agentDir $file))) { $missing += $file }
}
if ($missing.Count -gt 0) { throw "Missing required .agent SSOT files: $($missing -join ', ')" }

$models = (& ollama list 2>$null) -join "`n"
if ($LASTEXITCODE -ne 0) { throw "Unable to list Ollama models. Make sure Ollama is running." }
if ($models -notmatch [regex]::Escape($Model)) { throw "Ollama model '$Model' is not installed. Run: ollama pull $Model" }

Write-Output "Sentra Agent SSOT"
Write-Output "Status: RUNNING"
Write-Output "Model: $Model"
Write-Output "Repo: $repo"
Write-Output "Please wait. Local model may take 10-60 seconds."
Write-Output ""

$sessionsDir = Join-Path $agentDir "sessions"
$sessionPath = Get-LatestSessionPath $sessionsDir
$sessionText = if ($sessionPath) { Read-CompactFile -Path $sessionPath -MaxChars $MaxSessionChars } else { "[no session log found]" }

$readme = Read-CompactFile -Path (Join-Path $agentDir "README.md") -MaxChars 1000
$handoff = Read-CompactFile -Path (Join-Path $agentDir "HANDOFF.md") -MaxChars 1800
$progress = Read-CompactFile -Path (Join-Path $agentDir "PROGRESS.md") -MaxChars 1400

$protectedBlockers = @(
    "packages/sentra/sentra-bentara/src/auth.ts",
    "packages/sentra/sentra-nada/src/__tests__/*",
    "apps/corporate/ferdiiskandar/AGENTS.md"
)

$prompt = @"
You maintain Sentra .agent continuity.
Read the source and return JSON only.

Task:
Summarize what changed today. Do not rewrite files. Do not invent facts.

JSON shape:
{
  "today_summary": "one short English sentence",
  "completed": ["short item"],
  "next_action": "one short English sentence",
  "risk_flags": ["short item"],
  "decision_append": "NONE or one short durable decision/lesson"
}

Rules:
- Use English only.
- If unsure, say "unclear from session".
- Do not claim build/typecheck/test passed unless source says so.
- Do not remove or ignore these protected blockers:
  - packages/sentra/sentra-bentara/src/auth.ts
  - packages/sentra/sentra-nada/src/__tests__/*
  - apps/corporate/ferdiiskandar/AGENTS.md

--- .agent/README.md ---
$readme

--- .agent/HANDOFF.md ---
$handoff

--- .agent/PROGRESS.md ---
$progress

--- latest session ---
$sessionText
"@

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$stamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$reportDir = Join-Path $agentDir "reports\ssot-daily"
$backupDir = Join-Path $reportDir "$stamp-backup"
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Copy-Item -LiteralPath (Join-Path $agentDir "HANDOFF.md") -Destination (Join-Path $backupDir "HANDOFF.md") -Force
Copy-Item -LiteralPath (Join-Path $agentDir "PROGRESS.md") -Destination (Join-Path $backupDir "PROGRESS.md") -Force
Copy-Item -LiteralPath (Join-Path $agentDir "DECISIONS.md") -Destination (Join-Path $backupDir "DECISIONS.md") -Force

$response = Invoke-OllamaJson -Model $Model -Prompt $prompt
$raw = [string]$response.response

$errors = @()
$summary = $null
try {
    $summary = $raw | ConvertFrom-Json -ErrorAction Stop
} catch {
    $errors += "Model did not return valid JSON"
}

$todaySummary = "No valid model summary was produced."
$completed = @()
$nextAction = "Continue from HANDOFF.md with small, safe changes."
$riskFlags = @()
$decisionAppend = "NONE"

if ($summary) {
    $todaySummary = if ($summary.today_summary) { "$($summary.today_summary)".Trim() } else { $todaySummary }
    $completed = Convert-ToStringArray $summary.completed
    $nextAction = if ($summary.next_action) { "$($summary.next_action)".Trim() } else { $nextAction }
    $riskFlags = Convert-ToStringArray $summary.risk_flags
    $decisionAppend = if ($summary.decision_append) { "$($summary.decision_append)".Trim() } else { "NONE" }
}

$todaySummary = Convert-KnownEnglish $todaySummary
$completed = @($completed | ForEach-Object { Convert-KnownEnglish $_ })
$nextAction = Convert-KnownEnglish $nextAction
$riskFlags = @($riskFlags | ForEach-Object { Convert-KnownEnglish $_ })
$decisionAppend = Convert-KnownEnglish $decisionAppend

if (-not $todaySummary -or $todaySummary.Length -lt 10) { $errors += "Summary too short" }
if (-not $nextAction -or $nextAction.Length -lt 10) { $errors += "Next action too short" }
if ($decisionAppend -ne "NONE" -and $decisionAppend.Length -gt 1200) { $errors += "Decision append too long" }

$completedBlock = Format-Bullets -Items $completed -Fallback "No new completed item is clear from the session."
$riskBlock = Format-Bullets -Items $riskFlags -Fallback "No new risk is clear from the session."
$protectedBlock = Format-Bullets -Items $protectedBlockers
$date = Get-Date -Format "yyyy-MM-dd"

$newHandoff = @"
# HANDOFF - Current State and Next Action

Update every meaningful session. This is the first active file the next agent should read after README.md.

## Snapshot

- Date: $date
- Active work: SSOT simplification and repo governance cleanup
- Repo: D:\Devops\abyss-monorepo
- Mode: small, scoped changes only
- .agent/ is the operational SSOT; AGENTS.md is the public rulebook.

## Daily Summary

$todaySummary

## Completed / Observed Today

$completedBlock

## Protected Blockers

$protectedBlock

## Risks

$riskBlock

## Next Action

$nextAction

## Guardrails

- Do not delete or clean .agent/.
- Do not touch packages/sentra/** automatically.
- Treat packages/sentra/** as crown jewel / review-first territory.
- Do not claim build, typecheck, or tests passed without fresh verification.
- Keep fixes small and scoped.

Last updated: $timestamp
"@

$newProgress = @"
# PROGRESS - Milestones and Status

Update when a milestone moves. Keep this high-level; details belong in HANDOFF.md, sessions/, reports/, or archive/.

Legend: [x] done, [~] in progress, [ ] not started, [!] blocked.

## Repo Stabilization

- [x] Academic solutions build blocker fixed.
- [x] Orchestrator Prisma generate/cache blocker fixed.
- [x] DAF website Windows standalone build blocker fixed.
- [x] Safe non-crown-jewel typecheck blockers fixed.
- [x] Approved narrow unused/type-only crown-jewel fixes completed.
- [!] Remaining crown-jewel review blockers:
  - packages/sentra/sentra-bentara/src/auth.ts
  - packages/sentra/sentra-nada/src/__tests__/*

## SSOT and Governance

- [x] .agent/ minimal SSOT shape adopted.
- [x] .agent.bak records sorted into .agent/.
- [x] Agent tooling moved to tooling/governance/agent/.
- [~] Daily SSOT helper simplified to one local model call plus script-rendered files.
- [!] Governance healthcheck still reports stale references in apps/corporate/ferdiiskandar/AGENTS.md.

## Today

$completedBlock

## Current Summary

$todaySummary

Last updated: $timestamp
"@

foreach ($requiredFact in @(".agent", "packages/sentra", "sentra-bentara", "sentra-nada", "ferdiiskandar/AGENTS.md")) {
    if ($newHandoff -notmatch [regex]::Escape($requiredFact)) { $errors += "HANDOFF lost required fact: $requiredFact" }
    if ($newProgress -notmatch [regex]::Escape($requiredFact)) { $errors += "PROGRESS lost required fact: $requiredFact" }
}
foreach ($label in @("HANDOFF", "PROGRESS")) {
    $text = if ($label -eq "HANDOFF") { $newHandoff } else { $newProgress }
    if ($text -notmatch "crown[- ]jewel") { $errors += "$label lost required fact: crown jewel" }
    if ($text -match "Proses|Melanjutkan|Tidak ada|Belum|sebelum mengimplementasikannya|perubahan.*sedang") {
        $errors += "$label contains non-English active text"
    }
}

$status = "APPLIED"
if ($DryRun) { $status = "DRY_RUN" }
if ($errors.Count -gt 0) { $status = "SKIPPED" }

if ($status -eq "APPLIED") {
    Set-Content -LiteralPath (Join-Path $agentDir "HANDOFF.md") -Value $newHandoff -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $agentDir "PROGRESS.md") -Value $newProgress -Encoding UTF8
    if ($decisionAppend -and $decisionAppend -ne "NONE") {
        Add-Content -LiteralPath (Join-Path $agentDir "DECISIONS.md") -Value ("`n## $date - Daily SSOT lesson`n`n$decisionAppend`n") -Encoding UTF8
    }
}

$promptTokens = Estimate-Tokens $prompt
$responseTokens = Estimate-Tokens $raw
$actualPromptTokens = if ($response.prompt_eval_count) { $response.prompt_eval_count } else { "n/a" }
$actualResponseTokens = if ($response.eval_count) { $response.eval_count } else { "n/a" }
$durationMs = if ($response.total_duration) { [Math]::Round([double]$response.total_duration / 1000000, 0) } else { "n/a" }

$reportPath = Join-Path $reportDir "$stamp.md"
$report = @"
# Sentra Agent SSOT Daily Run

- Generated: $timestamp
- Model: $Model
- Status: $status
- Dry run: $($DryRun.IsPresent)
- Source session: $sessionPath
- Backup: $backupDir

## Token Details

| Metric | Value |
|---|---:|
| Prompt characters | $($prompt.Length) |
| Estimated prompt tokens | $promptTokens |
| Ollama prompt tokens | $actualPromptTokens |
| Response characters | $($raw.Length) |
| Estimated response tokens | $responseTokens |
| Ollama response tokens | $actualResponseTokens |
| Duration ms | $durationMs |

## Result

$(if ($errors.Count -gt 0) { ($errors | ForEach-Object { "- $_" }) -join "`n" } else { "- passed" })

## Model JSON

$raw
"@

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8

Write-Output "Sentra Agent SSOT"
Write-Output "Status: $status"
Write-Output "Reason: $(if ($errors.Count -gt 0) { $errors[0] } elseif ($DryRun) { 'dry run passed; no files changed' } else { 'SSOT updated safely' })"
Write-Output "Report: $reportPath"
Write-Output "Time ms: $durationMs"
Write-Output "Tokens: prompt=$actualPromptTokens response=$actualResponseTokens estimated_prompt=$promptTokens estimated_response=$responseTokens"
