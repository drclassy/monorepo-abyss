# Clear Cursor Chat History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Membuat script batch (.bat) untuk menghapus riwayat chat global dan workspace di Cursor IDE.

**Architecture:** Script akan menutup paksa proses Cursor, lalu melakukan pembersihan pada file `state.vscdb` di folder GlobalStorage dan WorkspaceStorage. File akan di-rename menjadi `.bak` (sebagai backup otomatis) sebelum dihapus permanen di sesi berikutnya.

**Tech Stack:** Windows Batch Script (.bat)

---

### Task 1: Create ClearHistory.bat

**Files:**
- Create: `C:\Users\%USERNAME%\Desktop\ClearCursorHistory.bat`

- [ ] **Step 1: Definisikan struktur dasar dan penutupan Cursor**

```batch
@echo off
setlocal enabledelayedexpansion
title Cursor History Nuker - Jean

echo ======================================================
echo    CURSOR HISTORY NUKER - JEAN (SENTRA ANALYST)
echo ======================================================
echo.

:: 1. Tutup Cursor
echo [1/3] Menutup Cursor IDE...
taskkill /F /IM Cursor.exe /T >nul 2>&1
timeout /t 2 >nul
```

- [ ] **Step 2: Bersihkan Global Chat History**

```batch
:: 2. Bersihkan Global Storage (Chat Utama)
echo [2/3] Membersihkan Global Chat History...
set "GLOBAL_DB=%APPDATA%\Cursor\User\globalStorage\state.vscdb"
if exist "!GLOBAL_DB!" (
    echo [-] Backing up and removing Global DB...
    move /y "!GLOBAL_DB!" "!GLOBAL_DB!.bak" >nul
)
```

- [ ] **Step 3: Bersihkan Workspace Chat History (Project-specific)**

```batch
:: 3. Bersihkan Workspace Storage (Chat per Project)
echo [3/3] Membersihkan Workspace Chat History...
set "WS_ROOT=%APPDATA%\Cursor\User\workspaceStorage"
if exist "!WS_ROOT!" (
    for /d %%d in ("!WS_ROOT!\*") do (
        if exist "%%d\state.vscdb" (
            echo [-] Removing history in %%~nxd...
            move /y "%%d\state.vscdb" "%%d\state.vscdb.bak" >nul
        )
    )
)
```

- [ ] **Step 4: Selesai dan Feedback**

```batch
echo.
echo ======================================================
echo    BERHASIL! Riwayat chat telah di-reset (Backup .bak dibuat).
echo    Silahkan buka kembali Cursor Abang.
echo ======================================================
pause
exit
```

- [ ] **Step 5: Tulis file ke Desktop menggunakan PowerShell**
