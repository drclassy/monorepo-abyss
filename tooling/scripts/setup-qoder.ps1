#requires -Version 7.0
<#
.SYNOPSIS
    Bootstraps Qoder IDE configuration for a Sentra monorepo on Windows 11.

.DESCRIPTION
    Copies .qoder/, AGENTS.md, and .qoderignore into the target repository.
    Optionally initializes git hooks, validates the structure, and prints a summary.

.PARAMETER TargetRepo
    Path to the repository where the Qoder setup will be installed.
    Defaults to the current directory.

.PARAMETER Force
    Overwrite existing files. Without this flag, the script refuses to clobber.

.PARAMETER SkipGitHooks
    Skip installation of pre-commit hooks.

.EXAMPLE
    .\setup-qoder.ps1 -TargetRepo C:\dev\sentra
    .\setup-qoder.ps1 -TargetRepo C:\dev\sentra -Force

.NOTES
    Author: Sentra AI
    Requires PowerShell 7+. Run from Windows Terminal.
#>

[CmdletBinding()]
param(
    [string]$TargetRepo = (Get-Location).Path,
    [switch]$Force,
    [switch]$SkipGitHooks
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceDir = Split-Path -Parent $ScriptDir   # parent of scripts/

# ----------------------------------------------------------------
# Pretty printing
# ----------------------------------------------------------------
function Write-Header($text) {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Write-Step($text) {
    Write-Host "  → $text" -ForegroundColor Yellow
}

function Write-Ok($text) {
    Write-Host "  ✓ $text" -ForegroundColor Green
}

function Write-Skip($text) {
    Write-Host "  · $text" -ForegroundColor DarkGray
}

function Write-Fail($text) {
    Write-Host "  ✗ $text" -ForegroundColor Red
}

# ----------------------------------------------------------------
# Preflight
# ----------------------------------------------------------------
Write-Header "Sentra Qoder Setup"

if (-not (Test-Path $TargetRepo)) {
    Write-Fail "Target repo not found: $TargetRepo"
    exit 1
}

$TargetRepo = (Resolve-Path $TargetRepo).Path
Write-Host "  Source: $SourceDir"
Write-Host "  Target: $TargetRepo"

# ----------------------------------------------------------------
# Files to copy
# ----------------------------------------------------------------
$Files = @(
    @{ Source = "AGENTS.md";       Target = "AGENTS.md" }
    @{ Source = ".qoderignore";    Target = ".qoderignore" }
    @{ Source = ".qoder";          Target = ".qoder"; IsDirectory = $true }
)

$NestedAgents = @(
    "packages/clinical-core/AGENTS.md"
    "packages/agents/AGENTS.md"
    "packages/ui-brand/AGENTS.md"
    "apps/AGENTS.md"
)

# ----------------------------------------------------------------
# Copy main config
# ----------------------------------------------------------------
Write-Header "1. Copying Qoder configuration"

foreach ($file in $Files) {
    $src = Join-Path $SourceDir $file.Source
    $dst = Join-Path $TargetRepo $file.Target

    if (-not (Test-Path $src)) {
        Write-Skip "Source missing: $($file.Source)"
        continue
    }

    if ((Test-Path $dst) -and -not $Force) {
        Write-Skip "Exists (use -Force to overwrite): $($file.Target)"
        continue
    }

    if ($file.IsDirectory) {
        Copy-Item -Path $src -Destination $dst -Recurse -Force
    } else {
        $dstDir = Split-Path -Parent $dst
        if ($dstDir -and -not (Test-Path $dstDir)) {
            New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
        }
        Copy-Item -Path $src -Destination $dst -Force
    }
    Write-Ok "Installed: $($file.Target)"
}

# ----------------------------------------------------------------
# Nested AGENTS.md (only if the package directory exists)
# ----------------------------------------------------------------
Write-Header "2. Installing nested AGENTS.md (where packages exist)"

foreach ($rel in $NestedAgents) {
    $src = Join-Path $SourceDir $rel
    $dst = Join-Path $TargetRepo $rel
    $dstDir = Split-Path -Parent $dst

    if (-not (Test-Path $src)) {
        Write-Skip "Source missing: $rel"
        continue
    }

    if (-not (Test-Path $dstDir)) {
        Write-Skip "Package not present yet (skipped): $rel"
        continue
    }

    if ((Test-Path $dst) -and -not $Force) {
        Write-Skip "Exists (use -Force to overwrite): $rel"
        continue
    }

    Copy-Item -Path $src -Destination $dst -Force
    Write-Ok "Installed: $rel"
}

# ----------------------------------------------------------------
# Git hooks (optional)
# ----------------------------------------------------------------
if (-not $SkipGitHooks) {
    Write-Header "3. Git hooks"

    $gitDir = Join-Path $TargetRepo ".git"
    if (-not (Test-Path $gitDir)) {
        Write-Skip "Not a git repo, skipping hooks"
    }
    else {
        $hooksDir = Join-Path $gitDir "hooks"
        $preCommit = Join-Path $hooksDir "pre-commit"

        $hookContent = @'
#!/bin/sh
# Sentra pre-commit hook (installed by setup-qoder.ps1)
# Blocks commits that introduce PHI-related paths or secrets.

set -e

# 1. Block PHI paths
if git diff --cached --name-only | grep -E "(patient-data/|phi/|clinical-data/raw/|.*_phi\..*)" > /dev/null; then
  echo "✗ Blocked: PHI-related paths detected in commit."
  echo "  Files under patient-data/, phi/, or matching *_phi.* must never be committed."
  exit 1
fi

# 2. Block .env files
if git diff --cached --name-only | grep -E "^\.env($|\.)" | grep -v "\.env\.example" > /dev/null; then
  echo "✗ Blocked: .env file in commit."
  echo "  Only .env.example may be committed."
  exit 1
fi

# 3. Run gitleaks if available
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --staged --no-banner
fi

exit 0
'@
        if ((Test-Path $preCommit) -and -not $Force) {
            Write-Skip "pre-commit hook exists (use -Force to overwrite)"
        } else {
            Set-Content -Path $preCommit -Value $hookContent -Encoding UTF8 -NoNewline
            # Make executable on systems that respect mode bits
            if ($IsLinux -or $IsMacOS) {
                & chmod +x $preCommit
            }
            Write-Ok "Installed pre-commit hook"
        }
    }
}

# ----------------------------------------------------------------
# Validation
# ----------------------------------------------------------------
Write-Header "4. Validation"

$ExpectedFiles = @(
    "AGENTS.md"
    ".qoderignore"
    ".qoder/mcp.json"
    ".qoder/rules/00-project-overview.md"
    ".qoder/rules/01-healthcare-guardrails.md"
    ".qoder/rules/02-coding-standards.md"
    ".qoder/rules/03-monorepo-structure.md"
    ".qoder/rules/04-python-conventions.md"
    ".qoder/rules/05-typescript-conventions.md"
    ".qoder/rules/06-clinical-strict-mode.md"
    ".qoder/rules/07-agents-orchestration.md"
    ".qoder/rules/08-testing-quality.md"
    ".qoder/rules/09-git-workflow.md"
    ".qoder/agents/clinical-reviewer.md"
    ".qoder/agents/security-auditor.md"
    ".qoder/agents/test-writer.md"
    ".qoder/agents/spec-writer.md"
    ".qoder/agents/refactor-architect.md"
    ".qoder/specs/TEMPLATE-standard-spec.md"
    ".qoder/specs/TEMPLATE-clinical-spec.md"
)

$missing = @()
foreach ($rel in $ExpectedFiles) {
    $path = Join-Path $TargetRepo $rel
    if (Test-Path $path) {
        Write-Ok $rel
    } else {
        Write-Fail "MISSING: $rel"
        $missing += $rel
    }
}

# ----------------------------------------------------------------
# Character budget check (Qoder limit: 100,000 chars across rules)
# ----------------------------------------------------------------
Write-Header "5. Rules character budget (Qoder limit: 100,000)"

$rulesDir = Join-Path $TargetRepo ".qoder/rules"
if (Test-Path $rulesDir) {
    $total = 0
    Get-ChildItem -Path $rulesDir -Filter "*.md" | ForEach-Object {
        $size = (Get-Content $_.FullName -Raw).Length
        $total += $size
        $name = $_.Name
        Write-Host ("    {0,-45} {1,8} chars" -f $name, $size)
    }
    $pct = [math]::Round(($total / 100000) * 100, 1)
    Write-Host ""
    Write-Host ("    Total: {0} / 100,000 ({1}%)" -f $total, $pct) -ForegroundColor $(if ($total -gt 100000) {"Red"} elseif ($pct -gt 80) {"Yellow"} else {"Green"})
    if ($total -gt 100000) {
        Write-Fail "Rules exceed Qoder's 100k character limit. Excess will be truncated."
    }
}

# ----------------------------------------------------------------
# Final summary
# ----------------------------------------------------------------
Write-Header "Setup Complete"

if ($missing.Count -eq 0) {
    Write-Ok "All expected files installed."
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor Cyan
    Write-Host "    1. Open the repo in Qoder IDE: qoder $TargetRepo"
    Write-Host "    2. Open Qoder Settings → Rules (Ctrl+Shift+,) to verify rules loaded."
    Write-Host "    3. Open Qoder Settings → MCP to enable additional servers."
    Write-Host "    4. Try Quest Mode with: .qoder/specs/TEMPLATE-standard-spec.md"
    Write-Host "    5. Read README-QODER-SETUP.md for the full Indonesian guide."
} else {
    Write-Fail "Some files are missing. Re-run with -Force to overwrite."
    exit 1
}
