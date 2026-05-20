# GUARD 1 Smart Auto-Inject — Design Spec
**Date:** 2026-05-15
**Author:** Brainstormed with Chief (Ferdi Iskandar / Classy)
**Branch:** refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar

---

## Context

### Masalah
Hampir semua agent (Claude Code, Cursor, subagents) melanggar workflow wajib AGENTS.md yaitu membaca file-file di `.agent/` sebelum mulai bekerja (GUARD 1 + JET J1). Audit terhadap 20 commit terakhir menunjukkan **95% non-compliance** pada J9 trailer, dan session-start.ps1 yang ada hanya memvalidasi bahwa file `.agent/` **ada** (exists) — bukan bahwa agent benar-benar membacanya.

### Root Cause
| Level | Penyebab | Dampak |
|-------|----------|--------|
| L1 (Kritis) | `session-start.ps1` cek *exists*, bukan inject konten ke konteks | Agent tidak terpaksa "melihat" isi file |
| L2 | CLAUDE.md berisi instruksi teks "baca file X" — dapat diabaikan di konteks panjang | Non-deterministic compliance |
| L3 | Tidak ada pre-commit hook untuk J9 trailer | 19/20 commit tanpa `Agent: · Phase: · Handoff:` |
| L4 | Subagent yang di-dispatch tidak mewarisi enforcement | Dispatch agent = blank slate |

### Solusi
Ganti model "instruksi teks yang bisa diabaikan" menjadi **deterministic injection** — konten `.agent/` otomatis masuk ke konteks agent lewat hook, bukan bergantung kepatuhan membaca manual.

---

## Arsitektur

```
┌─────────────────────────────────────────────────────┐
│  KOMPONEN 1: session-start.ps1 (enhanced)           │
│  - Validasi file EXISTS (sudah ada) ✓               │
│  - [BARU] Baca HANDOFF.md + PROGRESS.md +           │
│    LESSONS.md top-5                                 │
│  - [BARU] Output JSON dengan `additionalContext`    │
│    → konten langsung masuk ke konteks Claude        │
└────────────────────┬────────────────────────────────┘
                     │ JSON: { "continue": true,
                     │         "additionalContext": "===" }
                     ▼
         Claude menerima konteks otomatis
         tanpa perlu baca file manual

┌─────────────────────────────────────────────────────┐
│  KOMPONEN 2: pre-tool-use.ps1 (enhanced)            │
│  - Sudah ada: blok destructive commands ✓           │
│  - [BARU] Intercept git commit commands             │
│  - Parse commit message dari command input          │
│  - Blok jika tidak ada J9 trailer                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  KOMPONEN 3: scripts/sync-agent-digest.ps1 (baru)   │
│  Cross-agent compatibility (Cursor, Windsurf, dll)  │
│  - Generate .agent/DIGEST.md                        │
│    (ringkasan HANDOFF + PROGRESS + LESSONS top-5)   │
│  - Dipanggil oleh session-start.ps1                 │
└─────────────────────────────────────────────────────┘
```

---

## File yang Dimodifikasi / Dibuat

| File | Status | Perubahan |
|------|--------|-----------|
| `.agent/hooks/session-start.ps1` | Modified | Tambah read + JSON `additionalContext` output |
| `.agent/hooks/pre-tool-use.ps1` | Modified | Tambah J9 trailer validation pada `git commit` |
| `.agent/scripts/sync-agent-digest.ps1` | **New** | Generator `.agent/DIGEST.md` |
| `.agent/DIGEST.md` | **New** (generated) | Auto-generated, ditambah ke .gitignore |

---

## Detail Implementasi

### Komponen 1 — `session-start.ps1`

Tambahkan setelah baris 40 (setelah semua validasi existing):

```powershell
# === GUARD 1 ENHANCEMENT: Auto-inject critical context ===

# Step 1: Generate fresh DIGEST.md via helper script
$digestScript = "$agentDir/scripts/sync-agent-digest.ps1"
if (Test-Path $digestScript) {
    & $digestScript -AgentDir $agentDir
}

# Step 2: Read critical files (token-optimized)
$handoff  = Get-Content "$agentDir/HANDOFF.md" -Raw -ErrorAction SilentlyContinue
$progress = Get-Content "$agentDir/PROGRESS.md" -Raw -ErrorAction SilentlyContinue

# Lessons: last 5 entries only (~200 tokens)
$lessonsRaw = Get-Content "$agentDir/LESSONS.md" -Raw -ErrorAction SilentlyContinue
$lessonEntries = $lessonsRaw -split "(?m)^## " | Where-Object { $_ -match '\S' } | Select-Object -Last 5
$lessons = ($lessonEntries | ForEach-Object { "## $_" }) -join "`n"

# Step 3: Build context payload
# NOTE: Untuk SessionStart hooks, plain stdout langsung masuk ke konteks Claude.
# Tidak perlu JSON wrapping — lebih simpel dan lebih reliable.
$ctx = @"
=== GUARD 1 AUTO-INJECTED CONTEXT ($(Get-Date -Format 'yyyy-MM-dd HH:mm')) ===
Wajib output sebelum melanjutkan: ✅ CONTEXT LOADED: [state] · PROGRESS: [state] · ACTIVE TASK: [goal] · KNOWN RISKS: [risks]

## HANDOFF.md (Active Plan)
$handoff

