#Requires -Version 7.0
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $here '..')

docker compose -f docker-compose.base.yml down

Write-Host "✓ Base profile down" -ForegroundColor Green
