@echo off
setlocal

title Classy Guardian Console

set "REPO_ROOT=V:\avcn-sentra\abyss-monorepo"
set "CONSOLE_DIR=%REPO_ROOT%\tooling\librarian-desktop"
set "WORKER_DIR=%REPO_ROOT%\tooling\librarian-desktop\literature-worker"
set "WORKER_URL=http://127.0.0.1:8787/health"

echo -----------------------------------------------
echo   AVVCENNA GUARDIAN CONSOLE
echo   Guardian Repo + Sentinel Library
echo -----------------------------------------------

if not exist "%CONSOLE_DIR%\package.json" (
  echo [ERROR] Console path tidak ditemukan: %CONSOLE_DIR%
  pause
  exit /b 1
)

if not exist "%WORKER_DIR%\package.json" (
  echo [ERROR] Literature worker path tidak ditemukan: %WORKER_DIR%
  pause
  exit /b 1
)

echo [1/2] Menyiapkan literature worker...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { Invoke-WebRequest -Uri '%WORKER_URL%' -UseBasicParsing -TimeoutSec 2 ^| Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command','Set-Location ''%WORKER_DIR%''; pnpm.cmd start'"
  timeout /t 2 >nul
) else (
  echo [OK] Literature worker sudah aktif.
)

echo [2/2] Membuka Guardian Console...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process powershell -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command','Set-Location ''%CONSOLE_DIR%''; pnpm.cmd start'"

echo [OK] Launcher selesai.
timeout /t 2 >nul
exit /b 0
