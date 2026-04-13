#Requires -Version 7.0
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $here '..')

$composeFiles = @("-f", "docker-compose.base.yml")
if (Test-Path "docker-compose.meta.yml") {
    $composeFiles += @("-f", "docker-compose.meta.yml")
}
if (Test-Path "docker-compose.skills.yml") {
    $composeFiles += @("-f", "docker-compose.skills.yml")
}

docker compose @composeFiles up -d
Write-Host "✓ Full profile up" -ForegroundColor Green
