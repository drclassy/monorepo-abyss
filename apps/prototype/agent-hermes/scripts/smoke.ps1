#Requires -Version 7.0
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $here '..')

$venvPython = ".\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Error "Virtual environment not found at .venv. Please create it first."
    exit 1
}

& $venvPython -m pytest tests/smoke/test_base_profile.py -v

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Smoke tests passed" -ForegroundColor Green
} else {
    Write-Host "✗ Smoke tests failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
