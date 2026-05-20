# Cursor IDE Cleanup Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat script batch (.bat) untuk membersihkan file cache dan sampah Cursor IDE di Windows Desktop.

**Architecture:** Script menggunakan perintah shell bawaan Windows (`tasklist`, `taskkill`, `del`, `rmdir`) untuk mendeteksi status aplikasi dan melakukan pembersihan folder cache secara rekursif dan paksa.

**Tech Stack:** Windows Batch Script (.bat)

---

### Task 1: Create Cleanup Batch Script

**Files:**
- Create: `C:\Users\%USERNAME%\Desktop\CleanCursor.bat`

- [ ] **Step 1: Definisikan variabel path dan pesan awal**

```batch
@echo off
setlocal
title Cursor IDE Junk Cleaner - Jean (Sentra Analyst)

echo ======================================================
echo    CURSOR IDE JUNK CLEANER - JEAN (SENTRA ANALYST)
echo ======================================================
echo.
```

- [ ] **Step 2: Tambahkan deteksi proses Cursor**

```batch
echo [1/3] Memeriksa status Cursor IDE...
tasklist /FI "IMAGENAME eq Cursor.exe" 2>NUL | find /I /N "Cursor.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [!] Cursor sedang berjalan. Menutup Cursor otomatis...
    taskkill /F /IM Cursor.exe /T
    timeout /t 2 >nul
) else (
    echo [OK] Cursor sudah tertutup.
)
echo.
```

- [ ] **Step 3: Tambahkan perintah pembersihan folder sampah**

```batch
echo [2/3] Membersihkan file sampah dan cache...

set "CURSOR_USER=%APPDATA%\Cursor\User"

:: List target folders
set "targets=workspaceStorage Cache "Code Cache" GPUCache logs GlobalStorage"

for %%t in (%targets%) do (
    if exist "%CURSOR_USER%\%%~t" (
        echo [-] Menghapus %%~t...
        rmdir /s /q "%CURSOR_USER%\%%~t" >nul 2>&1
        if not exist "%CURSOR_USER%\%%~t" (
            echo     [OK] Berhasil.
        ) else (
            echo     [!] Gagal menghapus %%~t (mungkin masih digunakan).
        )
    )
)
echo.
```

- [ ] **Step 4: Tambahkan pesan penutup dan feedback**

```batch
echo [3/3] Selesai! Cursor sudah lebih ringan sekarang.
echo.
echo Catatan: State sidebar dan file terbuka terakhir akan direset.
echo ======================================================
pause
exit
```

- [ ] **Step 5: Tulis file ke Desktop**

Gunakan command shell untuk menulis seluruh konten ke file `%USERPROFILE%\Desktop\CleanCursor.bat`.
