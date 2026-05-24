# Reinforces ABYSS SOP on every submitted user prompt.
# The hook adds context only; it does not inspect or persist prompt contents.
$project = $env:CLAUDE_PROJECT_DIR
if (-not $project) { $project = (Get-Location).Path }

$repoRoot = git -C $project rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or -not $repoRoot) {
    [Console]::Error.WriteLine("SOP PREFLIGHT HOOK FAILED: Unable to determine repo root from $project")
    exit 2
}

$agentsPath = Join-Path $repoRoot "AGENTS.md"
$agentDir = Join-Path $repoRoot ".agent"
$agentReadme = Join-Path $agentDir "README.md"
$agentHandoff = Join-Path $agentDir "HANDOFF.md"
$agentContext = Join-Path $agentDir "CONTEXT.md"

$missing = @()
foreach ($path in @($agentsPath, $agentDir, $agentReadme, $agentHandoff, $agentContext)) {
    if (-not (Test-Path $path)) { $missing += $path }
}

if ($missing.Count -gt 0) {
    [Console]::Error.WriteLine("SOP PREFLIGHT HOOK FAILED: Missing required files: $($missing -join ', ')")
    exit 2
}

$contextNote = @"
ABYSS SOP PREFLIGHT REQUIRED:
Before any non-trivial repo work, the assistant must read the literal workspace files, not rely only on injected context:
1. Read AGENTS.md.
2. Verify .agent/ exists.
3. Read .agent/README.md.
4. Read .agent/HANDOFF.md.
5. Read .agent/CONTEXT.md before boundary, protected-area, or crown-jewel work.
6. Report: SOP PREFLIGHT - AGENTS.md: read; .agent exists: yes; .agent/README.md: read; .agent/HANDOFF.md: read; mode: read-only/editing.

Fail closed: no final audit/verdict, file edit, cleanup, delete, rename, refactor, package/config change, or packages/sentra/** touch before this preflight is complete.
Protected files currently expected:
- $agentsPath
- $agentReadme
- $agentHandoff
- $agentContext
"@

$payload = @{
    continue = $true
    hookSpecificOutput = @{
        hookEventName     = "UserPromptSubmit"
        additionalContext = $contextNote.Trim()
    }
} | ConvertTo-Json -Compress -Depth 5

[Console]::Out.WriteLine($payload)
