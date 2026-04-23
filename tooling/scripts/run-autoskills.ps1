#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════
# run-autoskills.ps1
# Auto-install AI agent skills for The Abyss monorepo
# Usage: pwsh tooling/scripts/run-autoskills.ps1 [--dry-run] [-y]
# ═══════════════════════════════════════════════════════════════

param(
  [switch]$DryRun,
  [switch]$Yes
)

$ROOT = Split-Path (Split-Path $PSScriptRoot)
$FLAGS = if ($DryRun) { "--dry-run" } elseif ($Yes) { "-y" } else { "" }

$TARGETS = @(
  # Root — picks up: Turborepo, TypeScript, pnpm, Node.js
  $ROOT,

  # Healthcare apps — picks up: NestJS, Prisma, Vite
  "$ROOT\apps\healthcare\sentra-main",
  "$ROOT\apps\healthcare\sentra-assist",
  "$ROOT\apps\healthcare\referralink",
  "$ROOT\apps\healthcare\primary-healthcare",

  # Platform
  "$ROOT\apps\platform",

  # Packages — picks up: Prisma, shared types
  "$ROOT\packages"
)

$PASS = @()
$FAIL = @()

Write-Host ""
Write-Host "  AVCN Autoskills Runner" -ForegroundColor Yellow
Write-Host "  The Abyss Monorepo — AI Skill Auto-Installer" -ForegroundColor DarkGray
Write-Host "  ─────────────────────────────────────────────" -ForegroundColor DarkGray
if ($DryRun) {
  Write-Host "  MODE: DRY RUN (preview only, nothing installed)" -ForegroundColor Cyan
}
Write-Host ""

foreach ($dir in $TARGETS) {
  if (-not (Test-Path "$dir\package.json")) {
    Write-Host "  SKIP  $dir" -ForegroundColor DarkGray
    Write-Host "        no package.json found" -ForegroundColor DarkGray
    continue
  }

  $name = (Get-Item $dir).Name
  Write-Host "  RUN   $name" -ForegroundColor White
  Write-Host "        $dir" -ForegroundColor DarkGray

  Push-Location $dir
  try {
    if ($FLAGS) {
      $result = npx autoskills $FLAGS 2>&1
    } else {
      $result = npx autoskills 2>&1
    }

    if ($LASTEXITCODE -eq 0) {
      Write-Host "  OK    $name" -ForegroundColor Green
      $PASS += $name
    } else {
      Write-Host "  FAIL  $name" -ForegroundColor Red
      Write-Host "        $result" -ForegroundColor DarkRed
      $FAIL += $name
    }
  } catch {
    Write-Host "  ERR   $name — $_" -ForegroundColor Red
    $FAIL += $name
  } finally {
    Pop-Location
  }

  Write-Host ""
}

# Summary
Write-Host "  ─────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  DONE  $($PASS.Count) passed · $($FAIL.Count) failed" -ForegroundColor Yellow
Write-Host ""

if ($PASS.Count -gt 0) {
  Write-Host "  Installed:" -ForegroundColor Green
  $PASS | ForEach-Object { Write-Host "    ✓ $_" -ForegroundColor Green }
  Write-Host ""
}

if ($FAIL.Count -gt 0) {
  Write-Host "  Failed:" -ForegroundColor Red
  $FAIL | ForEach-Object { Write-Host "    ✗ $_" -ForegroundColor Red }
  Write-Host ""
}

Write-Host "  Skills installed to: ~/.claude/skills/" -ForegroundColor DarkGray
Write-Host "  Run /clear di Claude Code untuk load skills baru" -ForegroundColor DarkGray
Write-Host ""
