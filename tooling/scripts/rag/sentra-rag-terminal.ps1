[CmdletBinding()]
param(
  [ValidateSet('menu', 'library', 'eval', 'ask', 'status', 'setup', 'preview')]
  [string]$Action = 'menu',
  [string]$Question,
  [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$AppDir = Join-Path $RepoRoot 'packages\sentra\sentra-pustaka'
$LibraryRoot = Join-Path $RepoRoot 'library\medical'
$EnvFile = Join-Path $AppDir '.env'
$ArtifactsDir = Join-Path $AppDir 'data\knowledge-artifacts'
$RegistryDir = Join-Path $AppDir 'data\knowledge-registry'
$EvalDir = Join-Path $AppDir 'data\retrieval-evaluation'
$QueriesFile = Join-Path $AppDir 'data\eval\retrieval-queries.json'
$LogDir = Join-Path $AppDir '.runtime\terminal-logs'
$DefaultDatabaseUrl = 'postgresql://abyss:abyss_dev_password@localhost:5432/abyss_db?schema=public'

function Write-Section([string]$Title) {
  Write-Host ''
  Write-Host ('=' * 42)
  Write-Host (' ' * [Math]::Max(0, [int]((42 - $Title.Length) / 2)) + $Title)
  Write-Host ('=' * 42)
}

function Ensure-Workspace {
  New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
}

function Ensure-Pnpm {
  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw 'pnpm belum tersedia di terminal ini.'
  }
}

function Ensure-DefaultEnv {
  if (Test-Path $EnvFile) {
    return
  }

  @(
    "DATABASE_URL=$DefaultDatabaseUrl"
    'OLLAMA_BASE_URL=http://localhost:11434'
    'SENTRA_GEN_MODEL=gemma2:9b'
    'SENTRA_EMBED_MODEL=nomic-embed-text'
    'MEDICAL_LIBRARY_PATH=../../library/medical'
  ) | Set-Content -Path $EnvFile -Encoding UTF8
}

function Ensure-EvalQueries {
  if (Test-Path $QueriesFile) {
    return
  }

  Invoke-BackendStep -Label 'Menyiapkan query evaluasi' -Script 'eval:retrieval' -Arguments @('--create-sample-queries')
}

function Get-LatestRunDir {
  param([Parameter(Mandatory = $true)][string]$RunsRoot)

  if (-not (Test-Path $RunsRoot)) {
    return $null
  }

  Get-ChildItem $RunsRoot -Directory |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
}

function Get-LocalStatus {
  $dbConfigured = $false
  if (Test-Path $EnvFile) {
    $dbConfigured = Select-String -Path $EnvFile -Pattern '^DATABASE_URL=' -Quiet -ErrorAction SilentlyContinue
  }

  $dbPortOpen = $false
  try {
    $dbPortOpen = (Test-NetConnection -ComputerName 'localhost' -Port 5432 -WarningAction SilentlyContinue).TcpTestSucceeded
  } catch {
    $dbPortOpen = $false
  }

  $libraryPdfCount = 0
  if (Test-Path $LibraryRoot) {
    $libraryPdfCount = @(Get-ChildItem $LibraryRoot -Recurse -File -Filter *.pdf -ErrorAction SilentlyContinue).Count
  }

  $evalLatest = Get-LatestRunDir -RunsRoot (Join-Path $EvalDir 'runs')
  $evalReadiness = 'belum ada'
  if ($evalLatest) {
    $evalSummary = Join-Path $evalLatest.FullName 'retrieval-eval-summary.json'
    if (Test-Path $evalSummary) {
      try {
        $evalReadiness = (Get-Content $evalSummary -Raw | ConvertFrom-Json).aadi_readiness
      } catch {
        $evalReadiness = 'tidak terbaca'
      }
    }
  }

  [pscustomobject]@{
    LibraryPdfCount = $libraryPdfCount
    DbConfigured = $dbConfigured
    DbPortOpen = $dbPortOpen
    ArtifactsReady = Test-Path (Join-Path $ArtifactsDir 'ingestion-summary.json')
    RegistryReady = Test-Path (Join-Path $RegistryDir 'registry.json')
    EvalQueriesReady = Test-Path $QueriesFile
    EvalReadiness = $evalReadiness
  }
}

function Show-FrontHeader([string]$Title = 'SENTRA RAG') {
  $status = Get-LocalStatus
  Write-Section $Title
  Write-Host ('Dokumen library : ' + $status.LibraryPdfCount)
  Write-Host ('Koneksi lokal   : ' + ($(if ($status.DbConfigured -and $status.DbPortOpen) { 'siap' } elseif ($status.DbConfigured) { 'konfigurasi ada, database belum aktif' } else { 'belum siap' })))
  Write-Host ('Artifacts PDF   : ' + ($(if ($status.ArtifactsReady) { 'ada' } else { 'belum ada' })))
  Write-Host ('Registry RAG    : ' + ($(if ($status.RegistryReady) { 'ada' } else { 'belum ada' })))
  Write-Host ('Evaluasi        : ' + $status.EvalReadiness)
}

function Get-IngestionSummaryObject {
  $summaryPath = Join-Path $ArtifactsDir 'ingestion-summary.json'
  if (-not (Test-Path $summaryPath)) {
    return $null
  }

  Get-Content $summaryPath -Raw | ConvertFrom-Json
}

function Get-RegistrySummaryObject {
  $registryPath = Join-Path $RegistryDir 'registry.json'
  if (-not (Test-Path $registryPath)) {
    return $null
  }

  $registry = Get-Content $registryPath -Raw | ConvertFrom-Json
  $entries = @($registry.entries)
  $countByStatus = @{}
  foreach ($entry in $entries) {
    $statusName = [string]$entry.registry_status
    if (-not $countByStatus.ContainsKey($statusName)) {
      $countByStatus[$statusName] = 0
    }
    $countByStatus[$statusName]++
  }
  $readyCount = if ($countByStatus.ContainsKey('ready_for_review')) { $countByStatus['ready_for_review'] } else { 0 }
  $approvedCount = if ($countByStatus.ContainsKey('approved_for_embedding')) { $countByStatus['approved_for_embedding'] } else { 0 }
  $needsReviewCount = if ($countByStatus.ContainsKey('needs_review')) { $countByStatus['needs_review'] } else { 0 }
  $failedCount = if ($countByStatus.ContainsKey('failed')) { $countByStatus['failed'] } else { 0 }
  [pscustomobject]@{
    Total = $entries.Count
    Ready = $readyCount
    Approved = $approvedCount
    NeedsReview = $needsReviewCount
    Failed = $failedCount
  }
}

function Get-EmbeddingSummaryObject {
  $latest = Get-LatestRunDir -RunsRoot (Join-Path $ArtifactsDir 'runs')
  if (-not $latest) {
    return $null
  }

  $summaryPath = Join-Path $latest.FullName 'embedding-run-summary.json'
  if (-not (Test-Path $summaryPath)) {
    return $null
  }

  Get-Content $summaryPath -Raw | ConvertFrom-Json
}

function Get-EvalSummaryObject {
  $latest = Get-LatestRunDir -RunsRoot (Join-Path $EvalDir 'runs')
  if (-not $latest) {
    return $null
  }

  $summaryPath = Join-Path $latest.FullName 'retrieval-eval-summary.json'
  if (-not (Test-Path $summaryPath)) {
    return $null
  }

  Get-Content $summaryPath -Raw | ConvertFrom-Json
}

function Show-OutcomeSummary {
  Write-Section 'HASIL'

  $ingest = Get-IngestionSummaryObject
  if ($ingest) {
    Write-Host ('PDF diperiksa    : ' + $ingest.totalDiscoveredPdfs)
    Write-Host ('Siap dipakai     : ' + $ingest.readyCount)
    Write-Host ('Perlu review     : ' + $ingest.needsReviewCount)
    Write-Host ('Gagal            : ' + $ingest.failedCount)
    Write-Host ('Duplikat diskip  : ' + $ingest.skippedDuplicateCount)
  } else {
    Write-Host 'Belum ada hasil ingest.'
  }

  $registry = Get-RegistrySummaryObject
  if ($registry) {
    Write-Host ('Approved untuk RAG : ' + $registry.Approved)
    Write-Host ('Menunggu review    : ' + $registry.Ready)
    Write-Host ('Butuh perhatian    : ' + ($registry.NeedsReview + $registry.Failed))
  } else {
    Write-Host 'Registry belum ada.'
  }

  $embedding = Get-EmbeddingSummaryObject
  if ($embedding) {
    Write-Host ('Dokumen masuk RAG  : ' + $embedding.embedded_documents)
    Write-Host ('Chunk masuk RAG    : ' + $embedding.embedded_chunks)
    Write-Host ('Status susun RAG   : ' + $embedding.status)
  } else {
    Write-Host 'Belum ada hasil penyusunan RAG.'
  }

  $eval = Get-EvalSummaryObject
  if ($eval) {
    Write-Host ('Kesiapan retrieval : ' + $eval.aadi_readiness)
    Write-Host ('Query lulus        : ' + $eval.passed_queries + '/' + $eval.total_queries)
    Write-Host ('Status evaluasi    : ' + $eval.status)
  } else {
    Write-Host 'Belum ada hasil evaluasi.'
  }
}

function Invoke-BackendStep {
  param(
    [Parameter(Mandatory = $true)][string]$Label,
    [Parameter(Mandatory = $true)][string]$Script,
    [string[]]$Arguments = @()
  )

  Ensure-Pnpm
  Ensure-Workspace

  $safeLabel = ($Label -replace '[^a-zA-Z0-9]+', '-').Trim('-').ToLowerInvariant()
  $logPath = Join-Path $LogDir ((Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + $safeLabel + '.log')

  Write-Host ('- ' + $Label + '...')

  Push-Location $AppDir
  try {
    $oldNpmConfigStoreDir = $env:npm_config_store_dir
    $env:npm_config_store_dir = $null
    try {
      & pnpm $Script @Arguments *> $logPath
      if ($LASTEXITCODE -ne 0) {
        throw "Tahap gagal: $Label"
      }
    } finally {
      if ($null -ne $oldNpmConfigStoreDir) {
        $env:npm_config_store_dir = $oldNpmConfigStoreDir
      } else {
        Remove-Item Env:npm_config_store_dir -ErrorAction SilentlyContinue
      }
    }
  } finally {
    Pop-Location
  }
}

function Invoke-LibraryFlow {
  Show-FrontHeader 'PROSES LIBRARY'
  Write-Host ''
  Ensure-DefaultEnv
  Ensure-EvalQueries

  $status = Get-LocalStatus
  if ($status.LibraryPdfCount -eq 0) {
    throw 'Library medical belum berisi PDF.'
  }

  Invoke-BackendStep -Label 'Mengolah PDF library' -Script 'ingest:pdf' -Arguments @('--input', $LibraryRoot, '--output', $ArtifactsDir)
  Invoke-BackendStep -Label 'Memperbarui registry' -Script 'registry:update' -Arguments @('--artifacts', $ArtifactsDir, '--registry', $RegistryDir)

  $status = Get-LocalStatus
  if ($status.DbPortOpen) {
    Invoke-BackendStep -Label 'Menyusun knowledge base' -Script 'embed:approved' -Arguments @('--write')
    Invoke-BackendStep -Label 'Menilai kualitas retrieval' -Script 'eval:retrieval' -Arguments @()
  } else {
    Invoke-BackendStep -Label 'Menyusun knowledge base aman' -Script 'embed:approved' -Arguments @('--dry-run')
    Invoke-BackendStep -Label 'Menilai kualitas retrieval aman' -Script 'eval:retrieval' -Arguments @('--dry-run')
  }

  Show-OutcomeSummary
}

function Invoke-RagRefreshFlow {
  Show-FrontHeader 'REFRESH RAG'
  Write-Host ''
  Ensure-DefaultEnv
  Ensure-EvalQueries

  if (-not (Test-Path (Join-Path $ArtifactsDir 'ingestion-summary.json'))) {
    throw 'Belum ada hasil PDF untuk direfresh.'
  }

  Invoke-BackendStep -Label 'Memperbarui registry' -Script 'registry:update' -Arguments @('--artifacts', $ArtifactsDir, '--registry', $RegistryDir)

  $status = Get-LocalStatus
  if ($status.DbPortOpen) {
    Invoke-BackendStep -Label 'Menyusun knowledge base' -Script 'embed:approved' -Arguments @('--write')
    Invoke-BackendStep -Label 'Menilai kualitas retrieval' -Script 'eval:retrieval' -Arguments @()
  } else {
    Invoke-BackendStep -Label 'Menyusun knowledge base aman' -Script 'embed:approved' -Arguments @('--dry-run')
    Invoke-BackendStep -Label 'Menilai kualitas retrieval aman' -Script 'eval:retrieval' -Arguments @('--dry-run')
  }

  Show-OutcomeSummary
}

function Invoke-QuestionFlow {
  param([string]$PromptQuestion)

  Show-FrontHeader 'TANYA DOKUMEN'
  Write-Host ''
  Ensure-DefaultEnv

  $status = Get-LocalStatus
  if (-not $status.DbPortOpen) {
    throw 'Database lokal belum aktif. Pertanyaan belum bisa dijalankan.'
  }

  if ([string]::IsNullOrWhiteSpace($PromptQuestion)) {
    $PromptQuestion = Read-Host 'Tulis pertanyaan medis'
  }

  if ([string]::IsNullOrWhiteSpace($PromptQuestion)) {
    throw 'Pertanyaan tidak boleh kosong.'
  }

  Ensure-Workspace
  $logPath = Join-Path $LogDir ((Get-Date -Format 'yyyyMMdd-HHmmss') + '-ask.log')

  Push-Location $AppDir
  try {
    $oldNpmConfigStoreDir = $env:npm_config_store_dir
    $env:npm_config_store_dir = $null
    try {
      $answer = & pnpm query $PromptQuestion 2>&1
      $answer | Set-Content -Path $logPath -Encoding UTF8
      if ($LASTEXITCODE -ne 0) {
        throw 'Pertanyaan gagal diproses.'
      }
    } finally {
      if ($null -ne $oldNpmConfigStoreDir) {
        $env:npm_config_store_dir = $oldNpmConfigStoreDir
      } else {
        Remove-Item Env:npm_config_store_dir -ErrorAction SilentlyContinue
      }
    }
  } finally {
    Pop-Location
  }

  Write-Section 'JAWABAN'
  $filtered = $answer | Where-Object { $_ -notmatch '^npm warn ' -and $_ -notmatch '^>\s@sentra/' -and $_ -notmatch '^Query:\s' -and $_ -notmatch '^Searching' }
  $filtered | ForEach-Object { Write-Host $_ }
}

function Show-StatusScreen {
  Show-FrontHeader 'STATUS'
  Show-OutcomeSummary
}

function Show-PreviewScreen {
  Show-FrontHeader 'RINGKASAN'
  Write-Section 'AKSI'
  Write-Host '1. Proses library'
  Write-Host '2. Refresh RAG'
  Write-Host '3. Tanya dokumen'
  Write-Host '4. Lihat status'
  Write-Host '5. Siapkan koneksi lokal'
}

function Show-MainMenu {
  while ($true) {
    Show-FrontHeader 'SENTRA RAG'
    Write-Section 'PILIH AKSI'
    Write-Host '1. Proses library'
    Write-Host '2. Refresh RAG'
    Write-Host '3. Tanya dokumen'
    Write-Host '4. Lihat status'
    Write-Host '5. Siapkan koneksi lokal'
    Write-Host '0. Keluar'
    Write-Host ''

    $choice = Read-Host 'Pilih aksi'
    switch ($choice) {
      '1' { Invoke-LibraryFlow; Pause }
      '2' { Invoke-RagRefreshFlow; Pause }
      '3' { Invoke-QuestionFlow -PromptQuestion $Question; Pause }
      '4' { Show-StatusScreen; Pause }
      '5' {
        Ensure-DefaultEnv
        Show-FrontHeader 'KONEKSI LOKAL'
        Write-Host ''
        Write-Host 'Konfigurasi lokal sudah dipastikan tersedia.'
        Pause
      }
      '0' { return }
      default {
        Write-Host ''
        Write-Host 'Pilihan tidak dikenal.'
        Pause
      }
    }
    Clear-Host
  }
}

try {
  switch ($Action) {
    'menu'    { Show-MainMenu }
    'library' { Invoke-LibraryFlow }
    'eval'    { Invoke-RagRefreshFlow }
    'ask'     { Invoke-QuestionFlow -PromptQuestion $Question }
    'status'  { Show-StatusScreen }
    'setup'   { Ensure-DefaultEnv; Show-FrontHeader 'KONEKSI LOKAL'; Write-Host ''; Write-Host 'Konfigurasi lokal sudah dipastikan tersedia.' }
    'preview' { Show-PreviewScreen }
  }
} catch {
  Write-Section 'PERLU PERHATIAN'
  Write-Host $_.Exception.Message
  exit 1
}