## PROGRESS.md (Current State)
$progress

## LESSONS.md (5 Entry Terbaru)
$lessons
=== END GUARD 1 CONTEXT ===
"@

# Step 4: Print to stdout — Claude Code SessionStart hooks inject stdout ke konteks agent
Write-Output $ctx
```

**Token estimate:** HANDOFF (~800) + PROGRESS (~400) + LESSONS top-5 (~200) = **~1,400 token/session**

---

### Komponen 2 — `pre-tool-use.ps1`

Tambahkan blok baru untuk J9 validation sebelum exit akhir:

```powershell
# === J9 TRAILER VALIDATION ===
# Intercept git commit dan validasi trailer wajib
# NOTE: Pre-tool-use hook untuk Bash menerima command via $env:CLAUDE_BASH_COMMAND
# (env var ini yang dipakai kode existing dan terbukti berjalan)

if ($cmd -match 'git\s+commit') {
    # Extract pesan dari -m "..." pattern
    if ($cmd -match '-m\s+"([^"]*)"' -or $cmd -match "-m\s+'([^']*)'") {
        $commitMsg = $Matches[1]
        # J9 pattern: Agent: X · Phase: Y · Handoff: Z
        $trailerPattern = 'Agent:\s+.+\s+·\s+Phase:\s+.+\s+·\s+Handoff:\s+.+'
        if ($commitMsg -notmatch $trailerPattern) {
            # Gunakan permissionDecision: deny — cara proper untuk block PreToolUse
            $block = @{
                hookSpecificOutput = @{
                    hookEventName           = "PreToolUse"
                    permissionDecision      = "deny"
                    permissionDecisionReason = "J9 VIOLATION: Commit message missing required trailer. Format: Agent: [name] · Phase: [phase] · Handoff: [session-id]. Example: Agent: Claude · Phase: Execution · Handoff: 2026-05-15-task-name"
                }
                continue = $true
            } | ConvertTo-Json -Compress -Depth 5
            [Console]::Out.WriteLine($block)
            exit 0
        }
    }
    # Jika commit pakai heredoc/EOF — tidak di-intercept (accepted trade-off)
}
```

> `$cmd` sudah tersedia dari `$env:CLAUDE_BASH_COMMAND` yang di-read di bagian atas pre-tool-use.ps1 (`$cmd = $env:CLAUDE_BASH_COMMAND`). Blok J9 ini cukup disisipkan setelah loop blocked-commands yang sudah ada.

---

### Komponen 3 — `sync-agent-digest.ps1`

File baru di `.agent/scripts/sync-agent-digest.ps1`:

```powershell
# sync-agent-digest.ps1
# Generates .agent/DIGEST.md — compact cross-agent context summary
# Called by session-start.ps1 at session initialization

param(
    [Parameter(Mandatory)][string]$AgentDir
)

$handoff  = Get-Content "$AgentDir/HANDOFF.md" -Raw -ErrorAction SilentlyContinue
$progress = (Get-Content "$AgentDir/PROGRESS.md" -ErrorAction SilentlyContinue) |
            Select-Object -Last 30 | Out-String
$lessonsRaw = Get-Content "$AgentDir/LESSONS.md" -Raw -ErrorAction SilentlyContinue
$lessons  = ($lessonsRaw -split "(?m)^## " | Where-Object { $_ -match '\S' } |
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
```

---

## .gitignore Update

Tambahkan ke root `.gitignore`:
```
# Auto-generated agent digest
.agent/DIGEST.md
```

---

## Verifikasi

### Test 1 — Auto-inject berfungsi
```
Mulai sesi Claude Code baru.
Expected: Claude menampilkan GUARD 1 output tanpa diminta baca manual.
✅ Pass: Output mengandung "✅ CONTEXT LOADED: ..."
❌ Fail: Tidak ada output atau agent langsung ke task
```

### Test 2 — J9 trailer enforcement
```bash
# Commit tanpa trailer → harus diblok
git commit -m "fix: something without trailer"
# Expected: Blocked dengan pesan "J9 VIOLATION: ..."

# Commit dengan trailer → harus lolos
git commit -m "fix: something\n\nAgent: Claude · Phase: Execution · Handoff: 2026-05-15-test"
# Expected: Commit berhasil
```

### Test 3 — DIGEST.md ter-generate
```powershell
Test-Path ".agent/DIGEST.md"           # → True
(Get-Item ".agent/DIGEST.md").LastWriteTime  # → Dalam 1 menit dari session start
```

### Test 4 — GUARD 1 masih blok jika file hilang
```powershell
Rename-Item .agent/HANDOFF.md .agent/HANDOFF.md.bak
# Start session → Expected: "GUARD 1 FAILED: Missing .agent files"
Rename-Item .agent/HANDOFF.md.bak .agent/HANDOFF.md  # restore
```

---

## Trade-offs yang Diterima

| Trade-off | Keputusan |
|-----------|-----------|
| +~1,400 token per session | Diterima — optimized (hanya 3 file, lessons top-5) |
| DIGEST.md tidak di-commit | Diterima — auto-generated, selalu fresh |
| Heredoc commit tidak di-intercept J9 | Diterima — Claude Code gunakan `-m "..."` pattern |
| Cursor/Windsurf hanya dapat DIGEST.md (tidak auto-inject) | Diterima — DIGEST.md cukup sebagai cross-agent bridge |
