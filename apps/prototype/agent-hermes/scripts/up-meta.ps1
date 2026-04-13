#Requires -Version 7.0
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $here '..')

if (-not (Test-Path "docker-compose.meta.yml")) {
    Write-Warning "docker-compose.meta.yml not found. Meta profile is not yet configured."
    exit 1
}

docker compose -f docker-compose.base.yml -f docker-compose.meta.yml up -d
Write-Host "✓ Base + Meta profile up" -ForegroundColor Green
