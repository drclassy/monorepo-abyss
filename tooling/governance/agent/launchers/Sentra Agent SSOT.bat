@echo off
setlocal
title Sentra Agent SSOT
cls
echo Sentra Agent SSOT
echo =================
echo Starting daily SSOT refresh...
echo Repo: D:\Devops\abyss-monorepo
echo Model: granite4.1:3b
echo.
echo Please wait. This can take 10-60 seconds on local Ollama.
echo.
cd /d "D:\Devops\abyss-monorepo"
pwsh -NoProfile -ExecutionPolicy Bypass -File "D:\Devops\abyss-monorepo\tooling\governance\agent\scripts\sync-agent-ssot.ps1"
echo.
echo Done. Press any key to close.
pause >nul
