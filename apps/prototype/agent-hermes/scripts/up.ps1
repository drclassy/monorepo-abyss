#Requires -Version 7.0
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $here '..')

docker compose -f docker-compose.base.yml up -d

Write-Host "✓ Base profile up" -ForegroundColor Green
Write-Host "  Mission Control : http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host "  Workspace UI    : http://127.0.0.1:3001" -ForegroundColor Cyan
Write-Host "  Hermes Gateway  : http://127.0.0.1:8642" -ForegroundColor Cyan
Write-Host "  Hindsight API   : http://127.0.0.1:8888" -ForegroundColor Cyan
Write-Host "  Hindsight CP    : http://127.0.0.1:9999" -ForegroundColor Cyan
