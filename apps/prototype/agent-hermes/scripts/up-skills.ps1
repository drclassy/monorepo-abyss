#Requires -Version 7.0
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $here '..')

if (-not (Test-Path "docker-compose.skills.yml")) {
    Write-Warning "docker-compose.skills.yml not found. Skills profile is not yet configured."
    exit 1
}

docker compose -f docker-compose.base.yml -f docker-compose.skills.yml up -d
Write-Host "✓ Base + Skills profile up" -ForegroundColor Green
